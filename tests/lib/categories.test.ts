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
