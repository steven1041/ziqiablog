import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { t } from '@/lib/i18n';
import type { Locale } from '@/lib/types';

const NAV: { key: 'articles' | 'categories' | 'tags' | 'about'; path: string }[] = [
  { key: 'articles', path: '' },
  { key: 'categories', path: 'categories' },
  { key: 'tags', path: 'tags' },
  { key: 'about', path: 'about' },
];

const DOT_COLORS = ['#4285F4', '#EA4335', '#FBBC04', '#34A853'];

export function Header({ locale, currentPath }: { locale: Locale; currentPath: string }) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-4 border-b border-outline-variant bg-surface/90 px-5 py-4 backdrop-blur-md md:px-10">
      <Link href={`/${locale}`} className="flex items-center gap-2.5">
        <span className="flex gap-1">
          {DOT_COLORS.map((c) => (
            <span key={c} className="h-2 w-2 rounded-full" style={{ background: c }} />
          ))}
        </span>
        <span className="font-heading text-xl font-bold tracking-tight text-google-blue-cta">ZiQia.cc</span>
      </Link>
      <nav className="hidden gap-1 md:flex">
        {NAV.map((item) => {
          const full = item.path ? `/${locale}/${item.path}` : `/${locale}`;
          const active = currentPath === full || currentPath.startsWith(full + '/');
          return (
            <Link
              key={item.key}
              href={full}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${active ? 'bg-primary-container text-google-blue-cta' : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'}`}
            >
              {t(locale, item.key)}
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
