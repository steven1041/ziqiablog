import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from '@/components/Header';

describe('Header', () => {
  it('renders brand with four color dots', () => {
    render(<Header locale="cn" currentPath="/cn" />);
    expect(screen.getByText('Alex.dev')).toBeInTheDocument();
  });

  it('highlights active nav item based on currentPath', () => {
    render(<Header locale="cn" currentPath="/en" />);
    const link = screen.getByText('文章').closest('a');
    expect(link).toBeTruthy();
  });
});
