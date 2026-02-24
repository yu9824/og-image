# Project Structure

## Organization Philosophy

API 中心の小さなリポジトリ。`api/` にサーバーレスエントリと共有ロジック、`web/` にプレビュー用の単一ページ。設定・Docker はルートに置く。機能ごとにファイルを分けるが、ディレクトリ階層は深くしない。

## Directory Patterns

### API エントリとルーティング
**Location**: `/api/`  
**Purpose**: Vercel サーバーレス関数のエントリ。`index.ts` が唯一のハンドラ。全リクエストは `vercel.json` の rewrites でここに来る。  
**Example**: `api/index.ts` — `parseRequest` → `getHtml` → `getScreenshot`、エラー時 500。

### API 共有ロジック（_lib）
**Location**: `/api/_lib/`  
**Purpose**: パース・HTML 生成・スクリーンショット・型・Chromium オプションなど、API から使う純粋なモジュール。`_` で「内部用」を示す。  
**Example**: `types.ts`（型）、`parser.ts`（URL/query → ParsedRequest）、`template.ts`（getHtml）、`chromium.ts`（getScreenshot）、`sanitizer.ts`、`options.ts`。

### プレビュー用 Web
**Location**: `/web/`  
**Purpose**: パラメータ入力と画像プレビュー用のクライアント。単一の `index.ts` で完結。`api/_lib/types` を import して URL を組み立てる。  
**Example**: `web/index.ts` — H/R で UI を組み、画像 URL を表示・コピー。

### 静的アセット（API 内）
**Location**: `/api/_fonts/`  
**Purpose**: 画像生成時に埋め込むフォント（woff2）。template から `readFileSync` で base64 読み込み。

### Docker
**Location**: `/docker/`  
**Purpose**: イメージビルド・コンテナ実行用の Dockerfile とシェル。本番と同様の環境でローカル検証するときに使う。

## Naming Conventions

- **Files**: 小文字とハイフン（vercel.json, docker 配下）。TS は camelCase ファイル名（index.ts, parser.ts, template.ts）。
- **Components / 関数**: PascalCase（コンポーネント名）、camelCase（関数・変数）。型は PascalCase（ParsedRequest, FileType, Pattern）。
- **内部用ディレクトリ**: `_lib`, `_fonts` のように `_` プレフィックスで「公開 API でない」ことを示す。

## Import Organization

- 相対インポートのみ。`./_lib/parser` のように同一パッケージ内は相対パス。
- Web から API の型を参照: `import { ParsedRequest, ... } from '../api/_lib/types'`。
- パスエイリアス（`@/`）は未使用。

## Code Organization Principles

- **api/index.ts**: 薄いハンドラに保ち、具体的な処理は `_lib` に委譲。
- **api/_lib**: 各ファイルは単一責務（parser＝リクエスト解釈、template＝HTML、chromium＝スクリーンショット、sanitizer＝エスケープ）。
- **型の共有**: リクエスト仕様は `ParsedRequest` に集約し、parser の出力と template の入力で同じ型を使う。
- **環境依存**: Chromium の実行パスや dev/prod の切り替えは `options.ts` に集約。秘密情報は steering に書かない。

---
_Document patterns, not file trees. New files following patterns shouldn't require updates_
