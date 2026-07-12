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
