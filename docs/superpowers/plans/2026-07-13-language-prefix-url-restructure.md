# 语言前缀 URL 重构实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 所有分类页面 URL 加上语言前缀（`/cn/categories/`、`/en/categories/`），移除标签功能，导航栏添加搜索入口。

**Architecture:** Zola 原生 taxonomy 不支持子目录内容结构的语言前缀 URL，改为手动 content 页面 + 模板逻辑：分类列表用 section 页面，分类单页用 content 页面按语言过滤文章。

**Tech Stack:** Zola 0.19.2, Tera 模板, Pagefind 搜索

## Global Constraints

- Zola 0.19.2，不升级版本
- 内容结构：`content/cn/` + `content/en/` 子目录法，不改
- 不引入构建脚本、外部工具或 Node.js 依赖
- 中英文分类/标签完全隔离，不共享
- 只改分类和标签的 URL，文章和 about 页不动
- 构建命令：`zola build && npx pagefind --site public`

---

### Task 1: 配置与清理

**Files:**
- Modify: `config.toml`
- Delete: `templates/tags/list.html`
- Delete: `templates/tags/single.html`
- Delete: `templates/categories/list.html`
- Delete: `templates/categories/single.html`
- Delete: `templates/tags/` (empty dir)

- [ ] **Step 1: 修改 config.toml**

删除 tags taxonomy，categories 加 `render = false`：

```toml
taxonomies = [
  { name = "categories", feed = false, render = false },
]
```

`build_search_index` 保持 `false`（用 Pagefind）。

- [ ] **Step 2: 从文章 frontmatter 移除 tags**

全部 8 篇中文文章 + 1 篇英文文章都有 `tags = [...]`。由于 tags taxonomy 已被移除，Zola 不会生成警告，但保留无用字段不整洁，一并清理。每篇文章删除 frontmatter 中 `tags = [...]` 行（位置在 `[taxonomies]` 块内）。

需要修改的文件：
- `content/cn/posts/ai-coding-cli-tools-comparison.md`
- `content/cn/posts/du-wan-wen-dang-bu-hui-yong.md`
- `content/cn/posts/gamedevtest`（注意：该文件名在目录列表中为 `content/cn/posts/gamedevtest`，不是 `.md` 文件，检查实际路径）
- `content/cn/posts/message-queue.md`
- `content/cn/posts/rsc-deep-dive.md`
- `content/cn/posts/rust-memory.md`
- `content/cn/posts/why-tech-docs-fail.md`
- `content/en/posts/welcome.md`

- [ ] **Step 3: 删除旧 taxonomy 模板**

```bash
rm -rf templates/tags templates/categories/list.html templates/categories/single.html
```

- [ ] **Step 4: 构建验证**

```bash
docker run --rm -v "$(pwd):/app" -w /app ghcr.io/getzola/zola:v0.19.2 build 2>&1
```

Expected: `-> Creating 12 pages (0 orphan) and 5 sections`（无 categories/tags 页面），无警告。

- [ ] **Step 5: Commit**

```bash
git add config.toml
git rm -r templates/tags templates/categories/list.html templates/categories/single.html
git add content/cn/posts/ content/en/posts/
git commit -m "chore: 移除标签 taxonomy，清理文章 frontmatter，禁用分类自动页面生成"
```

---

### Task 2: 新建模板

**Files:**
- Create: `templates/categories-section.html`
- Create: `templates/category-page.html`

- [ ] **Step 1: 创建 categories-section.html**

分类列表页模板。遍历 `config.extra.categories`，通过 `get_taxonomy(kind="categories")` 统计文章数，链接指向 `/{page_lang}/categories/{slug}/`。

```html
{% extends "base.html" %}

{% block title %}{{ trans(key="categories", lang=page_lang) }} — {{ site_title }}{% endblock title %}

{% block content %}
<h1 class="page-heading">{{ trans(key="categories", lang=page_lang) }}</h1>

{% set all_cats = get_taxonomy(kind="categories") %}
{% set defined = config.extra.categories %}

<div class="cat-list">
  {% for d in defined %}
  {% set_global count = 0 %}
  {% for cat in all_cats.items %}
    {% if cat.slug == d.slug %}
      {% set_global count = cat.pages | length %}
    {% endif %}
  {% endfor %}
  {% if page_lang == "en" %}
    {% set cat_name = d.en %}
  {% else %}
    {% set cat_name = d.cn %}
  {% endif %}
  <a {% if count > 0 %}href="{{ get_url(path='/' ~ page_lang ~ '/categories/' ~ d.slug ~ '/') }}"{% endif %}>
    <div class="cat-icon" style="background: #E8F0FE">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="#4285F4">
        <rect x="3" y="3" width="18" height="18" rx="4" opacity="0.2"/>
        <circle cx="12" cy="12" r="4"/>
      </svg>
    </div>
    <div>
      <div class="cat-name">{{ cat_name }}</div>
      <div class="cat-count">{{ count }} {{ trans(key="articles", lang=page_lang) }}</div>
    </div>
  </a>
  {% endfor %}
</div>
{% endblock content %}
```

- [ ] **Step 2: 创建 category-page.html**

分类单页模板。从 `/{page_lang}/posts/_index.md` 获取该语言所有文章，按 `page.taxonomies.categories[0]` 过滤。

```html
{% extends "base.html" %}

{% block title %}{{ page.title }} — {{ site_title }}{% endblock title %}
{% block description %}{{ page.description }}{% endblock description %}

{% block content %}
{% set posts_section = get_section(path=page_lang ~ "/posts/_index.md") %}
{% set cat_slug = page.components | last %}
{% set cat_name = page.title %}

<h1 class="page-heading">{{ cat_name }}</h1>

{% set cat_posts = [] %}
{% for post in posts_section.pages %}
  {% if post.taxonomies.categories is containing(cat_slug) %}
    {% set_global cat_posts = cat_posts | concat(with=[post]) %}
  {% endif %}
{% endfor %}

{% if cat_posts | length > 0 %}
<div class="grid md:grid-cols-2 lg:grid-cols-3">
  {% for post in cat_posts %}
  <article class="article-card">
    <a href="{{ post.permalink }}">
      <div class="card-visual" style="background: linear-gradient(135deg, #E8F0FE 0%, #4285F4 100%)">
        <span class="card-cat">{{ cat_name }}</span>
      </div>
      <div class="card-body">
        <h3>{{ post.title }}</h3>
        <p>{{ post.description }}</p>
        <div class="card-footer">
          <span>{{ post.date }} · {{ trans(key="reading_time", lang=page_lang) | replace(from="{n}", to=post.reading_time ~ "") }}</span>
          <span class="read-more">{{ trans(key="read_more", lang=page_lang) }} →</span>
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

- [ ] **Step 3: Commit**

```bash
git add templates/categories-section.html templates/category-page.html
git commit -m "feat: 分类列表和单页模板（语言前缀 URL）"
```

---

### Task 3: 新建 content 页面（8 个文件）

**Files:**
- Create: `content/cn/categories/_index.md`
- Create: `content/en/categories/_index.md`
- Create: `content/cn/categories/ai-dev-experience.md`
- Create: `content/cn/categories/ai-news.md`
- Create: `content/cn/categories/ai-opinions.md`
- Create: `content/en/categories/ai-dev-experience.md`
- Create: `content/en/categories/ai-news.md`
- Create: `content/en/categories/ai-opinions.md`

- [ ] **Step 1: 创建分类列表 sections**

`content/cn/categories/_index.md`：
```md
+++
title = "分类"
template = "categories-section.html"
[extra]
translation_key = "categories"
+++
```

`content/en/categories/_index.md`：
```md
+++
title = "Categories"
template = "categories-section.html"
[extra]
translation_key = "categories"
+++
```

- [ ] **Step 2: 创建中文分类单页（3 个）**

`content/cn/categories/ai-dev-experience.md`：
```md
+++
title = "AI开发经验"
description = "AI 开发实践、经验与工具"
template = "category-page.html"
[extra]
translation_key = "ai-dev-experience"
+++
```

`content/cn/categories/ai-news.md`：
```md
+++
title = "AI新闻"
description = "AI 行业新闻与动态"
template = "category-page.html"
[extra]
translation_key = "ai-news"
+++
```

`content/cn/categories/ai-opinions.md`：
```md
+++
title = "AI观点"
description = "AI 行业观点与评论"
template = "category-page.html"
[extra]
translation_key = "ai-opinions"
+++
```

- [ ] **Step 3: 创建英文分类单页（3 个）**

`content/en/categories/ai-dev-experience.md`：
```md
+++
title = "AI Dev Experience"
description = "AI development practices, insights, and tools"
template = "category-page.html"
[extra]
translation_key = "ai-dev-experience"
+++
```

`content/en/categories/ai-news.md`：
```md
+++
title = "AI News"
description = "AI industry news and updates"
template = "category-page.html"
[extra]
translation_key = "ai-news"
+++
```

`content/en/categories/ai-opinions.md`：
```md
+++
title = "AI Opinions"
description = "AI industry opinions and commentary"
template = "category-page.html"
[extra]
translation_key = "ai-opinions"
+++
```

- [ ] **Step 4: Commit**

```bash
git add content/cn/categories/ content/en/categories/
git commit -m "feat: 分类列表和分类单页 content 页面"
```

---

### Task 4: 修改现有模板

**Files:**
- Modify: `templates/base.html`
- Modify: `templates/section.html`
- Modify: `templates/post.html`

- [ ] **Step 1: 修改 base.html 导航链接**

将硬编码的 `/categories/` 和 `/tags/` 改为语言前缀路径，移除 tags 链接，添加 search 链接：

```html
      <a href="{{ get_url(path='/' ~ page_lang ~ '/categories/') }}" {% if cur is containing('/categories/') %}class="active"{% endif %}>{{ trans(key="categories", lang=page_lang) }}</a>
      <a href="{{ get_url(path='/' ~ page_lang ~ '/search/') }}" {% if cur is containing('/search/') %}class="active"{% endif %}>{{ trans(key="search", lang=page_lang) }}</a>
```

完整 diff（第 34-37 行）：
```
-      <a href="{{ get_url(path='/categories/') }}" {% if cur is containing('/categories/') %}class="active"{% endif %}>{{ trans(key="categories", lang=page_lang) }}</a>
-      <a href="{{ get_url(path='/tags/') }}" {% if cur is containing('/tags/') %}class="active"{% endif %}>{{ trans(key="tags", lang=page_lang) }}</a>
+      <a href="{{ get_url(path='/' ~ page_lang ~ '/categories/') }}" {% if cur is containing('/categories/') %}class="active"{% endif %}>{{ trans(key="categories", lang=page_lang) }}</a>
+      <a href="{{ get_url(path='/' ~ page_lang ~ '/search/') }}" {% if cur is containing('/search/') %}class="active"{% endif %}>{{ trans(key="search", lang=page_lang) }}</a>
```

- [ ] **Step 2: 修改 section.html（首页）**

修改分类展示区，将链接改为 `/{page_lang}/categories/{slug}/`。

替换第 75 行 `get_taxonomy` 调用，移除 `cat_href` 从 `cat.permalink` 获取的方式，改为手动构建：

```html
  {% if config.extra.categories %}
  {% set all_cats = get_taxonomy(kind="categories", required=false) %}
  <div class="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9">
    {% for d in config.extra.categories %}
    {% set_global count = 0 %}
    {% if all_cats %}
      {% for cat in all_cats.items %}
        {% if cat.slug == d.slug %}
          {% set_global count = cat.pages | length %}
        {% endif %}
      {% endfor %}
    {% endif %}
    <a href="{{ get_url(path='/' ~ page_lang ~ '/categories/' ~ d.slug ~ '/') }}" class="cat-icon-link">
      <div class="cat-icon" style="background: #E8F0FE">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#4285F4">
          <rect x="3" y="3" width="18" height="18" rx="4" opacity="0.2"/>
          <circle cx="12" cy="12" r="4"/>
        </svg>
      </div>
      <span>{% if page_lang == "en" %}{{ d.en }}{% else %}{{ d.cn }}{% endif %}</span>
    </a>
    {% endfor %}
  </div>
  {% endif %}
```

- [ ] **Step 3: 修改 post.html**

移除文章页中的标签显示（`post.taxonomies.tags` 相关代码。当前 post.html 没有显示标签，但检查第 29-32 行的分类显示是否影响。实际上 post.html 中 `page.taxonomies.categories[0]` 显示在文章头部，这个保留不变。移除对 `page.taxonomies.tags` 的任何引用——当前文件中没有标签引用，所以无需修改。

验证：`grep -n 'tags' templates/post.html` 应无输出。

- [ ] **Step 4: 构建验证**

```bash
rm -rf public && docker run --rm -v "$(pwd):/app" -w /app ghcr.io/getzola/zola:v0.19.2 build 2>&1
```

Expected: `-> Creating 18 pages (0 orphan) and 7 sections`

查看生成的页面：
```bash
find public -name "*.html" | sort
```

Expected 包含：
```
public/cn/categories/index.html
public/cn/categories/ai-dev-experience/index.html
public/cn/categories/ai-news/index.html
public/cn/categories/ai-opinions/index.html
public/en/categories/index.html
public/en/categories/ai-dev-experience/index.html
public/en/categories/ai-news/index.html
public/en/categories/ai-opinions/index.html
```

不应包含：
- `public/tags/` 下的任何页面
- `public/categories/`（根目录，无语言前缀）

- [ ] **Step 5: Commit**

```bash
git add templates/base.html templates/section.html
git commit -m "feat: 导航和首页使用语言前缀分类链接，添加搜索入口"
```

---

### Task 5: 验证

- [ ] **Step 1: 完整构建**

```bash
rm -rf public && docker run --rm -v "$(pwd):/app" -w /app ghcr.io/getzola/zola:v0.19.2 build 2>&1
```

- [ ] **Step 2: 检查页面列表**

```bash
find public -name "index.html" | sort | sed 's|public||;s|/index.html||'
```

Expected output:
```
/404
/cn
/cn/about
/cn/categories
/cn/categories/ai-dev-experience
/cn/categories/ai-news
/cn/categories/ai-opinions
/cn/posts
/cn/posts/ai-coding-cli-tools-comparison
/cn/posts/du-wan-wen-dang-bu-hui-yong
/cn/posts/gamedevtest
/cn/posts/message-queue
/cn/posts/rsc-deep-dive
/cn/posts/rust-memory
/cn/posts/why-tech-docs-fail
/cn/search
/en
/en/about
/en/categories
/en/categories/ai-dev-experience
/en/categories/ai-news
/en/categories/ai-opinions
/en/posts
/en/posts/welcome
/en/search
/
```

确认无 `tags` 和根 `categories` 路径。

- [ ] **Step 3: 检查分类页面内容**

```bash
# 中文分类列表应显示 3 个分类
grep -c 'cat-name' public/cn/categories/index.html
# Expected: 3

# 英文分类列表
grep -c 'cat-name' public/en/categories/index.html
# Expected: 3

# 中文分类单页只显示中文文章
grep -c 'article-card' public/cn/categories/ai-dev-experience/index.html
# Expected: 6（6 篇中文文章）

# 英文分类单页只显示英文文章
grep -c 'article-card' public/en/categories/ai-dev-experience/index.html
# Expected: 1（welcome）
```

- [ ] **Step 4: 确认 /categories/ 和 /tags/ 返回 404**

```bash
test -f public/categories/index.html && echo "EXISTS (BAD)" || echo "NOT FOUND (GOOD)"
test -f public/tags/index.html && echo "EXISTS (BAD)" || echo "NOT FOUND (GOOD)"
```

Both should say "NOT FOUND (GOOD)"

- [ ] **Step 5: Pagefind 搜索索引**

```bash
npx pagefind --site public 2>&1
```
Expected: 无报错，索引文件生成在 `public/pagefind/`

- [ ] **Step 6: 最终 commit**

```bash
git add -A
git commit -m "feat: 分类页面语言前缀 URL，移除标签，导航加搜索"
```
