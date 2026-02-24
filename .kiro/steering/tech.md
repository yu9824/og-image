# Technology Stack

## Architecture

- **API**: 単一 HTTP ハンドラ（`api/index.ts`）。リクエストをパース → HTML 生成 → Headless Chrome でスクリーンショット → 画像返却。エラー時は 500 と HTML メッセージ。
- **Web**: プレビュー用の単一ページ。仮想 DOM 風の軽量ヘルパ（`H`, `R`, `copee`）で UI を構成し、画像 URL を動的に組み立てて表示・コピー。
- **Routing**: Vercel の `rewrites` で全パスを `/api` に転送。実質 API がルート。

## Core Technologies

- **Language**: TypeScript
- **Runtime**: Node.js 14.x（package.json engines）
- **Headless**: Puppeteer-core + chrome-aws-lambda（本番）、ローカルは OS の Chrome 実行パスを `options.ts` で指定
- **Deploy**: Vercel（vercel.json の rewrites のみ使用）

## Key Libraries

- **marked**: Markdown → HTML
- **twemoji**: 絵文字 → 画像/span
- **chrome-aws-lambda**: Lambda 向け Chromium バイナリ
- **puppeteer-core**: ヘッドレスブラウザ制御（スクリーンショット）

テンプレート HTML では KaTeX（CDN）で数式、YakuHanJPs / M PLUS 1p 等の Web フォントを使用。埋め込みフォントは `api/_fonts/` の woff2 を base64 で読み込み。

## Development Standards

### Type Safety

- `api/tsconfig.json`: `strict`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `noFallthroughCasesInSwitch`
- 共通型は `api/_lib/types.ts`（`ParsedRequest`, `FileType`, `Pattern`）で定義し、parser と template で共有

### Code Quality

- ビルド: `npm run build`（`tsc -p web/tsconfig.json`）。API は Vercel がビルド。
- 特別な ESLint/Prettier 設定は未導入。既存スタイル（インデント・クォート）に合わせる。

### Testing

- テストフレームワークは未導入。手動で `vercel dev` や Docker で動作確認。

## Development Environment

### Required Tools

- Node.js 14.x
- Vercel CLI（`vercel dev` / `vercel`）
- ローカルプレビュー時: Chrome（options.ts の `exePath`）
- Docker 利用時: docker と docker 用スクリプト（`docker/build.sh`, `docker/run.sh`）

### Common Commands

```bash
# 開発・デバッグ
vercel dev

# ビルド（web）
npm run build

# デプロイ
vercel

# Docker でビルド・実行
sh docker/build.sh
sh docker/run.sh
```

### Debug

- `OG_HTML_DEBUG=1`: 画像の代わりに生成 HTML を返す。テンプレート調整時に便利。

## Key Technical Decisions

- **API と Web の分離**: `api/` はサーバーレス関数、`web/` はプレビュー用のクライアント。型は `api/_lib/types.ts` を web が参照。
- **Chromium の切り替え**: 開発時はローカル Chrome、本番は chrome-aws-lambda。`getOptions(isDev)` で分岐。
- **HTML のサニタイズ**: ユーザー入力（テキスト・色・URL）は `sanitizeHtml` を通してから HTML に埋め込み、XSS を防止。
- **キャッシュ**: 画像は不変として 7 日キャッシュ。`no-transform` で CDN の改変を禁止。

---
_Document standards and patterns, not every dependency_
