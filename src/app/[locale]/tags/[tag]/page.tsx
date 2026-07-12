import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, LOCALES } from '@/lib/i18n';
import { getPostsByTag, getAllTags } from '@/lib/posts';
import { ArticleCard } from '@/components/ArticleCard';
import type { Locale } from '@/lib/types';

export async function generateStaticParams() {
  const results: { locale: string; tag: string }[] = [];
  for (const locale of LOCALES) {
    const tags = await getAllTags(locale);
    for (const tag of tags) {
      results.push({ locale, tag });
    }
  }
  return results;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; tag: string }> }): Promise<Metadata> {
  const { locale, tag } = await params;
  return {
    title: `#${tag}`,
    description: `包含标签 "${tag}" 的所有文章`,
    alternates: { canonical: `https://ziqia.cc/${locale}/tags/${tag}/` },
  };
}

export default async function TagPage({ params }: { params: Promise<{ locale: string; tag: string }> }) {
  const { locale, tag } = await params;
  if (!isLocale(locale)) notFound();
  const posts = await getPostsByTag(locale as Locale, tag);
  return (
    <div className="py-10">
      <h1 className="mb-7 font-heading text-3xl font-bold tracking-tight">#{tag}</h1>
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
