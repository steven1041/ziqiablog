# 自动发布博客 Skill 适配 Zola 架构 — 执行计划

## 背景

项目已从 Next.js 迁移到 Zola，原有的 auto-publish-blog skill 设计文档和实施计划基于 Next.js 架构，需要全面适配 Zola。

## 核心变更点

| # | 维度 | 旧（Next.js） | 新（Zola） |
|---|------|---------------|-----------|
| 1 | 文件格式 | `.mdx` | `.md` |
| 2 | Frontmatter | YAML `---` | TOML `+++` |
| 3 | 字段结构 | `category`, `excerpt`, `translationKey`, `coverAlt` | `description`, `[taxonomies] categories`, `[extra] translation_key`, `cover_alt` |
| 4 | 分类 | 9 个 | 3 个（`ai-dev-experience`, `ai-news`, `ai-opinions`） |
| 5 | 构建命令 | `npm run build` | `zola build && npx pagefind --site public` |
| 6 | 输出目录 | `out/` | `public/` |
| 7 | 图片存储 | `public/images/` | `static/images/` |
| 8 | 图片引用 | `<img src="...">` | `![](/images/...)` |
| 9 | 部署仓库 | `out/` 内 git init | 同级独立目录 `myblog-deploy`，rsync 同步 |
| 10 | 安全边界 | 不改 `src/`, `next.config.mjs` | 不改 `templates/`, `config.toml`, `static/style.css` |
| 11 | 测试 | `npm test` | 移除（Zola 项目无测试框架） |

## 执行步骤

### Step 1: 更新设计文档

**文件:** `docs/superpowers/specs/2026-07-13-auto-publish-blog-skill-design.md`

用上面 brainstorming 阶段确认的完整设计覆盖此文件。关键变更：
- 所有 `.mdx` → `.md`
- 所有 YAML frontmatter → TOML frontmatter
- 9 个分类 → 3 个分类
- `npm run build` → `zola build -o /tmp/myblog-build && npx pagefind --site /tmp/myblog-build`
- `out/` → `public/`（构建产物），`static/images/`（图片源文件）
- 部署仓库从 `out/` 内 git init → 同级独立目录 `myblog-deploy` + rsync
- 安全边界更新为 Zola 项目文件
- 移除 `npm test` 步骤

### Step 2: 更新实施计划

**文件:** `docs/superpowers/plans/2026-07-13-auto-publish-blog-skill.md`

用适配 Zola 的新计划覆盖。6 个 Task 全部需要调整：

**Task 1: SKILL.md** — 所有 Next.js 引用改为 Zola：
- "Next.js 静态博客" → "Zola 静态博客"
- `content/cn/posts/` 下创建 `.md` 而非 `.mdx`
- Frontmatter 用 TOML `+++` 格式
- 分类从 9 个改为 3 个
- 构建命令改为 `zola build -o /tmp/myblog-build`
- 部署改为 rsync 到同级 `myblog-deploy` 仓库
- 图片存 `static/images/posts/{slug}/`
- 图片引用用 Markdown `![]()` 语法
- 安全边界改为不修改 `templates/`、`config.toml`、`static/style.css`

**Task 2: categories.md** — 从 9 个分类改为 3 个：
```
ai-dev-experience  → AI开发经验
ai-news            → AI新闻
ai-opinions        → AI观点
```

**Task 3: frontmatter.md** — 全部改为 TOML 格式：
- 字段名变化：`excerpt` → `description`，`translationKey` → `translation_key`，`coverAlt` → `cover_alt`
- 新增 `template = "post.html"` 字段
- `category` → `[taxonomies] categories = ["..."]`
- 分类校验列表从 9 个改为 3 个

**Task 4: generate-flux-image.sh** — 输出路径改为 `static/images/posts/{slug}/`

**Task 5: 初始化部署仓库** — 从 `out/` git init 改为：
- 同级目录 `git clone` 部署仓库
- 验证 rsync 可用

**Task 6: 验收测试** — 从 `npm test` 改为 `zola build` 验证构建通过

### Step 3: Spec 自审

检查更新后的文档：
- Placeholder 扫描：无 TBD/TODO
- 内部一致性：架构描述与字段规范匹配
- 范围检查：聚焦于 skill 适配，不涉及其他重构
- 模糊点检查：所有字段名、路径、命令明确

### Step 4: 用户审阅

请用户审阅更新后的设计文档和实施计划。

### Step 5: Git 提交

```bash
git add docs/superpowers/specs/2026-07-13-auto-publish-blog-skill-design.md
git add docs/superpowers/plans/2026-07-13-auto-publish-blog-skill.md
git commit -m "docs: 适配 auto-publish-blog skill 设计到 Zola 架构"
```
