import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeroCard } from '@/components/HeroCard';
import type { PostMeta } from '@/lib/types';

const sample: PostMeta = {
  slug: 'rust-memory', translationKey: 'rust-memory', title: 'Rust 内存模型',
  date: '2024-11-01', category: 'tooling', tags: ['rust'], readingTime: 6,
  featured: true, excerpt: '理解所有权。', coverAlt: 'cover',
};

describe('HeroCard', () => {
  it('renders post title and excerpt', () => {
    render(<HeroCard post={sample} locale="cn" />);
    expect(screen.getAllByText('Rust 内存模型')).toHaveLength(2);
    expect(screen.getByText('理解所有权。')).toBeInTheDocument();
  });

  it('renders ZiQia.cc brand and Z avatar', () => {
    render(<HeroCard post={sample} locale="cn" />);
    expect(screen.getByText('ZiQia.cc')).toBeInTheDocument();
    expect(screen.getByText('Z')).toBeInTheDocument();
  });
});
