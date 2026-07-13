# 自动发布博客 Skill 设计规格

**日期:** 2026-07-13
**状态:** draft

---

## 概述

创建一个 OpenCode Skill，支持从对话中提取 Q&A 改写为博客文章，或从本地文件/口述导入内容。自动完成 frontmatter 填充、插图生成、MDX 文件创建、本地构建及部署仓库推送。一句话：**对话中随口一句"发博客"，几分钟后文章上线。**

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

| 字段 | 处理方式 | 说明 |
|------|----------|------|
| `title` | LLM 从内容提炼 | 用户可覆盖 |
| `slug` | 自动生成拼音/英文简写 | 从 title 推导 |
| `date` | 自动取当天 `YYYY-MM-DD` | — |
| `category` | LLM 从 9 个分类中匹配 | 必须为合法分类 ID |
| `tags` | LLM 提取 3-5 个关键词 | string[] |
| `excerpt` | LLM 自动摘要，约 50 字 | — |
| `translationKey` | 设为与 slug 相同 | 历史遗留字段，保持兼容 |
| `coverAlt` | 从首张插图自动生成 | 无插图则省略 |
| `featured` | 发布时询问用户 | 默认 `false` |
| `readingTime` | 不设置 | 构建时自动计算 |

### 2.2 分类列表

合法的 `category` 值（来源 `src/lib/categories.ts`）：

```
prompt-engineering, ai-coding-workflows, tooling, quality,
cost-efficiency, real-world, security, team-collab, ai-news
```

### 2.3 必填字段校验

以下字段缺失则阻塞发布：
- `title`
- `slug`
- `date`
- `category`（且必须在合法列表中）

`tags`、`excerpt`、`featured` 缺失仅警告，不阻塞。

---

## 3. 插图方案

### 3.1 总策略

采用混合方案：Mermaid 生成技术图表（免费，bash 渲染），Cloudflare FLUX.1 生成概念配图（日均免费 173 张，完全够用）。

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
  → 保存到 public/images/posts/{slug}/
  → MDX 中 <img> 引用
```

### 3.3 Mermaid 渲染

- LLM 输出 Mermaid 代码块（几十 token，成本极低）
- 通过 `npx -y @mermaid-js/mermaid-cli mmdc` 命令渲染为 SVG（首次自动安装，无需预安装）
- SVG 保存到 `public/images/posts/{slug}/diagram-N.svg`
- 整个过程不产生 LLM token 消耗

### 3.4 FLUX 生图

- 模型：`@cf/black-forest-labs/flux-1-schnell`
- 平台：Cloudflare Workers AI
- 成本：约 58 Neurons/张，每日免费 10,000 Neurons ≈ 173 张
- 调用方式：bash `curl` 直接请求 Cloudflare API
- 前提：用户需在环境变量中配置 `CLOUDFLARE_ACCOUNT_ID` 和 `CLOUDFLARE_API_TOKEN`
- API 基础地址：`https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/@cf/black-forest-labs/flux-1-schnell`

### 3.5 图片存储

```
public/images/posts/{slug}/
├── cover.png          # 封面图（FLUX 概念配图，嵌入 MDX 开头）
├── diagram-1.svg      # 技术图表（Mermaid SVG）
├── diagram-2.svg      # 技术图表
└── illustration-1.png # 概念配图（FLUX）
```

---

## 4. 构建与部署

### 4.1 双仓库架构

| 仓库 | 用途 | 内容 |
|------|------|------|
| `myblog`（源码仓库） | 源码 + MDX 内容 | `content/`, `src/`, `public/`, ... |
| `myblog-deploy`（部署仓库） | 纯静态产物 | `out/` 目录下的 HTML/JS/CSS/SVG/PNG |
| Cloudflare Pages → | 直接拉取部署仓库 | 零构建，纯静态托管 |

### 4.2 发布管道

```
创建 MDX + 生成图片
  → npm run build（本地，所有构建错误在此暴露）
  → cp out/ 到 myblog-deploy 仓库
  → myblog 源码仓库 git commit + push
  → myblog-deploy 仓库 git commit + push
  → Cloudflare Pages 自动检测部署仓库更新 → 上线
```

### 4.3 部署仓库初始化

- 在 `out/` 目录中 `git init` 并关联用户在 GitHub 新建的远程仓库
- 此操作为一次性设置，后续发布只做 `git add/commit/push`
- 部署仓库地址由用户在首次使用时提供

### 4.4 git 操作范围

本 skill 只操作部署仓库（`myblog-deploy`）的 git。源码仓库的 `git commit + push` 可选（用户可自行决定是否提交源码变更）。

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
  6. 生成 Mermaid 图表 + FLUX 配图
  7. 创建 MDX 文件
  8. 展示 diff 摘要
  9. "确认发布？(y/n)"
  10. 构建 + 推送部署仓库
  11. 输出上线 URL
```

### 5.2 文件导入

```
用户: "导入博客 /home/stone/draft.md"
Skill:
  1. 读取文件
  2. LLM 分析内容，自动生成 frontmatter
  3. 展示 frontmatter，询问确认
  4. 后续同 5.1 步骤 5-11
```

### 5.3 口述创建

```
用户: "发布博客：标题《xxx》，内容：balabala..."
Skill:
  1. 解析标题和正文
  2. LLM 润色、自动生成 frontmatter
  3. 后续同 5.1 步骤 3-11
```

---

## 6. 错误处理

| 场景 | 处理 |
|------|------|
| 分类不合法 | 提示合法分类列表，要求重选 |
| slug 重复 | 自动追加数字后缀（如 `xxx-2`） |
| Cloudflare API 不可用 | 跳过 FLUX 配图，仅用 Mermaid，告知用户 |
| mermaid-cli 渲染失败 | 跳过该图表，仅用 FLUX，告知用户 |
| npm run build 失败 | 展示错误日志，停止发布，不推送 |
| git push 失败 | 展示错误，提示用户检查网络/权限 |

---

## 7. Skill 文件结构

```
~/.opencode/skills/auto-publish-blog/
├── SKILL.md                       # Skill 定义与工作流指令
├── references/
│   ├── categories.md              # 9 个分类参考
│   └── frontmatter.md             # Frontmatter 字段规范
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

### 8.2 部署仓库

- 用户在 GitHub 新建空仓库（如 `myblog-deploy`）
- 首次使用时在本地 `out/` 初始化并关联

---

## 9. 安全边界

- 仅写入 `content/cn/posts/`、`public/images/posts/`、`out/`
- 不修改 `src/`、`tailwind.config.ts`、`next.config.mjs` 等源码文件
- `git push` 前必须展示 diff 摘要并获得用户确认
- 不自动修改已有文章，除非用户明确要求

---

## 10. 未覆盖场景（未来迭代）

- 文章编辑/更新已有文章
- 定时发布
- 自动交叉引用/关联推荐
- 多语言支持
- 视频/GIF 配图
