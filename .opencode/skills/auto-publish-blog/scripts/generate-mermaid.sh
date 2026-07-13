#!/usr/bin/env bash
set -euo pipefail

# 用法: generate-mermaid.sh "<mermaid-code-or-file>" "<output-path>"
# 通过 kroki.io API 将 Mermaid 代码渲染为 SVG
# 第一个参数可以是 Mermaid 代码字符串，也可以是 .mmd 文件路径

if [ $# -lt 2 ]; then
  echo "用法: $0 <mermaid-code|.mmd-file> <output-path>" >&2
  exit 1
fi

INPUT="$1"
OUTPUT="$2"

# 如果第一个参数是文件路径，读取文件内容
if [ -f "$INPUT" ]; then
  MMD=$(cat "$INPUT")
else
  MMD="$INPUT"
fi

echo "正在生成 Mermaid 图表..."

# 确保输出目录存在
mkdir -p "$(dirname "${OUTPUT}")"

export MMD OUTPUT

python3 -c "
import urllib.request, base64, zlib, sys, os

mmd = os.environ['MMD']
output = os.environ['OUTPUT']

# 使用 kroki.io API（支持中文）
encoded = base64.urlsafe_b64encode(zlib.compress(mmd.encode('utf-8'), 9)).decode('ascii')
url = f'https://kroki.io/mermaid/svg/{encoded}'

req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    resp = urllib.request.urlopen(req, timeout=30)
    data = resp.read()
except Exception as e:
    print(f'Kroki API 错误: {e}', file=sys.stderr)
    sys.exit(1)

# 验证是有效的 SVG
if not data.startswith(b'<svg'):
    print(f'返回的不是有效 SVG: {data[:200]}', file=sys.stderr)
    sys.exit(1)

with open(output, 'wb') as f:
    f.write(data)

print(f'Mermaid SVG 已保存到: {output} ({len(data)} bytes)')
"
