import Link from 'next/link';
import type { Locale } from '@/lib/types';
import { t } from '@/lib/i18n';

export function LangSwitchPost({ locale, targetSlug }: { locale: Locale; targetSlug: string }) {
  const targetLocale: Locale = locale === 'cn' ? 'en' : 'cn';
  return (
    <Link
      href={`/${targetLocale}/posts/${targetSlug}/`}
      className="mt-3 inline-block rounded-full border border-outline-variant px-3 py-1 text-xs font-semibold text-on-surface-variant transition-colors hover:bg-surface-variant"
    >
      {t(locale,'view_in_other_lang')} →
    </Link>
  );
}
