# CLAUDE.md - track-my-subs プロジェクトガイド

## プロジェクト概要

個人のサブスクリプション契約を管理・可視化するWebアプリケーション。契約中サービスの登録、更新リマインダー、支払いサイクルの把握などを通じて、無駄な出費を減らすことを目的としている。

## 技術スタック

### モノレポ構成（pnpm workspace）

- **フロントエンド**: React + TypeScript + Vite (`packages/frontend`)
- **バックエンド**: Fastify + TypeScript (`packages/backend`)
- **共有型定義**: TypeScript (`packages/shared`)
- **データベース**: PostgreSQL
- **パッケージマネージャ**: pnpm
- **テスト**: Jest（バックエンドのみ）
- **Lint/Format**: Biome
- **デプロイ**: AWS
  - ステージング環境: mainブランチから自動デプロイ（将来実装予定）
  - 本番環境: Gitタグ（`v*.*.*`）から手動デプロイ

## ディレクトリ構造

```
track-my-subs/
├── packages/
│   ├── frontend/       # React + Vite フロントエンド
│   ├── backend/        # Fastify バックエンド
│   └── shared/         # 共有型定義・ユーティリティ
├── doc/                # ドキュメント（ER図など）
├── biome.json          # Biome設定
├── tsconfig.base.json  # TypeScript基本設定
├── pnpm-workspace.yaml # pnpmワークスペース設定
└── package.json        # ルートパッケージ設定
```

## コーディング規約

### 一般原則

- **型安全性**: TypeScriptの型を最大限活用し、`any`は極力避ける
- **共有型**: フロントエンドとバックエンドで共通の型は`packages/shared`に定義
- **コードフォーマット**: Biomeを使用（保存時自動フォーマット推奨）
- **命名規則**:
  - ファイル名: kebab-case (`user-service.ts`)
  - コンポーネント: PascalCase (`UserProfile.tsx`)
  - 関数/変数: camelCase (`getUserById`)
  - 定数: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
  - 型/インターフェース: PascalCase (`UserData`, `ApiResponse`)

### React (frontend)

- 関数コンポーネントを使用
- カスタムフックで状態管理ロジックを分離
- propsの型は明示的に定義
- 状態管理ライブラリが導入される場合はその規約に従う

### Fastify (backend)

- ルートハンドラは`async/await`を使用
- エラーハンドリングは統一された形式で
- リクエスト/レスポンスのスキーマ定義を活用
- 環境変数は適切に型付けして使用

### データベース

- マイグレーションファイルで全てのスキーマ変更を管理
- ER図（`doc/er-diagram.md`）を更新

## 開発ワークフロー

### ブランチ戦略（GitHub Flow）

シンプルで小規模開発に適したGitHub Flowを採用。

- **`main`**: 常にデプロイ可能な状態を保つブランチ（ステージング環境に対応）
- **`issue_{番号}`**: 各issueに対応する作業ブランチ

### 環境戦略

```
開発環境（ローカル）
    ↓
issue_* ブランチで実装
    ↓
PR → main にマージ
    ↓
ステージング環境（AWS）← mainブランチ
    ↓
検証完了後、タグ作成（例: v1.0.0）
    ↓
本番環境（AWS）← Gitタグからデプロイ
```

**環境ごとのデータベース:**
- **開発**: ローカルPostgreSQL（Docker推奨）
- **ステージング**: AWS RDS（小規模インスタンス）
- **本番**: AWS RDS（適切なスペック）

**重要**: ステージングと本番のデータベースは完全分離し、本番データは絶対にステージングで使用しない。

### コミット規約

- プレフィックスを使用: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`
- 例: `feat: サブスクリプション一覧表示機能を追加`

### 作業フロー

1. issueを作成
2. `issue_{番号}`ブランチを作成
3. 実装・テスト（ローカル環境）
4. Biomeでlint/format確認: `pnpm lint`
5. PRを作成してmainにマージ
6. （将来）mainへのマージでステージング環境に自動デプロイ
7. ステージング環境で動作確認
8. 問題なければGitタグ（`v1.0.0`など）を作成
9. （将来）タグから本番環境へデプロイ

### リリースフロー

```bash
# ステージングで検証完了後
git tag v1.0.0
git push origin v1.0.0

# （将来）タグのpushをトリガーに本番環境へ自動デプロイ
```

## よくある作業パターン

### 新規API追加

1. `packages/shared`に型定義を追加
2. `packages/backend`にルートとハンドラを実装
3. `packages/frontend`でAPIクライアント関数を作成
4. フロントエンドのコンポーネントから呼び出し

### 新規コンポーネント追加

1. `packages/frontend/src/components`に`.tsx`ファイルを作成
2. propsの型をインターフェースで定義
3. スタイルは適切な方法で実装（CSS Modules、Tailwind等）
4. 必要に応じてストーリーブックやテストを追加

### データベーススキーマ変更

1. マイグレーションファイルを作成
2. `doc/er-diagram.md`を更新
3. 影響を受ける型定義を`packages/shared`で更新
4. バックエンドのクエリを修正

## パッケージ管理

### 依存関係の追加

```bash
# ルートの依存関係
pnpm add -w <package>

# 特定のワークスペースに追加
pnpm --filter frontend add <package>
pnpm --filter backend add <package>
pnpm --filter shared add <package>
```

### コマンド

```bash
# 全体のlint
pnpm lint

# 全体のformat
pnpm format

# 各パッケージの開発サーバー起動は各package.jsonを参照
```

## 注意事項

- **セキュリティ**: 機密情報（API key、DB接続情報等）は環境変数で管理し、コミットしない
- **パフォーマンス**: 不要な再レンダリングを避ける（React.memo、useMemo、useCallback）
- **アクセシビリティ**: セマンティックなHTMLとARIA属性を適切に使用
- **エラーハンドリング**: ユーザーフレンドリーなエラーメッセージを表示

## AIアシスタント向けのガイド

- このプロジェクトはpnpm workspaceのモノレポです
- 型の変更は`packages/shared`を更新後、影響を受けるfrontend/backendも更新してください
- 新機能追加時は、まず対応するissueの内容を確認してください
- コード変更後は必ずBiomeでlintを実行してください: `pnpm lint`
