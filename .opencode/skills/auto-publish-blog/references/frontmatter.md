# Frontmatter 字段规范

博客使用 YAML frontmatter，位于 MDX 文件的 `---` 分隔符之间。

## 字段定义

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `title` | string | 是 | 文章标题，用引号包裹 |
| `slug` | string | 是 | URL 路径片段，小写字母+数字+连字符 |
| `translationKey` | string | 是 | 历史兼容字段，设为与 slug 相同 |
| `date` | string | 是 | ISO 日期 YYYY-MM-DD |
| `category` | string | 是 | 分类 ID，必须是 references/categories.md 中定义的合法值 |
| `tags` | string[] | 否 | 标签列表 `[tag1, tag2]` |
| `featured` | boolean | 否 | 是否精选，默认 false |
| `excerpt` | string | 否 | 文章摘要，约 50 字 |
| `coverAlt` | string | 否 | 封面图的 alt 文本 |
| `readingTime` | number | 否 | 自动计算，无需手动设置 |

## 示例

```yaml
---
title: "深入理解 React Server Components"
slug: rsc-deep-dive
translationKey: rsc-deep-dive
date: 2024-12-01
category: ai-coding-workflows
tags: [react, rsc, architecture]
featured: false
excerpt: 从原理到实践，探索 RSC 如何重塑前端数据流与组件边界。
coverAlt: React Server Components 示意图
---
```

## Slug 生成规则

1. 如果标题是中文，用拼音（小写，空格→连字符）
2. 如果标题含英文，用英文部分转小写，空格→连字符
3. 去除所有特殊字符（只保留 a-z、0-9、连字符）
4. 避免 slug 以数字开头
5. slug 长度控制在 60 字符以内

## 分类校验规则

`category` 必须是以下 9 个值之一，否则博客构建会报错：
```
prompt-engineering
ai-coding-workflows
tooling
quality
cost-efficiency
real-world
security
team-collab
ai-news
```
