import Link from 'next/link';
import { LOCALES, t, isLocale } from '@/lib/i18n';
import type { Locale } from '@/lib/types';

export default function LocaleNotFound({ params }: { params: { locale: string } }) {
  // fallback to cn if locale invalid (shouldn't happen because parent notFound triggers 404)
  const locale: Locale = isLocale(params.locale) ? params.locale : 'en';
  return (
    <div className="grid min-h-[60vh] place-items-center px-6 text-center">
      <div>
        <p className="font-heading text-7xl font-bold text-google-blue-cta">404</p>
        <p className="mt-3 text-lg text-on-surface-variant">{t(locale,'page_not_found')}</p>
        <Link href={`/${locale}`} className="mt-6 inline-block rounded-full border border-outline-variant px-5 py-2.5 text-sm font-bold transition-colors hover:bg-surface-variant">
          {t(locale,'back_home')} →
        </Link>
      </div>
    </div>
  );
}
