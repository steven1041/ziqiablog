import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/i18n';
import { SearchBox } from '@/components/SearchBox';
import { Suspense } from 'react';
import type { Locale } from '@/lib/types';

export const metadata: Metadata = {
  title: '搜索',
  description: '搜索 ziqia.cc 上的文章',
  alternates: { canonical: 'https://ziqia.cc/cn/search/' },
  robots: { index: false, follow: true },
};

export default function SearchPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  return (
    <Suspense fallback={<div className="py-12 text-center text-on-surface-variant">Loading…</div>}>
      <SearchBox locale={locale} />
    </Suspense>
  );
}
