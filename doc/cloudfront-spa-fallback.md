# CloudFront SPAフォールバック設定手順

## 目的

SPAのサブパス（`/login`・`/register`・`/subscriptions/new` など）をURL直アクセス・リロード・直リンクした際に、S3が返す `AccessDenied`（HTTP 403）ではなく、アプリ（`index.html`）が表示されるようにする。

クライアントサイドルーティングでは実在しないオブジェクトキーへのリクエストが発生するため、CloudFrontのCustom Error Responsesでフォールバックを設定する。

## 前提

- フロントエンドは S3 + CloudFront で配信している（デプロイの詳細は `.github/workflows/deploy-frontend.yml` を参照）。
- CloudFrontの配信設定はIaC管理されていないため、本手順は手動で適用する。
- 適用対象のディストリビューションIDは、デプロイワークフローで使う `CLOUDFRONT_DISTRIBUTION_ID` と同一。
- 適用はマネジメントコンソールで行う。AWS CLIを使う場合は末尾の「備考」を参照（未実行のため注意点あり）。

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

## マネジメントコンソールでの適用手順

1. CloudFront → 対象のディストリビューションを選択
2. **エラーページ**（英語UI: Error pages）タブを開く
3. **カスタムエラーレスポンスを作成**（Create custom error response）をクリックし、以下を入力して作成
   - HTTP error code: `403: Forbidden`
   - Error caching minimum TTL: `0`
   - Customize error response: `Yes`
   - Response page path: `/index.html`
   - HTTP Response code: `200: OK`
4. 同じ手順で `404: Not Found` についても作成する
5. ステータスが `Deployed` になったら、**キャッシュ削除**タブ（英語UI: Invalidations）で「キャッシュ削除を作成」を押し、オブジェクトパスに `/*` を入力して作成する

### 入力時の注意

- **Customize error response を `Yes` にしないと、レスポンスページパスとHTTPレスポンスコードの入力欄が表示されない**。`No` のままではオリジンの403がそのまま返るため、フォールバックが機能しない。
- キャッシュ削除のタブ名は日本語UIでは「キャッシュ削除」。以前の「無効化」表記から変わっている。

## 動作確認（受け入れ条件）

キャッシュ削除の反映後、ブラウザのキャッシュを避けて確認する。

確認に使うパスは、フロントエンドの実在ルート（`packages/frontend/src/App.tsx`）に合わせる。存在しないパスはアプリ側の catch-all で `/` にリダイレクトされるため、フォールバックの検証にはゲストでも画面が出る `/login`・`/register` が分かりやすい。

- [ ] `/login` に直アクセス・リロードでログイン画面が表示される
- [ ] `/register` に直アクセス・リロードで登録画面が表示される
- [ ] `/subscriptions/new` に直アクセスで403にならない（未ログイン時は `/login` へリダイレクトされる想定でよい）
- [ ] ルート `/` の表示、および静的アセット（JS/CSS）の配信に影響がない

```bash
# ステータスコードを確認する
curl -o /dev/null -s -w "%{http_code}\n" https://<CLOUDFRONT_DOMAIN>/login
curl -o /dev/null -s -w "%{http_code}\n" https://<CLOUDFRONT_DOMAIN>/register
curl -o /dev/null -s -w "%{http_code}\n" https://<CLOUDFRONT_DOMAIN>/subscriptions/new
```

いずれも `200` が返ればステータス上はフォールバックが効いている。返っている本文が `index.html` であることまで確認する場合は、本文を取得してSPAのマウント先要素の有無を見る。

```bash
# 本文が index.html であることを確認する
curl -s https://<CLOUDFRONT_DOMAIN>/login | grep -o '<div id="root">'
```

最終的な描画はブラウザで目視確認する（ステータスコードや本文の一致だけではJS実行後の画面表示までは保証されない）。

## 備考: AWS CLIでの適用（オプション・未実行）

コンソールを使わずCLIで適用する場合の手順。**この手順は実際には実行しておらず（今回の適用はコンソールで実施）、AWS APIを呼ぶ部分は未検証。** `jq` の変換ロジックのみローカルで動作確認済み。

`<DISTRIBUTION_ID>` を実際のディストリビューションIDに置き換える。

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

`get-distribution-config` の出力は `{ "ETag": ..., "DistributionConfig": {...} }` の形。更新APIには `DistributionConfig` 部分のみを渡す。

既存の `CustomErrorResponses` を保持したまま403/404を追記する。`.CustomErrorResponses` へ丸ごと代入すると既存のカスタムエラー設定（メンテナンスページ等）が消えるため、以下のように既存 `Items` を残す形にする。403/404が既に設定されている場合はこの内容で置き換わる。

```bash
jq '.DistributionConfig
  | .CustomErrorResponses.Items = (
      (.CustomErrorResponses.Items // [])
      | map(select(.ErrorCode != 403 and .ErrorCode != 404))
      + [
          {"ErrorCode":403,"ResponsePagePath":"/index.html","ResponseCode":"200","ErrorCachingMinTTL":0},
          {"ErrorCode":404,"ResponsePagePath":"/index.html","ResponseCode":"200","ErrorCachingMinTTL":0}
        ]
    )
  | .CustomErrorResponses.Quantity = (.CustomErrorResponses.Items | length)
  ' dist-config.json > dist-config-updated.json

# 適用前に差分を確認する
jq -c '.CustomErrorResponses' dist-config-updated.json
```

### 3. 設定を更新

```bash
aws cloudfront update-distribution \
  --id <DISTRIBUTION_ID> \
  --distribution-config file://dist-config-updated.json \
  --if-match "$ETAG"
```

### 4. 反映を待ち、キャッシュを削除

デプロイ状態が `Deployed` になるまで数分かかる。

```bash
# 反映状況の確認（Status が Deployed になるまで待つ）
aws cloudfront get-distribution --id <DISTRIBUTION_ID> \
  --query 'Distribution.Status' --output text

# 既存キャッシュを削除
aws cloudfront create-invalidation \
  --distribution-id <DISTRIBUTION_ID> \
  --paths "/*"
```
