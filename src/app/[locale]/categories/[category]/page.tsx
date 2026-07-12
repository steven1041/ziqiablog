import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, LOCALES } from '@/lib/i18n';
import { getPostsByCategory } from '@/lib/posts';
import { CATEGORIES, isCategory, categoryList } from '@/lib/categories';
import { ArticleCard } from '@/components/ArticleCard';
import type { Locale, Category } from '@/lib/types';

export async function generateStaticParams() {
  const cats = categoryList();
  return LOCALES.flatMap((locale) => cats.map((c) => ({ locale, category: c.id })));
}

export async function generateMetadata({ params }: { params: { locale: string; category: string } }): Promise<Metadata> {
  if (!isCategory(params.category)) return {};
  const cat = CATEGORIES[params.category];
  return {
    title: cat.label,
    description: `${cat.label} 相关文章`,
    alternates: { canonical: `https://ziqia.cc/${params.locale}/categories/${params.category}/` },
  };
}

export default async function CategoryPage({ params }: { params: { locale: string; category: string } }) {
  if (!isLocale(params.locale) || !isCategory(params.category)) notFound();
  const locale = params.locale as Locale;
  const category = params.category as Category;
  const posts = await getPostsByCategory(locale, category);
  const cat = CATEGORIES[category];
  return (
    <div className="py-10">
      <h1 className="mb-7 font-heading text-3xl font-bold tracking-tight">{cat.label}</h1>
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
