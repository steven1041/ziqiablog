# 个人技术博客设计文档

**日期**：2026-07-11
**状态**：待最终 review
**项目名称**：Alex.dev 个人技术博客

## 1. 概述

个人技术博客，双语（中文/英文）支持，使用 Next.js + MDX 构建，静态导出后托管于 Cloudflare Pages。视觉风格采用纯 Google Material Design 语言，兼顾内容可读性与现代审美。博客记录技术思考、项目经验和偶尔的生活片段。

## 2. 目标读者

开发者、技术爱好者、对系统设计/前端/后端话题感兴趣的中文与英文读者。

## 3. 技术栈

| 层 | 选型 | 说明 |
|----|------|------|
| 框架 | Next.js 14+ (App Router) | 静态导出 `output: 'export'` |
| 内容 | MDX | `content/cn/` 与 `content/en/` 双目录，含 frontmatter |
| 样式 | Tailwind CSS + CSS 变量 | Google 色系 token，明暗双主题 |
| 字体 | `Google Sans`, `Roboto`, `Noto Sans SC` | 通过 `next/font` 加载 |
| 搜索 | `pagefind` | 构建时生成索引，极小 bundle |
| 代码高亮 | `shiki` | 构建时渲染，双主题随明暗切换 |
| 主题切换 | `next-themes` | 默认 `prefers-color-scheme` 跟随系统 |
| RSS | `feed` 构建脚本 | 中英各一个 feed |
| MDX 工具 | `gray-matter` + `next-mdx-remote` | frontmatter 解析 + 编译 |
| 测试 | `vitest` + `@testing-library/react` | 组件单测 + 快照测试 |
| 部署 | Cloudflare Pages | 自动构建 + CDN |

## 4. 视觉设计系统（Google 风格）

### 4.1 配色

| Token | 值 | 用途 |
|-------|-----|------|
| `--google-blue` | `#4285F4` / `#1A73E8` | 主色、CTA、主分类 |
| `--google-red` | `#EA4335` | 红色分类 |
| `--google-yellow` | `#FBBC04` / `#F9AB00` | 黄色分类 |
| `--google-green` | `#34A853` | 绿色分类 |
| `--surface` | `#FFFFFF` | 亮色底色 |
| `--surface-variant` | `#F1F3F4` | 次级背景 |
| `--surface-dim` | `#F8F9FA` | 浅背景 |
| `--on-surface` | `#1F1F1F` | 亮色主文字 |
| `--on-surface-variant` | `#5F6368` | 次文字 |
| `--outline` | `#DADCE0` | 边框 |
| `--outline-variant` | `#E8EAED` | 浅边框 |
| `--primary-container` | `#D3E3FD` | 选中态/标签底 |
| 暗色对应 | 反相值 | 暗色模式 token 自动映射 |

暗色模式主色：
- `--surface` → `#1F1F1F`
- `--surface-variant` → `#2A2A2A`
- `--surface-dim` → `#161616`
- `--on-surface` → `#E8EAED`
- `--on-surface-variant` → `#9AA0A6`
- `--outline` → `#3C4043`
- `--outline-variant` → `#2A2A2A`
- `--primary-container` → `#041E49`（高饱和文字）/ `#D3E3FD`（背景）

### 4.2 字体

- **标题**：`Google Sans`（700 / `letter-spacing: -0.5px`）
- **正文**：`Roboto` + `Noto Sans SC`（中文回退）
- **正文尺寸**：16px，`line-height: 1.7`
- **UI 标签**：14px，`font-weight: 500`

### 4.3 圆角与阴影

- 卡片圆角：16px（文章卡片）/ 24px（Hero）
- 按钮：pill（999px）
- 分类 icon：50%（圆形）
- 阴影（hover）：`0 1px 3px rgba(60,64,67,0.15), 0 4px 12px rgba(60,64,67,0.1)`
- 暗色模式阴影：`0 1px 3px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.3)`

### 4.4 分类色映射

| 分类 | 主色 | 浅底（亮色） |
|------|------|------|
| 前端 | `#4285F4` | `#D3E3FD` |
| 后端 | `#EA4335` | `#FCE8E6` |
| 系统架构 | `#34A853` | `#E6F4EA` |
| DevOps | `#F9AB00` | `#FEF7E0` |
| AI | `#4285F4` | `#E8F0FE` |
| 生活随笔 | `#DA4335` | `#FCE8E6` |

暗色模式浅底替换为对应深色（如 `#D3E3FD` → `#041E49` 等透明度 20% 的相对色）。

## 5. 信息架构

```
/                     → 重定向到 /cn
/[locale]             → 首页
  - Featured Hero（精选文章）
  - 最新文章 grid（3 列卡片）
  - 浏览分类（圆形 icon 卡片）
/[locale]/posts/[slug] → 文章详情
  - TOC 侧栏（scrollspy）
  - MDX 正文（shiki 代码高亮）
  - 文章 meta（作者、时间、阅读时长）
  - 双语切换按钮
  - 上一篇/下一篇
/[locale]/categories/[category] → 分类列表
/[locale]/tags/[tag]   → 标签列表
/[locale]/about        → 关于页（MDX）
/search                → 全文搜索
/feeds/feed-cn.xml     → RSS（中文）
/feeds/feed-en.xml     → RSS（英文）
404                    → 双语 404 页
```

## 6. 路由与双语实现

- 默认 `/` → 重定向到 `/cn`
- 目录：`content/cn/posts/*.mdx`、`content/en/posts/*.mdx`
- frontmatter `translationKey: rsc-deep-dive` 关联双语文章
- 顶部语言切换：`中文 / EN` 胶囊按钮，点击跳到对应语种同篇文章版本
- 未翻译文章：切到对应语种时如有则跳转，无则显示"暂未翻译"占位卡片并提供返回当前语种链接
- 默认语种：中文（`/cn`）

## 7. 功能实现细节

### 7.1 搜索（pagefind）
- 构建后运行 `pagefind` 对 `out/` 目录静态 HTML 建索引
- `/search` 页客户端搜索，按当前语种过滤结果
- 索引包含：标题、正文、分类、标签
- 结果高亮关键词、显示所属分类色块

### 7.2 代码高亮（shiki）
- 构建时渲染为静态 HTML，零运行时 JS
- 双主题：亮色 `github-light`，暗色 `github-dark`
- 通过 CSS `data-theme` 切换，不重载页面
- 代码块右上角复制按钮（纯 JS，`clipboard` API）

### 7.3 目录 TOC
- 构建时从 MDX 标题（h2/h3）提取
- 桌面：右侧 sticky 侧栏，`scrollspy` 高亮当前章节
- 移动端：折叠式抽屉，点击展开

### 7.4 主题切换（next-themes）
- 默认 `theme="system"`
- 顶部切换按钮（sun/moon SVG icon，Phosphor 系列）
- `prefers-color-scheme` 跟随系统
- 防闪烁：`suppressHydrationWarning` + `next-themes` 内联 script
- 切换后写入 `localStorage`

### 7.5 RSS
- 构建脚本（Node）遍历 `content/cn/` 与 `content/en/`
- 各生成 `public/feeds/feed-cn.xml`、`public/feeds/feed-en.xml`
- 含最新 20 篇文章，含标题、摘要、发布日期、链接

### 7.6 评论
- 不实现

## 8. 目录结构

```
content/
  cn/
    posts/*.mdx
    about.mdx
  en/
    posts/*.mdx
    about.mdx
src/
  app/
    page.tsx              # 重定向到 /cn
    [locale]/
      page.tsx
      posts/[slug]/page.tsx
      categories/[category]/page.tsx
      tags/[tag]/page.tsx
      about/page.tsx
      not-found.tsx
    search/page.tsx
  components/
    Header.tsx
    Footer.tsx
    HeroCard.tsx
    ArticleCard.tsx
    CategoryIcon.tsx
    TableOfContents.tsx
    LangSwitch.tsx
    ThemeToggle.tsx
    CodeBlock.tsx
    CopyButton.tsx
  lib/
    posts.ts              # 读取/解析 MDX
    i18n.ts               # 双语工具
    rss.ts                # feed 生成
  styles/
    globals.css
    tokens.css            # CSS 变量
public/
  feeds/
    feed-cn.xml
    feed-en.xml
scripts/
  build-search.mjs        # pagefind 调用
  build-rss.mjs            # feed 生成
next.config.js
tailwind.config.ts
tsconfig.json
```

## 9. frontmatter 规范

```yaml
---
title: 深入理解 React Server Components
slug: rsc-deep-dive
translationKey: rsc-deep-dive
date: 2024-12-01
category: frontend
tags: [react, rsc, architecture]
readingTime: 8
featured: true
excerpt: 从原理到实践，探索 RSC 如何重塑前端数据流。
coverAlt: React Server Components 示意图
---
```

字段说明：
- `slug`：URL 路径段，双语文章的 slug 在各自语种下可不同
- `translationKey`：双语关联键，同篇文章中英文 `translationKey` 必须相同
- `category`：枚举值 `frontend | backend | architecture | devops | ai | life`
- `featured: true`：首页 Hero 展示（同时只有一篇）
- `readingTime`：构建时由 `reading-time` 库自动计算，无需手填

## 10. 测试

- `vitest` 单测：
  - `lib/posts.ts`：frontmatter 解析、双语关联（translationKey 匹配）
  - `lib/i18n.ts`：语种路由、未翻译处理
  - 分类映射字典
- `@testing-library/react` 组件测试：
  - `Header`：导航高亮、语言切换行为
  - `ArticleCard`：分类色与字段渲染
  - `TableOfContents`：scrollspy 高亮
  - `ThemeToggle`：状态切换
- 关键页面 snapshot：首页、文章页、搜索页
- Lighthouse CI 目标：性能 ≥ 95，a11y ≥ 90，SEO ≥ 95

## 11. 错误处理

- 404：双语 not-found 页面，含搜索框与返回首页按钮
- MDX 解析失败：构建时报错并停止 CI，错误信息含文件路径与行号
- 翻译缺失：占位卡片显示"暂未翻译"，提供阅读另一语种的链接
- 图片加载失败：占位灰色块 + `coverAlt` 文本

## 12. 部署

- 平台：Cloudflare Pages
- 构建命令：`npm run build`（含 next build + pagefind + rss 脚本）
- 输出目录：`out/`
- 触发：`main` 分支推送自动部署生产
- 预览：每个 PR 自动部署预览环境
- 环境变量：无敏感变量
- 域名：Cloudflare 托管 DNS，自动 HTTPS

## 13. YAGNI 裁剪

以下功能**不在**本次范围内：
- 评论 / Giscus / utterances
- Newsletter / 邮件订阅
- 站点统计 / 分析（Google Analytics 等）
- CMS 后台（纯 Git 内容管理）
- 多作者支持
- 多语种扩展（仅中/英）
- 文章系列/连载导航（仅 上一篇/下一篇）

## 14. 后续扩展（非本次）

未来可考虑：
- 文章搜索的语义化（向量检索）
- OG image 自动生成
- 文章阅读进度条
- i18n 扩展到日文/韩文