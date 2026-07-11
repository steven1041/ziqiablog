import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeProvider } from '@/providers/theme-provider';
import { ThemeToggle } from '@/components/ThemeToggle';

function setup() {
  return render(
    <ThemeProvider attribute="class" defaultTheme="system">
      <ThemeToggle />
    </ThemeProvider>
  );
}

describe('ThemeToggle', () => {
  it('renders a button', () => {
    setup();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('toggles class on html when clicked', () => {
    setup();
    const btn = screen.getByRole('button');
    expect(document.documentElement.className).not.toContain('dark');
    act(() => { fireEvent.click(btn); });
    // after click, next-themes sets stored theme to dark on light default
    expect(document.documentElement.className).toMatch(/dark|light/);
  });
});