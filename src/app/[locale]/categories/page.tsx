import { notFound } from 'next/navigation';
import Link from 'next/link';
import { isLocale, t } from '@/lib/i18n';
import { categoryList } from '@/lib/categories';
import { getPostsCountPerCategory } from '@/lib/posts';
import { CategoryIcon } from '@/components/CategoryIcon';
import type { Locale } from '@/lib/types';

export default async function CategoriesIndex({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const cats = categoryList();
  const counts = await getPostsCountPerCategory(locale);
  return (
    <div className="py-10">
      <h1 className="mb-7 font-heading text-3xl font-bold tracking-tight">{t(locale,'categories')}</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cats.map((c) => (
          <Link key={c.id} href={`/${locale}/categories/${c.id}/`} className="flex items-center gap-4 rounded-card border border-outline-variant bg-surface-dim p-5 transition-colors hover:bg-surface">
            <CategoryIcon category={c.id} size={44} />
            <div>
              <div className="font-heading font-bold">{c.label[locale]}</div>
              <div className="text-sm text-on-surface-variant">{counts[c.id] ?? 0} {t(locale,'articles')}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
