import { describe, it, expect, beforeEach } from 'vitest';
import path from 'node:path';
import {
  setPostsDirForTest,
  getPost, getAllPosts, getFeatured, getPostsByCategory,
  getPostsByTag, getAllTags, getTranslation,
} from '@/lib/posts';

beforeEach(() => {
  setPostsDirForTest(path.resolve(process.cwd(), 'tests/fixtures/content'));
});

describe('posts loader', () => {
  it('parses a single post with computed readingTime', async () => {
    const post = await getPost('cn', 'hello-rsc');
    expect(post?.title).toBe('深入理解 React Server Components');
    expect(post?.translationKey).toBe('rsc-deep-dive');
    expect(post?.featured).toBe(true);
    expect(post?.readingTime).toBeGreaterThan(0);
  });

  it('getAllPosts returns sorted desc by date', async () => {
    const posts = await getAllPosts('cn');
    expect(posts).toHaveLength(1);
  });

  it('getFeatured finds featured post', async () => {
    const feat = await getFeatured('cn');
    expect(feat?.slug).toBe('hello-rsc');
  });

  it('filters by category and tag', async () => {
    expect((await getPostsByCategory('cn', 'frontend'))).toHaveLength(1);
    expect((await getPostsByCategory('cn', 'backend'))).toHaveLength(0);
    expect((await getPostsByTag('cn', 'react'))).toHaveLength(1);
    expect((await getPostsByTag('cn', 'rust'))).toHaveLength(0);
  });

  it('aggregates unique tags', async () => {
    expect((await getAllTags('cn')).sort()).toEqual(['architecture', 'react', 'rsc']);
  });

  it('finds translation across locales by translationKey', async () => {
    const en = await getTranslation('en', 'rsc-deep-dive');
    expect(en?.slug).toBe('rsc-deep-dive');
    expect(en?.title).toBe('Understanding React Server Components');
  });
});