#!/usr/bin/env bash
set -euo pipefail

# 用法: generate-flux-image.sh "<prompt>" "<output-path>"
# 密钥自动从 ~/.zshrc / ~/.bashrc / ~/.cloudflare-creds 读取

if [ $# -lt 2 ]; then
  echo "用法: $0 <prompt> <output-path>" >&2
  exit 1
fi

PROMPT="$1"
OUTPUT="$2"

# 自动从常见配置文件加载 Cloudflare 密钥
_load_creds() {
  for src in "$HOME/.cloudflare-creds" "$HOME/.zshrc" "$HOME/.bashrc"; do
    if [ -f "$src" ]; then
      eval "$(grep -E '^export CLOUDFLARE_(ACCOUNT_ID|API_TOKEN)=' "$src" 2>/dev/null || true)"
    fi
  done
}

if [ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ] || [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
  _load_creds
fi

if [ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]; then
  echo "错误: 未设置 CLOUDFLARE_ACCOUNT_ID，请在 ~/.zshrc 或 ~/.bashrc 中配置" >&2
  exit 1
fi

if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
  echo "错误: 未设置 CLOUDFLARE_API_TOKEN，请在 ~/.zshrc 或 ~/.bashrc 中配置" >&2
  exit 1
fi

echo "正在生成图片..."
echo "Prompt: ${PROMPT}"

# 确保输出目录存在
mkdir -p "$(dirname "${OUTPUT}")"

export PROMPT OUTPUT

python3 -c "
import json, urllib.request, base64, sys, os

prompt = os.environ['PROMPT']
api_url = f\"https://api.cloudflare.com/client/v4/accounts/{os.environ['CLOUDFLARE_ACCOUNT_ID']}/ai/run/@cf/black-forest-labs/flux-1-schnell\"
token = os.environ['CLOUDFLARE_API_TOKEN']
output = os.environ['OUTPUT']

width = int(os.environ.get('FLUX_WIDTH', '1024'))
height = int(os.environ.get('FLUX_HEIGHT', '576'))
body = json.dumps({'prompt': prompt, 'num_steps': 4, 'width': width, 'height': height}).encode()

req = urllib.request.Request(api_url, data=body, method='POST')
req.add_header('Authorization', f'Bearer {token}')
req.add_header('Content-Type', 'application/json')

try:
    resp = urllib.request.urlopen(req)
    data = resp.read()
except urllib.error.HTTPError as e:
    print(f'API 错误: HTTP {e.code} {e.reason}', file=sys.stderr)
    print(e.read()[:500], file=sys.stderr)
    sys.exit(1)

# 尝试解析 JSON 响应（FLUX 返回 JSON，内含 base64 图片数据）
try:
    result = json.loads(data)
    if 'result' in result and 'image' in result['result']:
        img_bytes = base64.b64decode(result['result']['image'])
    elif 'result' in result:
        print(f'API 返回 JSON 但格式不符: {json.dumps(result, ensure_ascii=False)[:300]}', file=sys.stderr)
        sys.exit(1)
    else:
        print(f'API 返回异常 JSON: {json.dumps(result, ensure_ascii=False)[:300]}', file=sys.stderr)
        sys.exit(1)
except (json.JSONDecodeError, UnicodeDecodeError):
    # 非 JSON 响应，可能是直接二进制图片
    img_bytes = data

if len(img_bytes) < 1000:
    print(f'警告: 生成的图片过小 ({len(img_bytes)} bytes)', file=sys.stderr)
    sys.exit(1)

with open(output, 'wb') as f:
    f.write(img_bytes)

print(f'图片已保存到: {output} ({len(img_bytes)} bytes)')
"
