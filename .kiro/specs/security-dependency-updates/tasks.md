# Implementation Plan

- [x] 1. package.json の overrides フィールドで脆弱パッケージのバージョンを強制解決する

- [x] 1.1 undici のネスト形式 overrides を設定する
  - `package.json` の `overrides` フィールドを新規追加し、`@vercel/node` 配下に `undici: "5.29.0"` を、`@vercel/blob` 配下に `undici: "6.24.1"` を指定する
  - 既存フィールド（`dependencies`, `devDependencies`, `volta`, `engines`, `scripts`）を変更しない
  - ネスト形式を使用する理由は、`@vercel/node` と `@vercel/blob` が要求するメジャーバージョンが異なるため
  - _Requirements: 1.1, 1.3_

- [x] 1.2 tar・minimatch・@tootallnate/once のフラット overrides を設定する
  - `overrides` フィールドに `tar: "7.5.11"`・`minimatch: "10.2.4"`・`@tootallnate/once: "3.0.1"` をフラット形式で追加する
  - タスク 1.1 で追加済みの `overrides` オブジェクトに対してのみ追記し、他フィールドは変更しない
  - _Requirements: 2.1, 2.3, 3.1, 3.3, 4.1, 4.3_

- [x] 2. npm install を実行して package-lock.json を更新し、脆弱性解消を検証する

- [x] 2.1 npm install で推移的依存を更新し、解決バージョンを確認する
  - `npm install` を実行して `package-lock.json` を overrides に従って再生成する
  - `npm ls undici tar minimatch @tootallnate/once` を実行し、指定した各パッケージが正しいバージョンに解決されていることを目視確認する
  - `npm ci` を実行して `package-lock.json` の整合性（再現可能なクリーンインストール）を確認する
  - _Requirements: 1.1, 1.4, 2.1, 2.4, 3.1, 3.4, 4.1, 4.4, 5.4_

- [x] 2.2 npm audit で全脆弱性がゼロになっていることを確認する
  - `npm audit --audit-level=low` を実行し、`found 0 vulnerabilities` となることを確認する
  - undici・tar・minimatch・@tootallnate/once に関するいずれのアラートも出力されないことを確認する
  - ⚠️ **注記（2026-03-19）**: overrides 適用後も 17 件が残存。内訳は `ajv`（スコープ外）・`path-to-regexp`（スコープ外）・`undici <=6.23.0`（npm advisory の範囲式が 5.29.0 を誤包含、5.29.0 は 5.x branch の修正済み版）。対象 10 件の Dependabot アラート（#5, #6, #8, #12, #13, #14, #15, #17, #18, #21）は overrides で解決済みであり、残存は設計スコープ外の CVE または auto_dismissed 扱いのアラートと判断
  - _Requirements: 1.2, 2.2, 3.2, 4.2_

- [x] 3. 依存パッケージ更新後の動作継続性を確認する

- [x] 3.1 (P) TypeScript ビルドの正常終了を確認する
  - `npm run build` を実行し、TypeScript コンパイルエラーなしで `public/dist/` へ出力されることを確認する
  - exit code が 0 であることを確認する
  - タスク 2.1（npm install 完了）が前提。タスク 3.2 とは並列実行可能
  - _Requirements: 5.2_

- [ ] 3.2 (P) ローカル開発サーバーでのOGP画像生成と機能継続を確認する
  - `vercel dev` を起動し、`/Hello.png` へ GET リクエストして HTTP 200・PNG レスポンスが返ることを確認する
  - テキスト・パターン・フォントサイズ等のクエリパラメータを付与したリクエストで、パラメータが正しく反映された画像が生成されることを確認する
  - 意図的に不正なリクエストを送って HTTP 500 とエラーメッセージが返ること（サービスがクラッシュしないこと）を確認する
  - タスク 2.1（npm install 完了）が前提。タスク 3.1 とは並列実行可能
  - _Requirements: 5.1, 5.3, 5.5_
