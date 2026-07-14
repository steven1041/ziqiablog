+++
title = "ArcoDesignPro 使用笔记"
slug = "arco-design-pro-shi-yong-bi-ji"
description = "ArcoDesignPro 中后台解决方案的安装配置、项目结构和使用心得"
date = 2026-07-14
template = "post.html"

[taxonomies]
categories = ["ai-dev-experience"]

[extra]
translation_key = "arco-design-pro-shi-yong-bi-ji"
featured = false
cover_alt = "ArcoDesignPro 中后台框架示意图"
+++

![ArcoDesignPro 中后台框架示意图](/images/posts/arco-design-pro-shi-yong-bi-ji/cover.png)

ArcoDesignPro 是字节跳动 Arco Design 团队推出的中后台前端解决方案，基于 Vue 3 + TypeScript + Arco Design Vue 组件库，开箱即用地提供了权限管理、国际化、主题定制等企业级功能。

## 环境准备

Node.js 版本要求 20.19.0 及以上，建议使用 nvm 管理版本。

## 安装方式

### 方式一：CLI 脚手架

```bash
npm i -g arco-cli
npm install -g cross-env
cross-env BASE_CONFIG=local arco init hello-arco-pro
```

脚手架会引导你选择模板和配置项，适合快速创建新项目。

### 方式二：RsBuild 模板

```bash
git clone https://github.com/watsonhaw5566/arco-design-pro-vue-template.git
cd arco-design-pro-vue-template
pnpm i
pnpm dev
```

RsBuild 构建速度更快，适合对构建性能有要求的场景。

## 项目结构

```
src/
├── api/            # 接口定义
├── assets/         # 静态资源
├── components/     # 公共组件
├── config/         # 全局配置
├── directives/     # 自定义指令
├── hooks/          # 组合式函数
├── layout/         # 布局组件
├── locales/        # 国际化文件
├── router/         # 路由配置
├── store/          # 状态管理
├── utils/          # 工具函数
└── views/          # 页面组件
```

## 核心功能

- **权限管理**：基于角色的路由权限控制，支持页面级和按钮级权限
- **国际化**：内置 i18n 支持，切换语言无需刷新
- **主题定制**：支持动态切换主题色，CSS 变量驱动
- **Mock 数据**：开发环境内置 Mock，接口联调无缝切换

## 使用心得

ArcoDesignPro 的组件文档完善，TypeScript 类型定义齐全，开发体验良好。权限系统基于 `v-permission` 指令实现，使用简洁。建议新项目优先选择 RsBuild 版本，构建速度有明显提升。
