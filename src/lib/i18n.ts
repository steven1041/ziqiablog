import type { Locale } from './types';

export const LOCALES: Locale[] = ['cn', 'en'];
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
  not_translated: string;
  view_in_other_lang: string;
  back_home: string;
  search_placeholder: string;
  no_results: string;
  table_of_contents: string;
  previous: string;
  next: string;
  page_not_found: string;
  rss: string;
};

const UI: Record<Locale, UIStrings> = {
  cn: {
    home: '首页', articles: '文章', categories: '分类', tags: '标签',
    about: '关于', search: '搜索', recent_posts: '最新文章',
    recent_posts_sub: '最近的技术探索与思考', featured: '精选文章',
    browse_categories: '浏览分类', browse_categories_sub: '按主题探索文章',
    view_all: '查看全部', read_more: '阅读全文', reading_time: (n) => `${n} 分钟阅读`,
    not_translated: '暂未翻译', view_in_other_lang: '查看另一语种',
    back_home: '返回首页', search_placeholder: '搜索文章…',
    no_results: '没有找到相关结果', table_of_contents: '目录',
    previous: '上一篇', next: '下一篇', page_not_found: '页面未找到',
    rss: 'RSS',
  },
  en: {
    home: 'Home', articles: 'Articles', categories: 'Categories', tags: 'Tags',
    about: 'About', search: 'Search', recent_posts: 'Recent posts',
    recent_posts_sub: 'Latest technical explorations and thoughts',
    featured: 'Featured', browse_categories: 'Browse by topic',
    browse_categories_sub: 'Explore posts by theme', view_all: 'View all',
    read_more: 'Read more', reading_time: (n) => `${n} min read`,
    not_translated: 'Not yet translated',
    view_in_other_lang: 'View in other language', back_home: 'Back home',
    search_placeholder: 'Search posts…', no_results: 'No results found',
    table_of_contents: 'On this page', previous: 'Previous', next: 'Next',
    page_not_found: 'Page not found', rss: 'RSS',
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