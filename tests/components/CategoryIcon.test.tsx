import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CategoryIcon } from '@/components/CategoryIcon';

describe('CategoryIcon', () => {
  it('renders without label', () => {
    const { container } = render(<CategoryIcon category="prompt-engineering" size={56} />);
    expect(container.querySelector('svg')).toBeTruthy();
    expect(screen.queryByText('提示工程')).toBeNull();
  });

  it('renders with label', () => {
    render(<CategoryIcon category="prompt-engineering" size={56} label="提示工程" />);
    expect(screen.getByText('提示工程')).toBeInTheDocument();
  });

  it('renders link when href is provided', () => {
    render(<CategoryIcon category="ai-news" size={56} label="业界新闻" href="/cn/categories/ai-news/" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/cn/categories/ai-news');
  });
});
