# Requirements Document

## Project Description (Input)
nodeのバージョンアップ (24系)

## Introduction
本プロジェクト（OGP 画像動的生成サービス）のランタイムを Node.js 14.x から Node.js 24 系へ移行する。package.json の engines、Vercel のランタイム設定、Docker および開発環境の記述を 24 系に合わせ、既存の API・Web・プレビュー機能が Node 24 で問題なく動作することを保証する。

## Requirements

### 1. ランタイム指定の更新
**Objective:** As a 開発者, I want ビルド・実行環境が Node.js 24 系で一貫して指定されること, so that 本番・ローカル・CI で同じランタイムが使われる。

#### Acceptance Criteria
1. The project shall specify Node.js 24.x（または 24 系を許容する範囲）を `package.json` の `engines.node` に記載する。
2. Where Vercel でデプロイする場合, the project shall use Node.js 24 をランタイムとして指定する（`vercel.json` またはプロジェクト設定で明示可能な場合）。
3. Where Docker でビルド・実行する場合, the project shall use Node.js 24 系のベースイメージを用いる。

### 2. 既存機能の動作保証
**Objective:** As a 開発者・利用者, I want API・Web プレビュー・画像生成が Node 24 環境で従来どおり動作すること, so that アップグレード後もサービスが継続利用できる。

#### Acceptance Criteria
1. When API にリクエストが送信される, the project shall パース・HTML 生成・スクリーンショット・画像返却が Node 24 上で完了する。
2. When プレビュー用 Web にアクセスする, the project shall パラメータ入力と画像 URL の表示・コピーが Node 24 上で動作する。
3. If Node 24 非互換の API や依存が存在する場合, the project shall 互換性を満たすよう依存の更新または差し替えを行う。

### 3. 依存関係の互換性
**Objective:** As a 開発者, I want 主要依存（TypeScript、puppeteer-core、chrome-aws-lambda、marked、twemoji 等）が Node 24 と互換であること, so that ビルド・実行時エラーを防ぐ。

#### Acceptance Criteria
1. The project shall 使用する npm パッケージが Node.js 24 でインストール・ビルド・実行可能である。
2. If 既存パッケージが Node 24 で動作しない場合, the project shall 互換バージョンへの更新または代替手段を採用する。
3. When `npm install` または `yarn install` を実行する, the project shall Node 24 環境で依存解決が成功する。

### 4. 開発・運用ドキュメントの整合
**Objective:** As a 開発者, I want steering および開発環境の記述が Node 24 を反映していること, so that 新規参加者や CI が正しいバージョンで作業できる。

#### Acceptance Criteria
1. The project shall `.kiro/steering/tech.md` および関連ドキュメント内の Node バージョン表記を 24 系に更新する。
2. Where 必要なツール（Node バージョン）が記載されている, the project shall Node.js 24.x を要求として明記する。
3. When Docker 利用手順が参照される, the project shall Node 24 系のイメージを用いる旨を反映する。

### 5. 検証可能性
**Objective:** As a 開発者, I want Node 24 環境での動作が手動またはスクリプトで確認できること, so that リグレッションを防げる。

#### Acceptance Criteria
1. When `vercel dev` を Node 24 で実行する, the project shall ローカルで API とプレビューが起動し、画像生成が完了する。
2. Where Docker で検証する場合, the project shall Node 24 ベースのイメージでビルド・実行し、同様に画像生成が完了する。
3. The project shall デプロイ先（Vercel）で Node 24 ランタイムが使用され、本番リクエストが正常に処理されることを確認可能である。
