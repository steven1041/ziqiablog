# Blog Rebrand & AI-Dev Refocus — Design Spec

**Date:** 2026-07-12
**Status:** approved

---

## Overview

Rebrand the blog from bilingual "Alex.dev" to single-language Chinese "ziqia.cc", refocus all categories around AI development topics, and add SEO + AdSense support.

---

## 1. Architecture Decision

**Keep `/[locale]` route structure** with only `cn` as valid locale. This minimizes file moves and URL breakage.

- `src/app/page.tsx` continues redirect `/` → `/cn`
- All `[locale]/` pages only generate `{ locale: 'cn' }` in `generateStaticParams`
- `content/en/` directory removed entirely

---

## 2. Category System

### 2.1 New Categories

Replace current 6 categories with 9 AI-development-focused categories.

| ID | 中文名 | Color | BgColor | BgColorDark |
|---|---|---|---|---|
| `prompt-engineering` | 提示工程 | `#4285F4` | `#E8F0FE` | `#0B3D91` |
| `ai-coding-workflows` | AI 编码工作流 | `#34A853` | `#E6F4EA` | `#0D652D` |
| `tooling` | 工具生态 | `#EA4335` | `#FCE8E6` | `#A50E0E` |
| `quality` | 质量保障 | `#F9AB00` | `#FEF7E0` | `#7A5A00` |
| `cost-efficiency` | 成本与效率 | `#1A73E8` | `#D3E3FD` | `#041E49` |
| `real-world` | 项目实践 | `#34A853` | `#E6F4EA` | `#0D652D` |
| `security` | 安全与合规 | `#EA4335` | `#FCE8E6` | `#A50E0E` |
| `team-collab` | 团队协作 | `#4285F4` | `#D3E3FD` | `#041E49` |
| `ai-news` | 业界新闻 | `#F9AB00` | `#FEF7E0` | `#7A5A00` |

Colors are recycled from the existing palette (Google colors). Duplicate color combinations are acceptable since the primary identifier is the icon + text label.

### 2.2 Types Changes

`src/lib/types.ts`:
- `Locale = 'cn'` (was `'cn' | 'en'`)
- `Category` union type updated to 9 new IDs
- `CategoryConfig.label` simplified from `Record<Locale, string>` to `string`

### 2.3 CategoryIcon Updates

`src/components/CategoryIcon.tsx`:
- Add 9 new SVG icon paths for each category
- Accept optional `label` prop to display category name below icon
- Homepage usage: `<CategoryIcon category={c.id} size={56} label={c.label} />`

---

## 3. i18n Simplification

`src/lib/i18n.ts`:
- `LOCALES = ['cn']`
- `DEFAULT_LOCALE` stays `'cn'`
- `UI` dictionary: remove `en` entries, keep only `cn`
- `t()`, `tf()`, `isLocale()` keep same signatures
- `localePath()` stays unchanged

---

## 4. Branding Changes

All occurrences of "Alex Chen" → "ziqia.cc", "Alex.dev" → "ziqia.cc".

| File | Change |
|---|---|
| `Header.tsx:25` | logo text `Alex.dev` → `ziqia.cc` |
| `HeroCard.tsx:33` | author name `Alex Chen` → `ziqia.cc` |
| `[locale]/posts/[slug]/page.tsx:45` | author name `Alex Chen` → `ziqia.cc` |
| `[locale]/posts/[slug]/page.tsx:44` | avatar letter `A` → `Z` |
| `HeroCard.tsx:31` | avatar letter `A` → `Z` |
| `Footer.tsx:14` | copyright `© YYYY Alex Chen · Built with Next.js & MDX` → `© YYYY ziqia.cc` |
| `src/lib/rss.ts` | `SITE_BASE` → `https://ziqia.cc`, `AUTHOR.name` → `ziqia.cc` |

---

## 5. Footer Cleanup

`src/components/Footer.tsx`:
- Remove all social links (GitHub, Twitter, Email, RSS)
- Remove `locale` prop — component becomes prop-less
- Only show: `© 2026 ziqia.cc`

Remove corresponding `LINKS` constant and imports. Remove RSS `<Link>` element.

---

## 6. Header Cleanup

`src/components/Header.tsx`:
- Remove `<LangSwitch>` import and rendering
- Keep `Locale` prop for nav link generation (paths still need `/[locale]/...`)
- Logo text changed as per branding section

---

## 7. Code Block Background Fix

`src/content/CodeBlock.tsx` or `src/styles/globals.css`:

Add CSS to enforce distinct background on shiki code blocks:

```css
.shiki-light pre,
.shiki-dark pre {
  @apply rounded-xl border border-outline-variant;
  background: rgb(var(--surface-dim)) !important;
}
```

This overrides shiki's theme background with the surface-dim token, ensuring visible separation from page background in both light and dark modes.

---

## 8. Homepage Category Section

`src/app/[locale]/page.tsx` (line 46-48):
- Replace `<CategoryIcon category={c.id} size={56} />` with `<CategoryIcon category={c.id} size={56} label={c.label} />`
- Grid adjusts from `grid-cols-2 md:grid-cols-3 lg:grid-cols-6` to `grid-cols-3 md:grid-cols-5 lg:grid-cols-9` for 9 categories

---

## 9. SEO Implementation

### 9.1 Static Assets

- `public/robots.txt`: Allow all, point sitemap to `https://ziqia.cc/sitemap.xml`
- `app/sitemap.ts`: Auto-generate sitemap with all routes (static export compatible via `generateSitemaps`)

### 9.2 Per-Page Metadata

Each page exports `generateMetadata()`:

| Page | Title pattern | Description pattern |
|---|---|---|
| Home | `ziqia.cc — AI 开发技术博客` | Fixed description |
| Post detail | `{title} — ziqia.cc` | `{post.excerpt}` |
| Categories index | `文章分类 — ziqia.cc` | Fixed description |
| Category detail | `{category.label} — ziqia.cc` | `{category.label} 相关文章` |
| Tags index | `标签 — ziqia.cc` | Fixed description |
| Tag detail | `{tag} — ziqia.cc` | `包含标签 "{tag}" 的所有文章` |
| About | `关于 — ziqia.cc` | Fixed description |
| Search | `搜索 — ziqia.cc` | Fixed description |

All pages include:
- Open Graph: `og:title`, `og:description`, `og:type`, `og:url`, `og:site_name`
- Twitter Card: `twitter:card = "summary_large_image"`
- Canonical URL: `<link rel="canonical" href="https://ziqia.cc/cn/...">`

Post detail pages additionally include:
- `article:published_time`
- `article:tag` (one per tag)
- JSON-LD `BlogPosting` structured data

### 9.3 RSS Feed

Keep RSS generation, but only for Chinese:
- Scripts: `build-rss.mjs` only generates `feed-cn.xml`
- Output: `out/feeds/feed-cn.xml`
- Domain: `https://ziqia.cc`

---

## 10. AdSense Integration

Post detail page `[locale]/posts/[slug]/page.tsx`:

Add auto ad script via environment variable:

```tsx
{process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
  <script
    async
    src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
    crossOrigin="anonymous"
  />
)}
```

Set `NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXX` in Cloudflare Pages environment variables. When unset, no script is injected.

---

## 11. Content Migration

### 11.1 Remove English Content

Delete `content/en/` directory.

### 11.2 Remap Existing Articles

Update `category` in frontmatter of each `content/cn/posts/*.mdx`:

| File | Old Category | New Category |
|---|---|---|
| `message-queue.mdx` | `architecture` | `real-world` |
| `game-dev.mdx` | `ai` | `real-world` |
| `rsc-deep-dive.mdx` | `frontend` | `ai-coding-workflows` |
| `rust-memory.mdx` | `backend` | `tooling` |

### 11.3 English Post Files

Delete corresponding English versions in `content/en/posts/` (done as part of `content/en/` removal).

---

## 12. Test Updates

| Test File | Changes Required |
|---|---|
| `tests/lib/categories.test.ts` | Replace 6 old categories with 9 new ones |
| `tests/lib/i18n.test.ts` | Single locale, no English UI strings |
| `tests/lib/posts.test.ts` | Update test fixture categories |
| `tests/lib/rss.test.ts` | New domain, author name, feed filename |
| `tests/lib/date.test.ts` | Remove English format branch tests |
| `tests/lib/toc.test.ts` | No changes |

---

## 13. Files Summary

### Files to Modify
- `src/lib/types.ts`
- `src/lib/categories.ts`
- `src/lib/i18n.ts`
- `src/lib/rss.ts`
- `src/components/Footer.tsx`
- `src/components/Header.tsx`
- `src/components/HeroCard.tsx`
- `src/components/CategoryIcon.tsx`
- `src/content/CodeBlock.tsx`
- `src/styles/globals.css`
- `src/app/[locale]/layout.tsx`
- `src/app/[locale]/page.tsx`
- `src/app/[locale]/posts/[slug]/page.tsx`
- `src/app/[locale]/categories/page.tsx`
- `src/app/[locale]/categories/[category]/page.tsx`
- `src/app/[locale]/tags/page.tsx`
- `src/app/[locale]/tags/[tag]/page.tsx`
- `src/app/[locale]/about/page.tsx`
- `src/app/[locale]/search/page.tsx`
- `src/app/search/page.tsx`
- `src/app/layout.tsx` (add metadata)
- `src/app/not-found.tsx`
- `content/cn/posts/message-queue.mdx`
- `content/cn/posts/game-dev.mdx`
- `content/cn/posts/rsc-deep-dive.mdx`
- `content/cn/posts/rust-memory.mdx`
- `scripts/build-rss.mjs`
- `package.json` (name field)
- `tests/lib/categories.test.ts`
- `tests/lib/i18n.test.ts`
- `tests/lib/posts.test.ts`
- `tests/lib/rss.test.ts`
- `tests/lib/date.test.ts`

### Files to Create
- `public/robots.txt`
- `src/app/sitemap.ts`

### Files/Directories to Delete
- `content/en/` (entire directory)

### Files to Leave In Place (no longer imported)
- `src/components/LangSwitch.tsx`
- `src/components/LangSwitchPost.tsx`
