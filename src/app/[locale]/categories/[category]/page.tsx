import { notFound } from 'next/navigation';
import { isLocale, t } from '@/lib/i18n';
import { getPostsByCategory } from '@/lib/posts';
import { CATEGORIES, isCategory, categoryList } from '@/lib/categories';
import { ArticleCard } from '@/components/ArticleCard';
import type { Locale, Category } from '@/lib/types';

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  return categoryList().map((c) => ({ category: c.id }));
}

export default async function CategoryPage({ params }: { params: { locale: string; category: string } }) {
  if (!isLocale(params.locale) || !isCategory(params.category)) notFound();
  const locale = params.locale as Locale;
  const category = params.category as Category;
  const posts = await getPostsByCategory(locale, category);
  const cat = CATEGORIES[category];
  return (
    <div className="py-10">
      <h1 className="mb-7 font-heading text-3xl font-bold tracking-tight">{cat.label[locale]}</h1>
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
