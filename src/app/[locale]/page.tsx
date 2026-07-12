import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, LOCALES, t } from '@/lib/i18n';
import { getAllPostsMeta, getFeatured } from '@/lib/posts';
import { categoryList } from '@/lib/categories';
import { HeroCard } from '@/components/HeroCard';
import { ArticleCard } from '@/components/ArticleCard';
import { CategoryIcon } from '@/components/CategoryIcon';
import type { Locale } from '@/lib/types';

export const metadata: Metadata = {
  title: 'ZiQia.cc — AI 开发技术博客',
  description: '关于提示工程、AI 编码工作流、工具生态等 AI 开发技术文章',
  alternates: { canonical: 'https://ziqia.cc/cn/' },
};

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [featured, posts] = await Promise.all([getFeatured(locale), getAllPostsMeta(locale)]);
  const recent = posts.filter((p) => !p.featured).slice(0, 6);
  const cats = categoryList();

  return (
    <div className="py-8 md:py-10">
      {featured && (
        <section className="mb-8">
          <HeroCard post={featured} locale={locale} />
        </section>
      )}
      <section className="mb-10">
        <div className="mb-7 flex items-end justify-between border-b border-outline-variant pb-4">
          <div>
            <h2 className="font-heading text-2xl font-bold tracking-tight">{t(locale,'recent_posts')}</h2>
            <p className="mt-1 text-sm text-on-surface-variant">{t(locale,'recent_posts_sub')}</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recent.map((p) => <ArticleCard key={p.slug} post={p} locale={locale} />)}
        </div>
      </section>
      <section>
        <div className="mb-7 flex items-end justify-between border-b border-outline-variant pb-4">
          <div>
            <h2 className="font-heading text-2xl font-bold tracking-tight">{t(locale,'browse_categories')}</h2>
            <p className="mt-1 text-sm text-on-surface-variant">{t(locale,'browse_categories_sub')}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 md:grid-cols-5 lg:grid-cols-9">
          {cats.map((c) => (
            <CategoryIcon key={c.id} category={c.id} size={56} label={c.label} href={`/${locale}/categories/${c.id}/`} />
          ))}
        </div>
      </section>
    </div>
  );
}
