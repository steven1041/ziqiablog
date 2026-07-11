import Link from 'next/link';
import type { Locale } from '@/lib/types';
import { t } from '@/lib/i18n';

const LINKS = [
  { label: 'GitHub', href: 'https://github.com/steven1041' },
  { label: 'Twitter', href: 'https://twitter.com' },
  { label: 'Email', href: 'mailto:109382921@qq.com' },
];

export function Footer({ locale }: { locale: Locale }) {
  return (
    <footer className="flex flex-col items-center justify-between gap-3 border-t border-outline-variant px-5 py-6 text-sm text-on-surface-variant md:flex-row md:px-10">
      <p>© {new Date().getFullYear()} Alex Chen · Built with Next.js & MDX</p>
      <div className="flex gap-6">
        {LINKS.map((l) => (
          <a key={l.label} href={l.href} className="transition-colors hover:text-on-surface">{l.label}</a>
        ))}
        <Link href={locale === 'cn' ? '/feeds/feed-cn.xml' : '/feeds/feed-en.xml'} className="transition-colors hover:text-on-surface">{t(locale, 'rss')}</Link>
      </div>
    </footer>
  );
}
