#!/usr/bin/env bash
# Task 5.1: vercel dev でローカル起動した状態で、プレビュー・画像生成が成功することを確認する。
# 事前に別ターミナルで `npx vercel dev` を実行しておくこと。
set -e

BASE_URL="${1:-http://127.0.0.1:3000}"
OUTPUT_FILE="${2:-}"

echo "=== vercel dev 検証 (Node 24) ==="
echo "対象: $BASE_URL"

# 1) プレビュー: ルートまたはパスで画像生成リクエスト
echo -n "画像生成 (GET /Test%20Image.png): "
RESP=$(curl -s -o /tmp/og-verify.png -w "%{http_code}|%{content_type}" --max-time 30 "$BASE_URL/Test%20Image.png" || true)
HTTP_CODE="${RESP%%|*}"
CONTENT_TYPE="${RESP##*|}"

if [ "$HTTP_CODE" != "200" ]; then
  echo "FAIL (HTTP $HTTP_CODE)"
  echo "  vercel dev が起動しているか、$BASE_URL でアクセスできるか確認してください。"
  exit 1
fi

if [[ "$CONTENT_TYPE" != image/png* && "$CONTENT_TYPE" != image/jpeg* ]]; then
  echo "FAIL (Content-Type: $CONTENT_TYPE)"
  exit 1
fi

echo "OK (HTTP $HTTP_CODE, $CONTENT_TYPE)"
FILE_INFO=$(file -b /tmp/og-verify.png 2>/dev/null || true)
echo "  生成ファイル: $FILE_INFO"

if [ -n "$OUTPUT_FILE" ]; then
  cp /tmp/og-verify.png "$OUTPUT_FILE"
  echo "  保存先: $OUTPUT_FILE"
fi

echo "=== 検証完了: プレビュー・画像生成は正常に動作しています ==="
