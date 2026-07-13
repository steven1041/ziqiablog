#!/usr/bin/env bash
set -euo pipefail

# 用法: generate-flux-image.sh "<prompt>" "<output-path>"
# 依赖: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN 环境变量, jq 命令

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

if ! command -v jq &>/dev/null; then
  echo "错误: 需要 jq 命令，请安装 (apt install jq / brew install jq)" >&2
  exit 1
fi

API_URL="https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/black-forest-labs/flux-1-schnell"

TRUNCATED_PROMPT="${PROMPT}"
if [ ${#TRUNCATED_PROMPT} -gt 100 ]; then
  TRUNCATED_PROMPT="${TRUNCATED_PROMPT:0:100}..."
fi
echo "正在生成图片..."
echo "Prompt: ${TRUNCATED_PROMPT}"

mkdir -p "$(dirname "${OUTPUT}")"

# 使用 jq 安全构建 JSON，避免 prompt 中的特殊字符破坏 JSON
JSON_DATA=$(jq -nc --arg prompt "${PROMPT}" '{prompt: $prompt, num_steps: 4}')

# 直接将二进制响应写入文件，避免命令替换丢失 NUL 字节
HTTP_CODE=$(curl -s -o "${OUTPUT}" -w "%{http_code}" \
  --max-time 120 --connect-timeout 10 \
  -X POST "${API_URL}" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "${JSON_DATA}")

if [ "${HTTP_CODE}" != "200" ]; then
  echo "错误: API 返回状态码 ${HTTP_CODE}" >&2
  head -c 500 "${OUTPUT}" >&2
  echo >&2
  exit 1
fi

# 验证文件是否为有效 PNG（检查 PNG 魔数 0x89）
if ! head -c1 "${OUTPUT}" | od -An -tx1 | grep -qi "89"; then
  echo "错误: API 未返回有效 PNG 图片" >&2
  head -c 500 "${OUTPUT}" >&2
  echo >&2
  exit 1
fi

# 使用 wc -c 替代 GNU 特有的 stat -c%s，提高可移植性
FILE_SIZE=$(wc -c < "${OUTPUT}")
if [ "${FILE_SIZE}" -lt 1000 ]; then
  echo "错误: 生成的文件过小 (${FILE_SIZE} bytes)，可能不是有效图片" >&2
  exit 1
fi

echo "图片已保存到: ${OUTPUT} (${FILE_SIZE} bytes)"
