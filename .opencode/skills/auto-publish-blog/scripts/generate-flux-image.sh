#!/usr/bin/env bash
set -euo pipefail

# 用法: generate-flux-image.sh "<prompt>" "<output-path>"
# 依赖: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN 环境变量

if [ $# -lt 2 ]; then
  echo "用法: $0 <prompt> <output-path>" >&2
  exit 1
fi

PROMPT="$1"
OUTPUT="$2"

if [ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]; then
  echo "错误: 未设置 CLOUDFLARE_ACCOUNT_ID 环境变量" >&2
  exit 1
fi

if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
  echo "错误: 未设置 CLOUDFLARE_API_TOKEN 环境变量" >&2
  exit 1
fi

API_URL="https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/black-forest-labs/flux-1-schnell"

echo "正在生成图片..."
echo "Prompt: ${PROMPT}"

# 确保输出目录存在
mkdir -p "$(dirname "${OUTPUT}")"

TMPFILE="${OUTPUT}.tmp"

BODY=$(jq -nc --arg p "$PROMPT" '{prompt: $p, num_steps: 4}')

HTTP_CODE=$(curl -s -o "${TMPFILE}" -w "%{http_code}" \
  -X POST "${API_URL}" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "${BODY}")

if [ "${HTTP_CODE}" != "200" ]; then
  echo "错误: API 返回状态码 ${HTTP_CODE}" >&2
  if [ -f "${TMPFILE}" ]; then
    head -c 500 "${TMPFILE}" >&2
    echo >&2
    rm -f "${TMPFILE}"
  fi
  exit 1
fi

# 检查响应是否为 JSON 错误（首字符是 {）
FIRST_BYTE=$(head -c 1 "${TMPFILE}")
if [ "${FIRST_BYTE}" = "{" ]; then
  echo "错误: API 返回 JSON 错误" >&2
  head -c 500 "${TMPFILE}" >&2
  echo >&2
  rm -f "${TMPFILE}"
  exit 1
fi

# 检查文件是否有效
FILE_SIZE=$(stat -c%s "${TMPFILE}" 2>/dev/null || echo 0)
if [ "${FILE_SIZE}" -lt 1000 ]; then
  echo "警告: 生成的文件过小 (${FILE_SIZE} bytes)，可能不是有效图片" >&2
  rm -f "${TMPFILE}"
  exit 1
fi

mv "${TMPFILE}" "${OUTPUT}"
echo "图片已保存到: ${OUTPUT} (${FILE_SIZE} bytes)"
