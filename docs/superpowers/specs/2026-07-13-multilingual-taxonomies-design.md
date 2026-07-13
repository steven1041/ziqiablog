# 多语言分类与标签（Multilingual Taxonomies）设计文档

> **目标**：实现中文和英文各自独立的分类（categories）和标签（tags）页面，使用语言前缀 URL，分类列表预定义不可随意新增。

## 背景

当前 Zola 站点的 taxonomy（categories + tags）只在 `config.toml` 主段定义，等同于只对默认语言 `cn` 生效。英文内容虽然有 frontmatter 中的 categories/tags，但 Zola 没有生成对应的英文 taxonomy 页面。导航链接也写死指向 `/categories/`，不区分语言。

## 设计方案

采用 Zola 原生多语言 taxonomy 机制（方案 A），在 `[languages.en]` 下定义独立的 taxonomy。分类列表从 `config.extra` 中预定义数组读取，而非从 Zola 自动生成的 taxonomy 中遍历，确保只展示允许的分类。

### URL 结构

| 页面 | URL |
|------|-----|
| 中文分类列表 | `/cn/categories/` |
| 中文分类单页 | `/cn/categories/{slug}/` |
| 英文分类列表 | `/en/categories/` |
| 英文分类单页 | `/en/categories/{slug}/` |
| 中文标签列表 | `/cn/tags/` |
| 中文标签单页 | `/cn/tags/{slug}/` |
| 英文标签列表 | `/en/tags/` |
| 英文标签单页 | `/en/tags/{slug}/` |

标签不做预定义限制，跟随文章 frontmatter 自动生成。

### 预定义分类

三个固定分类，中英对照：

| slug | 中文显示名 | 英文显示名 |
|------|-----------|------------|
| `ai-dev-experience` | AI开发经验 | AI Dev Experience |
| `ai-news` | AI新闻 | AI News |
| `ai-opinions` | AI观点 | AI Opinions |

未来新增分类需同时加入 `config.extra.categories` 数组。

## 文件改动

### 1. `config.toml`

```toml
# 主段：cn taxonomy（保持不变）
taxonomies = [
  { name = "categories", feed = false },
  { name = "tags", feed = false },
]

# 预定义分类列表（新增）
[extra]
categories = [
  { slug = "ai-dev-experience", cn = "AI开发经验", en = "AI Dev Experience" },
  { slug = "ai-news", cn = "AI新闻", en = "AI News" },
  { slug = "ai-opinions", cn = "AI观点", en = "AI Opinions" },
]

# 英文语言配置（在现有基础上新增 taxonomy）
[languages.en]
taxonomies = [
  { name = "categories", feed = false },
  { name = "tags", feed = false },
]
```

### 2. `templates/base.html`

导航链接从硬编码 `/categories/`、`/tags/` 改为带语言前缀：

```twig
<a href="/{{ page_lang }}/categories/" ...>{{ trans(key="categories", lang=page_lang) }}</a>
<a href="/{{ page_lang }}/tags/" ...>{{ trans(key="tags", lang=page_lang) }}</a>
```

`active` 判断同步修正。

### 3. `templates/section.html`（首页）

分类展示区从 `get_taxonomy(kind="categories", lang="cn")` 改为遍历 `config.extra.categories`，根据 `page_lang` 取对应显示名，链接指向 `/{page_lang}/categories/{slug}/`。

### 4. `templates/categories/list.html`（分类列表页）

从 `get_taxonomy(kind="categories", lang=page_lang)` 改为遍历 `config.extra.categories`，同样根据 `page_lang` 显示对应名称。

### 5. `templates/categories/single.html`

保持不变。Zola 正常根据 frontmatter 中的 slug 生成单页，模板中 `term.pages` 自动获取该分类下的文章。

### 6. `templates/tags/list.html` 和 `tags/single.html`

保持不变。已有 `lang=page_lang`，config 加上英文 taxonomy 后即可正常工作。

### 7. 文章 frontmatter 迁移（8 篇）

| 文章 | 旧分类 | 新分类 |
|------|--------|--------|
| `cn/posts/ai-coding-cli-tools-comparison.md` | `tooling` | `ai-dev-experience` |
| `cn/posts/du-wan-wen-dang-bu-hui-yong.md` | `ai-coding-workflows` | `ai-dev-experience` |
| `cn/posts/rsc-deep-dive.md` | `ai-coding-workflows` | `ai-dev-experience` |
| `cn/posts/rust-memory.md` | `tooling` | `ai-dev-experience` |
| `cn/posts/why-tech-docs-fail.md` | `tooling` | `ai-opinions` |
| `cn/posts/message-queue.md` | `real-world` | `ai-dev-experience` |
| `cn/posts/game-dev.md` | `real-world` | `ai-dev-experience` |
| `en/posts/welcome.md` | `ai-coding-workflows` | `ai-dev-experience` |

## 验证清单

- [ ] `zola build` 无报错
- [ ] 本地访问 `/cn/categories/` 显示 3 个中文分类
- [ ] 本地访问 `/cn/categories/ai-dev-experience/` 列出对应中文文章
- [ ] 本地访问 `/en/categories/` 显示 3 个英文分类
- [ ] 本地访问 `/en/categories/ai-dev-experience/` 列出 welcome 文章
- [ ] 导航栏链接指向正确的语言前缀路径
- [ ] `/cn/tags/` 和 `/en/tags/` 各自独立工作
- [ ] 分类展示区（首页）根据语言显示正确的分类名

## 不做的事

- 不处理旧 URL（`/categories/`）重定向 — 网站尚未上线，无历史 URL 需要兼容
- 分类不做跨语言映射关联 — 中英文分类各自独立
