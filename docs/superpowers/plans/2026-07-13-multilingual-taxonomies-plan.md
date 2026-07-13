# 多语言分类与标签实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现中英文独立的 categories/tags 页面，使用语言前缀 URL，分类列表预定义不可新增

**Architecture:** 在 `config.toml` 中定义 `[extra].categories` 预定义分类列表 + `[languages.en]` 英文 taxonomy；模板层分类展示改为遍历 config 而非 get_taxonomy，确保只展示允许的分类

**Tech Stack:** Zola, Tera 模板

## Global Constraints

- 所有改动仅涉及 `config.toml`、`templates/`、`content/` 文件
- 分类展示必须从 `config.extra.categories` 读取，不从 `get_taxonomy` 遍历
- URL 统一使用 `/{page_lang}/categories/{slug}/` 格式（`get_url` 生成）
- 标签不做预定义限制，保持 Zola 自动生成
- 中英文分类各自独立，不做映射关联
- `zola build` 必须无报错

---

### Task 1: config.toml — 新增预定义分类列表 + 英文 taxonomy

**Files:**
- Modify: `config.toml`

**Interfaces:**
- Produces: `config.extra.categories` 数组（每项含 slug/cn/en），`config.languages.en.taxonomies` 被 Zola 用于生成英文 taxonomy 页面

- [ ] **Step 1: 在 `[markdown.highlighting]` 之后、`[translations]` 之前插入 `[extra]` 分类列表**

```
[markdown.highlighting]
light_theme = "github-light"
dark_theme = "ayu-dark"

[extra]
categories = [
  { slug = "ai-dev-experience", cn = "AI开发经验", en = "AI Dev Experience" },
  { slug = "ai-news", cn = "AI新闻", en = "AI News" },
  { slug = "ai-opinions", cn = "AI观点", en = "AI Opinions" },
]

[translations]
```

- [ ] **Step 2: 在 `[languages.en]` 下 `description` 之后插入 `taxonomies` 数组**

在 `config.toml` 第 47 行 `description = "Articles about..."` 之后插入：
```toml
taxonomies = [
  { name = "categories", feed = false },
  { name = "tags", feed = false },
]
```
插入后效果：
```toml
[languages.en]
title = "ZiQia.cc — AI Development Blog"
description = "Articles about prompt engineering, AI coding workflows, tooling ecosystem"
taxonomies = [
  { name = "categories", feed = false },
  { name = "tags", feed = false },
]

[languages.en.translations]
```

- [ ] **Step 3: 验证构建**

Run: `zola build`

Expected: 构建成功无报错

- [ ] **Step 4: 提交**

```bash
git add config.toml
git commit -m "config: 新增预定义分类列表与英文 taxonomy"
```

---

### Task 2: templates/base.html — 导航链接改为语言前缀

**Files:**
- Modify: `templates/base.html`

**Interfaces:**
- Consumes: `page_lang`（已在 base.html 顶部从路由推导）
- Produces: 导航链接指向 `/{page_lang}/categories/` 和 `/{page_lang}/tags/`

- [ ] **Step 1: 修改分类导航链接**

将第 35 行：
```twig
<a href="/categories/" {% if cur is containing('/categories/') %}class="active"{% endif %}>{{ trans(key="categories", lang=page_lang) }}</a>
```
改为：
```twig
<a href="{{ get_url(path='/' ~ page_lang ~ '/categories/') }}" {% if cur is containing('/categories/') %}class="active"{% endif %}>{{ trans(key="categories", lang=page_lang) }}</a>
```

- [ ] **Step 2: 修改标签导航链接**

将第 36 行：
```twig
<a href="/tags/" {% if cur is containing('/tags/') %}class="active"{% endif %}>{{ trans(key="tags", lang=page_lang) }}</a>
```
改为：
```twig
<a href="{{ get_url(path='/' ~ page_lang ~ '/tags/') }}" {% if cur is containing('/tags/') %}class="active"{% endif %}>{{ trans(key="tags", lang=page_lang) }}</a>
```

- [ ] **Step 3: 验证构建**

Run: `zola build`

Expected: 构建成功，检查 `public/cn/categories/index.html` 和 `public/en/categories/index.html` 均存在

- [ ] **Step 4: 提交**

```bash
git add templates/base.html
git commit -m "templates: 导航链接改为语言前缀 URL"
```

---

### Task 3: templates/section.html — 首页分类展示区改为预定义列表

**Files:**
- Modify: `templates/section.html`

**Interfaces:**
- Consumes: `page_lang`、`config.extra.categories`
- Produces: 首页分类区根据语言显示对应分类名，链接指向 `/{page_lang}/categories/{slug}/`

- [ ] **Step 1: 替换分类展示区代码**

将第 74-89 行（从 `{% set categories = get_taxonomy...` 到 `{% endif %}`）替换为：

```twig
  {% if config.extra.categories %}
  <div class="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9">
    {% for d in config.extra.categories %}
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

- [ ] **Step 2: 验证构建**

Run: `zola build`

Expected: 构建成功

- [ ] **Step 3: 提交**

```bash
git add templates/section.html
git commit -m "templates: 首页分类展示改为预定义列表，支持多语言"
```

---

### Task 4: templates/categories/list.html — 分类列表页改为预定义列表

**Files:**
- Modify: `templates/categories/list.html`

**Interfaces:**
- Consumes: `page_lang`、`config.extra.categories`
- Produces: 分类列表页只展示预定义分类，含文章计数

- [ ] **Step 1: 重写分类列表模板**

将整个文件内容替换为：

```twig
{% extends "base.html" %}

{% block title %}{{ trans(key="categories", lang=page_lang) }} — {{ site_title }}{% endblock title %}

{% block content %}
<h1 class="page-heading">{{ trans(key="categories", lang=page_lang) }}</h1>

{% set all_cats = get_taxonomy(kind="categories", lang=page_lang) %}
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
  <a href="{{ get_url(path='/' ~ page_lang ~ '/categories/' ~ d.slug ~ '/') }}">
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

- [ ] **Step 2: 验证构建**

Run: `zola build`

Expected: 构建成功

- [ ] **Step 3: 提交**

```bash
git add templates/categories/list.html
git commit -m "templates: 分类列表页改为预定义列表，支持多语言显示名与文章计数"
```

---

### Task 5: 文章 frontmatter — 替换分类 slug

**Files:**
- Modify: `content/cn/posts/ai-coding-cli-tools-comparison.md`
- Modify: `content/cn/posts/du-wan-wen-dang-bu-hui-yong.md`
- Modify: `content/cn/posts/rsc-deep-dive.md`
- Modify: `content/cn/posts/rust-memory.md`
- Modify: `content/cn/posts/why-tech-docs-fail.md`
- Modify: `content/cn/posts/message-queue.md`
- Modify: `content/cn/posts/game-dev.md`
- Modify: `content/en/posts/welcome.md`

**Interfaces:**
- Consumes: 旧分类名 `tooling` / `ai-coding-workflows` / `real-world`
- Produces: 新分类名 `ai-dev-experience` / `ai-opinions`

- [ ] **Step 1: 替换 `ai-coding-cli-tools-comparison.md`**

`categories = ["tooling"]` → `categories = ["ai-dev-experience"]`

```bash
sed -i 's/categories = \["tooling"\]/categories = ["ai-dev-experience"]/' content/cn/posts/ai-coding-cli-tools-comparison.md
```

- [ ] **Step 2: 替换 `du-wan-wen-dang-bu-hui-yong.md`**

`categories = ["ai-coding-workflows"]` → `categories = ["ai-dev-experience"]`

```bash
sed -i 's/categories = \["ai-coding-workflows"\]/categories = ["ai-dev-experience"]/' content/cn/posts/du-wan-wen-dang-bu-hui-yong.md
```

- [ ] **Step 3: 替换 `rsc-deep-dive.md`**

`categories = ["ai-coding-workflows"]` → `categories = ["ai-dev-experience"]`

```bash
sed -i 's/categories = \["ai-coding-workflows"\]/categories = ["ai-dev-experience"]/' content/cn/posts/rsc-deep-dive.md
```

- [ ] **Step 4: 替换 `rust-memory.md`**

`categories = ["tooling"]` → `categories = ["ai-dev-experience"]`

```bash
sed -i 's/categories = \["tooling"\]/categories = ["ai-dev-experience"]/' content/cn/posts/rust-memory.md
```

- [ ] **Step 5: 替换 `why-tech-docs-fail.md`**

`categories = ["tooling"]` → `categories = ["ai-opinions"]`

```bash
sed -i 's/categories = \["tooling"\]/categories = ["ai-opinions"]/' content/cn/posts/why-tech-docs-fail.md
```

- [ ] **Step 6: 替换 `message-queue.md`**

`categories = ["real-world"]` → `categories = ["ai-dev-experience"]`

```bash
sed -i 's/categories = \["real-world"\]/categories = ["ai-dev-experience"]/' content/cn/posts/message-queue.md
```

- [ ] **Step 7: 替换 `game-dev.md`**

`categories = ["real-world"]` → `categories = ["ai-dev-experience"]`

```bash
sed -i 's/categories = \["real-world"\]/categories = ["ai-dev-experience"]/' content/cn/posts/game-dev.md
```

- [ ] **Step 8: 替换 `en/posts/welcome.md`**

`categories = ["ai-coding-workflows"]` → `categories = ["ai-dev-experience"]`

```bash
sed -i 's/categories = \["ai-coding-workflows"\]/categories = ["ai-dev-experience"]/' content/en/posts/welcome.md
```

- [ ] **Step 9: 验证构建**

Run: `zola build`

Expected: 构建成功，无分类引用错误

- [ ] **Step 10: 提交**

```bash
git add content/cn/posts/ai-coding-cli-tools-comparison.md content/cn/posts/du-wan-wen-dang-bu-hui-yong.md content/cn/posts/rsc-deep-dive.md content/cn/posts/rust-memory.md content/cn/posts/why-tech-docs-fail.md content/cn/posts/message-queue.md content/cn/posts/game-dev.md content/en/posts/welcome.md
git commit -m "content: 文章分类迁移至预定义分类（ai-dev-experience / ai-opinions）"
```

---

### 验证

全部 Task 完成后运行：

```bash
zola build
```

确认以下输出存在：
- `public/cn/categories/index.html` — 中文分类列表页
- `public/cn/categories/ai-dev-experience/index.html` — 中文章列表
- `public/cn/categories/ai-news/index.html` — 中文章列表（空）
- `public/cn/categories/ai-opinions/index.html` — 中文章列表
- `public/en/categories/index.html` — 英文分类列表页
- `public/en/categories/ai-dev-experience/index.html` — 英文章列表
- `public/en/categories/ai-news/index.html` — 英文章列表（空）
- `public/en/categories/ai-opinions/index.html` — 英文章列表（空）
