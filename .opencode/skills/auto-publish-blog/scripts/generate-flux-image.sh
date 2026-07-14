#!/usr/bin/env bash
set -euo pipefail

# 如果环境变量未设置，尝试从 ~/.bashrc 加载
if [ -z "${CLOUDFLARE_API_TOKEN:-}" ] || [ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]; then
  [ -f ~/.bashrc ] && source ~/.bashrc
fi

# 用法: generate-flux-image.sh "<prompt>" "<output-path>" [width] [height]
# 依赖: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN 环境变量, python3 或 jq 命令
# 默认尺寸: 1200x632 (Open Graph 标准，宽高须为 8 的倍数)

if [ $# -lt 2 ]; then
  echo "用法: $0 <prompt> <output-path> [width] [height]" >&2
  echo "默认尺寸: 1200x632 (Open Graph 标准，宽高须为 8 的倍数)" >&2
  exit 1
fi

PROMPT="$1"
OUTPUT="$2"
WIDTH="${3:-1200}"
HEIGHT="${4:-632}"

if [ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]; then
  echo "错误: 未设置 CLOUDFLARE_ACCOUNT_ID 环境变量" >&2
  exit 1
fi

if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
  echo "错误: 未设置 CLOUDFLARE_API_TOKEN 环境变量" >&2
  exit 1
fi

# 检查 JSON 处理工具：优先 python3，其次 jq
if command -v python3 &>/dev/null; then
  JSON_TOOL="python3"
elif command -v jq &>/dev/null; then
  JSON_TOOL="jq"
else
  echo "错误: 需要 python3 或 jq 命令" >&2
  exit 1
fi

API_URL="https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/black-forest-labs/flux-1-schnell"

TRUNCATED_PROMPT="${PROMPT}"
if [ ${#TRUNCATED_PROMPT} -gt 100 ]; then
  TRUNCATED_PROMPT="${TRUNCATED_PROMPT:0:100}..."
fi
echo "正在生成图片 (${WIDTH}x${HEIGHT})..."
echo "Prompt: ${TRUNCATED_PROMPT}"

mkdir -p "$(dirname "${OUTPUT}")"

# 使用 python3 或 jq 安全构建 JSON
if [ "$JSON_TOOL" = "python3" ]; then
  JSON_DATA=$(python3 -c "import json,sys; print(json.dumps({'prompt': sys.argv[1], 'num_steps': 4, 'width': int(sys.argv[2]), 'height': int(sys.argv[3])}))" "${PROMPT}" "${WIDTH}" "${HEIGHT}")
else
  JSON_DATA=$(jq -nc --arg prompt "${PROMPT}" --argjson width "${WIDTH}" --argjson height "${HEIGHT}" '{prompt: $prompt, num_steps: 4, width: $width, height: $height}')
fi

# 调用 API，将响应保存到临时文件
RESPONSE_FILE=$(mktemp)
trap 'rm -f "${RESPONSE_FILE}"' EXIT

HTTP_CODE=$(curl -s -o "${RESPONSE_FILE}" -w "%{http_code}" \
  --max-time 120 --connect-timeout 10 \
  -X POST "${API_URL}" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "${JSON_DATA}")

if [ "${HTTP_CODE}" != "200" ]; then
  echo "错误: API 返回状态码 ${HTTP_CODE}" >&2
  head -c 500 "${RESPONSE_FILE}" >&2
  echo >&2
  exit 1
fi

# 从 JSON 响应中提取 base64 图片数据并解码
if [ "$JSON_TOOL" = "python3" ]; then
  python3 -c "
import json, base64, sys
with open(sys.argv[1]) as f:
    data = json.load(f)
image_b64 = data.get('result', {}).get('image', '')
if not image_b64:
    print('错误: 响应中未找到图片数据', file=sys.stderr)
    sys.exit(1)
with open(sys.argv[2], 'wb') as f:
    f.write(base64.b64decode(image_b64))
" "${RESPONSE_FILE}" "${OUTPUT}"
else
  # 使用 jq 提取 base64，然后用 base64 命令解码
  IMAGE_B64=$(jq -r '.result.image' "${RESPONSE_FILE}")
  if [ -z "${IMAGE_B64}" ] || [ "${IMAGE_B64}" = "null" ]; then
    echo "错误: 响应中未找到图片数据" >&2
    exit 1
  fi
  echo "${IMAGE_B64}" | base64 -d > "${OUTPUT}"
fi

# 验证文件是否为有效图片（检查 PNG 魔数 0x89 或 JPEG 魔数 0xFF）
FIRST_BYTE=$(head -c1 "${OUTPUT}" | od -An -tx1 | tr -d ' ')
if [[ "${FIRST_BYTE}" != "89" ]] && [[ "${FIRST_BYTE}" != "ff" ]]; then
  echo "错误: 未生成有效图片文件" >&2
  head -c 100 "${OUTPUT}" >&2
  echo >&2
  exit 1
fi

# 检查文件大小
FILE_SIZE=$(wc -c < "${OUTPUT}")
if [ "${FILE_SIZE}" -lt 1000 ]; then
  echo "错误: 生成的文件过小 (${FILE_SIZE} bytes)，可能不是有效图片" >&2
  exit 1
fi

echo "图片已保存到: ${OUTPUT} (${FILE_SIZE} bytes)"
