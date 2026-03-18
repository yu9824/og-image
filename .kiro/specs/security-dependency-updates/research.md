# リサーチ & 設計判断ログ

---

## Summary

- **Feature**: `security-dependency-updates`
- **Discovery Scope**: Extension（既存プロジェクトの依存関係設定変更）
- **Key Findings**:
  - 脆弱なパッケージ（undici, tar, minimatch, @tootallnate/once）はすべて `vercel` devDependency の推移的依存として混入しており、直接依存には影響しない
  - `vercel` を最新版（50.32.5）に更新しても推移的依存のバージョンは修正されず、`npm overrides` による強制ピン留めが唯一の有効手段
  - `undici` は `@vercel/node`（5.28.4）と `@vercel/blob`（^6.23.0）が別メジャーバージョンを要求するため、ネスト形式の overrides で個別指定が必要

---

## Research Log

### 依存チェーン調査

- **Context**: どのパッケージが脆弱なバージョンを引き込んでいるかを特定するため `npm ls` で依存ツリーを確認
- **Sources Consulted**: ローカルで `npm ls undici tar minimatch @tootallnate/once --depth=3` を実行
- **Findings**:
  - `vercel@50.25.1`
    - `@vercel/blob@2.3.0` → `undici@6.23.0`（要 6.24.0）
    - `@vercel/node@5.6.9` → `undici@5.28.4`（要 5.29.0）
    - `@vercel/fun@1.3.0` → `tar@7.5.7`（要 7.5.11）、`@tootallnate/once@2.0.0`（要 3.0.1）
    - `@vercel/build-utils@13.6.1` → `@vercel/python-analysis@0.8.1` → `minimatch@10.1.1`（要 10.2.3）
- **Implications**: vercel の更新だけでは不十分。`package.json` の `overrides` で強制解決する

### vercel アップグレード効果の検証

- **Context**: `vercel` を 50.32.5 に更新した場合、推移的依存が修正されるか確認
- **Sources Consulted**: `npm show vercel@50.32.5 dependencies` および各サブパッケージの `dependencies` フィールドを調査
- **Findings**:
  - `vercel@50.32.5` でも `@vercel/fun@1.3.0`（tar 7.5.7、@tootallnate/once 2.0.0）・`@vercel/blob@2.3.0`（undici ^6.23.0）・`@vercel/node@5.6.15`（undici 5.28.4）は変わらず脆弱なまま
  - `@vercel/build-utils@13.8.0` でも `@vercel/python-analysis@0.9.1` が `minimatch@10.1.1` を依然として使用
- **Implications**: vercel アップグレードは必要なく、overrides のみで対応可能

### npm overrides の動作確認

- **Context**: `undici` が異なるメジャーバージョン（5.x と 6.x）を要求する場合の overrides 記法
- **Sources Consulted**: npm 公式ドキュメント（`package.json` の `overrides` フィールド）
- **Findings**:
  - フラット指定 `"undici": "X.Y.Z"` は全インスタンスに同一バージョンを強制し、メジャーバージョン違いによる互換性破壊リスクがある
  - ネスト指定（`"@vercel/node": { "undici": "5.29.0" }` + `"@vercel/blob": { "undici": "6.24.1" }`）なら依存元ごとに別バージョンを維持できる
- **Implications**: undici は必ずネスト形式で指定する。tar/minimatch/@tootallnate/once はフラット指定で問題なし

### パッチ済み最新バージョン確認

- **Context**: 各脆弱パッケージの修正済み最新バージョンを npm registry で確認
- **Sources Consulted**: `npm show <pkg> version` および `npm show <pkg> versions --json`
- **Findings**:
  - `undici`: 5.x 最新 = **5.29.0**、6.x 最新 = **6.24.1**
  - `tar`: 最新 = **7.5.11**
  - `minimatch`: 最新 10.x = **10.2.4**（要件では 10.2.3 以上）
  - `@tootallnate/once`: 最新 = **3.0.1**
- **Implications**: overrides でこれらのバージョンを指定することで全 Dependabot アラートを解消できる

---

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| npm overrides（ネスト形式） | `package.json` の `overrides` で依存元ごとに推移的依存バージョンを強制指定 | 最小変更・本番コードに影響なし・npm 標準機能 | overrides はメジャーバージョン互換性を保証しない | undici の 2 メジャーバージョン問題を安全に解決できる唯一の手段 |
| vercel アップグレード | `vercel` を最新版（50.32.5）にアップグレードして推移的依存を更新 | 依存全体を最新化できる | 検証の結果、最新 vercel でも脆弱なバージョンが残る | 単独では不十分 |
| 直接依存として追加 | 脆弱パッケージを `dependencies` に直接追加し npm の hoisting で上書き | 意図が明確 | hoisting の動作に依存するため不安定・非推奨 | overrides の方が確実 |

---

## Design Decisions

### Decision: npm overrides による推移的依存の強制解決

- **Context**: 脆弱パッケージはすべて `vercel` の推移的依存。`vercel` 本体のアップグレードでは解消されない
- **Alternatives Considered**:
  1. vercel アップグレードのみ — 検証済みで効果なし
  2. npm overrides（フラット形式）— undici の異なるメジャーバージョン問題で使用不可
  3. npm overrides（ネスト形式）— 依存元ごとに個別バージョンを維持できる
- **Selected Approach**: `package.json` に `overrides` フィールドを追加。undici のみネスト形式、他はフラット形式で指定
- **Rationale**: npm 標準機能であり、`package-lock.json` の再生成で確実にバージョンが固定される。本番コード（`api/`, `web/`）への変更ゼロ
- **Trade-offs**: 将来 vercel がこれらの脆弱パッケージを更新した際、overrides エントリが冗長になる可能性（npm audit でクリーンになったら削除すべき）
- **Follow-up**: `npm install` 後に `npm audit` で 0 件であることを確認し、`vercel dev` と `npm run build` で動作継続を検証

---

## Risks & Mitigations

- `@tootallnate/once@3.0.1` の API 変更 — `@vercel/fun` が内部で依存するため破壊的変更があれば実行時エラーの可能性 → `vercel dev` での動作確認で検出
- `undici@6.24.1` の `@vercel/blob` への影響 — `^6.23.0` 範囲内なので互換性リスクは低い
- `minimatch@10.2.4` のフラット override による他依存への影響 — 10.x は安定メジャーであり後方互換性あり

---

## References

- [npm overrides 公式ドキュメント](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#overrides)
- [GHSA-f269-vfmq-vjvj undici WebSocket overflow](https://github.com/nodejs/undici/security/advisories/GHSA-f269-vfmq-vjvj)
- [tar 7.5.11 changelog](https://github.com/npm/node-tar/releases)
