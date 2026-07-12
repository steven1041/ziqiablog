import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/i18n';
import { SearchBox } from '@/components/SearchBox';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: '搜索',
  description: '搜索 ZiQia.cc 上的文章',
  alternates: { canonical: 'https://ziqia.cc/cn/search/' },
  robots: { index: false, follow: true },
};

export default async function SearchPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <Suspense fallback={<div className="py-12 text-center text-on-surface-variant">Loading…</div>}>
      <SearchBox locale={locale} />
    </Suspense>
  );
}
