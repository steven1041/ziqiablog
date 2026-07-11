import { notFound } from 'next/navigation';
import Link from 'next/link';
import { isLocale, t, tf, localePath } from '@/lib/i18n';
import { getAllSlugs, getPost, getAllPostsMeta, getTranslation } from '@/lib/posts';
import { CATEGORIES } from '@/lib/categories';
import { extractToc } from '@/lib/toc';
import { MDXContent } from '@/components/MDXContent';
import { TableOfContents } from '@/components/TableOfContents';
import { LangSwitchPost } from '@/components/LangSwitchPost';
import type { Locale } from '@/lib/types';

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const locale = params.locale as Locale;
  return (await getAllSlugs(locale)).map((slug) => ({ slug }));
}

export default async function PostPage({ params }: { params: { locale: string; slug: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const post = await getPost(locale, params.slug);
  if (!post) notFound();
  const cat = CATEGORIES[post.category];
  const toc = extractToc(post.content);
  const all = await getAllPostsMeta(locale);
  const idx = all.findIndex((p) => p.slug === post.slug);
  const prev = all[idx + 1] ?? null;
  const next = all[idx - 1] ?? null;
  const translation = await getTranslation(locale === 'cn' ? 'en' : 'cn', post.translationKey);

  return (
    <div className="py-8">
      <div className="grid gap-10 lg:grid-cols-[1fr_220px]">
        <article>
          <div className="mb-6">
            <span className="inline-block rounded-full px-3 py-1 text-xs font-bold" style={{ background: cat.bgColor, color: cat.color }}>{cat.label[locale]}</span>
            <h1 className="mt-4 font-heading text-3xl font-bold leading-tight tracking-tight md:text-4xl">{post.title}</h1>
            <div className="mt-3 flex items-center gap-3 text-sm text-on-surface-variant">
              <span className="grid h-9 w-9 place-items-center rounded-full font-bold text-white" style={{ background: `linear-gradient(135deg, ${cat.color}, #34A853)` }}>A</span>
              <span>Alex Chen · {post.date} · {tf(locale,'reading_time')(post.readingTime)}</span>
            </div>
            {translation && <LangSwitchPost locale={locale} targetSlug={translation.slug} /> }
          </div>
          <div className="prose prose-neutral max-w-none dark:prose-invert">
            <MDXContent source={post.content} />
          </div>
          <nav className="mt-12 flex justify-between gap-4 border-t border-outline-variant pt-6">
            {prev ? (
              <Link href={localePath(locale,'posts',prev.slug)+'/'} className="text-sm">
                <span className="text-on-surface-variant">{t(locale,'previous')}</span>
                <span className="block font-bold">{prev.title}</span>
              </Link>
            ) : <span />}
            {next ? (
              <Link href={localePath(locale,'posts',next.slug)+'/'} className="text-right text-sm">
                <span className="text-on-surface-variant">{t(locale,'next')}</span>
                <span className="block font-bold">{next.title}</span>
              </Link>
            ) : <span />}
          </nav>
        </article>
        <TableOfContents items={toc} locale={locale} />
      </div>
    </div>
  );
}
