import { describe, it, expect } from 'vitest';
import { LOCALES, DEFAULT_LOCALE, isLocale, localePath, t } from '@/lib/i18n';

describe('i18n', () => {
  it('cn and en are supported, cn default', () => {
    expect(LOCALES).toEqual(['cn', 'en']);
    expect(DEFAULT_LOCALE).toBe('cn');
  });

  it('isLocale guards', () => {
    expect(isLocale('cn')).toBe(true);
    expect(isLocale('fr')).toBe(false);
  });

  it('localePath joins segments with leading locale', () => {
    expect(localePath('cn', 'posts', 'rsc')).toBe('/cn/posts/rsc');
    expect(localePath('en')).toBe('/en');
  });

  it('t returns UI strings per locale', () => {
    expect(t('cn', 'recent_posts')).toBe('最新文章');
    expect(t('en', 'recent_posts')).toBe('Recent posts');
  });
});