# Implementation Plan: node-version-upgrade-24

## Implementation Tasks

- [ ] 1. (P) ランタイムと依存を Node 24 に更新する
- [x] 1.1 (P) プロジェクトのランタイム指定を Node 24.x に変更する
  - ビルド・実行環境が本番・ローカル・Vercel で一貫して Node 24 となるよう、engines を 24.x に設定する。Vercel は engines を参照するため追加設定は不要。
  - _Requirements: 1.1, 1.2_
- [x] 1.2 (P) Node 24 非互換の本番用 Chromium 依存を削除し、互換パッケージに差し替える
  - chrome-aws-lambda を削除し、@sparticuz/chromium を追加する。puppeteer-core は Puppeteer Chromium Support に準拠した互換バージョンに更新する。
  - Node 24 環境で npm install が成功することを確認する。
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 2. (P) Docker ビルド・実行環境を Node 24 系に更新する
- [ ] 2.1 (P) Dockerfile のベースイメージを Node 24 系に変更する
  - FROM を node:24-bookworm-slim 等の Node 24 系に変更する。既存の RUN やユーザー設定が Bookworm 環境で動作するか必要に応じて確認する。
  - _Requirements: 1.3_

- [ ] 3. 本番用 Chromium 取得を @sparticuz/chromium に差し替える
- [ ] 3.1 本番時に Chromium 起動オプションを @sparticuz/chromium から返すようにする
  - 開発時は従来どおりローカル Chrome の実行パスとオプションを返す。本番時は @sparticuz/chromium の executablePath（非同期）、args、headless を返す。既存の getOptions の戻り値の型と契約は維持する。呼び出し元（chromium モジュール）は変更しない。
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 4. (P) 開発・運用ドキュメントの Node バージョン表記を 24 系に合わせる
- [ ] 4.1 (P) steering のランタイム・必須ツール・Docker 記述を Node 24 に更新する
  - Runtime と Required Tools の Node 表記を 24.x に置換する。Docker 利用時は Node 24 系イメージを用いる旨を追記する。
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 5. Node 24 環境での動作を手動で検証する
- [ ] 5.1 vercel dev でローカル起動し、プレビューと画像生成が成功することを確認する
  - _Requirements: 5.1_
- [ ] 5.2 Docker でビルド・実行し、画像生成が完了することを確認する
  - _Requirements: 5.2_
- [ ] 5.3 本番デプロイ後、Vercel で Node 24 が使用されていることと画像生成レスポンスが正常であることを確認する
  - _Requirements: 5.3_
