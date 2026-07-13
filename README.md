# ZiQia.cc — AI 开发技术博客

个人 AI 开发技术博客（中文 + English），使用 Zola（Rust 静态站点生成器）构建，部署到 Cloudflare Pages。

## 技术栈

- **框架**: [Zola](https://www.getzola.org/) 纯静态站点生成器
- **模板**: Tera（手写）
- **样式**: 手写 CSS（无框架依赖）
- **代码高亮**: Zola 内置 syntect
- **搜索**: Pagefind
- **部署**: Cloudflare Pages
- **暗色模式**: CSS `prefers-color-scheme`

## 开发

```bash
# 安装 Zola（一次）
# 参见 https://www.getzola.org/documentation/getting-started/installation/

# 本地开发
zola serve

# 构建
zola build              # 输出到 public/
npx pagefind --site public  # 搜索索引
```

输出：`public/`

## 部署到 Cloudflare Pages

1. 在 Cloudflare Pages 创建新项目并连接本仓库
2. 构建命令：`zola build && npx pagefind --site public`
3. 输出目录：`public`
4. 环境变量（可选）：
   - `ADSENSE_CLIENT_ID`：Google AdSense 客户端 ID（不设置则不渲染广告脚本）
