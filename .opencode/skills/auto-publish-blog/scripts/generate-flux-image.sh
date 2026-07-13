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

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "${API_URL}" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"prompt\": \"${PROMPT}\", \"num_steps\": 4}")

HTTP_CODE=$(echo "${RESPONSE}" | tail -1)
BODY=$(echo "${RESPONSE}" | sed '$d')

if [ "${HTTP_CODE}" != "200" ]; then
  echo "错误: API 返回状态码 ${HTTP_CODE}" >&2
  echo "${BODY}" >&2
  exit 1
fi

# 检查响应是否为 JSON（可能是错误消息）
if echo "${BODY}" | head -c 1 | grep -q '{'; then
  echo "错误: API 返回 JSON 错误" >&2
  echo "${BODY}" >&2
  exit 1
fi

# 将二进制响应写入文件
echo "${BODY}" > "${OUTPUT}"

# 检查文件是否有效
FILE_SIZE=$(stat -c%s "${OUTPUT}" 2>/dev/null || echo 0)
if [ "${FILE_SIZE}" -lt 1000 ]; then
  echo "警告: 生成的文件过小 (${FILE_SIZE} bytes)，可能不是有效图片" >&2
  exit 1
fi

echo "图片已保存到: ${OUTPUT} (${FILE_SIZE} bytes)"
