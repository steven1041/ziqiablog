# Alex.dev — 个人技术博客

Bilingual (CN/EN) personal tech blog built with Next.js 14 + MDX, statically exported and deployed on Cloudflare Pages.

## Develop

```bash
npm install
npm run dev     # http://localhost:3000 → /cn
```

## Build

```bash
npm run build   # next build + rss + pagefind
```

Output: `out/`

## Tests

```bash
npm test
```

## Deploy on Cloudflare Pages

1. Create a new Cloudflare Pages project, connect this Git repository.
2. Build command: `npm run build`
3. Output directory: `out`
4. Environment: Node 20

## Fonts

This build uses the system-ui font stack (`system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans SC', sans-serif`) instead of Google Fonts to avoid network dependencies during static export. If you prefer Google Fonts (Inter / Roboto / Noto Sans SC), revert the changes in `src/app/layout.tsx`, `src/styles/globals.css`, and `tailwind.config.ts`.
