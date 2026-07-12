'use client';
import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { Locale } from '@/lib/types';

const SearchBox = dynamic(
  () => import('@/components/SearchBox').then((mod) => ({ default: mod.SearchBox })),
  { ssr: false }
) as ComponentType<{ locale: Locale }>;

export function SearchBoxClient({ locale }: { locale: Locale }) {
  return <SearchBox locale={locale} />;
}
