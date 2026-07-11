import Link from 'next/link';
import type { Locale } from '@/lib/types';
import { LOCALES } from '@/lib/i18n';

export function LangSwitch({ locale, currentPath }: { locale: Locale; currentPath: string }) {
  const segments = currentPath.split('/').filter(Boolean);
  const targetLocale: Locale = locale === 'cn' ? 'en' : 'cn';
  const targetPath = '/' + [targetLocale, ...segments.slice(1)].join('/');
  return (
    <Link
      href={targetPath}
      className="flex items-center gap-1.5 rounded-full border border-outline-variant px-3.5 py-1.5 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-variant"
      aria-label="Switch language"
    >
      <span className={locale==='cn'?'text-google-blue-cta font-bold':'text-on-surface-variant'}>中</span>
      <span className="text-outline">/</span>
      <span className={locale==='en'?'text-google-blue-cta font-bold':'text-on-surface-variant'}>EN</span>
    </Link>
  );
}
