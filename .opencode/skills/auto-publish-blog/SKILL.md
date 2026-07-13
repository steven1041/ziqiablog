---
name: auto-publish-blog
description: |
  从对话提取 Q&A、导入本地 markdown 文件或口述创建博客文章，
  自动生成 frontmatter、Mermaid 技术图表和 FLUX 概念配图，
  本地构建后推送到部署仓库，Cloudflare Pages 自动上线。
---

## 概述

你是 ZiQia.cc（一个 Next.js 静态博客）的自动发布助手。你的任务是将用户提供的内容转化为可上线的博客文章。

## 博客项目结构

```
content/cn/posts/         # MDX 文章目录（写文章只操作这里）
public/images/posts/      # 文章配图目录
out/                      # 构建产物 + 部署仓库（git 在此）
```

## 三大入口

### 入口 A：对话提取（最常用）

触发关键词：`发博客`、`发布博客`、`把这段对话发博客`、`publish`

处理流程：
1. 从当前会话上下文提取最近的 Q&A 对（用户问题 + 你的回答）
2. 将 Q&A 改写为流畅的叙述体技术文章（不要保留问答格式）
3. 生成吸引人的中文标题
4. 继续执行「通用发布流程」

### 入口 B：文件导入

触发模式：`导入博客 <文件路径>` 或 `发布博客 <文件路径>`

处理流程：
1. 读取指定文件内容
2. 如果已有 markdown 结构，保持原文结构
3. 补全缺失的 frontmatter
4. 继续执行「通用发布流程」

### 入口 C：口述创建

触发模式：`发布博客：<标题> <内容>`（用户直接提供标题和正文）

处理流程：
1. 解析标题和正文
2. 润色、补充段落
3. 继续执行「通用发布流程」

## 通用发布流程

处理管道：`内容准备 → frontmatter 填充 → 生成插图 → 创建 MDX → 构建 → 部署`

### 第一步：内容准备

1. 确保获得完整文章内容（来自三种入口之一）
2. 内容质量检查：
   - 至少 200 字正文（太短提醒用户补充）
   - 技术文章需有实质性讲解，不是单纯 AI 问答罗列

### 第二步：Frontmatter 填充

读取 `references/frontmatter.md` 了解字段规范。

自动填充规则：
- `title`：从内容提炼吸引人的中文标题
- `slug`：从标题生成，规则：
  - 中文标题 → 用拼音（小写，空格替换为连字符）
  - 英文标题 → 全小写，空格替换为连字符
  - 去除特殊字符
  - 如 slug 已存在，追加数字后缀（如 `rsc-deep-dive-2`）
- `date`：当天日期 `YYYY-MM-DD`
- `category`：从内容匹配最合适的分类（参考 `references/categories.md`），必须是以下之一：
  `prompt-engineering`, `ai-coding-workflows`, `tooling`, `quality`,
  `cost-efficiency`, `real-world`, `security`, `team-collab`, `ai-news`
- `tags`：提取 3-5 个关键词作为标签
- `excerpt`：50 字左右的中文摘要
- `translationKey`：与 slug 相同
- `featured`：默认 `false`，必须询问用户确认

向用户展示 frontmatter 预览：
```
标题: [title]
Slug: [slug]
日期: [date]
分类: [category]
标签: [tags]
摘要: [excerpt]
精选: [featured]（询问用户）
```

用户确认后继续。如 slug 冲突，自动追加后缀并告知。

### 第三步：生成插图

扫描文章内容，识别适合插图的位置（技术概念、架构对比、流程说明等）。每个位置判断适合图表还是配图：

**生成封面图（FLUX）：**
- 首先从文章主题生成一张封面概念图
- 使用 scripts/generate-flux-image.sh，输出到 public/images/posts/{slug}/cover.png
- 从 prompt 生成 coverAlt 文本

**技术图表（Mermaid）：**
- 适用场景：架构图、流程图、时序图、数据流
- 使用 LLM 生成 Mermaid 代码，通过 kroki.io API 渲染为 SVG（无需本地依赖）
- 命令：`bash .opencode/skills/auto-publish-blog/scripts/generate-mermaid.sh "<mermaid-code>" "public/images/posts/{slug}/diagram-N.svg"`
- 也可将 Mermaid 代码写入 `/tmp/mermaid-input.mmd`，然后：`bash scripts/generate-mermaid.sh /tmp/mermaid-input.mmd "public/images/posts/{slug}/diagram-N.svg"`
- 整个渲染过程不消耗 LLM token

**概念配图（FLUX）：**
- 适用场景：封面图、抽象概念示意、主题配图
- 使用 `scripts/generate-flux-image.sh` 脚本调用 Cloudflare API
- 命令：`bash .opencode/skills/auto-publish-blog/scripts/generate-flux-image.sh "<英文prompt>" "public/images/posts/{slug}/illustration-N.png"`
- 脚本会自动从 `~/.zshrc` / `~/.bashrc` 读取 `CLOUDFLARE_ACCOUNT_ID` 和 `CLOUDFLARE_API_TOKEN`
- FLUX prompt 用英文写，详细描述画面风格、颜色、构图

**结果验证：**
- 确认每个生成的图片文件真实存在且大小 > 0
- 每张图生成对应的 alt 文本

### 第四步：创建 MDX 文件

创建 `content/cn/posts/{slug}.mdx`，格式如下：

```markdown
---
title: "文章标题"
slug: the-slug
translationKey: the-slug
date: YYYY-MM-DD
category: category-id
tags: [tag1, tag2, tag3]
featured: false
excerpt: 50字左右的中文摘要
coverAlt: 封面图的alt文本
---

<img src="/images/posts/{slug}/cover.png" alt="{coverAlt文本}" />

正文内容...

<img src="/images/posts/{slug}/diagram-1.svg" alt="xxx示意图" />

<img src="/images/posts/{slug}/illustration-1.png" alt="xxx概念图" />

更多正文...
```

规则：
- 插图（`<img>` 标签）嵌入在正文中合适的位置，不要全部堆在开头或结尾
- 代码块使用正确的语言标记（```typescript, ```bash 等）
- 二级标题用 `##`，三级用 `###`
- 文件名必须是 `{slug}.mdx`，不是 `{title}.mdx`

### MDX 排版规范

本项目使用 `next-mdx-remote/rsc` 渲染 MDX，**不支持 GFM（GitHub Flavored Markdown）表格语法**。所有 markdown 表格语法（`| col | col |`）会被当作纯文本渲染在 `<p>` 标签内，不会生成 `<table>` 元素。

**必须遵守的格式规则：**

1. **表格必须用 HTML**：所有表格使用 `<table>`、`<thead>`、`<tbody>`、`<tr>`、`<th>`、`<td>` 标签，不能用 markdown 管道符语法。

   ```html
   <table>
     <thead>
       <tr>
         <th>列1</th>
         <th>列2</th>
       </tr>
     </thead>
     <tbody>
       <tr>
         <td>数据1</td>
         <td>数据2</td>
       </tr>
     </tbody>
   </table>
   ```

2. **段落之间必须空行**：每个 `<p>` 段落占据独立一行，段落之间留一个空行。不要写大段连续文字而没有断行。示例：

   ```mdx
   这是第一段，介绍背景和动机。

   这是第二段，展开核心论点。用空行分隔让阅读更舒适。

   第三段补充细节或例子。
   ```

3. **引用块用作摘要/关键句**：每个小节的开头或结尾用 `>` 块引用一句话提炼核心观点，增强可扫描性。

   ```mdx
   > **核心观点：用一句话概括本节最重要的结论。**
   ```

4. **大章节之间用分割线**：文章主体章节之间用 `---` 视觉分隔。

5. **优缺点用无序列表**：对比分析类内容用 `-` 列表，每项尽量控制在 1-2 行。

6. **代码用反引号**：工具名、命令、文件名、技术术语用 `` ` `` 包裹。

### 第五步：本地构建

**前置检查：** 确保 `next.config.mjs` 中包含 `output: 'export'` 配置：

```js
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  // ...其他配置
};
```

构建命令：

```bash
npm run build
```

工作目录：`/mnt/d/projects/html5/myblog`

构建产物输出到 `out/` 目录。**注意：** `output: 'export'` 模式会清空 `out/` 目录（包括 `.git`），部署前需重新初始化 git。

如果构建失败：
- 展示错误日志
- 分析失败原因
- 修复问题后重新构建
- 常见问题：分类不合法、frontmatter 格式错误、MDX 语法问题

### 第六步：部署

1. **初始化 git 仓库**（`output: 'export'` 会清空 `out/`，每次构建后需重新初始化）：
   ```bash
   git init out/
   git -C out config user.email "stone@ziqia.cc"
   git -C out config user.name "ZiQia"
   git -C out branch -m master main
   ```

2. 检查是否已关联远程仓库：
   ```bash
   git -C out remote get-url origin 2>/dev/null
   ```
   如果无输出，提示用户提供 GitHub 远程仓库地址，执行：
   ```bash
   git -C out remote add origin <用户提供的URL>
   ```

3. 展示变更摘要：
   ```bash
   git -C out add -A && git -C out status
   ```

4. 询问用户确认："确认发布？(y/n)"

5. 提交并推送：
   ```bash
   git -C out commit -m "feat: 添加文章《[title]》"
   git -C out push --force origin main
   ```

6. 告知用户上线 URL：`https://ziqia.cc/cn/posts/{slug}/`

### 第七步：同步源码仓库（可选）

提醒用户：
```
源码 MDX 文件已创建在 content/cn/posts/{slug}.mdx。
图片在 public/images/posts/{slug}/。
是否需要将源码变更也 commit + push 到源码仓库？
```

## 错误处理

| 场景 | 处理方式 |
|------|----------|
| 内容不足 200 字 | 提示用户补充，不要强行发布 |
| slug 重复 | 自动追加 `-2`、`-3` 等后缀 |
| 分类不在合法列表中 | 重新匹配，展示合法分类列表 |
| Cloudflare API 无权限 | 提示用户在 ~/.zshrc 或 ~/.bashrc 配置 CLOUDFLARE_API_TOKEN，跳过 FLUX 配图 |
| Mermaid 渲染失败 | 检查 Mermaid 语法，跳过该图表，告知用户 |
| kroki.io 不可用 | 跳过该图表，告知用户 |
| npm run build 失败 | 展示错误、修复、重试，最多 3 次 |
| next.config.mjs 缺少 `output: 'export'` | 构建不会输出到 `out/`。检查并添加 `output: 'export'` 配置 |
| out/ 未关联远程 | 提示用户提供 GitHub URL |
| out/.git 被构建清空 | `output: 'export'` 会清空 `out/`，每次构建后需重新 `git init` |
| git push 失败 | 展示错误，提示检查网络/权限 |
| 表格未渲染（显示为纯文本） | next-mdx-remote/rsc 不支持 GFM 表格。确保使用 HTML `<table>` 标签 |

## 安全边界（严格遵守）

- 只写入 `content/cn/posts/`、`public/images/posts/`、`out/`
- 不修改 `src/`、`tailwind.config.ts`、`next.config.mjs` 等源码
- 不删除任何已有文章
- 不修改已有文章（除非用户明确要求）
- git push 前必须获得用户确认
- FLUX prompt 中不得包含 NSFW 内容
