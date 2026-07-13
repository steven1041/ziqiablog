+++
title = "Rust 内存模型浅析"
slug = "rust-memory"
description = "理解所有权、借用与生命周期，写出更安全的系统级代码。"
date = 2024-11-01
template = "post.html"
[taxonomies]
categories = ["ai-dev-experience"]
tags = ["rust", "memory"]
[extra]
translation_key = "rust-memory"
featured = false
+++

## 所有权

每个值在任意时刻有且只有一个所有者。
