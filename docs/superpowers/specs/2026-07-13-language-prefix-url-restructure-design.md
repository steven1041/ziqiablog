# 语言前缀 URL 重构设计文档

> **目标**：所有页面统一语言前缀 URL——中文在 `/cn/` 下，英文在 `/en/` 下。移除标签功能，完善搜索。

## 背景

当前站点使用 Zola 0.19.2，内容按 `content/cn/` + `content/en/` 子目录结构组织。文章页和 about 页已正确使用语言前缀 URL，但分类（categories）和标签（tags）页面仍使用原生 taxonomy 路径而不带语言前缀。

Zola 0.19.2 的 `[languages.en].taxonomies` 配置对子目录内容结构不生效，无法原生生成带语言前缀的分类/标签页面。

## URL 结构

| 页面 | 当前（错误） | 改后 |
|------|-------------|------|
| 中文首页 | `/cn/` | `/cn/` ✅ |
| 英文首页 | `/en/` | `/en/` ✅ |
| 中文关于 | `/cn/about/` | `/cn/about/` ✅ |
| 英文关于 | `/en/about/` | `/en/about/` ✅ |
| 中文分类列表 | `/categories/` | `/cn/categories/` |
| 英文分类列表 | *(不存在)* | `/en/categories/` |
| 中文分类单页 | `/categories/{slug}/` | `/cn/categories/{slug}/` |
| 英文分类单页 | *(不存在)* | `/en/categories/{slug}/` |
| 中文搜索 | `/cn/search/` | `/cn/search/` ✅ |
| 英文搜索 | `/en/search/` | `/en/search/` ✅ |
| 首页根路径 | `/` (302 → `/cn/`) | `/` ✅ |

## 移除标签

- 从 `config.toml` taxonomies 中移除 `tags`
- 删除 `templates/tags/` 目录
- 删除所有模板中标签相关代码（文章卡片、导航等）

## 预定义分类

三个固定分类，不可随意新增：

| slug | 中文显示名 | 英文显示名 |
|------|-----------|------------|
| `ai-dev-experience` | AI开发经验 | AI Dev Experience |
| `ai-news` | AI新闻 | AI News |
| `ai-opinions` | AI观点 | AI Opinions |

## 实现方案

由于 Zola 原生 taxonomy 不支持语言前缀 URL，采用 **手动 content 页面 + 模板逻辑** 方案：

### 分类列表页（`/cn/categories/`、`/en/categories/`）

- 新建 `content/cn/categories/_index.md` 和 `content/en/categories/_index.md`
- 使用 `template = "categories-section.html"`
- 模板遍历 `config.extra.categories`，通过 `get_taxonomy(kind="categories")` 获取文章计数
- 链接指向 `/{page_lang}/categories/{slug}/`

### 分类单页（`/cn/categories/{slug}/`、`/en/categories/{slug}/`）

- 3 分类 × 2 语言 = 6 个 `.md` 文件，如 `content/cn/categories/ai-dev-experience.md`
- 使用 `template = "category-page.html"`
- 模板从 `/{page_lang}/posts/_index.md` 获取该语言下所有文章，按 `page.taxonomies.categories[0]` 过滤

### 搜索

- 已有 Pagefind 搜索（`templates/search.html` + `content/{lang}/search.md`）
- 构建命令 `zola build && npx pagefind --site public`
- 在导航栏添加搜索入口，链接到 `/{page_lang}/search/`

## 配置改动

```toml
taxonomies = [
  { name = "categories", feed = false, render = false },
]
build_search_index = false  # 保持 false，使用 Pagefind
```

## 模板改动

| 文件 | 改动 |
|------|------|
| `templates/base.html` | 导航 `/categories/` → `/{page_lang}/categories/`；移除 tags 导航；添加 search 导航 |
| `templates/section.html`（首页） | 分类展示区链接改为 `/{page_lang}/categories/{slug}/`；移除标签引用 |
| `templates/post.html` | 移除标签显示 |
| `templates/categories-section.html` | **新建**——分类列表页 |
| `templates/category-page.html` | **新建**——分类单页，从 posts 中过滤 |

## 删除

- `templates/tags/` 目录
- `templates/categories/list.html`
- `templates/categories/single.html`

## 验证清单

- [ ] `zola build && npx pagefind --site public` 无报错
- [ ] `/cn/categories/` 显示 3 个中文分类及对应文章数
- [ ] `/cn/categories/ai-dev-experience/` 只显示中文文章
- [ ] `/en/categories/` 显示 3 个英文分类
- [ ] `/en/categories/ai-dev-experience/` 只显示英文文章（welcome）
- [ ] 导航栏不再有标签页
- [ ] 导航栏有搜索入口
- [ ] `/cn/search/` 可搜索中文文章
- [ ] `/en/search/` 可搜索英文文章
- [ ] `/categories/` 和 `/tags/` 返回 404

## 不做的事

- 不处理旧 URL 重定向（网站尚未正式上线）
- 不加标签功能
- 不升级 Zola 版本
- 不加构建脚本或外部工具
