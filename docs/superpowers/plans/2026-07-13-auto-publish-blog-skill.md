# 自动发布博客 Skill 实施方案

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标:** 创建 OpenCode Skill，支持从对话提取 Q&A、本地文件导入、口述创建三种方式自动生成博客文章并发布上线。

**架构:** 一个 SKILL.md 定义所有工作流逻辑，辅助引用文件（分类列表、frontmatter 规范）和一个 FLUX API 调用脚本。Skill 置于项目本地 `.opencode/skills/` 下。

**技术栈:** OpenCode Skill (SKILL.md + TOML frontmatter), Bash (Shell), Cloudflare Workers AI API, Zola

## 全局约束

- SKILL.md frontmatter 中 `name` 字段必须是 `auto-publish-blog`
- `name` 必须匹配目录名（小写字母+数字+单连字符）
- Skill 目录位于 `.opencode/skills/auto-publish-blog/`
- 仅写入 `content/cn/posts/`、`static/images/posts/`
- 构建产物同步到同级目录 `myblog-deploy/`
- category 必须是 3 个合法分类之一，否则阻塞发布
- git push 前必须展示 diff 摘要并获用户确认
- 所有插图使用 Markdown 标准 `![]()` 语法嵌入正文

---

## 文件结构

```
.opencode/skills/auto-publish-blog/
├── SKILL.md                          # 主 skill 定义（工作流指令）
├── references/
│   ├── categories.md                 # 3 个分类参考
│   └── frontmatter.md                # Frontmatter 字段规范
└── scripts/
    └── generate-flux-image.sh        # Cloudflare FLUX API 调用脚本
```

**部署仓库初始化（一次性操作）:**
```
/mnt/d/projects/html5/myblog-deploy/  # 同级独立目录
  → git clone 用户指定的 GitHub 远程仓库
```

---

### Task 1: 创建 skill 目录结构与 SKILL.md

**Files:**
- Create: `.opencode/skills/auto-publish-blog/SKILL.md`
- Create: `.opencode/skills/auto-publish-blog/references/`
- Create: `.opencode/skills/auto-publish-blog/scripts/`

**Interfaces:**
- Produces: 完整的 SKILL.md 工作流定义，后续 task 创建的引用文件和脚本文件被 Skill 文档引用

- [ ] **Step 1: 创建 skill 目录**

```bash
mkdir -p .opencode/skills/auto-publish-blog/references
mkdir -p .opencode/skills/auto-publish-blog/scripts
```

- [ ] **Step 2: 编写 SKILL.md**

文件 `.opencode/skills/auto-publish-blog/SKILL.md`：

```markdown
---
name: auto-publish-blog
description: |
  从对话提取 Q&A、导入本地 markdown 文件或口述创建博客文章，
  自动生成 frontmatter、Mermaid 技术图表和 FLUX 概念配图，
  本地构建后推送到部署仓库，Cloudflare Pages 自动上线。
---

## 概述

你是 ZiQia.cc（一个 Zola 静态博客）的自动发布助手。你的任务是将用户提供的内容转化为可上线的博客文章。

## 博客项目结构

```
content/cn/posts/              # 文章目录（写文章只操作这里）
static/images/posts/           # 文章配图目录（源码管理）
/mnt/d/projects/html5/myblog-deploy/  # 部署仓库（同级独立目录，rsync 同步）
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

处理管道：`内容准备 → frontmatter 填充 → 生成插图 → 创建 MD → 构建 → 部署`

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
- `description`：50 字左右的中文摘要
- `categories`：从内容匹配最合适的分类（参考 `references/categories.md`），必须是以下之一：
  `ai-dev-experience`, `ai-news`, `ai-opinions`
- `tags`：提取 3-5 个关键词作为标签
- `translation_key`：与 slug 相同
- `featured`：默认 `false`，必须询问用户确认
- `template`：固定 `post.html`
- `cover_alt`：从首张插图自动生成

向用户展示 frontmatter 预览（以 TOML 格式）：
```toml
title = "[title]"
slug = "[slug]"
date = YYYY-MM-DD
categories = ["[category]"]
tags = ["[tag1]", "[tag2]", "[tag3]"]
description = "[excerpt]"
featured = [false/true]
```

用户确认后继续。如 slug 冲突，自动追加后缀并告知。

### 第三步：生成插图

扫描文章内容，识别适合插图的位置（技术概念、架构对比、流程说明等）。每个位置判断适合图表还是配图：

**技术图表（Mermaid）：**
- 适用场景：架构图、流程图、时序图、数据流
- 使用 LLM 生成 Mermaid 代码，然后通过 bash 渲染为 SVG
- 命令：`npx -y @mermaid-js/mermaid-cli mmdc -i /tmp/mermaid-input.mmd -o static/images/posts/{slug}/diagram-N.svg -b white`
- 将 Mermaid 代码写入临时文件 `/tmp/mermaid-input.mmd`，渲染后删除
- 整个渲染过程不消耗 LLM token

**概念配图（FLUX）：**
- 适用场景：封面图、抽象概念示意、主题配图
- 使用 `scripts/generate-flux-image.sh` 脚本调用 Cloudflare API
- 命令：`bash .opencode/skills/auto-publish-blog/scripts/generate-flux-image.sh "<英文prompt>" "static/images/posts/{slug}/illustration-N.png"`
- FLUX prompt 用英文写，详细描述画面风格、颜色、构图
- 如果 Cloudflare API 不可用（无 CLOUDFLARE_API_TOKEN），跳过生成并告知用户

**结果验证：**
- 确认每个生成的图片文件真实存在且大小 > 0
- 每张图生成对应的 alt 文本

### 第四步：创建 Markdown 文件

创建 `content/cn/posts/{slug}.md`，格式如下：

```toml
+++
title = "文章标题"
slug = "the-slug"
description = "50字左右的中文摘要"
date = YYYY-MM-DD
template = "post.html"

[taxonomies]
categories = ["category-id"]
tags = ["tag1", "tag2", "tag3"]

[extra]
translation_key = "the-slug"
featured = false
cover_alt = "封面图的alt文本"
+++

![xxx示意图](/images/posts/{slug}/diagram-1.svg)

正文内容（Markdown 格式）...

![xxx概念图](/images/posts/{slug}/illustration-1.png)

更多正文...
```

规则：
- 插图（`![]()` 语法）嵌入在正文中合适的位置，不要全部堆在开头或结尾
- 代码块使用正确的语言标记（```typescript, ```bash 等）
- 二级标题用 `##`，三级用 `###`
- 文件名必须是 `{slug}.md`，不是 `{title}.md`

### 第五步：本地构建

```bash
zola build -o /tmp/myblog-build && npx pagefind --site /tmp/myblog-build
```

工作目录：`/mnt/d/projects/html5/myblog`

如果构建失败：
- 展示错误日志
- 分析失败原因
- 修复问题后重新构建
- 常见问题：分类不合法、frontmatter 格式错误、TOML 语法问题

### 第六步：部署

1. 同步构建产物到部署仓库：
   ```bash
   rsync -a --delete /tmp/myblog-build/ /mnt/d/projects/html5/myblog-deploy/
   ```

2. 检查部署仓库是否已关联远程：
   ```bash
   git -C /mnt/d/projects/html5/myblog-deploy remote get-url origin 2>/dev/null
   ```
   如果无输出，提示用户提供 GitHub 远程仓库地址，执行：
   ```bash
   git -C /mnt/d/projects/html5/myblog-deploy remote add origin <用户提供的URL>
   ```

3. 展示变更摘要：
   ```bash
   git -C /mnt/d/projects/html5/myblog-deploy status
   git -C /mnt/d/projects/html5/myblog-deploy diff --stat
   ```

4. 询问用户确认："确认发布？(y/n)"

5. 提交并推送：
   ```bash
   git -C /mnt/d/projects/html5/myblog-deploy add -A
   git -C /mnt/d/projects/html5/myblog-deploy commit -m "feat: 添加文章《[title]》"
   git -C /mnt/d/projects/html5/myblog-deploy push origin main
   ```

6. 告知用户上线 URL：`https://ziqia.cc/cn/posts/{slug}/`

### 第七步：同步源码仓库（可选）

提醒用户：
```
源码 .md 文件已创建在 content/cn/posts/{slug}.md。
图片在 static/images/posts/{slug}/。
是否需要将源码变更也 commit + push 到源码仓库？
```

## 错误处理

| 场景 | 处理方式 |
|------|----------|
| 内容不足 200 字 | 提示用户补充，不要强行发布 |
| slug 重复 | 自动追加 `-2`、`-3` 等后缀 |
| 分类不在合法列表中 | 重新匹配，展示合法分类列表 |
| Cloudflare API 无权限 | 跳过 FLUX 配图，仅保留 Mermaid 图表 |
| Mermaid 渲染失败 | 跳过该图表，告知用户 |
| zola build 失败 | 展示错误、修复、重试，最多 3 次 |
| pagefind 失败 | 警告但不阻塞 |
| 部署仓库未关联远程 | 提示用户提供 GitHub URL |
| git push 失败 | 展示错误，提示检查网络/权限 |

## 安全边界（严格遵守）

- 只写入 `content/cn/posts/`、`static/images/posts/`
- 不修改 `templates/`、`config.toml`、`static/style.css`、`static/copy-button.js` 等源码文件
- 不删除任何已有文章
- 不修改已有文章（除非用户明确要求）
- git push 前必须获得用户确认
- FLUX prompt 中不得包含 NSFW 内容
```

- [ ] **Step 3: 确认 SKILL.md 语法正确**

验证 frontmatter 格式：
- `name: auto-publish-blog`（必填，1-64 字符，小写字母+数字+连字符）
- `description` 必填，1-1024 字符
- `---` 分隔符正确闭合

- [ ] **Step 4: Commit**

```bash
git add .opencode/skills/auto-publish-blog/SKILL.md
git commit -m "feat: 创建 auto-publish-blog skill 主定义"
```

---

### Task 2: 创建分类参考文件

**Files:**
- Create: `.opencode/skills/auto-publish-blog/references/categories.md`

**Interfaces:**
- Consumes: SKILL.md 中引用此文件获取分类信息
- Produces: 3 个合法分类的 ID 和中文名称，供 SKILL.md 工作流中查询

- [ ] **Step 1: 编写 categories.md**

文件 `.opencode/skills/auto-publish-blog/references/categories.md`：

```markdown
# 博客分类参考

博客使用以下 3 个分类。创建文章时 `categories` 字段必须是以下 ID 之一。

| ID | 中文名 | 说明 |
|----|--------|------|
| `ai-dev-experience` | AI开发经验 | AI 辅助开发的实践、经验总结、最佳实践 |
| `ai-news` | AI新闻 | AI 行业动态、新工具发布、趋势分析 |
| `ai-opinions` | AI观点 | 对 AI 技术方向的见解、深度分析、评论文章 |

## 分类选择指南

根据文章主题选择最匹配的分类：
- 讲 AI 辅助开发的实际经验/教程 → `ai-dev-experience`
- 讲行业新闻、新工具发布 → `ai-news`
- 讲观点、分析、评论 → `ai-opinions`
```

- [ ] **Step 2: Commit**

```bash
git add .opencode/skills/auto-publish-blog/references/categories.md
git commit -m "feat: 添加博客分类参考文件"
```

---

### Task 3: 创建 Frontmatter 规范文件

**Files:**
- Create: `.opencode/skills/auto-publish-blog/references/frontmatter.md`

**Interfaces:**
- Consumes: SKILL.md 中引用此文件获取字段规范
- Produces: 完整的前置元数据字段定义

- [ ] **Step 1: 编写 frontmatter.md**

文件 `.opencode/skills/auto-publish-blog/references/frontmatter.md`：

```markdown
# Frontmatter 字段规范

博客使用 TOML frontmatter，位于 Markdown 文件的 `+++` 分隔符之间。

## 字段定义

| 字段 | 位置 | 类型 | 必需 | 说明 |
|------|------|------|------|------|
| `title` | 顶层 | string | 是 | 文章标题，用引号包裹 |
| `slug` | 顶层 | string | 是 | URL 路径片段，小写字母+数字+连字符 |
| `description` | 顶层 | string | 否 | 文章摘要，约 50 字 |
| `date` | 顶层 | date | 是 | ISO 日期 YYYY-MM-DD |
| `template` | 顶层 | string | 是 | 固定为 `"post.html"` |
| `categories` | `[taxonomies]` | string[] | 是 | 分类列表，必须是合法分类 ID |
| `tags` | `[taxonomies]` | string[] | 否 | 标签列表 `["tag1", "tag2"]` |
| `translation_key` | `[extra]` | string | 是 | 与 slug 相同的标识符 |
| `featured` | `[extra]` | boolean | 否 | 是否精选，默认 false |
| `cover_alt` | `[extra]` | string | 否 | 封面图的 alt 文本 |

## 示例

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

## Slug 生成规则

1. 如果标题是中文，用拼音（小写，空格→连字符）
2. 如果标题含英文，用英文部分转小写，空格→连字符
3. 去除所有特殊字符（只保留 a-z、0-9、连字符）
4. 避免 slug 以数字开头
5. slug 长度控制在 60 字符以内

## 分类校验规则

`categories` 必须是以下 3 个值之一，否则博客构建会报错：
```
ai-dev-experience
ai-news
ai-opinions
```
```

- [ ] **Step 2: Commit**

```bash
git add .opencode/skills/auto-publish-blog/references/frontmatter.md
git commit -m "feat: 添加 frontmatter 字段规范文件"
```

---

### Task 4: 创建 FLUX 生图脚本

**Files:**
- Create: `.opencode/skills/auto-publish-blog/scripts/generate-flux-image.sh`

**Interfaces:**
- Consumes: 环境变量 `CLOUDFLARE_ACCOUNT_ID`、`CLOUDFLARE_API_TOKEN`
- Produces: 接收 prompt 和输出路径两个参数，调用 Cloudflare Workers AI API 生成 PNG

- [ ] **Step 1: 编写 generate-flux-image.sh**

文件 `.opencode/skills/auto-publish-blog/scripts/generate-flux-image.sh`：

```bash
#!/usr/bin/env bash
set -euo pipefail

# 用法: generate-flux-image.sh "<prompt>" "<output-path>"
# 依赖: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN 环境变量

if [ $# -lt 2 ]; then
  echo "用法: $0 <prompt> <output-path>" >&2
  exit 1
fi

PROMPT="$1"
OUTPUT="$2"

if [ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]; then
  echo "错误: 未设置 CLOUDFLARE_ACCOUNT_ID 环境变量" >&2
  exit 1
fi

if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
  echo "错误: 未设置 CLOUDFLARE_API_TOKEN 环境变量" >&2
  exit 1
fi

API_URL="https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/black-forest-labs/flux-1-schnell"

echo "正在生成图片..."
echo "Prompt: ${PROMPT}"

# 确保输出目录存在
mkdir -p "$(dirname "${OUTPUT}")"

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "${API_URL}" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"prompt\": \"${PROMPT}\", \"num_steps\": 4}")

HTTP_CODE=$(echo "${RESPONSE}" | tail -1)
BODY=$(echo "${RESPONSE}" | sed '$d')

if [ "${HTTP_CODE}" != "200" ]; then
  echo "错误: API 返回状态码 ${HTTP_CODE}" >&2
  echo "${BODY}" >&2
  exit 1
fi

# 检查响应是否为 JSON（可能是错误消息）
if echo "${BODY}" | head -c 1 | grep -q '{'; then
  echo "错误: API 返回 JSON 错误" >&2
  echo "${BODY}" >&2
  exit 1
fi

# 将二进制响应写入文件
echo "${BODY}" > "${OUTPUT}"

# 检查文件是否有效
FILE_SIZE=$(stat -c%s "${OUTPUT}" 2>/dev/null || echo 0)
if [ "${FILE_SIZE}" -lt 1000 ]; then
  echo "警告: 生成的文件过小 (${FILE_SIZE} bytes)，可能不是有效图片" >&2
  exit 1
fi

echo "图片已保存到: ${OUTPUT} (${FILE_SIZE} bytes)"
```

- [ ] **Step 2: 设置脚本为可执行**

```bash
chmod +x .opencode/skills/auto-publish-blog/scripts/generate-flux-image.sh
```

- [ ] **Step 3: Commit**

```bash
git add .opencode/skills/auto-publish-blog/scripts/generate-flux-image.sh
git commit -m "feat: 添加 Cloudflare FLUX 生图脚本"
```

---

### Task 5: 初始化部署仓库

**Files:**
- 在项目同级目录 `git clone` 部署仓库

**Interfaces:**
- Consumes: 用户提供的 GitHub 远程仓库 URL
- Produces: `/mnt/d/projects/html5/myblog-deploy/` 已克隆并关联远程仓库

- [ ] **Step 1: 检查 myblog-deploy 目录**

```bash
ls -la /mnt/d/projects/html5/myblog-deploy/
```

预期：目录存在且有 `.git/`，关联远程仓库。

- [ ] **Step 2: 如果目录不存在**

引导用户：
```
请先在 GitHub 上创建一个空仓库（如 myblog-deploy），
然后告诉我远程仓库 URL。
```

等待用户提供 URL 后：

```bash
cd /mnt/d/projects/html5 && git clone <用户提供的URL>
```

- [ ] **Step 3: 验证配置**

```bash
git -C /mnt/d/projects/html5/myblog-deploy remote -v
```

预期输出：显示正确的 origin URL。

---

### Task 6: 验收测试

**Files:**
- 无新文件，验证已有文件完整性

**Interfaces:**
- Consumes: 所有已创建的 skill 文件
- Produces: 测试报告，确认 skill 可用

- [ ] **Step 1: 验证所有文件存在**

```bash
ls -la .opencode/skills/auto-publish-blog/SKILL.md
ls -la .opencode/skills/auto-publish-blog/references/categories.md
ls -la .opencode/skills/auto-publish-blog/references/frontmatter.md
ls -la .opencode/skills/auto-publish-blog/scripts/generate-flux-image.sh
```

预期：四个文件都存在。

- [ ] **Step 2: 验证 SKILL.md frontmatter**

```bash
head -5 .opencode/skills/auto-publish-blog/SKILL.md
```

预期输出：
```
---
name: auto-publish-blog
description: |
  从对话提取 Q&A、导入本地 markdown 文件或口述创建博客文章，
```

- [ ] **Step 3: 验证脚本可执行**

```bash
test -x .opencode/skills/auto-publish-blog/scripts/generate-flux-image.sh && echo "可执行" || echo "不可执行"
```

预期输出：`可执行`

- [ ] **Step 4: 验证部署仓库配置**

```bash
git -C /mnt/d/projects/html5/myblog-deploy remote -v 2>&1
```

预期：显示正确的 origin URL。

- [ ] **Step 5: 运行构建验证**

```bash
zola build -o /tmp/myblog-build-test
```

工作目录：`/mnt/d/projects/html5/myblog`

预期：构建成功，无错误。

- [ ] **Step 6: 最终提交**

```bash
git status
```

如果有未提交的变更：

```bash
git add -A
git commit -m "chore: 完成 auto-publish-blog skill 实施"
```
