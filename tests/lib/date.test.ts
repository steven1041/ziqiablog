import { describe, it, expect } from 'vitest';
import { formatDate } from '@/lib/date';

describe('formatDate', () => {
  it('formats YYYY-MM-DD to Chinese', () => {
    expect(formatDate('2024-12-01', 'cn')).toBe('2024年12月01日');
  });

  it('formats YYYY-MM-DD to English', () => {
    expect(formatDate('2024-12-01', 'en')).toBe('Dec 1, 2024');
  });

  it('formats single-digit month and day in Chinese', () => {
    expect(formatDate('2024-01-05', 'cn')).toBe('2024年01月05日');
  });

  it('returns raw string on invalid date', () => {
    expect(formatDate('', 'cn')).toBe('');
    expect(formatDate('not-a-date', 'cn')).toBe('not-a-date');
  });

  it('formats the test fixture date correctly', () => {
    expect(formatDate('2024-12-01', 'cn')).toBe('2024年12月01日');
    expect(formatDate('2024-12-01', 'en')).toBe('Dec 1, 2024');
  });
});
