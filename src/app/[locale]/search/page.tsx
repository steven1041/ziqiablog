import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/i18n';
import { SearchBox } from '@/components/SearchBox';
import { Suspense } from 'react';
import type { Locale } from '@/lib/types';

export default function SearchPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  return (
    <Suspense fallback={<div className="py-12 text-center text-on-surface-variant">Loading…</div>}>
      <SearchBox locale={locale} />
    </Suspense>
  );
}
