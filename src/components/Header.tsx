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

export function SealLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" className="flex-shrink-0">
      <circle cx="14" cy="14" r="12.5" fill="none" className="stroke-google-blue-cta" strokeWidth="1.5" />
      <circle cx="14" cy="14" r="10" fill="none" className="stroke-google-blue-cta" strokeWidth="0.5" opacity="0.4" />
      <text x="14" y="19" textAnchor="middle" fontSize="14" fontWeight="bold" className="fill-google-blue-cta" fontFamily="serif">洽</text>
    </svg>
  );
}

export function Header({ locale, currentPath }: { locale: Locale; currentPath: string }) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-4 border-b border-outline-variant bg-surface/90 px-5 py-4 backdrop-blur-md md:px-10">
      <Link href={`/${locale}`} className="flex items-center gap-2.5">
        <span className="flex gap-1">
          <SealLogo />
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
