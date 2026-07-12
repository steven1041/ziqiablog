import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/Footer';

describe('Footer', () => {
  it('renders ZiQia.cc copyright', () => {
    render(<Footer />);
    expect(screen.getByText(/© \d{4} ZiQia\.cc/)).toBeInTheDocument();
  });

  it('does not render any social links', () => {
    render(<Footer />);
    expect(screen.queryByText('GitHub')).toBeNull();
    expect(screen.queryByText('Twitter')).toBeNull();
    expect(screen.queryByText('RSS')).toBeNull();
  });
});
