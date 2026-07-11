import { describe, it, expect } from 'vitest';
import { CATEGORIES, isCategory, categoryList } from '@/lib/categories';

describe('categories', () => {
  it('exposes the 6 spec categories with cn/en labels', () => {
    expect(Object.keys(CATEGORIES)).toEqual(['frontend','backend','architecture','devops','ai','life']);
    expect(CATEGORIES.frontend.label).toEqual({ cn: '前端', en: 'Frontend' });
    expect(CATEGORIES.life.label).toEqual({ cn: '生活随笔', en: 'Life' });
  });

  it('validates category with isCategory type guard', () => {
    expect(isCategory('frontend')).toBe(true);
    expect(isCategory('frontend' as string)).toBe(true);
    expect(isCategory('unknown')).toBe(false);
    expect(isCategory('')).toBe(false);
  });

  it('categoryList returns array form for iteration', () => {
    const list = categoryList();
    expect(list).toHaveLength(6);
    expect(list[0]).toMatchObject({ id: 'frontend', color: '#4285F4' });
  });

  it('rejects Object.prototype keys (no prototype pollution)', () => {
    expect(isCategory('toString')).toBe(false);
    expect(isCategory('constructor')).toBe(false);
    expect(isCategory('__proto__')).toBe(false);
    expect(isCategory('hasOwnProperty')).toBe(false);
  });
});