import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx,mdx}',
    './src/components/**/*.{ts,tsx}',
    './src/content/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        google: {
          blue: '#4285F4',
          'blue-cta': '#1A73E8',
          red: '#EA4335',
          yellow: '#F9AB00',
          green: '#34A853',
        },
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'surface-variant': 'rgb(var(--surface-variant) / <alpha-value>)',
        'surface-dim': 'rgb(var(--surface-dim) / <alpha-value>)',
        'on-surface': 'rgb(var(--on-surface) / <alpha-value>)',
        'on-surface-variant': 'rgb(var(--on-surface-variant) / <alpha-value>)',
        outline: 'rgb(var(--outline) / <alpha-value>)',
        'outline-variant': 'rgb(var(--outline-variant) / <alpha-value>)',
        'primary-container': 'rgb(var(--primary-container) / <alpha-value>)',
      },
      fontFamily: {
        heading: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Noto Sans SC', 'sans-serif'],
        body: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Noto Sans SC', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        hero: '24px',
      },
    },
  },
  plugins: [typography],
};
export default config;
