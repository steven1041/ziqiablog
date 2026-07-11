import { notFound } from 'next/navigation';
import Link from 'next/link';
import { isLocale, t } from '@/lib/i18n';
import { getAllTags } from '@/lib/posts';
import type { Locale } from '@/lib/types';

export default async function TagsIndex({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const tags = await getAllTags(locale);
  return (
    <div className="py-10">
      <h1 className="mb-7 font-heading text-3xl font-bold tracking-tight">{t(locale,'tags')}</h1>
      <div className="flex flex-wrap gap-2.5">
        {tags.map((tg) => (
          <Link key={tg} href={`/${locale}/tags/${tg}/`} className="rounded-full border border-outline-variant px-4 py-2 text-sm font-semibold transition-colors hover:bg-surface-variant">#{tg}</Link>
        ))}
      </div>
    </div>
  );
}
