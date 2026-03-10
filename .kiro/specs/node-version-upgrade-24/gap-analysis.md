# Implementation Gap Analysis: node-version-upgrade-24

## 1. Current State Investigation

### 1.1 対象資産

| 種別 | 場所 | 現状 |
|------|------|------|
| ランタイム指定 | `package.json` | `engines.node: "14.x"` |
| Vercel 設定 | `vercel.json` | `rewrites` のみ。ランタイム未記載（Vercel は `engines.node` または Project Settings で判定） |
| Docker | `docker/Dockerfile` | `FROM node:14.18.2-stretch` |
| 開発ドキュメント | `.kiro/steering/tech.md` | 「Node.js 14.x」の記述が 2 箇所（Runtime / Required Tools） |
| API エントリ | `api/index.ts` | 単一ハンドラ。Node バージョンに直接依存する構文は未確認 |
| 共有ロジック | `api/_lib/` | parser, template, chromium, sanitizer, options, types。Chromium 実行パスは `options.ts` で集約 |
| プレビュー Web | `web/` | 単一ページ。ビルドは `tsc -p web/tsconfig.json` |

### 1.2 依存関係（現状）

- **dependencies**: `chrome-aws-lambda@7.0.0`, `marked@4.0.10`, `puppeteer-core@7.0.0`, `twemoji@13.0.1`
- **devDependencies**: `@types/marked`, `@types/puppeteer`, `@types/puppeteer-core`, `typescript@4.1.5`

**重要な制約**: `chrome-aws-lambda` は古く、Node.js 20+ と非互換の可能性が高い。Node 24 では **Research Needed**（後述）。

### 1.3 統合面

- データモデル: `api/_lib/types.ts` の `ParsedRequest` 等。Node バージョン非依存。
- 外部連携: Vercel サーバーレス、Headless Chrome（chrome-aws-lambda / ローカル Chrome）。Chrome バイナリ周りが Node 24 で要確認。
- テスト: 未導入。手動で `vercel dev` / Docker で確認。

---

## 2. Requirements Feasibility（要件 vs 現状）

| 要件領域 | 技術ニーズ | ギャップ | 備考 |
|----------|------------|----------|------|
| **1. ランタイム指定の更新** | engines 24.x、Vercel 24、Docker 24 ベースイメージ | **Missing**: いずれも 14 系のまま | 変更箇所は明確。Vercel は `engines.node` または Project Settings で 24.x 指定可能（公式ドキュメントで確認済み）。 |
| **2. 既存機能の動作保証** | API/Web が Node 24 で動作 | **Constraint**: chrome-aws-lambda が Node 24 非対応の可能性 | 本番スクリーンショットは Lambda 用 Chromium に依存。代替パッケージの選定が必須。 |
| **3. 依存関係の互換性** | 全 npm パッケージが Node 24 で動作 | **Missing**: chrome-aws-lambda の代替または更新<br>**Unknown**: TypeScript / marked / twemoji の 24 互換（通常は問題なし） | @sparticuz/chromium が Node 20+ 向けの代替として知られている。Node 24 は **Research Needed**。 |
| **4. ドキュメント整合** | steering 等の Node 表記を 24 系に | **Missing**: tech.md の 2 箇所を 24 系に更新 | 単純な置換で対応可能。 |
| **5. 検証可能性** | vercel dev / Docker / 本番で Node 24 動作確認 | **Missing**: Docker は 24 ベースイメージに変更後に検証 | 手順変更なし。 |

### 2.1 Research Needed（設計フェーズで詳細化）

- **chrome-aws-lambda の代替**: `@sparticuz/chromium` が Node 20+ で推奨されている。Node 24 での動作・Vercel デプロイ可否を設計フェーズで確認する。
- **Vercel 上の Node 24**: 公式で Node 24.x がビルド・Functions で利用可能。`engines.node: "24.x"` で指定可能。プロジェクト設定との優先順位は Vercel ドキュメントで確認。
- **puppeteer-core のバージョン**: @sparticuz/chromium と組み合わせる場合、互換バージョンの組み合わせを設計で決定する。

---

## 3. Implementation Approach Options

### Option A: 既存資産の拡張（推奨に近い）

- **内容**: `package.json` の engines を 24.x に変更。Dockerfile のベースイメージを `node:24.x` に変更。`tech.md` の Node 表記を 24 系に更新。本番 Chromium は `chrome-aws-lambda` を **@sparticuz/chromium** に差し替え、`api/_lib/chromium.ts`（および必要なら options）を修正して実行パス・オプションを合わせる。
- **変更ファイル**: `package.json`, `vercel.json`（必要なら）, `docker/Dockerfile`, `.kiro/steering/tech.md`, `api/_lib/chromium.ts`, 依存の追加・削除（chrome-aws-lambda 削除、@sparticuz/chromium 追加）。
- **Trade-offs**: 既存構成を活かせる。chromium モジュールのみ差し替えで済む。一方、chromium の API 差異がある場合は `chromium.ts` の変更がやや複雑になる。

### Option B: Chromium レイヤーのみ新規抽象化

- **内容**: 「Lambda 用 Chromium 取得」を薄いラッパー（例: `api/_lib/chromium-lambda.ts`）に切り出し、その中で @sparticuz/chromium を利用。既存 `chromium.ts` はローカル Chrome 用のままにして、呼び出し元で dev/prod に応じてラッパーか既存かを選択する。
- **Trade-offs**: 責務分離は明確になるが、ファイルが増え、呼び出し経路の変更が必要。Node 24 アップグレードというスコープでは過剰の可能性がある。

### Option C: ハイブリッド（段階的）

- **Phase 1**: engines / Docker / tech.md を 24 系に更新。依存は現状のまま `npm install` が通るか確認（chrome-aws-lambda は Node 24 で失敗する可能性が高い）。
- **Phase 2**: chrome-aws-lambda → @sparticuz/chromium に差し替え、`chromium.ts` を修正。Vercel でデプロイ・動作確認。
- **Phase 3**: 必要に応じて TypeScript / 他依存のマイナーバージョンアップ。
- **Trade-offs**: リスクを分離できる。Phase 1 で Node 24 のビルド・実行路を先に通し、Phase 2 で本番 Chromium のみ対応する形にできる。

---

## 4. Requirement-to-Asset Map（ギャップタグ付き）

| 要件 ID | 対象資産 | ギャップ | 対応方針 |
|---------|----------|----------|----------|
| 1.1 | `package.json` (engines) | Missing | 24.x に更新 |
| 1.2 | Vercel ランタイム | Missing | engines または Project Settings で 24.x 指定 |
| 1.3 | `docker/Dockerfile` | Missing | ベースイメージを node:24 系に変更 |
| 2.1–2.3 | api/index.ts, api/_lib/*, web/ | Constraint | Chromium 差し替え後に動作確認 |
| 3.1–3.3 | package.json (dependencies) | Missing / Unknown | chrome-aws-lambda 代替導入。他は必要なら更新 |
| 4.1–4.3 | `.kiro/steering/tech.md` 等 | Missing | Node 表記を 24 系に更新 |
| 5.1–5.3 | 手順・検証 | Missing | 変更後に vercel dev / Docker / 本番で再検証 |

---

## 5. Implementation Complexity & Risk

- **Effort**: **M**（3–7 日）  
  - 設定・ドキュメントの変更は小さいが、Chromium 差し替えと Vercel 上での動作確認に時間がかかる可能性。
- **Risk**: **Medium**  
  - @sparticuz/chromium と Node 24 の組み合わせは情報が限られる。Vercel の Node 24 は公式サポート済み。既存 API の変更は chromium モジュールに限定できる。

**理由**: 変更点は明確だが、本番画像生成が Chromium に強く依存するため、代替パッケージの選定・統合とデプロイ検証が成否を分ける。

---

## 6. Design Phase への推奨事項

- **推奨アプローチ**: **Option A（既存拡張）** を基本とし、Chromium のみ **chrome-aws-lambda → @sparticuz/chromium** に差し替える。Option C の Phase 1/2 の順序（先に engines/Docker/docs、次に Chromium）で進めると安全。
- **設計で決めること**:
  - `api/_lib/chromium.ts` の変更範囲（executablePath / オプションの取得方法を @sparticuz/chromium に合わせる）。
  - `puppeteer-core` と `@sparticuz/chromium` の互換バージョン組み合わせ。
  - Vercel で Node 24 を有効にする方法（`engines.node` 優先か、Project Settings のみか）の明文化。
- **Research として持ち越す項目**:
  - @sparticuz/chromium の Node 24 動作保証と Vercel デプロイ可否。
  - 必要に応じた puppeteer-core のバージョンアップと API 変更の有無。
