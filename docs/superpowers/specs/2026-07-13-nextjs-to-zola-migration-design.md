# Next.js → Zola 博客重构设计

## 背景

当前博客（ziqia.cc）基于 Next.js 16 + MDX 构建，静态导出部署到 Cloudflare Pages。迁移到 Zola（Rust 静态站点生成器）以降低构建复杂度、消除 Node.js 依赖链、加快构建速度。

## 迁移目标

- 移除 Node.js/React/TypeScript/Tailwind 等 npm 依赖
- 构建时间从 ~30 秒降至 <1 秒
- 部署方式简化为直接上传静态目录
- 新增英文语言版本（双语博客）
- 保留现有功能：暗色主题（系统偏好）、搜索（Pagefind）、代码高亮（Zola 内置）、RSS、Sitemap
- 不使用任何 Zola 网站主题或第三方主题，所有模板和样式完全手写

## 项目目录结构

```
myblog/
├── config.toml               # Zola 全站配置
├── content/
│   ├── cn/                    # 中文内容
│   │   ├── _index.md          #  首页
│   │   ├── about.md           #  关于页
│   │   ├── search.md          #  搜索页
│   │   └── posts/             #  文章（7 篇）
│   │       └── *.md
│   └── en/                    # 英文内容
│       ├── _index.md
│       ├── about.md
│       ├── search.md
│       └── posts/
│           └── *.md
├── templates/
│   ├── base.html              # HTML 骨架（header/nav/main/footer）
│   ├── index.html             # 首页模板
│   ├── page.html              # 普通页面（about）
│   ├── search.html            # 搜索页（内联 Pagefind JS）
│   ├── post.html              # 文章页
│   ├── categories/
│   │   ├── list.html          # 全部分类索引
│   │   └── single.html        # 单分类文章列表
│   └── tags/
│       ├── list.html          # 全部标签索引
│       └── single.html        # 单标签文章列表
├── static/
│   ├── style.css              # 手写 CSS（~400 行）
│   ├── copy-button.js         # 代码块复制（内联 ~20 行）
│   └── images/                # 图片资源
├── .gitignore
└── README.md
```

## URL 映射

| 页面 | 中文 | English |
|------|------|---------|
| 首页 | `/cn/` | `/en/` |
| 关于 | `/cn/about/` | `/en/about/` |
| 文章 | `/cn/posts/slug/` | `/en/posts/slug/` |
| 分类索引 | `/cn/categories/` | `/en/categories/` |
| 单分类 | `/cn/categories/tooling/` | `/en/categories/tooling/` |
| 标签索引 | `/cn/tags/` | `/en/tags/` |
| 单标签 | `/cn/tags/AI编程/` | `/en/tags/ai-coding/` |
| 搜索 | `/cn/search/` | `/en/search/` |

## 内容 Frontmatter 格式

```toml
+++
title = "五大 AI 编程 CLI 工具横评"
slug = "ai-coding-cli-tools-comparison"
date = 2026-07-13
[taxonomies]
categories = ["tooling"]
tags = ["AI编程", "CLI工具", "OpenCode", "Claude Code"]
[extra]
translation_key = "ai-coding-cli-tools-comparison"
featured = false
cover_alt = "五大 AI 编程 CLI 工具概念对比图，暗色主题霓虹风格的开发者工作站"
+++
```

## 模板结构

### base.html
- HTML 骨架，含 `<head>`（字符集、视口、SEO meta、规范 CSS）
- `<header>`：Logo（ZiQia.cc + 印章 SVG）、导航链接（首页/分类/标签/关于）、语言切换（中文/English）
- `<main>`：`{% block content %}{% endblock %}`
- `<footer>`：版权
- 暗色主题通过 CSS `prefers-color-scheme` 实现，无 JS

### index.html
- featured 文章（HeroCard 样式）
- 最近文章网格（grid-cols-3）
- 分类导航图标

### post.html
- 文章头（分类标签、标题、日期、阅读时间）
- 正文 Markdown 渲染
- 侧栏目录（Zola 内置 TOC）
- 上一篇/下一篇导航
- JSON-LD schema（BlogPosting）
- AdSense 条件加载（环境变量控制）

### page.html（about）
- Markdown 内容渲染

### search.html
- 搜索专用模板，内联 Pagefind JS 和搜索框
- 通过 frontmatter `template = "search.html"` 引用

### categories/list.html
- 列出全部分类及每类文章数

### tags/list.html
- 列出全部标签

### categories/single.html & tags/single.html
- 按分类/标签过滤的文章列表（网格布局）

## Zola 内置功能替代说明

| Next.js npm 包 | Zola 替代 |
|---------------|-----------|
| next-mdx-remote | 原生 Markdown 渲染 |
| shiki | Zola 内置 syntect 语法高亮（仅配色方案，无主题依赖）|
| gray-matter | 原生 TOML frontmatter |
| reading-time | page.reading_time 变量 |
| feed | generate_feed = true |
| tailwindcss | 手写 CSS（~400 行） |
| next-themes | prefers-color-scheme 媒体查询 |
| next/sitemap | generate_sitemap = true |
| next/link + next/router | 原生 HTML <a> 链接 |

## 保留的外部工具

- Pagefind（构建后执行索引）：`npx pagefind --site public`
- Google AdSense（条件加载，通过构建时环境变量）

## Config.toml 关键配置

```toml
base_url = "https://ziqia.cc"
default_language = "cn"
generate_feed = true
generate_sitemap = true
highlight_code = true
# 仅选择内置语法高亮的配色方案，不影响网站外观
highlight_theme = "github-light"
highlight_theme_dark = "ayu-dark"

taxonomies = [
  { name = "categories", feed = false },
  { name = "tags", feed = false },
]

[languages.cn]
title = "ZiQia.cc — AI 开发技术博客"
description = "关于提示工程、AI 编码工作流、工具生态等 AI 开发技术文章"
[languages.cn.translations]
home = "首页"
articles = "文章"
categories = "分类"
tags = "标签"
about = "关于"
search = "搜索"
read_more = "阅读全文"
reading_time = "{n} 分钟阅读"
featured = "精选"
previous = "上一篇"
next = "下一篇"
page_not_found = "页面未找到"
table_of_contents = "目录"
recent_posts = "最新文章"
recent_posts_sub = "AI 开发的实践、思考与工具"
browse_categories = "按主题浏览"
browse_categories_sub = "选择一个分类开始探索"
no_results = "没有找到相关结果"
search_placeholder = "搜索文章…"
search_hint = "输入关键词开始搜索"
back_home = "返回首页"
view_all = "查看全部"

[languages.en]
title = "ZiQia.cc — AI Development Blog"
description = "Articles about prompt engineering, AI coding workflows, tooling ecosystem"
[languages.en.translations]
home = "Home"
articles = "Articles"
categories = "Categories"
tags = "Tags"
about = "About"
search = "Search"
read_more = "Read More"
reading_time = "{n} min read"
featured = "Featured"
previous = "Previous"
next = "Next"
page_not_found = "Page Not Found"
table_of_contents = "Table of Contents"
recent_posts = "Recent Posts"
recent_posts_sub = "Practices, insights, and tools for AI development"
browse_categories = "Browse by Category"
browse_categories_sub = "Pick a category to start exploring"
no_results = "No results found"
search_placeholder = "Search articles…"
search_hint = "Type keywords to search"
back_home = "Back to Home"
view_all = "View All"
```

## Dark Mode（纯 CSS）

通过 `prefers-color-scheme` media query 实现，不提供手动切换按钮。

```css
:root {
  --surface: 255 255 255;
  --on-surface: 31 31 31;
  /* ... light tokens */
}

@media (prefers-color-scheme: dark) {
  :root {
    --surface: 31 31 31;
    --on-surface: 232 234 237;
    /* ... dark tokens */
  }
}
```

## 内容迁移（MDX → Markdown）

1. 文件名从 `.mdx` 改为 `.md`
2. Frontmatter 从 YAML `---` 改为 TOML `+++`
3. 移除 JSX 组件引用（CodeBlock 由代码栅栏替代）
4. `<img>` 标签改为标准 Markdown 图片语法
5. 表格已使用 Markdown 语法，无需改动
6. 代码块已使用标准栅栏格式，无需改动
7. `readingTime` 字段移除（Zola 自动计算）

## 构建流程

```bash
zola build                    # 输出到 public/
npx pagefind --site public    # 搜索索引
```

Cloudflare Pages 构建命令：`zola build && npx pagefind --site public`
输出目录：`public`

## 已删除的 Next.js 文件/目录

删除（移出版本控制）：
- `src/`（所有 React 组件、页面、lib）
- `next.config.mjs`
- `tsconfig.json`
- `tailwind.config.ts`
- `postcss.config.mjs`
- `vitest.config.ts`
- `open-next.config.ts`
- `package.json` / `package-lock.json`
- `node_modules/`
- `scripts/`
- `.nvmrc`

保留：`content/`、`public/images/`、`docs/`
