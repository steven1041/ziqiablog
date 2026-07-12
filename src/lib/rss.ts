import { Feed } from 'feed';
import type { Locale } from './types';
import { getAllPostsMeta } from './posts';

const SITE_BASE = 'https://ziqia.cc';
const AUTHOR = {
  name: 'ZiQia.cc',
  link: 'https://ziqia.cc',
};

export async function buildFeedForLocale(locale: Locale): Promise<string> {
  const posts = (await getAllPostsMeta(locale)).slice(0, 20);
  const feed = new Feed({
    title: 'ZiQia.cc — AI 开发技术博客',
    description: '关于提示工程、AI 编码工作流、工具生态等 AI 开发技术文章',
    id: `${SITE_BASE}/`,
    link: `${SITE_BASE}/${locale}`,
    language: 'zh-CN',
    image: `${SITE_BASE}/favicon.ico`,
    copyright: `© ${new Date().getFullYear()} ZiQia.cc`,
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
