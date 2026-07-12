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
