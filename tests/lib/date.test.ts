import { describe, it, expect } from 'vitest';
import { formatDate } from '@/lib/date';

describe('formatDate', () => {
  it('formats YYYY-MM-DD to Chinese', () => {
    expect(formatDate('2024-12-01')).toBe('2024年12月01日');
  });

  it('pads single-digit month and day', () => {
    expect(formatDate('2024-01-05')).toBe('2024年01月05日');
  });

  it('returns raw string on invalid date', () => {
    expect(formatDate('')).toBe('');
    expect(formatDate('not-a-date')).toBe('not-a-date');
  });
});
