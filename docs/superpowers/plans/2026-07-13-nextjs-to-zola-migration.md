# Next.js → Zola 博客重构实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 ziqia.cc 从 Next.js 16 + MDX 重构为 Zola（Rust）静态博客，新增英文语言版本

**Architecture:** Zola 静态站点生成器 + 手写 CSS + 内联 JS（copy button），系统偏好暗色模式，Pagefind 搜索，Cloudflare Pages 部署

**Tech Stack:** Zola, Tera templates, Pagefind, hand-written CSS

## Global Constraints

- 不使用任何 Zola 网站主题或第三方 CSS 框架
- 所有模板（Tera）和样式完全手写
- 内容从 MDX 迁移为 Zola Markdown（TOML frontmatter）
- 暗色模式仅通过 `prefers-color-scheme` CSS media query 实现，无 JS 切换
- 代码高亮使用 Zola 内置 syntect，`highlight_theme = "github-light"` / `highlight_theme_dark = "ayu-dark"`
- Slugs 保持与当前一致
- 构建命令：`zola build && npx pagefind --site public`
- 输出目录：`public/`

---

### Task 1: Zola 项目脚手架 + CSS + 内容迁移

**Files:**
- Create: `config.toml`
- Create: `static/style.css`
- Create: `.gitignore`（覆盖现有）
- Create: `content/cn/_index.md`
- Create: `content/cn/about.md`
- Create: `content/cn/search.md`
- Create: `content/cn/posts/_index.md`（posts section 索引）
- Create: `content/cn/posts/*.md`（迁移 7 篇现有文章）

**Interfaces:**
- Consumes: 当前 `content/cn/posts/*.mdx`、`content/cn/about.mdx`
- Produces: 完整 Zola 内容树，所有 frontmatter 转为 TOML 格式

- [ ] **Step 1: 创建 config.toml**

```toml
base_url = "https://ziqia.cc"
default_language = "cn"
generate_feed = true
generate_sitemap = true
highlight_code = true
highlight_theme = "github-light"
highlight_theme_dark = "ayu-dark"
build_search_index = false

taxonomies = [
  { name = "categories", feed = false },
  { name = "tags", feed = false },
]

[markdown]
# 保持与现有表格、代码块一致

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

- [ ] **Step 2: 创建 static/style.css**

```css
:root {
  --surface: 255 255 255;
  --surface-variant: 241 243 244;
  --surface-dim: 248 249 250;
  --on-surface: 31 31 31;
  --on-surface-variant: 95 99 104;
  --outline: 218 220 224;
  --outline-variant: 232 234 237;
  --primary-container: 211 227 253;
  --google-blue: #4285F4;
  --google-blue-cta: #1A73E8;
  --google-red: #EA4335;
  --google-yellow: #F9AB00;
  --google-green: #34A853;
}

@media (prefers-color-scheme: dark) {
  :root {
    --surface: 31 31 31;
    --surface-variant: 42 42 42;
    --surface-dim: 22 22 22;
    --on-surface: 232 234 237;
    --on-surface-variant: 154 160 166;
    --outline: 60 64 67;
    --outline-variant: 42 42 42;
    --primary-container: 4 30 73;
  }
}

/* Reset & base */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans SC', sans-serif; -webkit-font-smoothing: antialiased; }
body { background: rgb(var(--surface)); color: rgb(var(--on-surface)); min-height: 100vh; display: flex; flex-direction: column; }

/* Layout */
.max-w-1280 { max-width: 1280px; margin: 0 auto; }
.px-5 { padding-left: 1.25rem; padding-right: 1.25rem; }
.py-8 { padding-top: 2rem; padding-bottom: 2rem; }
.py-10 { padding-top: 2.5rem; padding-bottom: 2.5rem; }
.py-12 { padding-top: 3rem; padding-bottom: 3rem; }
@media (min-width: 768px) { .md\:px-10 { padding-left: 2.5rem; padding-right: 2.5rem; } }

/* Header */
.header { position: sticky; top: 0; z-index: 50; display: flex; align-items: center; justify-content: space-between; gap: 1rem; border-bottom: 1px solid rgb(var(--outline-variant)); background: rgb(var(--surface) / 0.9); padding: 1rem 1.25rem; backdrop-filter: blur(12px); }
@media (min-width: 768px) { .header { padding-left: 2.5rem; padding-right: 2.5rem; } }
.header-logo { display: flex; align-items: center; gap: 0.625rem; text-decoration: none; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans SC', sans-serif; font-size: 1.25rem; font-weight: 700; letter-spacing: -0.025em; color: var(--google-blue-cta); }
.header-nav { display: none; gap: 0.25rem; }
@media (min-width: 768px) { .header-nav { display: flex; } }
.header-nav a { border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; font-weight: 500; color: rgb(var(--on-surface-variant)); text-decoration: none; transition: background 0.15s, color 0.15s; }
.header-nav a:hover { background: rgb(var(--surface-variant)); color: rgb(var(--on-surface)); }
.header-nav a.active { background: rgb(var(--primary-container)); color: var(--google-blue-cta); }
.header-actions { display: flex; align-items: center; gap: 0.5rem; }

/* Language switcher */
.lang-switch { display: flex; align-items: center; gap: 0.25rem; }
.lang-switch a { padding: 0.375rem 0.625rem; border-radius: 0.375rem; font-size: 0.8125rem; font-weight: 600; text-decoration: none; color: rgb(var(--on-surface-variant)); transition: background 0.15s; }
.lang-switch a:hover { background: rgb(var(--surface-variant)); }
.lang-switch a.active { color: var(--google-blue-cta); background: rgb(var(--primary-container)); }

/* Hero card */
.hero-card { display: grid; grid-template-columns: 1fr; overflow: hidden; border-radius: 24px; border: 1px solid rgb(var(--outline-variant)); background: rgb(var(--surface-dim)); }
@media (min-width: 768px) { .hero-card { grid-template-columns: 1.3fr 1fr; } }
.hero-visual { position: relative; display: flex; min-height: 260px; align-items: center; justify-content: center; overflow: hidden; padding: 2.5rem; color: #fff; }
@media (min-width: 768px) { .hero-visual { min-height: 420px; } }
.hero-visual .bg-circle { position: absolute; right: -2.5rem; top: -2.5rem; width: 12rem; height: 12rem; border-radius: 50%; background: rgba(255,255,255,0.15); }
.hero-visual .content { position: relative; z-index: 10; text-align: center; }
.hero-visual .badge { display: inline-block; margin-bottom: 1.25rem; border-radius: 9999px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.2); padding: 0.25rem 1rem; font-size: 0.75rem; font-weight: 500; backdrop-filter: blur(4px); }
.hero-visual .title { font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans SC', sans-serif; font-size: 3rem; font-weight: 700; letter-spacing: -0.025em; line-height: 1.1; }
.hero-text { display: flex; flex-direction: column; justify-content: center; padding: 2rem; }
@media (min-width: 768px) { .hero-text { padding: 3rem; } }
.hero-text .label { margin-bottom: 0.75rem; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans SC', sans-serif; font-size: 0.8125rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--google-blue-cta); }
.hero-text h1 { margin-bottom: 1rem; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans SC', sans-serif; font-size: 1.5rem; font-weight: 700; line-height: 1.2; letter-spacing: -0.025em; }
@media (min-width: 768px) { .hero-text h1 { font-size: 2.25rem; } }
.hero-text p { margin-bottom: 1.75rem; max-width: 28rem; font-size: 1rem; line-height: 1.625; color: rgb(var(--on-surface-variant)); }
.hero-meta { display: flex; align-items: center; gap: 0.75rem; border-top: 1px solid rgb(var(--outline-variant)); padding-top: 1.25rem; }
.hero-avatar { display: grid; width: 2.5rem; height: 2.5rem; place-items: center; border-radius: 9999px; font-weight: 700; color: #fff; }
.hero-attribution { font-size: 0.875rem; }
.hero-attribution .name { font-weight: 700; }
.hero-attribution .meta { font-size: 0.8125rem; color: rgb(var(--on-surface-variant)); }
.btn-primary { display: inline-block; margin-left: auto; border-radius: 9999px; background: var(--google-blue-cta); padding: 0.75rem 1.5rem; font-size: 0.875rem; font-weight: 700; color: #fff; text-decoration: none; box-shadow: 0 1px 3px rgba(60,64,67,0.3); transition: background 0.15s; }
.btn-primary:hover { background: #1765CC; }

/* Section */
.section { margin-bottom: 2.5rem; }
.section-header { display: flex; align-items: flex-end; justify-content: space-between; border-bottom: 1px solid rgb(var(--outline-variant)); padding-bottom: 1rem; margin-bottom: 1.75rem; }
.section-header h2 { font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans SC', sans-serif; font-size: 1.5rem; font-weight: 700; letter-spacing: -0.025em; }
.section-header p { margin-top: 0.25rem; font-size: 0.875rem; color: rgb(var(--on-surface-variant)); }

/* Grids */
.grid { display: grid; gap: 1.5rem; }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-9 { grid-template-columns: repeat(9, 1fr); }
@media (min-width: 768px) { .md\:grid-cols-2 { grid-template-columns: repeat(2, 1fr); } .md\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); } .md\:grid-cols-5 { grid-template-columns: repeat(5, 1fr); } }
@media (min-width: 1024px) { .lg\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); } .lg\:grid-cols-4 { grid-template-columns: repeat(4, 1fr); } .lg\:grid-cols-9 { grid-template-columns: repeat(9, 1fr); } }

/* Article card */
.article-card { overflow: hidden; border-radius: 16px; border: 1px solid rgb(var(--outline-variant)); background: rgb(var(--surface)); transition: box-shadow 0.15s; }
.article-card:hover { box-shadow: 0 1px 3px rgba(60,64,67,0.15), 0 4px 12px rgba(60,64,67,0.1); }
.article-card a { text-decoration: none; color: inherit; }
.article-card .card-visual { height: 9rem; width: 100%; position: relative; }
.article-card .card-cat { position: absolute; top: 0.75rem; left: 0.75rem; display: inline-block; border-radius: 9999px; background: rgba(255,255,255,0.95); padding: 0.25rem 0.625rem; font-size: 0.6875rem; font-weight: 700; }
.article-card .card-body { padding: 1rem; }
.article-card .card-body h3 { margin-bottom: 0.5rem; font-size: 1.125rem; font-weight: 700; line-height: 1.25; }
.article-card .card-body p { margin-bottom: 1rem; font-size: 0.875rem; line-height: 1.625; color: rgb(var(--on-surface-variant)); }
.article-card .card-footer { display: flex; align-items: center; justify-content: space-between; font-size: 0.8125rem; color: rgb(var(--on-surface-variant)); }
.article-card .card-footer .read-more { font-weight: 600; color: var(--google-blue-cta); }

/* Category icon */
.cat-icon-link { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; text-decoration: none; }
.cat-icon-link span { font-size: 0.75rem; font-weight: 600; color: rgb(var(--on-surface-variant)); text-align: center; }
.cat-icon { display: grid; width: 56px; height: 56px; place-items: center; border-radius: 16px; transition: transform 0.15s; }
.cat-icon:hover { transform: scale(1.05); }

/* Post page */
.post-layout { display: grid; gap: 2.5rem; padding: 2rem 0; }
@media (min-width: 1024px) { .post-layout { grid-template-columns: 1fr 220px; } }
article { min-width: 0; }
.post-header { margin-bottom: 1.5rem; }
.post-cat { display: inline-block; border-radius: 9999px; padding: 0.25rem 0.75rem; font-size: 0.75rem; font-weight: 700; }
.post-header h1 { margin-top: 1rem; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans SC', sans-serif; font-size: 1.875rem; font-weight: 700; line-height: 1.15; letter-spacing: -0.025em; }
@media (min-width: 768px) { .post-header h1 { font-size: 2.25rem; } }
.post-meta { margin-top: 0.75rem; display: flex; align-items: center; gap: 0.75rem; font-size: 0.875rem; color: rgb(var(--on-surface-variant)); }
.post-avatar { display: grid; width: 2.25rem; height: 2.25rem; place-items: center; border-radius: 9999px; font-weight: 700; color: #fff; }

/* Prose content */
.prose { max-width: none; font-size: 1rem; line-height: 1.75; color: rgb(var(--on-surface)); }
.prose h2 { margin-top: 2rem; margin-bottom: 0.75rem; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans SC', sans-serif; font-size: 1.5rem; font-weight: 700; letter-spacing: -0.025em; }
.prose h3 { margin-top: 1.5rem; margin-bottom: 0.5rem; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans SC', sans-serif; font-size: 1.25rem; font-weight: 600; letter-spacing: -0.025em; }
.prose p { margin-bottom: 1rem; }
.prose a { color: var(--google-blue-cta); text-decoration: underline; text-underline-offset: 2px; }
.prose a:hover { color: #1765CC; }
.prose ul, .prose ol { margin-bottom: 1rem; padding-left: 1.5rem; }
.prose li { margin-bottom: 0.25rem; }
.prose blockquote { margin: 1rem 0; border-left: 4px solid var(--google-blue-cta); padding: 0.5rem 1rem; background: rgb(var(--surface-dim)); border-radius: 0 8px 8px 0; }
.prose blockquote p { margin-bottom: 0; }
.prose hr { margin: 2rem 0; border: none; border-top: 1px solid rgb(var(--outline-variant)); }
.prose img { max-width: 100%; height: auto; border-radius: 12px; margin: 1.5rem 0; }
.prose table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.875rem; }
.prose th { background: rgb(var(--surface-dim)); font-weight: 700; text-align: left; padding: 0.75rem 1rem; border: 1px solid rgb(var(--outline-variant)); }
.prose td { padding: 0.75rem 1rem; border: 1px solid rgb(var(--outline-variant)); }
.prose tr:nth-child(even) td { background: rgb(var(--surface-dim)); }
.prose code { border-radius: 4px; background: rgb(var(--surface-variant)); padding: 0.125rem 0.375rem; font-size: 0.9em; }
.prose pre { border-radius: 12px; border: 1px solid rgb(var(--outline-variant)); padding: 1.25rem; margin: 1.5rem 0; overflow-x: auto; background: rgb(var(--surface-dim)) !important; position: relative; }
.prose pre code { background: none; padding: 0; font-size: 0.875rem; }

/* Post nav */
.post-nav { display: flex; justify-content: space-between; gap: 1rem; margin-top: 3rem; border-top: 1px solid rgb(var(--outline-variant)); padding-top: 1.5rem; }
.post-nav a { text-decoration: none; font-size: 0.875rem; }
.post-nav .nav-label { color: rgb(var(--on-surface-variant)); }
.post-nav .nav-title { display: block; font-weight: 700; color: rgb(var(--on-surface)); }
.post-nav a:hover .nav-title { color: var(--google-blue-cta); }

/* TOC sidebar */
.toc-sidebar { position: sticky; top: 6rem; display: none; max-height: calc(100vh - 7rem); overflow-y: auto; }
@media (min-width: 1024px) { .toc-sidebar { display: block; } }
.toc-sidebar .toc-label { margin-bottom: 0.75rem; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans SC', sans-serif; font-size: 0.875rem; font-weight: 700; color: rgb(var(--on-surface-variant)); }
.toc-sidebar nav { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.875rem; }
.toc-sidebar nav a { display: block; padding: 0.25rem 0; border-left: 2px solid rgb(var(--outline-variant)); padding-left: 0.75rem; color: rgb(var(--on-surface-variant)); text-decoration: none; transition: color 0.15s; }
.toc-sidebar nav a:hover { color: rgb(var(--on-surface)); }
.toc-sidebar nav a.level-3 { padding-left: 1.25rem; }
.toc-sidebar nav a.active { border-left-color: var(--google-blue-cta); color: var(--google-blue-cta); }

/* Category index page */
.cat-list { display: grid; gap: 1rem; }
@media (min-width: 768px) { .cat-list { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1024px) { .cat-list { grid-template-columns: repeat(4, 1fr); } }
.cat-list a { display: flex; align-items: center; gap: 1rem; border-radius: 16px; border: 1px solid rgb(var(--outline-variant)); background: rgb(var(--surface-dim)); padding: 1.25rem; text-decoration: none; transition: background 0.15s; }
.cat-list a:hover { background: rgb(var(--surface)); }
.cat-list .cat-name { font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans SC', sans-serif; font-weight: 700; color: rgb(var(--on-surface)); }
.cat-list .cat-count { font-size: 0.875rem; color: rgb(var(--on-surface-variant)); }

/* Tags index */
.tag-list { display: flex; flex-wrap: wrap; gap: 0.625rem; }
.tag-list a { display: inline-block; border-radius: 9999px; border: 1px solid rgb(var(--outline-variant)); padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 600; text-decoration: none; color: rgb(var(--on-surface-variant)); transition: background 0.15s; }
.tag-list a:hover { background: rgb(var(--surface-variant)); }

/* Search page */
.search-page { max-width: 36rem; margin: 0 auto; padding: 3rem 0; }
.search-input { width: 100%; border-radius: 9999px; border: 1px solid rgb(var(--outline-variant)); padding: 0.75rem 1.25rem; font-size: 1rem; background: rgb(var(--surface)); color: rgb(var(--on-surface)); outline: none; }
.search-input:focus { border-color: var(--google-blue-cta); }
.search-hint { margin-top: 2rem; text-align: center; color: rgb(var(--on-surface-variant)); }
.search-results { margin-top: 1.5rem; list-style: none; }
.search-result a { display: block; border-radius: 16px; border: 1px solid rgb(var(--outline-variant)); padding: 1rem; text-decoration: none; color: inherit; transition: background 0.15s; }
.search-result a:hover { background: rgb(var(--surface-variant)); }
.search-result .result-title { font-weight: 700; color: rgb(var(--on-surface)); }
.search-result .result-excerpt { margin-top: 0.25rem; font-size: 0.875rem; color: rgb(var(--on-surface-variant)); }

/* 404 */
.not-found { display: flex; min-height: 60vh; flex-direction: column; align-items: center; justify-content: center; padding: 3rem 1.25rem; text-align: center; }
.not-found h1 { font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans SC', sans-serif; font-size: 4rem; font-weight: 700; color: rgb(var(--on-surface-variant)); }
.not-found p { margin-top: 1rem; font-size: 1.125rem; color: rgb(var(--on-surface-variant)); }
.not-found a { display: inline-block; margin-top: 1.5rem; border-radius: 9999px; border: 1px solid rgb(var(--outline-variant)); padding: 0.625rem 1.25rem; font-size: 0.875rem; font-weight: 700; text-decoration: none; color: rgb(var(--on-surface)); transition: background 0.15s; }
.not-found a:hover { background: rgb(var(--surface-variant)); }

/* Footer */
.footer { display: flex; align-items: center; justify-content: center; border-top: 1px solid rgb(var(--outline-variant)); padding: 1.5rem 1.25rem; font-size: 0.875rem; color: rgb(var(--on-surface-variant)); margin-top: auto; }

/* Page heading */
.page-heading { font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans SC', sans-serif; font-size: 1.875rem; font-weight: 700; letter-spacing: -0.025em; margin-bottom: 1.75rem; }

/* Copy button */
.copy-btn { position: absolute; right: 0.75rem; top: 0.75rem; border-radius: 6px; border: 1px solid rgb(var(--outline-variant)); background: rgb(var(--surface) / 0.9); padding: 0.25rem 0.5rem; font-size: 0.6875rem; font-weight: 600; color: rgb(var(--on-surface-variant)); cursor: pointer; backdrop-filter: blur(4px); transition: background 0.15s; }
.copy-btn:hover { background: rgb(var(--surface-variant)); }
pre { position: relative; }
```

- [ ] **Step 3: 更新 .gitignore**

```
node_modules/
out/
.next/
build/
pagefind/
.superpowers/
.env
.env.local
.env.*.local
.DS_Store
Thumbs.db
.vscode/
.idea/
*.swp
*.swo
*.log
npm-debug.log*
public/
```

- [ ] **Step 4: 迁移内容 — 创建所有中文 Markdown 文件**

为每篇文章执行以下格式转换：
- 将 frontmatter 从 YAML `---` 改为 TOML `+++`
- 移除 `readingTime` 字段
- 将 `translationKey` 移到 `[extra]` 下
- 将 `category` 改为 taxonomy 格式
- 将 `tags` 改为 taxonomy 数组
- `<img>` 标签改为 `![](url)` Markdown 语法
- 移除 `<CodeBlock>` 引用（代码栅栏格式无需改动）
- 文件名从 `.mdx` 改为 `.md`

创建 `content/cn/_index.md`：
```toml
+++
title = "ZiQia.cc"
+++
```
（首页不需要 `sort_by = "date"`，因为子页面列表通过 posts section 获取）

创建 `content/cn/posts/_index.md`：
```toml
+++
title = "Posts"
sort_by = "date"
+++
```

创建 `content/cn/about.md` — 从 `content/cn/about.mdx` 迁移，将 YAML frontmatter 转为 TOML。

创建 `content/cn/search.md`：
```toml
+++
title = "搜索"
template = "search.html"
+++
```

现有 7 篇文章逐一迁移（`content/cn/posts/`）：
- `ai-coding-cli-tools-comparison.mdx`
- `du-wan-wen-dang-bu-hui-yong.mdx`
- `game-dev.mdx`
- `message-queue.mdx`
- `rsc-deep-dive.mdx`
- `rust-memory.mdx`
- `why-tech-docs-fail.mdx`

迁移示例（ai-coding-cli-tools-comparison.mdx → ai-coding-cli-tools-comparison.md）：
```toml
+++
title = "五大 AI 编程 CLI 工具横评：OpenCode、Claude Code、Codex CLI 怎么选？"
slug = "ai-coding-cli-tools-comparison"
description = "横向对比五大 AI 编程命令行工具的核心能力、优劣势与适用场景，帮你做出最适合自己的选择。"
date = 2026-07-13
[taxonomies]
categories = ["tooling"]
tags = ["AI编程", "CLI工具", "工具对比", "OpenCode", "Claude Code"]
[extra]
translation_key = "ai-coding-cli-tools-comparison"
featured = false
cover_alt = "五大 AI 编程 CLI 工具概念对比图，暗色主题霓虹风格的开发者工作站"
+++
```

正文中：
- `<img src="..." alt="..." />` → `![](...)`
- 移除 `</img>` 封闭标签
- 代码块保持 ``` 栅栏格式不变
- 表格保持 Markdown 格式不变

- [ ] **Step 5: 验证**

```bash
zola build
# Expected: Build succeeds, public/ 目录生成
ls public/cn/posts/ | wc -l
# Expected: 7 个文章目录
```

---

### Task 2: 基础模板 + 首页

**Files:**
- Create: `templates/base.html`
- Create: `templates/index.html`

**Interfaces:**
- Consumes: `config.toml` 中的翻译字符串、`content/cn/_index.md` 的子页面
- Produces: 首页 HTML 渲染

- [ ] **Step 1: 创建 templates/base.html**

```html
<!DOCTYPE html>
<html lang="{{ lang }}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{% block title %}{{ config.title }}{% endblock title %}</title>
  <meta name="description" content="{% block description %}{{ config.description }}{% endblock description %}">
  <link rel="stylesheet" href="{{ get_url(path='style.css', cachebust=true) }}">
  <link rel="icon" href="{{ get_url(path='/icon.svg') }}">
  {% block extra_head %}{% endblock extra_head %}
</head>
<body>
  <header class="header">
    <a href="{{ get_url(path='/' ~ lang ~ '/') }}" class="header-logo">
      <svg width="28" height="28" viewBox="0 0 28 28" style="flex-shrink:0">
        <circle cx="14" cy="14" r="12.5" fill="none" stroke="#1A73E8" stroke-width="1.5"/>
        <circle cx="14" cy="14" r="10" fill="none" stroke="#1A73E8" stroke-width="0.5" opacity="0.4"/>
        <text x="14" y="19" text-anchor="middle" font-size="14" font-weight="bold" fill="#1A73E8" font-family="serif">洽</text>
      </svg>
      ZiQia.cc
    </a>
    <nav class="header-nav">
      <a href="{{ get_url(path='/' ~ lang ~ '/') }}" {% if current_url and current_url == get_url(path='/' ~ lang ~ '/') %}class="active"{% endif %}>{{ trans(key="home", lang=lang) }}</a>
      <a href="{{ get_url(path='/' ~ lang ~ '/categories/') }}" {% if current_url and current_url is containing('/categories/') %}class="active"{% endif %}>{{ trans(key="categories", lang=lang) }}</a>
      <a href="{{ get_url(path='/' ~ lang ~ '/tags/') }}" {% if current_url and current_url is containing('/tags/') %}class="active"{% endif %}>{{ trans(key="tags", lang=lang) }}</a>
      <a href="{{ get_url(path='/' ~ lang ~ '/about/') }}" {% if current_url and current_url is containing('/about/') %}class="active"{% endif %}>{{ trans(key="about", lang=lang) }}</a>
    </nav>
    <div class="header-actions">
      <div class="lang-switch">
        {% block lang_switch %}
        {# 文章页面通过 translation_key 关联翻译 #}
        {% if page and page.translations %}
          {% for t in page.translations %}
          <a href="{{ t.permalink | safe }}">{{ t.lang | upper }}</a>
          {% endfor %}
        {% else %}
          {# 其他页面直接链接到另一语言首页 #}
          {% if lang == "cn" %}
          <a href="{{ get_url(path='/en/') }}">EN</a>
          {% else %}
          <a href="{{ get_url(path='/cn/') }}">中文</a>
          {% endif %}
        {% endif %}
        {% endblock lang_switch %}
      </div>
    </div>
  </header>
  <main class="max-w-1280 px-5 md:px-10 py-8">
    {% block content %}{% endblock content %}
  </main>
  <footer class="footer">
    <p>&copy; {{ now() | date(format="%Y") }} ZiQia.cc</p>
  </footer>
</body>
</html>
```

- [ ] **Step 2: 创建 templates/index.html**

```html
{% extends "base.html" %}

{% block content %}
{% set posts_section = get_section(path=lang ~ "/posts/_index.md") %}
{% set all_posts = posts_section.pages %}
{% set featured = all_posts | filter(attribute="extra.featured", value=true) | first %}

{% if featured %}
<section class="section">
  <div class="hero-card">
    {% set cat_color = "" %}
    {% set cat_bg = "" %}
    {% for cat in config.taxonomies %}
    {% if cat.name == "categories" %}{% set_global cat_color = "#1A73E8" %}{% endif %}
    {% endfor %}
    <div class="hero-visual" style="background: linear-gradient(135deg, #4285F4 0%, #174EA6 100%)">
      <div class="bg-circle"></div>
      <div class="content">
        <span class="badge">{{ trans(key="featured", lang=lang) }}</span>
        <div class="title">{{ featured.title | split(pat=" ") | slice(end=3) | join(sep=" ") }}</div>
      </div>
    </div>
    <div class="hero-text">
      <div class="label">{{ trans(key="featured", lang=lang) }}</div>
      <h1>{{ featured.title }}</h1>
      <p>{{ featured.description }}</p>
      <div class="hero-meta">
        <div class="hero-avatar" style="background: linear-gradient(135deg, #4285F4, #34A853)">Z</div>
        <div class="hero-attribution">
          <div class="name">ZiQia.cc</div>
          <div class="meta">{{ featured.date }} · {{ trans(key="reading_time", lang=lang) | replace(pat="{n}", rep=featured.reading_time) }}</div>
        </div>
        <a href="{{ featured.permalink }}" class="btn-primary">{{ trans(key="read_more", lang=lang) }}</a>
      </div>
    </div>
  </div>
</section>
{% endif %}

<section class="section">
  <div class="section-header">
    <div>
      <h2>{{ trans(key="recent_posts", lang=lang) }}</h2>
      <p>{{ trans(key="recent_posts_sub", lang=lang) }}</p>
    </div>
  </div>
  <div class="grid md:grid-cols-2 lg:grid-cols-3">
    {% for post in all_posts | slice(end=6) %}
    <article class="article-card">
      <a href="{{ post.permalink }}">
        <div class="card-visual" style="background: linear-gradient(135deg, #E8F0FE 0%, #4285F4 100%)">
          {% if post.taxonomies.categories %}
          <span class="card-cat">{{ post.taxonomies.categories[0] }}</span>
          {% endif %}
        </div>
        <div class="card-body">
          <h3>{{ post.title }}</h3>
          <p>{{ post.description }}</p>
          <div class="card-footer">
            <span>{{ post.date }} · {{ trans(key="reading_time", lang=lang) | replace(pat="{n}", rep=post.reading_time) }}</span>
            <span class="read-more">{{ trans(key="read_more", lang=lang) }} →</span>
          </div>
        </div>
      </a>
    </article>
    {% endfor %}
  </div>
</section>

<section class="section">
  <div class="section-header">
    <div>
      <h2>{{ trans(key="browse_categories", lang=lang) }}</h2>
      <p>{{ trans(key="browse_categories_sub", lang=lang) }}</p>
    </div>
  </div>
  {% set categories = get_taxonomy(kind="categories", lang=lang) %}
  <div class="grid grid-cols-9">
    {% for cat in categories.items %}
    <a href="{{ cat.permalink }}" class="cat-icon-link">
      <div class="cat-icon" style="background: #E8F0FE">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#4285F4">
          <rect x="3" y="3" width="18" height="18" rx="4" opacity="0.2"/>
          <circle cx="12" cy="12" r="4"/>
        </svg>
      </div>
      <span>{{ cat.name }}</span>
    </a>
    {% endfor %}
  </div>
</section>
{% endblock content %}
```

- [ ] **Step 3: 验证**

```bash
zola build
# Expected: Build 成功，首页显示 featured + 文章网格 + 分类图标
```

---

### Task 3: 文章页模板

**Files:**
- Create: `templates/post.html`

**Interfaces:**
- Consumes: `section.pages`（上一篇/下一篇）、`page.toc`、`page.taxonomies`
- Produces: 文章页面（含 TOC、导航、JSON-LD、代码高亮）

- [ ] **Step 1: 创建 templates/post.html**

```html
{% extends "base.html" %}

{% block title %}{{ page.title }} — {{ config.title }}{% endblock title %}
{% block description %}{{ page.description }}{% endblock description %}

{% block extra_head %}
{% set adsense_id = get_env(name="ADSENSE_CLIENT_ID", default="") %}
{% if adsense_id %}
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={{ adsense_id }}" crossorigin="anonymous"></script>
{% endif %}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "{{ page.title }}",
  "datePublished": "{{ page.date }}",
  "description": "{{ page.description }}",
  "url": "{{ page.permalink | safe }}",
  "author": { "@type": "Organization", "name": "ZiQia.cc" },
  "publisher": { "@type": "Organization", "name": "ZiQia.cc" }
}
</script>
{% endblock extra_head %}

{% block content %}
<div class="post-layout">
  <article>
    <div class="post-header">
      {% if page.taxonomies.categories %}
      {% set cat = page.taxonomies.categories[0] %}
      <span class="post-cat" style="background: #E8F0FE; color: #4285F4">{{ cat }}</span>
      {% endif %}
      <h1>{{ page.title }}</h1>
      <div class="post-meta">
        <span class="post-avatar" style="background: linear-gradient(135deg, #4285F4, #34A853)">Z</span>
        <span>ZiQia.cc · {{ page.date }} · {{ trans(key="reading_time", lang=lang) | replace(pat="{n}", rep=page.reading_time) }}</span>
      </div>
    </div>
    <div class="prose">
      {{ page.content | safe }}
    </div>
    <nav class="post-nav">
      {% if page.lower %}
      <a href="{{ page.lower.permalink }}">
        <div class="nav-label">{{ trans(key="previous", lang=lang) }}</div>
        <div class="nav-title">{{ page.lower.title }}</div>
      </a>
      {% else %}
      <div></div>
      {% endif %}
      {% if page.higher %}
      <a href="{{ page.higher.permalink }}" style="text-align:right">
        <div class="nav-label">{{ trans(key="next", lang=lang) }}</div>
        <div class="nav-title">{{ page.higher.title }}</div>
      </a>
      {% else %}
      <div></div>
      {% endif %}
    </nav>
  </article>
  <aside class="toc-sidebar">
    {% if page.toc %}
    <div class="toc-label">{{ trans(key="table_of_contents", lang=lang) }}</div>
    <nav>
      {% for h2 in page.toc %}
      <a href="{{ h2.permalink | safe }}" class="{% if h2.children %}level-2{% endif %}">{{ h2.title }}</a>
      {% for h3 in h2.children %}
      <a href="{{ h3.permalink | safe }}" class="level-3">{{ h3.title }}</a>
      {% endfor %}
      {% endfor %}
    </nav>
    {% endif %}
  </aside>
</div>
{% endblock content %}
```

- [ ] **Step 2: 验证**

```bash
zola build
# Expected: 文章页渲染完整，TOC 侧栏、上一篇/下一篇、JSON-LD 均存在
```

---

### Task 4: 分类和标签模板

**Files:**
- Create: `templates/categories/list.html`
- Create: `templates/categories/single.html`
- Create: `templates/tags/list.html`
- Create: `templates/tags/single.html`

**Interfaces:**
- Consumes: `taxonomy` 和 `term` 对象
- Produces: 分类/标签列表页和详情页

- [ ] **Step 1: 创建 templates/categories/list.html**

```html
{% extends "base.html" %}

{% block title %}{{ trans(key="categories", lang=lang) }} — {{ config.title }}{% endblock title %}

{% block content %}
<h1 class="page-heading">{{ trans(key="categories", lang=lang) }}</h1>
{% set categories = get_taxonomy(kind="categories", lang=lang) %}
<div class="cat-list">
  {% for cat in categories.items %}
  <a href="{{ cat.permalink }}">
    <div class="cat-icon" style="background: #E8F0FE">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="#4285F4">
        <rect x="3" y="3" width="18" height="18" rx="4" opacity="0.2"/>
        <circle cx="12" cy="12" r="4"/>
      </svg>
    </div>
    <div>
      <div class="cat-name">{{ cat.name }}</div>
      <div class="cat-count">{{ cat.pages | length }} {{ trans(key="articles", lang=lang) }}</div>
    </div>
  </a>
  {% endfor %}
</div>
{% endblock content %}
```

- [ ] **Step 2: 创建 templates/categories/single.html**

```html
{% extends "base.html" %}

{% block title %}{{ term.name }} — {{ config.title }}{% endblock title %}
{% block description %}{{ term.name }} {{ trans(key="categories", lang=lang) }}{% endblock description %}

{% block content %}
<h1 class="page-heading">{{ term.name }}</h1>
{% if term.pages %}
<div class="grid md:grid-cols-2 lg:grid-cols-3">
  {% for post in term.pages %}
  <article class="article-card">
    <a href="{{ post.permalink }}">
      <div class="card-visual" style="background: linear-gradient(135deg, #E8F0FE 0%, #4285F4 100%)">
        <span class="card-cat">{{ term.name }}</span>
      </div>
      <div class="card-body">
        <h3>{{ post.title }}</h3>
        <p>{{ post.description }}</p>
        <div class="card-footer">
          <span>{{ post.date }} · {{ trans(key="reading_time", lang=lang) | replace(pat="{n}", rep=post.reading_time) }}</span>
          <span class="read-more">{{ trans(key="read_more", lang=lang) }} →</span>
        </div>
      </div>
    </a>
  </article>
  {% endfor %}
</div>
{% else %}
<p style="color: rgb(var(--on-surface-variant))">—</p>
{% endif %}
{% endblock content %}
```

- [ ] **Step 3: 创建 templates/tags/list.html**

```html
{% extends "base.html" %}

{% block title %}{{ trans(key="tags", lang=lang) }} — {{ config.title }}{% endblock title %}

{% block content %}
<h1 class="page-heading">{{ trans(key="tags", lang=lang) }}</h1>
{% set tags = get_taxonomy(kind="tags", lang=lang) %}
<div class="tag-list">
  {% for tag in tags.items %}
  <a href="{{ tag.permalink }}">#{{ tag.name }}</a>
  {% endfor %}
</div>
{% endblock content %}
```

- [ ] **Step 4: 创建 templates/tags/single.html**

```html
{% extends "base.html" %}

{% block title %}#{{ term.name }} — {{ config.title }}{% endblock title %}
{% block description %}{{ trans(key="articles", lang=lang) }} "{{ term.name }}"{% endblock description %}

{% block content %}
<h1 class="page-heading">#{{ term.name }}</h1>
{% if term.pages %}
<div class="grid md:grid-cols-2 lg:grid-cols-3">
  {% for post in term.pages %}
  <article class="article-card">
    <a href="{{ post.permalink }}">
      <div class="card-visual" style="background: linear-gradient(135deg, #E8F0FE 0%, #4285F4 100%)">
        <span class="card-cat">{{ post.taxonomies.categories[0] }}</span>
      </div>
      <div class="card-body">
        <h3>{{ post.title }}</h3>
        <p>{{ post.description }}</p>
        <div class="card-footer">
          <span>{{ post.date }} · {{ trans(key="reading_time", lang=lang) | replace(pat="{n}", rep=post.reading_time) }}</span>
          <span class="read-more">{{ trans(key="read_more", lang=lang) }} →</span>
        </div>
      </div>
    </a>
  </article>
  {% endfor %}
</div>
{% else %}
<p style="color: rgb(var(--on-surface-variant))">—</p>
{% endif %}
{% endblock content %}
```

- [ ] **Step 5: 验证**

```bash
zola build
# Expected: /cn/categories/ 列出所有分类，/cn/tags/ 列出所有标签，点击后显示文章列表
```

---

### Task 5: About / 404 / Search / Copy Button

**Files:**
- Create: `templates/page.html`
- Create: `templates/search.html`
- Create: `templates/404.html`
- Create: `static/copy-button.js`

**Interfaces:**
- Consumes: `page.content`（about）、`term.pages`（search index）
- Produces: 各独立页面正常渲染

- [ ] **Step 1: 创建 templates/page.html**

```html
{% extends "base.html" %}

{% block title %}{{ page.title }} — {{ config.title }}{% endblock title %}
{% block description %}{{ page.description }}{% endblock description %}

{% block content %}
<div class="prose" style="max-width: 42rem; margin: 0 auto; padding: 2rem 0;">
  {{ page.content | safe }}
</div>
{% endblock content %}
```

- [ ] **Step 2: 创建 templates/search.html**

```html
{% extends "base.html" %}

{% block title %}{{ trans(key="search", lang=lang) }} — {{ config.title }}{% endblock title %}

{% block content %}
<div class="search-page">
  <input type="search" id="search-input" class="search-input" placeholder="{{ trans(key="search_placeholder", lang=lang) }}" aria-label="{{ trans(key="search", lang=lang) }}">
  <p id="search-hint" class="search-hint">{{ trans(key="search_hint", lang=lang) }}</p>
  <ul id="search-results" class="search-results"></ul>
</div>

<script>
const searchInput = document.getElementById('search-input');
const searchHint = document.getElementById('search-hint');
const searchResults = document.getElementById('search-results');
let pagefind = null;

(async () => {
  const mod = await import('/pagefind/pagefind.js');
  if (mod && typeof mod.search === 'function') {
    pagefind = mod;
  }
})();

searchInput.addEventListener('input', async () => {
  const q = searchInput.value.trim();
  if (!q || !pagefind) {
    searchResults.innerHTML = '';
    searchHint.style.display = q ? 'none' : '';
    return;
  }
  searchHint.style.display = 'none';
  const { results } = await pagefind.search(q);
  const slice = results.slice(0, 30);
  const items = await Promise.all(slice.map(async (r) => {
    const data = await r.data();
    return { url: data.url, title: data.meta.title, excerpt: data.excerpt };
  }));
  const filtered = items.filter(item => item.url.startsWith('/{{ lang }}/'));
  searchResults.innerHTML = filtered.map(item => `
    <li class="search-result">
      <a href="${item.url}">
        <div class="result-title">${item.title}</div>
        <div class="result-excerpt">${item.excerpt}</div>
      </a>
    </li>
  `).join('');
  if (filtered.length === 0) {
    searchResults.innerHTML = '<p class="search-hint">{{ trans(key="no_results", lang=lang) }}</p>';
  }
});
</script>
{% endblock content %}
```

- [ ] **Step 3: 创建 templates/404.html**

```html
{% extends "base.html" %}

{% block title %}{{ trans(key="page_not_found", lang=lang) }} — {{ config.title }}{% endblock title %}

{% block content %}
<div class="not-found">
  <h1>404</h1>
  <p>{{ trans(key="page_not_found", lang=lang) }}</p>
  <a href="{{ get_url(path='/' ~ lang ~ '/') }}">{{ trans(key="back_home", lang=lang) }} →</a>
</div>
{% endblock content %}
```

- [ ] **Step 4: 创建 static/copy-button.js**

```javascript
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('pre').forEach(pre => {
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = 'Copy';
    btn.addEventListener('click', async () => {
      const code = pre.querySelector('code');
      if (!code) return;
      try {
        await navigator.clipboard.writeText(code.textContent);
        btn.textContent = 'Copied';
        setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
      } catch {}
    });
    pre.appendChild(btn);
  });
});
```

更新 `templates/base.html` 在 `</body>` 前添加：
```html
<script src="{{ get_url(path='copy-button.js', cachebust=true) }}"></script>
```

- [ ] **Step 5: 验证**

```bash
zola build
# Expected: /cn/about/、/cn/search/、/cn/404.html 都正常渲染
```

---

### Task 6: 英文内容 + 语言切换

**Files:**
- Create: `content/en/_index.md`
- Create: `content/en/posts/_index.md`
- Create: `content/en/about.md`
- Create: `content/en/search.md`
- Modify: `templates/base.html`（完善语言切换逻辑）

**Interfaces:**
- Consumes: `page.translations`、`config.languages`
- Produces: 双语站点，语言切换按钮可用

- [ ] **Step 1: 创建英文首页和 section 索引**

`content/en/_index.md`：
```toml
+++
title = "ZiQia.cc"
+++
```

`content/en/posts/_index.md`：
```toml
+++
title = "Posts"
sort_by = "date"
+++
```

```toml
+++
title = "ZiQia.cc"
sort_by = "date"
+++
```

- [ ] **Step 2: 创建英文关于页 `content/en/about.md`**

```toml
+++
title = "About"
+++

## Hello, I'm Alex

A developer passionate about code and life.

This blog documents my technical explorations, project experiences, and occasional life snippets.

- Frontend / Backend / System Architecture
- Favorite tools: TypeScript, Rust, Next.js
- Contact info at the bottom of the page
```

- [ ] **Step 3: 创建英文搜索页 `content/en/search.md`**

```toml
+++
title = "Search"
template = "search.html"
+++
```

- [ ] **Step 4: 更新 base.html 的语言切换逻辑**

确认 base.html 中的语言切换块已按 Task 2 的版本实现（`page.translations` 用于文章页，`lang` 判断用于其他页面）。无需额外修改。

- [ ] **Step 5: 验证**

```bash
zola build
# Expected: /cn/ 和 /en/ 分别显示对应语言
# 在中文文章页面能看到 English 切换链接，反之亦然
```

---

### Task 7: 清理 Next.js 文件 + README 更新

**Files:**
- Remove: `src/`、`next.config.mjs`、`tsconfig.json`、`tailwind.config.ts`、`postcss.config.mjs`、`vitest.config.ts`、`open-next.config.ts`、`package.json`、`package-lock.json`、`scripts/`、`.nvmrc`、`node_modules/`
- Modify: `README.md`
- Modify: `.gitignore`（已更新）

- [ ] **Step 1: 删除 Next.js 文件**

```bash
rm -rf src/ next.config.mjs tsconfig.json tailwind.config.ts postcss.config.mjs vitest.config.ts open-next.config.ts package.json package-lock.json scripts/ .nvmrc node_modules/ .next/ next-env.d.ts
```

- [ ] **Step 2: 更新 README.md**

```markdown
# ZiQia.cc — AI 开发技术博客

单语言（中文）个人 AI 开发技术博客，使用 Zola（Rust 静态站点生成器）构建，部署到 Cloudflare Pages。

## 技术栈

- **框架**: [Zola](https://www.getzola.org/) 纯静态站点生成器
- **模板**: Tera
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
```

- [ ] **Step 3: 完整构建验证**

```bash
zola build
# Expected: build 成功，无错误

npx pagefind --site public
# Expected: 搜索索引生成

ls public/
# Expected: cn/ en/ feeds/ pagefind/ sitemap.xml style.css ...
```

- [ ] **Step 4: 提交**

```bash
git add -A
git status  # 确认没有遗留的 .next/ node_modules/ out/
git commit -m "refactor: Next.js → Zola 重构
- 移除 Next.js/React/TypeScript/Tailwind 等 npm 依赖
- 迁移 7 篇 MDX 文章为 Zola Markdown 格式
- 手写 CSS 替代 Tailwind（~400 行）
- 新增英文语言版本
- 系统偏好暗色模式（CSS prefers-color-scheme）
- Pagefind 搜索 + Zola 内置 RSS/Sitemap
- 部署方式简化为直接上传 public/"
```
