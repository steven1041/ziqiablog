# ZiQia.cc — AI 开发技术博客

单语言（中文）个人 AI 开发技术博客，使用 Next.js 14 + MDX 构建，静态导出并部署到 Cloudflare Pages。

## 主题

- 提示工程 (Prompt Engineering)
- AI 编码工作流 (AI Coding Workflows)
- 工具生态 (Tooling & Integration)
- 质量保障 (Quality & Review)
- 成本与效率 (Cost & Efficiency)
- 项目实践 (Real-World Practices)
- 安全与合规 (Security & Compliance)
- 团队协作 (Team Collaboration)
- 业界新闻 (AI News)

## 开发

```bash
npm install
npm run dev     # http://localhost:3000 → /cn
```

## 构建

```bash
npm run build   # next build + rss + pagefind
```

输出：`out/`

## 测试

```bash
npm test
```

## 部署到 Cloudflare Pages

1. 在 Cloudflare Pages 创建新项目并连接本仓库
2. 构建命令：`npm run build`
3. 输出目录：`out`
4. 环境：Node 20
5. 环境变量（可选）：
   - `NEXT_PUBLIC_ADSENSE_CLIENT_ID`：Google AdSense 客户端 ID（不设置则不渲染广告脚本）

## 字体

构建使用 system-ui 字体栈避免静态导出的网络依赖。如需切换到 Google Fonts（Inter / Roboto / Noto Sans SC），修改 `src/app/layout.tsx`、`src/styles/globals.css` 和 `tailwind.config.ts`。
