# Requirements Document

## Project Description (Input)
上記のセキュリティアラートを解消したいです。

GitHubのDependabotが検出した以下のセキュリティアラート（open状態）を解消する：
- #21 undici: WebSocket 64-bit length overflow (high) → 6.24.0
- #18 undici: CRLF Injection (medium) → 6.24.0
- #17 undici: HTTP Request/Response Smuggling (medium) → 6.24.0
- #15 tar: Symlink Path Traversal (high) → 7.5.11
- #14 tar: Hardlink Path Traversal (high) → 7.5.10
- #13 @tootallnate/once: Incorrect Control Flow Scoping (low) → 3.0.1
- #12 minimatch: ReDoS via GLOBSTAR (high) → 10.2.3
- #8 tar: Arbitrary File Read/Write via symlink chain (high) → 7.5.8
- #6 undici: DoS via bad certificate (low) → 5.29.0
- #5 undici: Insufficiently Random Values (medium) → 5.28.5

## Introduction

og-imageプロジェクトのnpm依存パッケージにおいて、GitHubのDependabotがopen状態のセキュリティ脆弱性を10件検出している。対象パッケージは `undici`（5件）・`tar`（3件）・`minimatch`（1件）・`@tootallnate/once`（1件）で、いずれも推移的依存（`package-lock.json`）として記録されている。本要件は、これらの脆弱性をすべて解消しつつ、OGP画像生成サービスの既存機能を損なわないことを保証する。

## Requirements

### Requirement 1: undici の脆弱性解消

**Objective:** サービス運営者として、`undici` に起因するすべてのDependabotアラートを解消したい。DoS・CRLF Injection・HTTP Smuggling・乱数不足など複数カテゴリの脆弱性をまとめて修正できる。

#### Acceptance Criteria

1. The og-image サービス shall `undici` を `6.24.0` 以上（またはそれと同等以上のセキュリティ修正が含まれるバージョン）に解決した状態で `package-lock.json` を保持する。
2. When `npm audit` を実行したとき、the og-image サービス shall `undici` に関するhigh・medium・lowいずれのセキュリティ脆弱性も報告しない。
3. If `undici` のバージョン変更によって直接依存パッケージとの互換性が失われたとき、the og-image サービス shall `package.json` の `overrides`（npm）フィールドを使用してバージョンを強制解決する。
4. The og-image サービス shall GitHub Dependabotアラート #5・#6・#17・#18・#21 をすべてクローズまたは自動解除された状態にする。

---

### Requirement 2: tar の脆弱性解消

**Objective:** サービス運営者として、`tar` に起因するすべてのDependabotアラートを解消したい。Path Traversal・任意ファイル読み書きなど深刻な脆弱性を修正できる。

#### Acceptance Criteria

1. The og-image サービス shall `tar` を `7.5.11` 以上に解決した状態で `package-lock.json` を保持する。
2. When `npm audit` を実行したとき、the og-image サービス shall `tar` に関するhigh脆弱性を報告しない。
3. If `tar` のバージョン変更によって直接依存パッケージとの互換性が失われたとき、the og-image サービス shall `package.json` の `overrides` フィールドを使用してバージョンを強制解決する。
4. The og-image サービス shall GitHub Dependabotアラート #8・#14・#15 をすべてクローズまたは自動解除された状態にする。

---

### Requirement 3: minimatch の脆弱性解消

**Objective:** サービス運営者として、`minimatch` に起因するDependabotアラートを解消したい。ReDoS攻撃につながる正規表現の脆弱性を修正できる。

#### Acceptance Criteria

1. The og-image サービス shall `minimatch` を `10.2.3` 以上に解決した状態で `package-lock.json` を保持する。
2. When `npm audit` を実行したとき、the og-image サービス shall `minimatch` に関するhigh脆弱性を報告しない。
3. If `minimatch` のバージョン変更によって直接依存パッケージとの互換性が失われたとき、the og-image サービス shall `package.json` の `overrides` フィールドを使用してバージョンを強制解決する。
4. The og-image サービス shall GitHub Dependabotアラート #12 をクローズまたは自動解除された状態にする。

---

### Requirement 4: @tootallnate/once の脆弱性解消

**Objective:** サービス運営者として、`@tootallnate/once` に起因するDependabotアラートを解消したい。制御フローの不正スコーピング脆弱性を修正できる。

#### Acceptance Criteria

1. The og-image サービス shall `@tootallnate/once` を `3.0.1` 以上に解決した状態で `package-lock.json` を保持する。
2. When `npm audit` を実行したとき、the og-image サービス shall `@tootallnate/once` に関するlow脆弱性を報告しない。
3. If `@tootallnate/once` のバージョン変更によって直接依存パッケージとの互換性が失われたとき、the og-image サービス shall `package.json` の `overrides` フィールドを使用してバージョンを強制解決する。
4. The og-image サービス shall GitHub Dependabotアラート #13 をクローズまたは自動解除された状態にする。

---

### Requirement 5: 更新後の動作継続性

**Objective:** サービス運営者として、依存パッケージ更新後もOGP画像生成の既存機能がすべて正常に動作することを保証したい。セキュリティ修正によるリグレッションを防止できる。

#### Acceptance Criteria

1. When 依存パッケージ更新後に `vercel dev` でローカルサーバーを起動したとき、the og-image サービス shall OGP画像生成リクエストに対してPNGまたはJPEG形式の画像レスポンスを返す。
2. When `npm run build` を実行したとき、the og-image サービス shall TypeScriptコンパイルエラーなしに `public/dist/` へ出力する。
3. While `vercel dev` が起動中のとき、the og-image サービス shall テキスト・パターン・フォントサイズ等のクエリパラメータを正しく反映した画像を生成する。
4. The og-image サービス shall `npm install` 実行後に `package-lock.json` の整合性が保たれ、`npm ci` が正常終了する。
5. If 依存パッケージ更新後にOGP画像生成が失敗したとき、the og-image サービス shall HTTPステータス500とエラーメッセージを返し、サービスがクラッシュしない。
