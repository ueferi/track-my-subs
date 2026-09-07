# CloudFront SPAフォールバック設定手順

## 目的

SPAのサブパス（`/login`・`/subscriptions` など）をURL直アクセス・リロード・直リンクした際に、S3が返す `AccessDenied`（HTTP 403）ではなく、アプリ（`index.html`）が表示されるようにする。

クライアントサイドルーティングでは実在しないオブジェクトキーへのリクエストが発生するため、CloudFrontのCustom Error Responsesでフォールバックを設定する。

## 前提

- フロントエンドは S3 + CloudFront で配信している（`doc` 外の詳細は `.github/workflows/deploy-frontend.yml` を参照）。
- CloudFrontの配信設定はIaC管理されていないため、本手順はAWS CLIまたはマネジメントコンソールで手動適用する。
- 適用対象のディストリビューションIDは、デプロイワークフローで使う `CLOUDFRONT_DISTRIBUTION_ID` と同一。

## 設定内容

CloudFront の Custom Error Responses に以下2件を追加する。

| エラーコード | レスポンスページ | レスポンスコード | エラーキャッシュ最小TTL |
| --- | --- | --- | --- |
| 403 | `/index.html` | 200 | 0 |
| 404 | `/index.html` | 200 | 0 |

### 各設定値の理由

- **403 と 404 の両方を対象にする**: S3をOAC/OAI経由で配信している場合、存在しないキーへのアクセスは `s3:ListBucket` 権限が無いことにより `404` ではなく `403 AccessDenied` になる。403だけ・404だけでは取りこぼすため両方を設定する。
- **レスポンスコードを 200 にする**: `index.html` を正常応答として返し、SPA側のルーターに遷移を委ねる。
- **エラーキャッシュ最小TTLを 0 にする**: エラーレスポンスが長時間キャッシュされ、デプロイ後も古い挙動が残るのを防ぐ。

### 副作用の注意

この方式は、本来の403/404（アプリの想定外エラー）もアプリ画面として200で返す。ただし本配信はSPAアセット専用であり、APIは別ホスト（Render）で配信しているため、API側の認可エラー等には影響しない。

## AWS CLIでの適用手順

`<DISTRIBUTION_ID>` を実際のディストリビューションIDに置き換えて実行する。

### 1. 現在の設定とETagを取得

```bash
aws cloudfront get-distribution-config \
  --id <DISTRIBUTION_ID> \
  --output json > dist-config.json

# ETag を控える（更新時に --if-match で必要）
ETAG=$(jq -r '.ETag' dist-config.json)
echo "$ETAG"
```

### 2. 適用するDistributionConfigを生成

`get-distribution-config` の出力は `{ "ETag": ..., "DistributionConfig": {...} }` の形。更新APIには `DistributionConfig` 部分のみを渡すため、そこを取り出したうえで `CustomErrorResponses` を差し替える。

```bash
jq '.DistributionConfig
  | .CustomErrorResponses = {
      "Quantity": 2,
      "Items": [
        {
          "ErrorCode": 403,
          "ResponsePagePath": "/index.html",
          "ResponseCode": "200",
          "ErrorCachingMinTTL": 0
        },
        {
          "ErrorCode": 404,
          "ResponsePagePath": "/index.html",
          "ResponseCode": "200",
          "ErrorCachingMinTTL": 0
        }
      ]
    }' dist-config.json > dist-config-updated.json
```

### 3. 設定を更新

```bash
aws cloudfront update-distribution \
  --id <DISTRIBUTION_ID> \
  --distribution-config file://dist-config-updated.json \
  --if-match "$ETAG"
```

### 4. 反映を待ち、キャッシュを無効化

デプロイ状態が `Deployed` になるまで数分かかる。

```bash
# 反映状況の確認（Status が Deployed になるまで待つ）
aws cloudfront get-distribution --id <DISTRIBUTION_ID> \
  --query 'Distribution.Status' --output text

# 既存キャッシュを無効化
aws cloudfront create-invalidation \
  --distribution-id <DISTRIBUTION_ID> \
  --paths "/*"
```

## マネジメントコンソールでの適用手順

CLIを使わない場合は以下でも同じ設定ができる。

1. CloudFront → 対象のディストリビューションを選択
2. **Error pages（エラーページ）** タブを開く
3. **Create custom error response** をクリックし、以下を入力して作成
   - HTTP error code: `403: Forbidden`
   - Customize error response: `Yes`
   - Response page path: `/index.html`
   - HTTP Response code: `200: OK`
   - Minimum TTL: `0`
4. 同じ手順で `404: Not Found` についても作成する
5. ステータスが `Deployed` になったら、**キャッシュ削除**タブ（英語UIでは Invalidations）で「キャッシュ削除を作成」を押し、オブジェクトパスに `/*` を入力して作成する

## 動作確認（受け入れ条件）

キャッシュ削除の反映後、ブラウザのキャッシュを避けて確認する。

確認に使うパスは、フロントエンドの実在ルート（`packages/frontend/src/App.tsx`）に合わせる。存在しないパスはアプリ側の catch-all で `/` にリダイレクトされるため、フォールバックの検証にはゲストでも画面が出る `/login`・`/register` が分かりやすい。

- [ ] `/login` に直アクセス・リロードでログイン画面が表示される
- [ ] `/register` に直アクセス・リロードで登録画面が表示される
- [ ] `/subscriptions/new` に直アクセスで403にならない（未ログイン時は `/login` へリダイレクトされる想定でよい）
- [ ] ルート `/` の表示、および静的アセット（JS/CSS）の配信に影響がない

```bash
# ステータスコードのみ確認する例
curl -o /dev/null -s -w "%{http_code}\n" https://<CLOUDFRONT_DOMAIN>/login
curl -o /dev/null -s -w "%{http_code}\n" https://<CLOUDFRONT_DOMAIN>/register
curl -o /dev/null -s -w "%{http_code}\n" https://<CLOUDFRONT_DOMAIN>/subscriptions/new
```

いずれも `200` が返り、レスポンス本文が `index.html` であればフォールバックが機能している。
