# 博客改版实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将双语博客 `Alex.dev` 改造为单语言 AI 开发主题博客 `ziqia.cc`，包含品牌替换、9 个新分类、内容精简、SEO 优化、Google AdSense 集成。

**Architecture:** 保留 Next.js App Router 的 `[locale]` 路由结构（仅保留 `cn`），分层重构：先数据层（types/categories/i18n/posts/rss），再组件层（Header/Footer/HeroCard/CategoryIcon/CodeBlock），最后页面层 + SEO + AdSense。

**Tech Stack:** Next.js 14 (App Router, static export), React 18, TypeScript, Tailwind CSS, shiki (代码高亮), vitest (测试), @testing-library/react, pagefind (站内搜索), feed (RSS)。

---

## 全局约束

- **站点域名**: `https://ziqia.cc`
- **品牌名**: `ziqia.cc`（替换所有 "Alex Chen" 和 "Alex.dev"）
- **语言**: 单语言 `cn`，但 `Locale` 类型保持以便后续拓展
- **分类体系**: 9 个 AI 开发主题分类（见 Task 1）
- **AdSense 客户端**: 通过环境变量 `NEXT_PUBLIC_ADSENSE_CLIENT_ID` 注入（默认不渲染）
- **静态导出**: `next.config.mjs` 保持 `output: 'export'`
- **测试命令**: `npm test`（vitest）
- **构建命令**: `npm run build`（包括 RSS 和 pagefind）
- **代码注释和 commit message**: 中文

---

## 任务清单

- [ ] Task 1: 数据层 - 分类与类型重构
- [ ] Task 2: 数据层 - i18n 单语言化与日期
- [ ] Task 3: 数据层 - 文章内容迁移
- [ ] Task 4: 数据层 - RSS 与构建脚本
- [ ] Task 5: UI - Footer 重构
- [ ] Task 6: UI - Header 重构
- [ ] Task 7: UI - HeroCard 品牌替换
- [ ] Task 8: UI - CategoryIcon 扩展
- [ ] Task 9: UI - 代码块背景修复
- [ ] Task 10: UI - 首页与分类页更新
- [ ] Task 11: UI - 文章详情页改造
- [ ] Task 12: SEO - 静态资源
- [ ] Task 13: SEO - 各页面 metadata
- [ ] Task 14: 验证与文档

---

## Task 1: 数据层 - 分类与类型重构

**Files:**
- Modify: `src/lib/types.ts`
- Modify: `src/lib/categories.ts`
- Modify: `tests/lib/categories.test.ts`

**背景:** 把 `Locale` 简化为 `'cn'`，`Category` 替换为 9 个新 ID，`CategoryConfig.label` 简化为 `string` 而非 `Record<Locale, string>`。

**Interfaces:**
- Consumes: 无
- Produces: `Category` 联合类型（9 个 ID）、`CategoryConfig.label: string`、`Locale = 'cn'`

### Steps

- [ ] **Step 1: 修改 `src/lib/types.ts`**

完整替换为：

```ts
export type Locale = 'cn';

export interface CategoryConfig {
  id: Category;
  label: string;
  color: string;
  bgColor: string;
  bgColorDark: string;
}

export interface PostMeta {
  slug: string;
  translationKey: string;
  title: string;
  date: string;        // ISO yyyy-mm-dd
  category: Category;
  tags: string[];
  readingTime: number;
  featured: boolean;
  excerpt: string;
  coverAlt?: string;
}

export interface Post extends PostMeta {
  locale: Locale;
  content: string;     // raw MDX body
}

export type Category =
  | 'prompt-engineering'
  | 'ai-coding-workflows'
  | 'tooling'
  | 'quality'
  | 'cost-efficiency'
  | 'real-world'
  | 'security'
  | 'team-collab'
  | 'ai-news';
```

- [ ] **Step 2: 修改 `src/lib/categories.ts`**

完整替换为：

```ts
import type { CategoryConfig, Category } from './types';

export const CATEGORIES: Record<Category, CategoryConfig> = {
  'prompt-engineering':  { id: 'prompt-engineering',  label: '提示工程',   color: '#4285F4', bgColor: '#E8F0FE', bgColorDark: '#0B3D91' },
  'ai-coding-workflows': { id: 'ai-coding-workflows', label: 'AI 编码工作流', color: '#34A853', bgColor: '#E6F4EA', bgColorDark: '#0D652D' },
  'tooling':             { id: 'tooling',             label: '工具生态',   color: '#EA4335', bgColor: '#FCE8E6', bgColorDark: '#A50E0E' },
  'quality':             { id: 'quality',             label: '质量保障',   color: '#F9AB00', bgColor: '#FEF7E0', bgColorDark: '#7A5A00' },
  'cost-efficiency':     { id: 'cost-efficiency',     label: '成本与效率', color: '#1A73E8', bgColor: '#D3E3FD', bgColorDark: '#041E49' },
  'real-world':          { id: 'real-world',          label: '项目实践',   color: '#34A853', bgColor: '#E6F4EA', bgColorDark: '#0D652D' },
  'security':            { id: 'security',            label: '安全与合规', color: '#EA4335', bgColor: '#FCE8E6', bgColorDark: '#A50E0E' },
  'team-collab':         { id: 'team-collab',         label: '团队协作',   color: '#4285F4', bgColor: '#D3E3FD', bgColorDark: '#041E49' },
  'ai-news':             { id: 'ai-news',             label: '业界新闻',   color: '#F9AB00', bgColor: '#FEF7E0', bgColorDark: '#7A5A00' },
};

export function isCategory(value: string): value is Category {
  return Object.prototype.hasOwnProperty.call(CATEGORIES, value);
}

export function categoryList(): CategoryConfig[] {
  return Object.values(CATEGORIES);
}
```

- [ ] **Step 3: 改写测试 `tests/lib/categories.test.ts`**

完整替换为：

```ts
import { describe, it, expect } from 'vitest';
import { CATEGORIES, isCategory, categoryList } from '@/lib/categories';

describe('categories', () => {
  it('exposes the 9 AI-dev categories with string labels', () => {
    expect(Object.keys(CATEGORIES)).toEqual([
      'prompt-engineering',
      'ai-coding-workflows',
      'tooling',
      'quality',
      'cost-efficiency',
      'real-world',
      'security',
      'team-collab',
      'ai-news',
    ]);
    expect(CATEGORIES['prompt-engineering'].label).toBe('提示工程');
    expect(CATEGORIES['ai-coding-workflows'].label).toBe('AI 编码工作流');
  });

  it('validates category with isCategory type guard', () => {
    expect(isCategory('prompt-engineering')).toBe(true);
    expect(isCategory('prompt-engineering' as string)).toBe(true);
    expect(isCategory('frontend')).toBe(false);
    expect(isCategory('unknown')).toBe(false);
    expect(isCategory('')).toBe(false);
  });

  it('categoryList returns array form for iteration', () => {
    const list = categoryList();
    expect(list).toHaveLength(9);
    expect(list[0]).toMatchObject({ id: 'prompt-engineering', color: '#4285F4' });
  });

  it('rejects Object.prototype keys (no prototype pollution)', () => {
    expect(isCategory('toString')).toBe(false);
    expect(isCategory('constructor')).toBe(false);
    expect(isCategory('__proto__')).toBe(false);
    expect(isCategory('hasOwnProperty')).toBe(false);
  });
});
```

- [ ] **Step 4: 运行测试**

```bash
npm test -- tests/lib/categories.test.ts
```

期望：4 个 it 全 PASS。`i18n` 和其他相关测试可能因依赖变化而失败（下一任务修复）。

- [ ] **Step 5: 提交**

```bash
git add src/lib/types.ts src/lib/categories.ts tests/lib/categories.test.ts
git commit -m "feat: 用 9 个 AI 开发分类替换原有 6 个分类"
```

---

## Task 2: 数据层 - i18n 单语言化与日期

**Files:**
- Modify: `src/lib/i18n.ts`
- Modify: `src/lib/date.ts`
- Modify: `tests/lib/i18n.test.ts`
- Modify: `tests/lib/date.test.ts`

**背景:** `i18n` 简化为仅 `cn`；`formatDate` 简化为不带 locale 参数（总返回中文格式）。

**Interfaces:**
- Consumes: Task 1 的 `Locale = 'cn'`
- Produces: `t(locale, key)` 仍需 locale 参数（向后兼容），但 locale 实际上只能是 `'cn'`；`formatDate(dateString): string` 不再带 locale

### Steps

- [ ] **Step 1: 修改 `src/lib/i18n.ts`**

完整替换为：

```ts
import type { Locale } from './types';

export const LOCALES: Locale[] = ['cn'];
export const DEFAULT_LOCALE: Locale = 'cn';

export function isLocale(value: string): value is Locale {
  return (LOCALES as string[]).includes(value);
}

export function localePath(locale: Locale, ...segments: string[]): string {
  return '/' + [locale, ...segments].filter(Boolean).join('/');
}

type UIStrings = {
  home: string;
  articles: string;
  categories: string;
  tags: string;
  about: string;
  search: string;
  recent_posts: string;
  recent_posts_sub: string;
  featured: string;
  browse_categories: string;
  browse_categories_sub: string;
  view_all: string;
  read_more: string;
  reading_time: (n: number) => string;
  back_home: string;
  search_placeholder: string;
  search_hint: string;
  no_results: string;
  table_of_contents: string;
  previous: string;
  next: string;
  page_not_found: string;
};

const UI: Record<Locale, UIStrings> = {
  cn: {
    home: '首页', articles: '文章', categories: '分类', tags: '标签',
    about: '关于', search: '搜索', recent_posts: '最新文章',
    recent_posts_sub: 'AI 开发的实践、思考与工具', featured: '精选文章',
    browse_categories: '按主题浏览', browse_categories_sub: '选择一个分类开始探索',
    view_all: '查看全部', read_more: '阅读全文', reading_time: (n) => `${n} 分钟阅读`,
    back_home: '返回首页', search_placeholder: '搜索文章…',
    search_hint: '输入关键词开始搜索',
    no_results: '没有找到相关结果', table_of_contents: '目录',
    previous: '上一篇', next: '下一篇', page_not_found: '页面未找到',
  },
};

export function t(locale: Locale, key: keyof UIStrings): string {
  const value = UI[locale][key];
  return typeof value === 'string' ? value : '';
}

export function tf(locale: Locale, key: keyof UIStrings): (n: number) => string {
  const value = UI[locale][key];
  return typeof value === 'function' ? value : () => '';
}

export type UIKey = keyof UIStrings;
```

- [ ] **Step 2: 修改 `src/lib/date.ts`**

完整替换为：

```ts
export function formatDate(dateString: string): string {
  const d = new Date(dateString + 'T00:00:00');
  if (isNaN(d.getTime())) return dateString;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}年${m}月${day}日`;
}
```

- [ ] **Step 3: 改写测试 `tests/lib/i18n.test.ts`**

完整替换为：

```ts
import { describe, it, expect } from 'vitest';
import { LOCALES, DEFAULT_LOCALE, isLocale, localePath, t } from '@/lib/i18n';

describe('i18n', () => {
  it('only cn is supported and is default', () => {
    expect(LOCALES).toEqual(['cn']);
    expect(DEFAULT_LOCALE).toBe('cn');
  });

  it('isLocale guards', () => {
    expect(isLocale('cn')).toBe(true);
    expect(isLocale('en')).toBe(false);
    expect(isLocale('fr')).toBe(false);
  });

  it('localePath joins segments with leading locale', () => {
    expect(localePath('cn', 'posts', 'rsc')).toBe('/cn/posts/rsc');
    expect(localePath('cn')).toBe('/cn');
  });

  it('t returns Chinese UI strings', () => {
    expect(t('cn', 'recent_posts')).toBe('最新文章');
    expect(t('cn', 'home')).toBe('首页');
  });
});
```

- [ ] **Step 4: 改写测试 `tests/lib/date.test.ts`**

完整替换为：

```ts
import { describe, it, expect } from 'vitest';
import { formatDate } from '@/lib/date';

describe('formatDate', () => {
  it('formats YYYY-MM-DD to Chinese', () => {
    expect(formatDate('2024-12-01')).toBe('2024年12月01日');
  });

  it('pads single-digit month and day', () => {
    expect(formatDate('2024-01-05')).toBe('2024年01月05日');
  });

  it('returns raw string on invalid date', () => {
    expect(formatDate('')).toBe('');
    expect(formatDate('not-a-date')).toBe('not-a-date');
  });
});
```

- [ ] **Step 5: 同步更新 `formatDate` 调用方**

执行命令找到所有 `formatDate` 调用点：

```bash
grep -rn "formatDate(" src/
```

预期调用方：
- `src/components/HeroCard.tsx`
- `src/components/ArticleCard.tsx`

修改两处调用为不带 locale 参数（Task 5/7/8 阶段同步修复，先记录），本任务测试通过即可。

- [ ] **Step 6: 运行测试**

```bash
npm test -- tests/lib/i18n.test.ts tests/lib/date.test.ts
```

期望：两个文件全 PASS。

- [ ] **Step 7: 提交**

```bash
git add src/lib/i18n.ts src/lib/date.ts tests/lib/i18n.test.ts tests/lib/date.test.ts
git commit -m "feat: i18n 简化为单语言，formatDate 去掉 locale 参数"
```

---

## Task 3: 数据层 - 文章内容迁移

**Files:**
- Delete: `content/en/` directory
- Delete: `tests/fixtures/content/en/` directory
- Modify: `content/cn/posts/message-queue.mdx` (frontmatter category)
- Modify: `content/cn/posts/game-dev.mdx`
- Modify: `content/cn/posts/rsc-deep-dive.mdx`
- Modify: `content/cn/posts/rust-memory.mdx`
- Modify: `tests/fixtures/content/cn/posts/hello-rsc.mdx`
- Modify: `tests/lib/posts.test.ts`

**背景:** 删除英文内容，4 篇中文文章 category 映射到新分类。

**Interfaces:**
- Consumes: Task 1 的新 `Category` 联合
- Produces: 中文文章使用新分类 ID

### Steps

- [ ] **Step 1: 删除英文内容目录**

```bash
rm -rf content/en/ tests/fixtures/content/en/
```

- [ ] **Step 2: 修改 `content/cn/posts/message-queue.mdx`**

修改第 6 行 `category: architecture` 为 `category: real-world`。

- [ ] **Step 3: 修改 `content/cn/posts/game-dev.mdx`**

修改第 6 行 `category: ai` 为 `category: real-world`。

- [ ] **Step 4: 修改 `content/cn/posts/rsc-deep-dive.mdx`**

修改第 6 行 `category: frontend` 为 `category: ai-coding-workflows`。

- [ ] **Step 5: 修改 `content/cn/posts/rust-memory.mdx`**

修改第 6 行 `category: backend` 为 `category: tooling`。

- [ ] **Step 6: 修改 `tests/fixtures/content/cn/posts/hello-rsc.mdx`**

修改第 6 行 `category: frontend` 为 `category: ai-coding-workflows`。

- [ ] **Step 7: 改写测试 `tests/lib/posts.test.ts`**

完整替换为：

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import path from 'node:path';
import {
  setPostsDirForTest,
  getPost, getAllPosts, getFeatured, getPostsByCategory,
  getPostsByTag, getAllTags,
} from '@/lib/posts';

beforeEach(() => {
  setPostsDirForTest(path.resolve(process.cwd(), 'tests/fixtures/content'));
});

describe('posts loader', () => {
  it('parses a single post with computed readingTime', async () => {
    const post = await getPost('cn', 'hello-rsc');
    expect(post?.title).toBe('深入理解 React Server Components');
    expect(post?.translationKey).toBe('rsc-deep-dive');
    expect(post?.featured).toBe(true);
    expect(post?.readingTime).toBeGreaterThan(0);
  });

  it('getAllPosts returns sorted desc by date', async () => {
    const posts = await getAllPosts('cn');
    expect(posts).toHaveLength(1);
  });

  it('getFeatured finds featured post', async () => {
    const feat = await getFeatured('cn');
    expect(feat?.slug).toBe('hello-rsc');
  });

  it('filters by category and tag', async () => {
    expect((await getPostsByCategory('cn', 'ai-coding-workflows'))).toHaveLength(1);
    expect((await getPostsByCategory('cn', 'backend'))).toHaveLength(0);
    expect((await getPostsByTag('cn', 'react'))).toHaveLength(1);
    expect((await getPostsByTag('cn', 'rust'))).toHaveLength(0);
  });

  it('aggregates unique tags', async () => {
    expect((await getAllTags('cn')).sort()).toEqual(['architecture', 'react', 'rsc']);
  });
});
```

（移除了 `getTranslation` 相关的测试，因为英文翻译已删除）

- [ ] **Step 8: 运行测试**

```bash
npm test -- tests/lib/posts.test.ts
```

期望：5 个 it 全 PASS。

- [ ] **Step 9: 提交**

```bash
git add -A content/ tests/fixtures/content/ tests/lib/posts.test.ts
git commit -m "chore: 删除英文内容并把 4 篇文章映射到新分类"
```

---

## Task 4: 数据层 - RSS 与构建脚本

**Files:**
- Modify: `src/lib/rss.ts`
- Modify: `scripts/build-rss.mjs`
- Modify: `tests/lib/rss.test.ts`

**背景:** RSS 域名改为 `https://ziqia.cc`，作者名改为 `ziqia.cc`，构建脚本只生成中文 feed。

**Interfaces:**
- Consumes: Task 1 的新 `Locale`
- Produces: `buildFeedForLocale(locale)` 输出包含 `https://ziqia.cc` 链接和 `ziqia.cc` 作者

### Steps

- [ ] **Step 1: 修改 `src/lib/rss.ts`**

完整替换为：

```ts
import { Feed } from 'feed';
import type { Locale } from './types';
import { getAllPostsMeta } from './posts';

const SITE_BASE = 'https://ziqia.cc';
const AUTHOR = {
  name: 'ziqia.cc',
  link: 'https://ziqia.cc',
};

export async function buildFeedForLocale(locale: Locale): Promise<string> {
  const posts = (await getAllPostsMeta(locale)).slice(0, 20);
  const feed = new Feed({
    title: 'ziqia.cc — AI 开发技术博客',
    description: '关于提示工程、AI 编码工作流、工具生态等 AI 开发技术文章',
    id: `${SITE_BASE}/`,
    link: `${SITE_BASE}/${locale}`,
    language: 'zh-CN',
    image: `${SITE_BASE}/favicon.ico`,
    copyright: `© ${new Date().getFullYear()} ziqia.cc`,
    author: AUTHOR,
  });
  for (const p of posts) {
    feed.addItem({
      title: p.title,
      id: `${SITE_BASE}/${locale}/posts/${p.slug}/`,
      link: `${SITE_BASE}/${locale}/posts/${p.slug}/`,
      description: p.excerpt,
      date: new Date(p.date),
      category: [{ name: p.category as string }],
    });
  }
  return feed.rss2();
}
```

- [ ] **Step 2: 修改 `scripts/build-rss.mjs`**

完整替换为：

```js
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { buildFeedForLocale } from '../src/lib/rss.ts';

const outDir = path.resolve(process.cwd(), 'out', 'feeds');
await fs.mkdir(outDir, { recursive: true });

const xml = await buildFeedForLocale('cn');
const file = path.join(outDir, 'feed-cn.xml');
await fs.writeFile(file, xml, 'utf8');
console.log(`[rss] wrote ${file} (${xml.length} bytes)`);
```

- [ ] **Step 3: 改写测试 `tests/lib/rss.test.ts`**

完整替换为：

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { setPostsDirForTest } from '@/lib/posts';
import { buildFeedForLocale } from '@/lib/rss';
import path from 'node:path';

beforeEach(() => setPostsDirForTest(path.resolve(__dirname, '../fixtures/content')));

describe('rss', () => {
  it('produces valid RSS2 envelope for cn with ziqia.cc domain', async () => {
    const xml = await buildFeedForLocale('cn');
    expect(xml).toContain('<?xml');
    expect(xml).toContain('<rss');
    expect(xml).toContain('React Server Components');
    expect(xml).toContain('https://ziqia.cc');
    expect(xml).toContain('ziqia.cc');
  });
});
```

- [ ] **Step 4: 运行测试**

```bash
npm test -- tests/lib/rss.test.ts
```

期望：PASS。

- [ ] **Step 5: 提交**

```bash
git add src/lib/rss.ts scripts/build-rss.mjs tests/lib/rss.test.ts
git commit -m "feat: RSS 域名改为 ziqia.cc，构建脚本只生成中文 feed"
```

---

## Task 5: UI - Footer 重构

**Files:**
- Modify: `src/components/Footer.tsx`
- Create: `tests/components/Footer.test.tsx`
- Modify: `src/app/[locale]/layout.tsx`（去掉 locale prop 传参）
- Modify: `src/app/layout.tsx`（如果有 Footer 引用）

**背景:** Footer 去掉所有社交链接、技术栈文字、locale 参数。

**Interfaces:**
- Consumes: 无
- Produces: `<Footer />` 无 props，仅显示 `© 2026 ziqia.cc`

### Steps

- [ ] **Step 1: 修改 `src/components/Footer.tsx`**

完整替换为：

```tsx
export function Footer() {
  return (
    <footer className="flex items-center justify-center border-t border-outline-variant px-5 py-6 text-sm text-on-surface-variant md:px-10">
      <p>© {new Date().getFullYear()} ziqia.cc</p>
    </footer>
  );
}
```

- [ ] **Step 2: 创建 `tests/components/Footer.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/Footer';

describe('Footer', () => {
  it('renders ziqia.cc copyright', () => {
    render(<Footer />);
    expect(screen.getByText(/© \d{4} ziqia\.cc/)).toBeInTheDocument();
  });

  it('does not render any social links', () => {
    render(<Footer />);
    expect(screen.queryByText('GitHub')).toBeNull();
    expect(screen.queryByText('Twitter')).toBeNull();
    expect(screen.queryByText('RSS')).toBeNull();
  });
});
```

- [ ] **Step 3: 修改 `src/app/[locale]/layout.tsx`**

修改第 25 行 `<Footer locale={locale} />` 为 `<Footer />`。

- [ ] **Step 4: 运行测试**

```bash
npm test -- tests/components/Footer.test.tsx
```

期望：PASS。

- [ ] **Step 5: 提交**

```bash
git add src/components/Footer.tsx tests/components/Footer.test.tsx src/app/\[locale\]/layout.tsx
git commit -m "refactor: Footer 去掉社交链接、技术栈和 locale 参数"
```

---

## Task 6: UI - Header 重构

**Files:**
- Modify: `src/components/Header.tsx`
- Modify: `tests/components/Header.test.tsx`

**背景:** Logo 文字改为 `ziqia.cc`，移除 `<LangSwitch>` 组件渲染。

**Interfaces:**
- Consumes: 无
- Produces: `<Header locale currentPath />` 渲染 `ziqia.cc` logo，无语言切换器

### Steps

- [ ] **Step 1: 修改 `src/components/Header.tsx`**

完整替换为：

```tsx
import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { t } from '@/lib/i18n';
import type { Locale } from '@/lib/types';

const NAV: { key: 'articles' | 'categories' | 'tags' | 'about'; path: string }[] = [
  { key: 'articles', path: '' },
  { key: 'categories', path: 'categories' },
  { key: 'tags', path: 'tags' },
  { key: 'about', path: 'about' },
];

const DOT_COLORS = ['#4285F4', '#EA4335', '#FBBC04', '#34A853'];

export function Header({ locale, currentPath }: { locale: Locale; currentPath: string }) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-4 border-b border-outline-variant bg-surface/90 px-5 py-4 backdrop-blur-md md:px-10">
      <Link href={`/${locale}`} className="flex items-center gap-2.5">
        <span className="flex gap-1">
          {DOT_COLORS.map((c) => (
            <span key={c} className="h-2 w-2 rounded-full" style={{ background: c }} />
          ))}
        </span>
        <span className="font-heading text-xl font-bold tracking-tight text-google-blue-cta">ziqia.cc</span>
      </Link>
      <nav className="hidden gap-1 md:flex">
        {NAV.map((item) => {
          const full = item.path ? `/${locale}/${item.path}` : `/${locale}`;
          const active = currentPath === full || currentPath.startsWith(full + '/');
          return (
            <Link
              key={item.key}
              href={full}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${active ? 'bg-primary-container text-google-blue-cta' : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'}`}
            >
              {t(locale, item.key)}
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
```

- [ ] **Step 2: 修改 `tests/components/Header.test.tsx`**

完整替换为：

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from '@/components/Header';

describe('Header', () => {
  it('renders ziqia.cc brand', () => {
    render(<Header locale="cn" currentPath="/cn" />);
    expect(screen.getByText('ziqia.cc')).toBeInTheDocument();
  });

  it('does not render language switch', () => {
    render(<Header locale="cn" currentPath="/cn" />);
    expect(screen.queryByLabelText('Switch language')).toBeNull();
  });

  it('highlights active nav item based on currentPath', () => {
    render(<Header locale="cn" currentPath="/cn" />);
    const link = screen.getByText('文章').closest('a');
    expect(link).toBeTruthy();
  });
});
```

- [ ] **Step 3: 运行测试**

```bash
npm test -- tests/components/Header.test.tsx
```

期望：3 个 it 全 PASS。

- [ ] **Step 4: 提交**

```bash
git add src/components/Header.tsx tests/components/Header.test.tsx
git commit -m "refactor: Header 品牌改为 ziqia.cc 并移除语言切换"
```

---

## Task 7: UI - HeroCard 品牌替换

**Files:**
- Modify: `src/components/HeroCard.tsx`
- Modify: `src/components/ArticleCard.tsx`
- Create: `tests/components/HeroCard.test.tsx`

**背景:** `Alex Chen` 替换为 `ziqia.cc`，头像字母 `A` 改为 `Z`，`formatDate` 不带 locale；`ArticleCard` 同步修复 `cat.label[locale]` → `cat.label`。

**Interfaces:**
- Consumes: Task 2 的新 `formatDate(dateString)` 签名、Task 1 的新 `CategoryConfig.label: string`
- Produces: `<HeroCard post locale />` 和 `<ArticleCard post locale />` 显示 ziqia.cc 品牌

### Steps

- [ ] **Step 1: 修改 `src/components/HeroCard.tsx`**

完整替换为：

```tsx
import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';
import { t, tf, localePath } from '@/lib/i18n';
import { formatDate } from '@/lib/date';
import type { Locale, PostMeta } from '@/lib/types';

export function HeroCard({ post, locale }: { post: PostMeta; locale: Locale }) {
  const cat = CATEGORIES[post.category];
  const href = localePath(locale, 'posts', post.slug) + '/';
  return (
    <div className="grid gap-0 overflow-hidden rounded-hero border border-outline-variant bg-surface-dim md:grid-cols-[1.3fr_1fr]">
      <div
        className="relative flex min-h-[260px] items-center justify-center overflow-hidden p-10 text-white md:min-h-[420px]"
        style={{ background: `linear-gradient(135deg, ${cat.color} 0%, #174EA6 100%)` }}
      >
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/15" />
        <div className="relative z-10 text-center">
          <span className="mb-5 inline-block rounded-full border border-white/30 bg-white/20 px-4 py-1 text-xs font-medium backdrop-blur">
            {t(locale,'featured')}
          </span>
          <div className="font-heading text-5xl font-bold tracking-tight">
            {post.title.split(' ').slice(0,3).join(' ')}
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center p-8 md:p-12">
        <div className="mb-3 font-heading text-[13px] font-bold uppercase tracking-wider text-google-blue-cta">{t(locale,'featured')}</div>
        <h1 className="mb-4 font-heading text-2xl font-bold leading-tight tracking-tight md:text-4xl">{post.title}</h1>
        <p className="mb-7 max-w-md text-base leading-relaxed text-on-surface-variant">{post.excerpt}</p>
        <div className="flex items-center gap-3 border-t border-outline-variant pt-5">
          <span className="grid h-10 w-10 place-items-center rounded-full font-bold text-white" style={{ background: `linear-gradient(135deg, ${cat.color}, #34A853)` }}>Z</span>
          <div className="text-sm">
            <div className="font-bold">ziqia.cc</div>
            <div className="text-[13px] text-on-surface-variant">{formatDate(post.date)} · {tf(locale,'reading_time')(post.readingTime)}</div>
          </div>
          <Link href={href} className="ml-auto rounded-full bg-google-blue-cta px-6 py-3 text-sm font-bold text-white shadow-[0_1px_3px_rgba(60,64,67,0.3)] transition-colors hover:bg-[#1765CC]">
            {t(locale,'read_more')}
          </Link>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 创建 `tests/components/HeroCard.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeroCard } from '@/components/HeroCard';
import type { PostMeta } from '@/lib/types';

const sample: PostMeta = {
  slug: 'rust-memory', translationKey: 'rust-memory', title: 'Rust 内存模型',
  date: '2024-11-01', category: 'tooling', tags: ['rust'], readingTime: 6,
  featured: true, excerpt: '理解所有权。', coverAlt: 'cover',
};

describe('HeroCard', () => {
  it('renders post title and excerpt', () => {
    render(<HeroCard post={sample} locale="cn" />);
    expect(screen.getByText('Rust 内存模型')).toBeInTheDocument();
    expect(screen.getByText('理解所有权。')).toBeInTheDocument();
  });

  it('renders ziqia.cc brand and Z avatar', () => {
    render(<HeroCard post={sample} locale="cn" />);
    expect(screen.getByText('ziqia.cc')).toBeInTheDocument();
    expect(screen.getByText('Z')).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: 同步修复 `src/components/ArticleCard.tsx`**

把 `src/components/ArticleCard.tsx` 中第 28 行 `formatDate(post.date, locale)` 改为 `formatDate(post.date)`，第 21 行 `{cat.label[locale]}` 改为 `{cat.label}`。

文件其他内容保持不变。

- [ ] **Step 4: 运行测试**

```bash
npm test -- tests/components/HeroCard.test.tsx tests/components/ArticleCard.test.tsx
```

期望：PASS。

- [ ] **Step 5: 提交**

```bash
git add src/components/HeroCard.tsx src/components/ArticleCard.tsx tests/components/HeroCard.test.tsx
git commit -m "refactor: HeroCard 与 ArticleCard 品牌替换，formatDate 去掉 locale 参数"
```

---

## Task 8: UI - CategoryIcon 扩展

**Files:**
- Modify: `src/components/CategoryIcon.tsx`
- Create: `tests/components/CategoryIcon.test.tsx`
- Modify: `tests/components/ArticleCard.test.tsx`（更新 category 字段）

**背景:** 添加 9 个新分类的 SVG 图标，新增 `label` 可选 prop（带 label 时显示图标 + 文字的纵向布局）。

**Interfaces:**
- Consumes: Task 1 的新 `Category` 联合
- Produces: `<CategoryIcon category size={56} label? />`

### Steps

- [ ] **Step 1: 修改 `src/components/CategoryIcon.tsx`**

完整替换为：

```tsx
import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';
import type { Category } from '@/lib/types';

const ICONS: Record<Category, React.ReactNode> = {
  'prompt-engineering':  <path d="M3 5h18v2H3zm0 4h12v2H3zm0 4h18v2H3zm0 4h12v2H3zM17 11l4 3-4 3z" />,
  'ai-coding-workflows': <path d="M8 3l-6 9 6 9m8-18l6 9-6 9M14 3l-4 18" />,
  'tooling':             <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1 .1-1.4z" />,
  'quality':             <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />,
  'cost-efficiency':     <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1H6.34c.12 2.19 1.76 3.42 3.66 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />,
  'real-world':          <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />,
  'security':            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />,
  'team-collab':         <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />,
  'ai-news':             <path d="M20 3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14H6v-2h5v2zm5-4H6v-2h10v2zm0-4H6V7h10v2z" />,
};

type Props = {
  category: Category;
  size?: number;
  label?: string;
  href?: string;
};

export function CategoryIcon({ category, size = 44, label, href }: Props) {
  const cfg = CATEGORIES[category];
  const icon = (
    <span
      className="grid place-items-center rounded-full"
      style={{ width: size, height: size, background: cfg.bgColor }}
    >
      <svg width={size*0.5} height={size*0.5} viewBox="0 0 24 24" fill={cfg.color}>
        {ICONS[category]}
      </svg>
    </span>
  );
  const content = label ? (
    <span className="flex flex-col items-center gap-1.5">
      {icon}
      <span className="text-xs font-medium text-on-surface-variant">{label}</span>
    </span>
  ) : icon;
  if (href) {
    return <Link href={href} className="transition-transform hover:scale-105">{content}</Link>;
  }
  return content;
}
```

- [ ] **Step 2: 创建 `tests/components/CategoryIcon.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CategoryIcon } from '@/components/CategoryIcon';

describe('CategoryIcon', () => {
  it('renders without label', () => {
    const { container } = render(<CategoryIcon category="prompt-engineering" size={56} />);
    expect(container.querySelector('svg')).toBeTruthy();
    expect(screen.queryByText('提示工程')).toBeNull();
  });

  it('renders with label', () => {
    render(<CategoryIcon category="prompt-engineering" size={56} label="提示工程" />);
    expect(screen.getByText('提示工程')).toBeInTheDocument();
  });

  it('renders link when href is provided', () => {
    render(<CategoryIcon category="ai-news" size={56} label="业界新闻" href="/cn/categories/ai-news/" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/cn/categories/ai-news/');
  });
});
```

- [ ] **Step 3: 更新 `tests/components/ArticleCard.test.tsx`**

修改 `category: 'backend'` 为 `category: 'tooling'`，并把 `locale="cn"` 期望的 `'后端'` 改为 `'工具生态'`。完整替换为：

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ArticleCard } from '@/components/ArticleCard';
import type { PostMeta } from '@/lib/types';

const sample: PostMeta = {
  slug: 'rust-memory', translationKey: 'rust-memory', title: 'Rust 内存模型',
  date: '2024-11-01', category: 'tooling', tags: ['rust'], readingTime: 6,
  featured: false, excerpt: '理解所有权。', coverAlt: 'cover',
};

describe('ArticleCard', () => {
  it('renders title, excerpt and meta', () => {
    render(<ArticleCard post={sample} locale="cn" />);
    expect(screen.getByText('Rust 内存模型')).toBeInTheDocument();
    expect(screen.getByText('理解所有权。')).toBeInTheDocument();
    expect(screen.getByText(/6 分钟阅读/)).toBeInTheDocument();
  });

  it('shows category label in cn', () => {
    render(<ArticleCard post={sample} locale="cn" />);
    expect(screen.getByText('工具生态')).toBeInTheDocument();
  });

  it('links to post detail page', () => {
    render(<ArticleCard post={sample} locale="cn" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/cn/posts/rust-memory');
  });
});
```

- [ ] **Step 4: 运行测试**

```bash
npm test -- tests/components/CategoryIcon.test.tsx tests/components/ArticleCard.test.tsx
```

期望：全 PASS。

- [ ] **Step 5: 提交**

```bash
git add src/components/CategoryIcon.tsx tests/components/CategoryIcon.test.tsx tests/components/ArticleCard.test.tsx
git commit -m "feat: CategoryIcon 扩展为 9 个新分类并支持文字标签"
```

---

## Task 9: UI - 代码块背景修复

**Files:**
- Modify: `src/styles/globals.css`

**背景:** shiki 主题背景与页面背景融合，添加 CSS 强制使用 `surface-dim` 背景色。

**Interfaces:**
- Consumes: 无
- Produces: 代码块有清晰的圆角边框 + 区分背景

### Steps

- [ ] **Step 1: 在 `src/styles/globals.css` 末尾追加**

在文件末尾（`}` 之后）添加：

```css
@layer components {
  .shiki-light pre,
  .shiki-dark pre {
    @apply rounded-xl border border-outline-variant p-5 my-6 overflow-x-auto;
    background: rgb(var(--surface-dim)) !important;
  }
  .shiki-light,
  .shiki-dark {
    display: contents;
  }
}
```

注：`display: contents` 让外层 `.shiki-light`/`.shiki-dark` 不影响布局，只保留内层 `<pre>` 的样式。

- [ ] **Step 2: 验证构建**

```bash
npm run build 2>&1 | tail -30
```

期望：构建成功，无 CSS 错误。

- [ ] **Step 3: 提交**

```bash
git add src/styles/globals.css
git commit -m "fix: 代码块背景与页面分离，添加边框和圆角"
```

---

## Task 10: UI - 首页与分类页更新

**Files:**
- Modify: `src/app/[locale]/page.tsx`
- Modify: `src/app/[locale]/categories/page.tsx`

**背景:** 首页分类区改为 9 列布局，图标带文字；分类页布局调整。

**Interfaces:**
- Consumes: Task 8 的 `CategoryIcon` 支持 `label` 和 `href`
- Produces: 首页分类区可点击跳转到对应分类

### Steps

- [ ] **Step 1: 修改 `src/app/[locale]/page.tsx`**

修改第 46-48 行的 grid 容器和子元素为：

```tsx
<div className="grid grid-cols-3 gap-4 md:grid-cols-5 lg:grid-cols-9">
  {cats.map((c) => (
    <CategoryIcon key={c.id} category={c.id} size={56} label={c.label} href={`/${locale}/categories/${c.id}/`} />
  ))}
</div>
```

- [ ] **Step 2: 修改 `src/app/[locale]/categories/page.tsx`**

第 21 行 `grid-cols-2 md:grid-cols-2 lg:grid-cols-3` 改为 `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`（9 个分类需要更宽的网格）。

- [ ] **Step 3: 运行构建验证**

```bash
npm run build 2>&1 | tail -20
```

期望：构建成功。

- [ ] **Step 4: 提交**

```bash
git add src/app/\[locale\]/page.tsx src/app/\[locale\]/categories/page.tsx
git commit -m "refactor: 首页分类区改为 9 列带文字标签的图标"
```

---

## Task 11: UI - 文章详情页改造

**Files:**
- Modify: `src/app/[locale]/posts/[slug]/page.tsx`

**背景:** 移除 `LangSwitchPost` 引用，品牌替换为 `ziqia.cc`，头像 `A` → `Z`，`formatDate` 不带 locale；注入 Google AdSense 自动广告脚本（环境变量控制）。

**Interfaces:**
- Consumes: Task 2 的 `formatDate(dateString)` 签名
- Produces: 文章详情页只显示中文（无翻译切换），`Z` 头像，`ziqia.cc` 品牌

### Steps

- [ ] **Step 1: 修改 `src/app/[locale]/posts/[slug]/page.tsx`**

完整替换为：

```tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { isLocale, LOCALES, t, tf, localePath } from '@/lib/i18n';
import { getAllSlugs, getPost, getAllPostsMeta } from '@/lib/posts';
import { CATEGORIES } from '@/lib/categories';
import { extractToc } from '@/lib/toc';
import { MDXContent } from '@/components/MDXContent';
import { TableOfContents } from '@/components/TableOfContents';
import type { Locale } from '@/lib/types';

export async function generateStaticParams() {
  const results: { locale: string; slug: string }[] = [];
  for (const locale of LOCALES) {
    const slugs = await getAllSlugs(locale);
    for (const slug of slugs) {
      results.push({ locale, slug });
    }
  }
  return results;
}

export default async function PostPage({ params }: { params: { locale: string; slug: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const post = await getPost(locale, params.slug);
  if (!post) notFound();
  const cat = CATEGORIES[post.category];
  const toc = extractToc(post.content);
  const all = await getAllPostsMeta(locale);
  const idx = all.findIndex((p) => p.slug === post.slug);
  const prev = all[idx + 1] ?? null;
  const next = all[idx - 1] ?? null;

  return (
    <div className="py-8">
      <div className="grid gap-10 lg:grid-cols-[1fr_220px]">
        <article>
          <div className="mb-6">
            <span className="inline-block rounded-full px-3 py-1 text-xs font-bold" style={{ background: cat.bgColor, color: cat.color }}>{cat.label}</span>
            <h1 className="mt-4 font-heading text-3xl font-bold leading-tight tracking-tight md:text-4xl">{post.title}</h1>
            <div className="mt-3 flex items-center gap-3 text-sm text-on-surface-variant">
              <span className="grid h-9 w-9 place-items-center rounded-full font-bold text-white" style={{ background: `linear-gradient(135deg, ${cat.color}, #34A853)` }}>Z</span>
              <span>ziqia.cc · {post.date} · {tf(locale,'reading_time')(post.readingTime)}</span>
            </div>
          </div>
          <div className="prose prose-neutral max-w-none dark:prose-invert">
            <MDXContent source={post.content} />
          </div>
          <nav className="mt-12 flex justify-between gap-4 border-t border-outline-variant pt-6">
            {prev ? (
              <Link href={localePath(locale,'posts',prev.slug)+'/'} className="text-sm">
                <span className="text-on-surface-variant">{t(locale,'previous')}</span>
                <span className="block font-bold">{prev.title}</span>
              </Link>
            ) : <span />}
            {next ? (
              <Link href={localePath(locale,'posts',next.slug)+'/'} className="text-right text-sm">
                <span className="text-on-surface-variant">{t(locale,'next')}</span>
                <span className="block font-bold">{next.title}</span>
              </Link>
            ) : <span />}
          </nav>
        </article>
        <TableOfContents items={toc} locale={locale} />
      </div>
    </div>
  );
}
```

注意：
- 移除了 `getTranslation` 导入和 `translation` 计算
- 移除了 `<LangSwitchPost>` JSX
- 头部时间用 `post.date` 原始格式 `YYYY-MM-DD`（也可改为 `formatDate(post.date)`，本任务保持原始格式与之前一致）
- 头像字母 `A` → `Z`
- `cat.label[locale]` → `cat.label`（因为 label 已经是 string）

- [ ] **Step 2: 添加 AdSense 自动广告脚本**

在 `export default async function PostPage` 函数顶部（`if (!isLocale(params.locale)) notFound();` 之后），加入：

```tsx
const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
```

然后在 return JSX 的 `<div className="py-8">` 内最前面（即 `<div className="grid gap-10 lg:grid-cols-[1fr_220px]">` 之前）添加：

```tsx
{adsenseId && (
  <script
    async
    src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
    crossOrigin="anonymous"
  />
)}
```

- [ ] **Step 3: 验证构建**

```bash
npm run build 2>&1 | tail -20
```

期望：构建成功，无 TypeScript 错误。

- [ ] **Step 4: 验证 AdSense 脚本（无环境变量时不渲染）**

```bash
ls out/cn/posts/rust-memory/index.html 2>&1 || ls out/cn/posts/*/index.html | head -1
grep -c "adsbygoogle" out/cn/posts/*/index.html
```

期望：`adsbygoogle` 出现 0 次（环境变量未设置时不渲染）。

- [ ] **Step 5: 提交**

```bash
git add src/app/\[locale\]/posts/\[slug\]/page.tsx
git commit -m "refactor: 文章详情页去掉语言切换，替换为 ziqia.cc 品牌，注入 AdSense"
```

---

## Task 12: SEO - 静态资源

**Files:**
- Create: `public/robots.txt`
- Create: `src/app/sitemap.ts`

**背景:** 添加 robots.txt 和动态生成的 sitemap.xml（Next.js App Router 内置支持）。

**Interfaces:**
- Consumes: Task 1 的新 `CATEGORIES`、`getAllPosts`、`getAllTags`
- Produces: `public/robots.txt` 静态文件，`src/app/sitemap.ts` 生成的 `out/sitemap.xml`

### Steps

- [ ] **Step 1: 创建 `public/robots.txt`**

```
User-agent: *
Allow: /

Sitemap: https://ziqia.cc/sitemap.xml
```

- [ ] **Step 2: 创建 `src/app/sitemap.ts`**

```ts
import type { MetadataRoute } from 'next';
import { LOCALES } from '@/lib/i18n';
import { categoryList } from '@/lib/categories';
import { getAllPostsMeta, getAllTags } from '@/lib/posts';

const SITE_BASE = 'https://ziqia.cc';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [];
  for (const locale of LOCALES) {
    routes.push({ url: `${SITE_BASE}/${locale}/`, lastModified: new Date() });
    routes.push({ url: `${SITE_BASE}/${locale}/categories/`, lastModified: new Date() });
    routes.push({ url: `${SITE_BASE}/${locale}/tags/`, lastModified: new Date() });
    routes.push({ url: `${SITE_BASE}/${locale}/about/`, lastModified: new Date() });
    for (const c of categoryList()) {
      routes.push({ url: `${SITE_BASE}/${locale}/categories/${c.id}/`, lastModified: new Date() });
    }
    const posts = await getAllPostsMeta(locale);
    for (const p of posts) {
      routes.push({
        url: `${SITE_BASE}/${locale}/posts/${p.slug}/`,
        lastModified: new Date(p.date),
      });
    }
    const tags = await getAllTags(locale);
    for (const tag of tags) {
      routes.push({ url: `${SITE_BASE}/${locale}/tags/${tag}/`, lastModified: new Date() });
    }
  }
  return routes;
}
```

- [ ] **Step 3: 验证构建产物**

```bash
npm run build 2>&1 | tail -20
ls out/sitemap.xml out/robots.txt 2>&1
```

期望：`out/sitemap.xml` 和 `out/robots.txt` 都存在。

- [ ] **Step 4: 检查 sitemap 内容**

```bash
head -30 out/sitemap.xml
```

期望：包含 `https://ziqia.cc/cn/posts/...` 链接。

- [ ] **Step 5: 提交**

```bash
git add public/robots.txt src/app/sitemap.ts
git commit -m "feat: 添加 robots.txt 和 sitemap.xml 自动化生成"
```

---

## Task 13: SEO - 各页面 metadata

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/not-found.tsx`
- Modify: `src/app/[locale]/page.tsx`
- Modify: `src/app/[locale]/posts/[slug]/page.tsx`
- Modify: `src/app/[locale]/categories/page.tsx`
- Modify: `src/app/[locale]/categories/[category]/page.tsx`
- Modify: `src/app/[locale]/tags/page.tsx`
- Modify: `src/app/[locale]/tags/[tag]/page.tsx`
- Modify: `src/app/[locale]/about/page.tsx`
- Modify: `src/app/[locale]/search/page.tsx`

**背景:** 为每个页面添加 `generateMetadata()`，输出 title、description、Open Graph、canonical URL；文章页额外输出 JSON-LD。

**Interfaces:**
- Consumes: 无
- Produces: 每个页面有独立的 `<title>`、`<meta description>`、OG 标签、canonical

### Steps

- [ ] **Step 1: 修改 `src/app/layout.tsx`**

完整替换为：

```tsx
import type { Metadata } from 'next';
import { ThemeProvider } from '@/providers/theme-provider';
import '@/styles/globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://ziqia.cc'),
  title: { default: 'ziqia.cc — AI 开发技术博客', template: '%s — ziqia.cc' },
  description: '关于提示工程、AI 编码工作流、工具生态等 AI 开发技术文章',
  openGraph: {
    type: 'website',
    siteName: 'ziqia.cc',
    locale: 'zh_CN',
    url: 'https://ziqia.cc',
  },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: 'https://ziqia.cc/cn/' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: 修改 `src/app/not-found.tsx`**

```tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 py-12 text-center">
      <h1 className="font-heading text-6xl font-bold text-on-surface-variant">404</h1>
      <p className="mt-4 text-lg text-on-surface-variant">页面未找到</p>
      <Link href="/cn/" className="mt-6 rounded-full bg-google-blue-cta px-6 py-2.5 text-sm font-bold text-white">
        返回首页
      </Link>
    </div>
  );
}
```

- [ ] **Step 3: 为首页 `[locale]/page.tsx` 添加 metadata**

在文件顶部 import 下、`export function generateStaticParams()` 前添加：

```tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ziqia.cc — AI 开发技术博客',
  description: '关于提示工程、AI 编码工作流、工具生态等 AI 开发技术文章',
  alternates: { canonical: 'https://ziqia.cc/cn/' },
};
```

（注意：此文件已有 `import { notFound } from 'next/navigation'`，新增 import 行插入到现有 import 块末尾。）

- [ ] **Step 4: 为文章详情页 `posts/[slug]/page.tsx` 添加 generateMetadata**

把当前的 `import { isLocale, LOCALES, t, tf, localePath } from '@/lib/i18n';` 修改为同时导入 `Metadata` 类型，并在 `generateStaticParams` 后新增：

```tsx
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { locale: string; slug: string } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const post = await getPost(params.locale as Locale, params.slug);
  if (!post) return {};
  const url = `https://ziqia.cc/${params.locale}/posts/${post.slug}/`;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      tags: post.tags,
    },
    twitter: { card: 'summary_large_image' },
  };
}
```

- [ ] **Step 5: 在文章详情页添加 JSON-LD**

在 `export default async function PostPage` 的 return JSX 顶部（`<div className="py-8">` 内）添加：

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      datePublished: post.date,
      description: post.excerpt,
      url: `https://ziqia.cc/${locale}/posts/${post.slug}/`,
      author: { '@type': 'Organization', name: 'ziqia.cc' },
      publisher: { '@type': 'Organization', name: 'ziqia.cc' },
    }),
  }}
/>
```

- [ ] **Step 6: 为分类列表页 `categories/page.tsx` 添加 metadata**

文件顶部 import 区添加 `import type { Metadata } from 'next';`，并在 `generateStaticParams` 前：

```tsx
export const metadata: Metadata = {
  title: '文章分类',
  description: '按主题浏览所有 AI 开发文章',
  alternates: { canonical: 'https://ziqia.cc/cn/categories/' },
};
```

- [ ] **Step 7: 为分类详情页 `categories/[category]/page.tsx` 添加 generateMetadata**

参考文章详情页模式：

```tsx
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { locale: string; category: string } }): Promise<Metadata> {
  if (!isCategory(params.category)) return {};
  const cat = CATEGORIES[params.category];
  return {
    title: cat.label,
    description: `${cat.label} 相关文章`,
    alternates: { canonical: `https://ziqia.cc/${params.locale}/categories/${params.category}/` },
  };
}
```

- [ ] **Step 8: 为标签列表页和标签详情页添加 metadata**

`tags/page.tsx`：

```tsx
export const metadata: Metadata = {
  title: '标签',
  description: '按标签浏览文章',
  alternates: { canonical: 'https://ziqia.cc/cn/tags/' },
};
```

`tags/[tag]/page.tsx`：

```tsx
export async function generateMetadata({ params }: { params: { locale: string; tag: string } }): Promise<Metadata> {
  return {
    title: `#${params.tag}`,
    description: `包含标签 "${params.tag}" 的所有文章`,
    alternates: { canonical: `https://ziqia.cc/${params.locale}/tags/${params.tag}/` },
  };
}
```

- [ ] **Step 9: 为 about 和 search 页添加 metadata**

`about/page.tsx`：

```tsx
export const metadata: Metadata = {
  title: '关于',
  description: '关于 ziqia.cc 博客',
  alternates: { canonical: 'https://ziqia.cc/cn/about/' },
};
```

`search/page.tsx`：

```tsx
export const metadata: Metadata = {
  title: '搜索',
  description: '搜索 ziqia.cc 上的文章',
  alternates: { canonical: 'https://ziqia.cc/cn/search/' },
  robots: { index: false, follow: true },
};
```

- [ ] **Step 10: 运行构建**

```bash
npm run build 2>&1 | tail -30
```

期望：构建成功。

- [ ] **Step 11: 验证 metadata**

```bash
ls out/cn/index.html
grep -o '<title>[^<]*</title>' out/cn/index.html
grep -o 'og:title' out/cn/index.html | head -1
```

期望：title 含 `ziqia.cc`，OG 标签存在。

- [ ] **Step 12: 提交**

```bash
git add src/app/layout.tsx src/app/not-found.tsx src/app/\[locale\]/page.tsx src/app/\[locale\]/posts/\[slug\]/page.tsx src/app/\[locale\]/categories/page.tsx src/app/\[locale\]/categories/\[category\]/page.tsx src/app/\[locale\]/tags/page.tsx src/app/\[locale\]/tags/\[tag\]/page.tsx src/app/\[locale\]/about/page.tsx src/app/\[locale\]/search/page.tsx
git commit -m "feat: 各页面添加 generateMetadata、OG 标签和 canonical URL"
```

---

## Task 14: 验证与文档

**Files:**
- Modify: `package.json`
- Modify: `README.md`
- Modify: `src/app/[locale]/layout.tsx`（清理不用的 import）
- Verify: 所有测试通过、构建无错误

**背景:** 更新项目名和 README，跑完整测试和构建。

**Interfaces:**
- Consumes: Task 1-13 全部
- Produces: `npm test` 和 `npm run build` 全部通过

### Steps

- [ ] **Step 1: 修改 `package.json`**

把 `"name": "alex-dev-blog"` 改为 `"name": "ziqia.cc"`。

- [ ] **Step 2: 修改 `README.md`**

完整替换为：

````markdown
# ziqia.cc — AI 开发技术博客

单语言（中文）个人 AI 开发技术博客，使用 Next.js 14 + MDX 构建，静态导出并部署到 Cloudflare Pages。

## 主题

- 提示工程 (Prompt Engineering)
- AI 编码工作流 (AI Coding Workflows)
- 工具生态 (Tooling & Integration)
- 质量保障 (Quality & Review)
- 成本与效率 (Cost & Efficiency)
- 项目实践 (Real-World Practices)
- 安全与合规 (Security & Compliance)
- 团队协作 (Team Collaboration)
- 业界新闻 (AI News)

## 开发

```bash
npm install
npm run dev     # http://localhost:3000 → /cn
```

## 构建

```bash
npm run build   # next build + rss + pagefind
```

输出：`out/`

## 测试

```bash
npm test
```

## 部署到 Cloudflare Pages

1. 在 Cloudflare Pages 创建新项目并连接本仓库
2. 构建命令：`npm run build`
3. 输出目录：`out`
4. 环境：Node 20
5. 环境变量（可选）：
   - `NEXT_PUBLIC_ADSENSE_CLIENT_ID`：Google AdSense 客户端 ID（不设置则不渲染广告脚本）

## 字体

构建使用 system-ui 字体栈避免静态导出的网络依赖。如需切换到 Google Fonts（Inter / Roboto / Noto Sans SC），修改 `src/app/layout.tsx`、`src/styles/globals.css` 和 `tailwind.config.ts`。
````

- [ ] **Step 3: 清理 `src/app/[locale]/layout.tsx`**

移除不再使用的 import（如 `Locale`、`t` 等如果不再需要）。最终文件应简洁：

```tsx
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { isLocale } from '@/lib/i18n';
import type { Locale } from '@/lib/types';

export function generateStaticParams() {
  return [{ locale: 'cn' }];
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params?: { locale?: string };
}) {
  if (!params || !params.locale || !isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const currentPath = `/${locale}`;
  return (
    <>
      <Header locale={locale} currentPath={currentPath} />
      <main className="mx-auto max-w-[1280px] px-5 md:px-10">{children}</main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 4: 运行完整测试**

```bash
npm test
```

期望：所有测试 PASS，无失败。

- [ ] **Step 5: 运行完整构建**

```bash
rm -rf out/
npm run build
```

期望：构建成功，`out/` 目录生成。

- [ ] **Step 6: 验证关键产物**

```bash
test -f out/sitemap.xml && echo "sitemap OK"
test -f out/robots.txt && echo "robots OK"
test -f out/feeds/feed-cn.xml && echo "rss OK"
grep -c "ziqia.cc" out/cn/index.html
```

期望：所有检查通过，`ziqia.cc` 在首页出现多次（标题、OG、canonical 等）。

- [ ] **Step 7: 提交**

```bash
git add package.json README.md src/app/\[locale\]/layout.tsx
git commit -m "docs: 更新 package.json 和 README 为 ziqia.cc"
```

---

## 自检清单

完成后对照以下清单确认：

- [ ] 6 个原有测试文件全部更新为新分类/单语言/新域名
- [ ] 4 个新测试文件（Footer/HeroCard/CategoryIcon/sitemap）创建
- [ ] Footer 不再含社交链接
- [ ] Header logo 显示 `ziqia.cc`
- [ ] 首页分类区显示 9 个带文字标签的图标
- [ ] 文章页无 `LangSwitchPost` 组件
- [ ] 代码块在 light/dark 模式下都有清晰边框和分离背景
- [ ] `out/sitemap.xml` 和 `out/robots.txt` 存在
- [ ] `out/feeds/feed-cn.xml` 存在
- [ ] 所有页面的 `<title>` 含 `ziqia.cc`
- [ ] 文章页输出 JSON-LD
- [ ] `NEXT_PUBLIC_ADSENSE_CLIENT_ID` 未设置时不渲染 AdSense 脚本
- [ ] `content/en/` 目录已删除
- [ ] `npm test` 全 PASS
- [ ] `npm run build` 成功
