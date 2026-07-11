'use client';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ReactNode } from 'react';

// next-themes@0.3.0 does not export ThemeProviderProps, so we hand-roll it.
type ThemeProviderProps = {
  children: ReactNode;
  attribute?: string | 'class';
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  storageKey?: string;
};

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}