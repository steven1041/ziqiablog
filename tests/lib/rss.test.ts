import { describe, it, expect, beforeEach } from 'vitest';
import { setPostsDirForTest } from '@/lib/posts';
import { buildFeedForLocale } from '@/lib/rss';
import path from 'node:path';

beforeEach(() => setPostsDirForTest(path.resolve(__dirname, '../fixtures/content')));

describe('rss', () => {
  it('produces valid RSS2 envelope for cn', async () => {
    const xml = await buildFeedForLocale('cn');
    expect(xml).toContain('<?xml');
    expect(xml).toContain('<rss');
    expect(xml).toContain('React Server Components');
  });
});
