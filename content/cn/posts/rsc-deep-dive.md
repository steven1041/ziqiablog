+++
title = "深入理解 React Server Components"
slug = "rsc-deep-dive"
description = "从原理到实践，探索 RSC 如何重塑前端数据流与组件边界。代码背后，是对简洁与优雅的坚持。"
date = 2024-12-01
[taxonomies]
categories = ["ai-coding-workflows"]
tags = ["react", "rsc", "architecture"]
[extra]
translation_key = "rsc-deep-dive"
featured = true
cover_alt = "React Server Components 示意图"
+++

## 背景

React Server Components（RSC）是 React 的全新架构。

```ts
async function Posts() {
  const posts = await db.query('posts');
  return <ul>{posts.map((p) => <li key={p.id}>{p.title}</li>)}</ul>;
}
```

## 工作原理

RSC 在服务器端渲染、传输到客户端后永不重渲染。

### 序列化格式

使用 React Flight 协议。

## 总结

RSC 把数据流推向服务器。
