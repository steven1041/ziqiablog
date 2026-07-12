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

export async function generateMetadata({ params }: { params: Promise<{ locale: string; category: string }> }): Promise<Metadata> {
  const { locale, category } = await params;
  if (!isCategory(category)) return {};
  const cat = CATEGORIES[category];
  return {
    title: cat.label,
    description: `${cat.label} 相关文章`,
    alternates: { canonical: `https://ziqia.cc/${locale}/categories/${category}/` },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ locale: string; category: string }> }) {
  const { locale, category } = await params;
  if (!isLocale(locale) || !isCategory(category)) notFound();
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
