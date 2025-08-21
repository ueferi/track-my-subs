# track-my-subs

個人のサブスクリプション契約を管理・可視化するための Web アプリケーション。
契約中サービスの登録、更新リマインダー、支払いサイクルの把握などを通じて、無駄な出費を減らすことを目的としている。

---

## 📦 技術スタック

| レイヤー     | 技術                             |
|--------------|----------------------------------|
| フロントエンド | React + TypeScript + Vite         |
| バックエンド   | Fastify + TypeScript              |
| パッケージ管理 | pnpm                              |
| DB           | PostgreSQL                        |
| 型共有        | pnpm workspace + `packages/shared` |
| テスト        | Jest (BEのみ)                     |
| Lint/Format  | Biome                             |
| デプロイ      | AWS (構成検討中)                 |
