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
