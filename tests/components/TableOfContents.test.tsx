import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TableOfContents } from '@/components/TableOfContents';

describe('TableOfContents', () => {
  it('renders section label and links', () => {
    render(<TableOfContents items={[{ id: 'a', text: 'A', level: 2 }]} locale="cn" />);
    expect(screen.getByText('目录')).toBeInTheDocument();
    expect(screen.getByText('A')).toHaveAttribute('href', '#a');
  });

  it('indents level-3 items', () => {
    render(<TableOfContents items={[{ id: 'a', text: 'A', level: 2 }, { id: 'b', text: 'B', level: 3 }]} locale="cn" />);
    const linkB = screen.getByText('B');
    expect(linkB.className).toContain('pl-5');
  });

  it('renders nothing when items is empty', () => {
    const { container } = render(<TableOfContents items={[]} locale="cn" />);
    expect(container.firstChild).toBeNull();
  });
});
