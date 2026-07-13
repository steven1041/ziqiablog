# 自动发布博客 Skill 设计规格

**日期:** 2026-07-13
**状态:** draft

---

## 概述

创建一个 OpenCode Skill，支持从对话中提取 Q&A 改写为博客文章，或从本地文件/口述导入内容。自动完成 frontmatter 填充、插图生成、Markdown 文件创建、本地构建及部署仓库推送。一句话：**对话中随口一句"发博客"，几分钟后文章上线。**

---

## 1. 内容来源与入口

### 1.1 三种入口

| 入口 | 触发方式 | 内容来源 | 典型场景 |
|------|----------|----------|----------|
| 对话提取 | "把这段对话发博客" | 当前会话上下文中最近的 Q&A | 问完 AI 觉得有料，随手发布 |
| 文件导入 | "导入博客 /path/to/file.md" | 本地 Markdown 文件 | 在别处写好的草稿 |
| 口述创建 | "发布博客：标题 + 内容" | 对话中口述 | 即兴创作 |

### 1.2 内容处理

- **对话提取**：从上下文抓取最近 Q&A 对，使用 LLM 改写为连贯的叙述体技术文章，消除问答痕迹。
- **文件导入**：读取本地 md，保持原文结构，仅补全 frontmatter。
- **口述创建**：将用户输入作为文章初稿，LLM 润色、补全段落。

---

## 2. Frontmatter 策略

### 2.1 字段处理

| 字段 | 处理方式 | Zola TOML 格式 |
|------|----------|----------------|
| `title` | LLM 从内容提炼 | `title = "..."` |
| `slug` | 自动生成 | `slug = "..."` |
| `date` | 自动取当天 `YYYY-MM-DD` | `date = YYYY-MM-DD` |
| `description` | LLM 自动摘要，约 50 字 | `description = "..."` |
| `template` | 固定值 | `template = "post.html"` |
| `categories` | LLM 从 3 个分类中匹配 | `[taxonomies]` 下 `categories = ["..."]` |
| `tags` | LLM 提取 3-5 个关键词 | `[taxonomies]` 下 `tags = ["...", "..."]` |
| `translation_key` | 与 slug 相同 | `[extra]` 下 `translation_key = "..."` |
| `cover_alt` | 从首张插图自动生成 | `[extra]` 下 `cover_alt = "..."` |
| `featured` | 发布时询问用户 | `[extra]` 下 `featured = false` |

### 2.2 分类列表

合法的 `categories` 值（来源 `config.toml` 的 `[extra]`）：

```
ai-dev-experience  → AI开发经验
ai-news            → AI新闻
ai-opinions        → AI观点
```

### 2.3 必填字段校验

以下字段缺失则阻塞发布：
- `title`
- `slug`
- `date`
- `categories`（且必须在合法列表中）

`tags`、`description`、`featured` 缺失仅警告，不阻塞。

### 2.4 Frontmatter 示例

```toml
+++
title = "深入理解 React Server Components"
slug = "rsc-deep-dive"
description = "从原理到实践，探索 RSC 如何重塑前端数据流与组件边界。"
date = 2026-07-13
template = "post.html"

[taxonomies]
categories = ["ai-dev-experience"]
tags = ["React", "RSC", "架构"]

[extra]
translation_key = "rsc-deep-dive"
featured = false
cover_alt = "React Server Components 示意图"
+++
```

---

## 3. 插图方案

### 3.1 总策略

采用混合方案：Mermaid 生成技术图表（免费，bash 渲染），Cloudflare FLUX.1 生成概念配图（日均免费 173 张）。

| 类型 | 适用场景 | 生成方式 | 工具 |
|------|----------|----------|------|
| 技术图表 | 架构图、流程图、时序图、数据流 | LLM 生成 Mermaid 代码 → bash `mmdc` 渲染 SVG | 文本模型（Go 套餐，免费） |
| 概念配图 | 封面图、抽象概念示意、主题配图 | LLM 写 prompt → Cloudflare API 生成 PNG | `@cf/black-forest-labs/flux-1-schnell` |

### 3.2 插图工作流

```
文章定稿
  → LLM 扫描全文，标注 2-3 个"此处应有图"的位置
  → 每处判断：适合技术图表（Mermaid）还是概念配图（FLUX）
  → 生成
  → 保存到 static/images/posts/{slug}/
  → Markdown 中 ![](url) 引用
```

### 3.3 Mermaid 渲染

- LLM 输出 Mermaid 代码块
- 通过 `npx -y @mermaid-js/mermaid-cli mmdc` 命令渲染为 SVG
- SVG 保存到 `static/images/posts/{slug}/diagram-N.svg`
- 整个过程不产生 LLM token 消耗

### 3.4 FLUX 生图

- 模型：`@cf/black-forest-labs/flux-1-schnell`
- 平台：Cloudflare Workers AI
- 调用方式：bash `curl` 请求 Cloudflare API
- 前提：环境变量 `CLOUDFLARE_ACCOUNT_ID` 和 `CLOUDFLARE_API_TOKEN`

### 3.5 图片存储

```
static/images/posts/{slug}/
├── cover.png          # 封面图（FLUX 概念配图）
├── diagram-1.svg      # 技术图表（Mermaid SVG）
├── diagram-2.svg      # 技术图表
└── illustration-1.png # 概念配图（FLUX）
```

构建时 Zola 自动将 `static/` 内容复制到 `public/`。

### 3.6 文章中引用方式

使用标准 Markdown 图片语法：

```markdown
![RSC 架构示意图](/images/posts/rsc-deep-dive/diagram-1.svg)
```

---

## 4. 构建与部署

### 4.1 双仓库架构

| 仓库 | 位置 | 用途 | 内容 |
|------|------|------|------|
| `myblog`（源码仓库） | `/mnt/d/projects/html5/myblog/` | 源码 + Markdown 内容 | `content/`, `templates/`, `static/`, `config.toml` |
| `myblog-deploy`（部署仓库） | `/mnt/d/projects/html5/myblog-deploy/` | 纯静态产物 | HTML/CSS/JS/SVG/PNG |
| Cloudflare Pages → | 直接拉取部署仓库 | 零构建，纯静态托管 | — |

### 4.2 发布管道

```
创建 .md + 生成图片（存 static/images/posts/{slug}/）
  → zola build -o /tmp/myblog-build
  → npx pagefind --site /tmp/myblog-build
  → rsync -a --delete /tmp/myblog-build/ /mnt/d/projects/html5/myblog-deploy/
  → myblog 源码仓库 git commit + push
  → myblog-deploy 仓库 git commit + push
  → Cloudflare Pages 自动上线
```

### 4.3 部署仓库初始化

- 用户在 GitHub 新建空仓库（如 `myblog-deploy`）
- 在项目同级目录 `git clone` 到 `/mnt/d/projects/html5/myblog-deploy/`
- 一次性设置，后续发布只做 `rsync + git add/commit/push`

### 4.4 git 操作范围

本 skill 操作部署仓库（`myblog-deploy`）的 git。源码仓库的 `git commit + push` 可选。

---

## 5. 用户交互流程

### 5.1 对话提取（最常用）

```
用户: "把刚才这段对话发博客"
Skill:
  1. 从上下文提取最近 Q&A 对
  2. LLM 改写为叙述体文章
  3. 展示暂定标题和分类："标题：[xxx]，分类：[yyy]，可以吗？"
  4. 用户确认或修改
  5. 询问 featured："是否设为精选？(y/n)"
  6. 生成 Mermaid 图表 + FLUX 配图（存 static/images/posts/{slug}/）
  7. 创建 .md 文件（content/cn/posts/{slug}.md）
  8. 展示 diff 摘要
  9. "确认发布？(y/n)"
  10. zola build + pagefind → rsync → git push
  11. 输出上线 URL：https://ziqia.cc/cn/posts/{slug}/
```

### 5.2 文件导入 / 口述创建

流程同 5.1，仅内容来源不同。

---

## 6. 错误处理

| 场景 | 处理 |
|------|------|
| 分类不合法 | 提示合法分类列表（3 个），要求重选 |
| slug 重复 | 自动追加数字后缀 |
| Cloudflare API 不可用 | 跳过 FLUX 配图，仅用 Mermaid |
| mermaid-cli 渲染失败 | 跳过该图表，告知用户 |
| `zola build` 失败 | 展示错误日志，停止发布 |
| `pagefind` 失败 | 警告但不阻塞 |
| git push 失败 | 展示错误，提示检查网络/权限 |

---

## 7. Skill 文件结构

```
.opencode/skills/auto-publish-blog/
├── SKILL.md                       # Skill 定义与工作流指令
├── references/
│   ├── categories.md              # 3 个分类参考
│   └── frontmatter.md             # Frontmatter 字段规范（TOML）
└── scripts/
    └── generate-flux-image.sh     # Cloudflare FLUX API 调用脚本
```

---

## 8. 依赖与前置条件

### 8.1 环境变量

| 变量 | 必需 | 说明 |
|------|------|------|
| `CLOUDFLARE_ACCOUNT_ID` | 是（如需 FLUX 配图） | Cloudflare 账号 ID |
| `CLOUDFLARE_API_TOKEN` | 是（如需 FLUX 配图） | Cloudflare API Token |

### 8.2 系统依赖

| 工具 | 必需 | 说明 |
|------|------|------|
| `zola` | 是 | 本地构建 |
| `npx` | 是 | 运行 pagefind 和 mermaid-cli |
| `rsync` | 是 | 同步构建产物到部署仓库 |

### 8.3 部署仓库

- 用户在 GitHub 新建空仓库（如 `myblog-deploy`）
- 首次使用时 `git clone` 到项目同级目录

---

## 9. 安全边界

- 仅写入 `content/cn/posts/`、`static/images/posts/`、部署仓库
- 不修改 `templates/`、`config.toml`、`static/style.css`、`static/copy-button.js`
- `git push` 前必须展示 diff 摘要并获得用户确认
- 不自动修改已有文章，除非用户明确要求

---

## 10. 未覆盖场景（未来迭代）

- 文章编辑/更新已有文章
- 定时发布
- 自动交叉引用/关联推荐
- 英文文章发布支持
- 视频/GIF 配图
