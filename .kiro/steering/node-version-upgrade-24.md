# Node.js 24 アップグレード

## 背景

Node.js 14.x から Node.js 24.x への移行。ランタイム・依存・Docker を 24 系に統一し、本番用 Chromium を `chrome-aws-lambda`（Node 20+ 非互換）から `@sparticuz/chromium` に差し替えた。

## ランタイム指定

| 環境 | 指定方法 |
|------|----------|
| Vercel | `package.json` の `engines.node: "24.x"`（Vercel は engines を自動参照） |
| Docker | `FROM node:24-bookworm-slim` |
| ローカル | Volta で 24.14.0 を固定 |

Vercel に `vercel.json` での追加設定は不要。

## 本番用 Chromium の切り替えパターン

`api/_lib/options.ts` の `getOptions(isDev)` が Chromium 起動オプションを抽象化する。

```typescript
// 開発: ローカル Chrome
// 本番: @sparticuz/chromium
export async function getOptions(isDev: boolean): Promise<Options> {
    if (isDev) {
        return { args: [], executablePath: exePath, headless: true };
    }
    return {
        args: chromium.args,
        executablePath: await chromium.executablePath(), // 非同期
        headless: chromium.headless,
    };
}
```

**重要**: `Options` 型（`args`, `executablePath`, `headless`）は変更しない。`chromium.ts` は `getOptions` の戻り値をそのまま `puppeteer-core` の `launch()` に渡す。

## 依存関係

| パッケージ | 状態 | 理由 |
|-----------|------|------|
| `@sparticuz/chromium` | 追加（本番用） | Node 24 互換の Chromium バイナリ |
| `chrome-aws-lambda` | **削除** | Node 20+ 非互換 |
| `puppeteer-core` | 維持 | `@sparticuz/chromium` と互換バージョンを使用 |

バージョン選定は [Puppeteer Chromium Support](https://pptr.dev/chromium-support) に従う。

## ローカル Chrome パス（開発時）

```typescript
const exePath =
    process.platform === 'win32'
        ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        : process.platform === 'linux'
          ? '/usr/bin/google-chrome'
          : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
```

## 検証手順

```bash
# 1. ローカル（vercel dev）
vercel dev
node scripts/verify-vercel-dev.mjs

# 2. Docker
./docker/build.sh && ./docker/run.sh
# コンテナ内で vercel dev を起動し画像生成を確認

# 3. 本番（デプロイ後）
# Vercel ダッシュボードのログで Node 24 を確認
# 本番 URL に画像生成リクエストを送信
```

## ロールバック手順

1. `package.json` の `engines.node` を元のバージョンに戻す
2. `chrome-aws-lambda` を再追加し、`@sparticuz/chromium` を削除
3. `api/_lib/options.ts` の import と本番分岐を元に戻す
4. `docker/Dockerfile` の `FROM` を旧バージョンに戻す
5. 再デプロイ

## 残タスク（tasks.md 参照）

- [ ] 5.2: Docker でビルド・実行し画像生成を確認
- [ ] 5.3: 本番 Vercel で Node 24 使用確認・画像生成レスポンス確認
