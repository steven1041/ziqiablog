import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { isLocale, LOCALES, t } from '@/lib/i18n';
import { categoryList } from '@/lib/categories';
import { getPostsCountPerCategory } from '@/lib/posts';
import { CategoryIcon } from '@/components/CategoryIcon';
import type { Locale } from '@/lib/types';

export const metadata: Metadata = {
  title: '文章分类',
  description: '按主题浏览所有 AI 开发文章',
  alternates: { canonical: 'https://ziqia.cc/cn/categories/' },
};

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function CategoriesIndex({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const cats = categoryList();
  const counts = await getPostsCountPerCategory(locale);
  return (
    <div className="py-10">
      <h1 className="mb-7 font-heading text-3xl font-bold tracking-tight">{t(locale,'categories')}</h1>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {cats.map((c) => (
          <Link key={c.id} href={`/${locale}/categories/${c.id}/`} className="flex items-center gap-4 rounded-card border border-outline-variant bg-surface-dim p-5 transition-colors hover:bg-surface">
            <CategoryIcon category={c.id} size={44} />
            <div>
              <div className="font-heading font-bold">{c.label}</div>
              <div className="text-sm text-on-surface-variant">{counts[c.id] ?? 0} {t(locale,'articles')}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
