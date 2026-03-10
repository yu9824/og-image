# Product Overview

OGP（Open Graph）画像を動的に生成するサーバーレスサービス。URL のパス・クエリでテキストやスタイルを指定すると、その内容を描画した画像（PNG/JPEG）を返す。ブログ・ドキュメントの `<meta property="og:image">` 用画像を、記事ごとに手軽に生成するためのツール。

## Core Capabilities

- **動的画像生成**: パス（テキスト）とクエリ（pattern, fontSize, width, md, textColor, textStrongColor, overlay）で画像を生成
- **Markdown / 数式 / 絵文字対応**: プレーンテキストまたは Markdown、KaTeX による数式、Twemoji による絵文字表示
- **プレビュー UI**: パラメータを変更しながらリアルタイムで画像をプレビューし、URL をコピー可能
- **キャッシュ**: レスポンスに長期キャッシュ（s-maxage=604800）を付与し CDN で効率化
- **デバッグモード**: 環境変数で HTML をそのまま返し、ブラウザ DevTools でテンプレートを調整可能

## Target Use Cases

- ブログ・ドキュメントの OGP 画像を記事タイトルなどから自動生成したい
- SNS や Slack でリンクを共有したときのプレビュー画像を統一・カスタマイズしたい
- ローカル（Docker / vercel dev）でプレビューしながらテンプレートやフォントを調整したい

## Value Proposition

記事ごとに手書きで画像を作る手間を省き、URL を貼るだけで一意の OGP 画像が得られる。Vercel へのデプロイでサーバーレス運用が容易。フォーク元（vercel/og-image → eyemono-og-image）の流れを引き継ぎ、自前ドメイン・フォント・オーバーレイでカスタマイズ可能。

---
_Focus on patterns and purpose, not exhaustive feature lists_
