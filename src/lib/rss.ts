import { Feed } from 'feed';
import type { Locale } from './types';
import { getAllPostsMeta } from './posts';

const SITE_BASE = 'https://alex.dev';
const AUTHOR = {
  name: 'Alex Chen',
  email: '109382921@qq.com',
  link: 'https://alex.dev',
};

export async function buildFeedForLocale(locale: Locale): Promise<string> {
  const posts = (await getAllPostsMeta(locale)).slice(0, 20);
  const feed = new Feed({
    title: locale === 'cn' ? 'Alex.dev — 技术博客' : 'Alex.dev — Tech Blog',
    description: 'Personal tech blog by Alex Chen',
    id: `${SITE_BASE}/`,
    link: `${SITE_BASE}/${locale}`,
    language: locale === 'cn' ? 'zh-CN' : 'en',
    image: `${SITE_BASE}/favicon.ico`,
    copyright: `© ${new Date().getFullYear()} Alex Chen`,
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
