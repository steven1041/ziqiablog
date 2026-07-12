import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from '@/components/Header';

describe('Header', () => {
  it('renders ZiQia.cc brand', () => {
    render(<Header locale="cn" currentPath="/cn" />);
    expect(screen.getByText('ZiQia.cc')).toBeInTheDocument();
  });

  it('does not render language switch', () => {
    render(<Header locale="cn" currentPath="/cn" />);
    expect(screen.queryByLabelText('Switch language')).toBeNull();
  });

  it('highlights active nav item based on currentPath', () => {
    render(<Header locale="cn" currentPath="/cn" />);
    const link = screen.getByText('文章').closest('a');
    expect(link).toBeTruthy();
  });
});
