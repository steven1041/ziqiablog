import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ArticleCard } from '@/components/ArticleCard';
import type { PostMeta } from '@/lib/types';

const sample: PostMeta = {
  slug: 'rust-memory', translationKey: 'rust-memory', title: 'Rust 内存模型',
  date: '2024-11-01', category: 'tooling', tags: ['rust'], readingTime: 6,
  featured: false, excerpt: '理解所有权。', coverAlt: 'cover',
};

describe('ArticleCard', () => {
  it('renders title, excerpt and meta', () => {
    render(<ArticleCard post={sample} locale="cn" />);
    expect(screen.getByText('Rust 内存模型')).toBeInTheDocument();
    expect(screen.getByText('理解所有权。')).toBeInTheDocument();
    expect(screen.getByText(/6 分钟阅读/)).toBeInTheDocument();
  });

  it('shows category label in cn', () => {
    render(<ArticleCard post={sample} locale="cn" />);
    expect(screen.getByText('工具生态')).toBeInTheDocument();
  });

  it('links to post detail page', () => {
    render(<ArticleCard post={sample} locale="cn" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/cn/posts/rust-memory');
  });
});
