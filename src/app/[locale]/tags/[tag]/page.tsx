import { notFound } from 'next/navigation';
import { isLocale, t } from '@/lib/i18n';
import { getPostsByTag, getAllTags } from '@/lib/posts';
import { ArticleCard } from '@/components/ArticleCard';
import type { Locale } from '@/lib/types';

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) return [];
  const locale = params.locale as Locale;
  return (await getAllTags(locale)).map((tag) => ({ tag }));
}

export default async function TagPage({ params }: { params: { locale: string; tag: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const posts = await getPostsByTag(locale, params.tag);
  return (
    <div className="py-10">
      <h1 className="mb-7 font-heading text-3xl font-bold tracking-tight">#{params.tag}</h1>
      {posts.length === 0 ? (
        <p className="text-on-surface-variant">—</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => <ArticleCard key={p.slug} post={p} locale={locale} />)}
        </div>
      )}
    </div>
  );
}
