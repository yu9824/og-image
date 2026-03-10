# Research & Design Decisions: node-version-upgrade-24

---
**Purpose**: 要件と既存コードベースのギャップ分析に基づき、Node 24 移行および Chromium 差し替えに必要な技術調査と設計判断を記録する。
---

## Summary

- **Feature**: node-version-upgrade-24
- **Discovery Scope**: Extension（既存ランタイム・依存の更新）
- **Key Findings**:
  - Vercel は Node.js 24.x をビルド・Functions で公式サポート。`package.json` の `engines.node: "24.x"` で指定可能。
  - `chrome-aws-lambda` は Node 20+ 非互換のため、本番用 Chromium は `@sparticuz/chromium` に差し替える。API は `executablePath()`（関数）、`args`、`headless` を提供し、既存 `options.ts` の契約に合わせて利用可能。
  - 既存の `api/_lib/options.ts` が chrome-aws-lambda を直接 import しているため、ここを @sparticuz/chromium に差し替え、`chromium.ts` の呼び出し契約（getOptions(isDev) → launch options）は変更しない。

## Research Log

### Vercel Node.js 24 ランタイム

- **Context**: 要件 1.2（Vercel で Node 24 をランタイムとして指定）の実現方法を確認するため。
- **Sources Consulted**: Vercel Changelog (Node.js 24 LTS GA)、Vercel Docs — Configuring the Runtime、Supported Node.js versions。
- **Findings**:
  - Node.js 24.x は Vercel のビルドおよび Serverless Functions で利用可能。新規プロジェクトのデフォルトとしても選択可能。
  - 指定方法: Project Settings → Build and Deployment → Node.js Version で 24.x を選択するか、`package.json` の `engines.node` に `"24.x"` を記載。Vercel は `engines.node` を参照する。
- **Implications**: `package.json` の `engines.node` を `"24.x"` に更新すれば、Vercel デプロイ時に Node 24 が使用される。`vercel.json` にランタイム指定は不要（rewrites のみの現状を維持）。

### @sparticuz/chromium と puppeteer-core

- **Context**: 要件 2・3 を満たすため、chrome-aws-lambda の代替と Node 24 互換の組み合わせを調査。
- **Sources Consulted**: npm @sparticuz/chromium、GitHub Sparticuz/chromium、Puppeteer Chromium Support ページ。
- **Findings**:
  - @sparticuz/chromium は Lambda 等サーバーレス向けの Chromium バイナリを提供。Puppeteer のバージョンに縛られず、Node 20+ および Node 24 で利用実績がある。
  - 利用形式: `executablePath: await chromium.executablePath()`、`args: chromium.args`、必要に応じて `headless`。既存の `options.ts` が返す `Options`（args, executablePath, headless）と整合する。
  - puppeteer-core は本番ではブラウザなしで利用するため、@sparticuz/chromium と組み合わせる場合は、Puppeteer の Chromium Support ページで推奨される @sparticuz/chromium のメジャー版を選ぶ。
- **Implications**: `api/_lib/options.ts` で chrome-aws-lambda の import を @sparticuz/chromium に変更し、`executablePath` を `await chromium.executablePath()` で取得する。開発時（isDev）の分岐は現状どおりローカル Chrome パスを維持。

### Docker ベースイメージ

- **Context**: 要件 1.3・5.2 に対応する Docker の Node 24 化。
- **Sources Consulted**: 既存 `docker/Dockerfile`（node:14.18.2-stretch）。
- **Findings**: 公式 Node イメージで node:24 系（例: node:24-alpine または node:24-bookworm）が利用可能。stretch は古いため、Bookworm または Alpine への移行を推奨。
- **Implications**: Dockerfile の `FROM` を node:24 系に変更。デプロイサイズや互換性の観点で Alpine か Bookworm を選択（設計で明記）。

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Option A: 既存拡張 | package.json / Docker / tech.md を更新し、options.ts のみ chrome-aws-lambda → @sparticuz/chromium に差し替え | 変更箇所が少ない。既存の getOptions 契約を維持。 | options.ts が Chromium 取得方法に依存する唯一のモジュールである必要がある | gap-analysis で推奨。chromium.ts は変更不要。 |
| Option B: Chromium ラッパー新設 | chromium-lambda.ts を新設し、本番時のみ @sparticuz/chromium を利用 | 責務分離が明確 | 呼び出し経路の変更が発生。本機能スコープでは過剰 | 採用しない。 |
| Option C: 段階的 | Phase 1 で engines/Docker/docs、Phase 2 で Chromium 差し替え | リスクを分離できる | Phase 1 のみでは本番画像生成が動かない（chrome-aws-lambda が Node 24 で失敗する想定） | 実装タスクの順序としては有効。設計では Option A を前提に変更セットを定義。 |

## Design Decisions

### Decision: 本番用 Chromium を @sparticuz/chromium に統一

- **Context**: chrome-aws-lambda は Node 20+ 非互換のため、Node 24 で本番スクリーンショットを実現するには代替が必要。
- **Alternatives Considered**:
  1. chrome-aws-lambda のフォークやパッチで Node 24 対応を試みる — メンテナンス負荷が高く、非推奨。
  2. @sparticuz/chromium を採用し、options.ts 内で差し替える — 既存の Options 契約と chromium.ts をそのまま利用可能。
- **Selected Approach**: options.ts で chrome-aws-lambda を削除し、@sparticuz/chromium を import。本番時（!isDev）は `executablePath: await chromium.executablePath()`、`args: chromium.args`、`headless: chromium.headless`（または同等）を返す。chromium.ts は変更しない。
- **Rationale**: 既存の「getOptions(isDev) が launch 用オプションを返す」という境界を維持し、変更を options.ts と依存リストに限定できる。
- **Trade-offs**: options.ts が Chromium パッケージに直接依存する構成は現状のまま。将来的に Lambda 以外のサーバーレス環境を追加する場合は、その時点でラッパーを検討可能。
- **Follow-up**: 実装時に @sparticuz/chromium と puppeteer-core の推奨バージョン組み合わせを Puppeteer Chromium Support で確認し、yarn.lock で固定する。

### Decision: Vercel ランタイムは engines.node で指定

- **Context**: 要件 1.2 で Vercel 上で Node 24 を使用する必要がある。
- **Alternatives Considered**:
  1. Project Settings のみで 24.x を指定 — リポジトリに設定が残らず、再現性に劣る。
  2. package.json の engines.node を "24.x" に設定 — Vercel がこれを参照するため、リポジトリ内で一貫して指定できる。
- **Selected Approach**: package.json の `engines.node` を `"24.x"` に更新する。vercel.json にはランタイム指定を追加しない。
- **Rationale**: 単一の真実の源（package.json）でランタイムを明示し、ローカル・CI・Vercel で同じバージョン要求を共有できる。
- **Trade-offs**: 特になし。Vercel のデフォルトが 24 以外の場合でも、engines が優先される。
- **Follow-up**: デプロイ後に Vercel の Function ログまたは設定画面で Node 24 が使われていることを確認する。

### Decision: Docker ベースイメージを node:24 系に更新

- **Context**: 要件 1.3・5.2 で Docker ビルド・実行を Node 24 で行う必要がある。
- **Alternatives Considered**:
  1. node:24-stretch — stretch は EOL に近く、セキュリティ更新が限られる。
  2. node:24-bookworm — Debian Bookworm ベース。安定性とパッケージの新しさのバランスが良い。
  3. node:24-alpine — イメージが小さい。glibc 依存のバイナリで問題が出る可能性がある（Chromium は本番では Vercel 上で動かすため、Docker 内では主に vercel dev 相当の検証用）。
- **Selected Approach**: Dockerfile の FROM を `node:24-bookworm-slim` など Node 24 系の公式イメージに変更する。具体的なタグは実装時に最新の LTS 推奨タグを採用。
- **Rationale**: 既存が stretch ベースだったため、Bookworm へ移行することで長期サポートとセキュリティ更新を得る。slim でイメージサイズを抑える。
- **Trade-offs**: ベースが変わるため、vim 等の追加インストールやユーザー設定が Dockerfile に残っている場合は動作確認が必要。
- **Follow-up**: docker/build.sh と docker/run.sh はそのまま利用し、ビルド・実行で画像生成が完了することを手動で確認する。

## Risks & Mitigations

- **@sparticuz/chromium の Node 24 未検証** — 公式およびコミュニティ情報では Node 24 で利用可能とされている。実装後に `vercel dev` およびデプロイでスクリーンショット生成を確認する。問題があれば Chromium のバージョン（メジャー）を変更して再検証。
- **puppeteer-core と @sparticuz/chromium のバージョン不整合** — Puppeteer の Chromium Support ページで推奨される @sparticuz/chromium のバージョンを採用する。実装タスクで「互換バージョンの組み合わせを明記」する。
- **Docker ベース変更によるレグレッション** — 移行後は docker/build.sh と docker/run.sh でビルド・起動し、プレビューと画像生成が成功することを確認する。必要に応じて Dockerfile 内の RUN（vim 等）を Bookworm 用に調整する。

## References

- [Vercel: Node.js 24 LTS GA](https://vercel.com/changelog/node-js-24-lts-is-now-generally-available-for-builds-and-functions) — Node 24 のビルド・Functions 対応
- [Vercel: Configuring the Runtime](https://vercel.com/docs/functions/configuring-functions/runtime) — ランタイム設定方法
- [@sparticuz/chromium (npm)](https://www.npmjs.com/package/@sparticuz/chromium) — 利用方法と executablePath/args
- [Puppeteer Chromium Support](https://pptr.dev/chromium-support) — puppeteer-core と @sparticuz/chromium のバージョン対応
