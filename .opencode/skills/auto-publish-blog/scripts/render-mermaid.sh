#!/usr/bin/env bash
set -euo pipefail

# 用法: render-mermaid.sh "<mermaid-code>" "<output-path>"
# 依赖: python3, curl
# 使用 mermaid.ink API 渲染 Mermaid 图表为 SVG

if [ $# -lt 2 ]; then
  echo "用法: $0 <mermaid-code> <output-path>" >&2
  exit 1
fi

MERMAID_CODE="$1"
OUTPUT="$2"

if ! command -v python3 &>/dev/null; then
  echo "错误: 需要 python3 命令" >&2
  exit 1
fi

mkdir -p "$(dirname "${OUTPUT}")"

TRUNCATED="${MERMAID_CODE}"
if [ ${#TRUNCATED} -gt 100 ]; then
  TRUNCATED="${TRUNCATED:0:100}..."
fi
echo "正在渲染 Mermaid 图表..."
echo "代码: ${TRUNCATED}"

# 使用 python3 进行 base64 编码
ENCODED=$(python3 -c "
import base64, sys
data = sys.argv[1].encode('utf-8')
encoded = base64.urlsafe_b64encode(data).decode('ascii')
print(encoded)
" "${MERMAID_CODE}")

URL="https://mermaid.ink/svg/${ENCODED}?bgColor=!white"

HTTP_CODE=$(curl -s -o "${OUTPUT}" -w "%{http_code}" \
  --max-time 30 --connect-timeout 10 \
  "${URL}")

if [ "${HTTP_CODE}" != "200" ]; then
  echo "错误: API 返回状态码 ${HTTP_CODE}" >&2
  rm -f "${OUTPUT}"
  exit 1
fi

FILE_SIZE=$(wc -c < "${OUTPUT}")
if [ "${FILE_SIZE}" -lt 100 ]; then
  echo "错误: 生成的文件过小 (${FILE_SIZE} bytes)" >&2
  rm -f "${OUTPUT}"
  exit 1
fi

echo "图表已保存到: ${OUTPUT} (${FILE_SIZE} bytes)"
