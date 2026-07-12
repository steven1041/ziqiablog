import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { isLocale, LOCALES, t, tf, localePath } from '@/lib/i18n';
import { getAllSlugs, getPost, getAllPostsMeta } from '@/lib/posts';
import { CATEGORIES } from '@/lib/categories';
import { extractToc } from '@/lib/toc';
import { MDXContent } from '@/components/MDXContent';
import { TableOfContents } from '@/components/TableOfContents';
import type { Locale } from '@/lib/types';

export async function generateStaticParams() {
  const results: { locale: string; slug: string }[] = [];
  for (const locale of LOCALES) {
    const slugs = await getAllSlugs(locale);
    for (const slug of slugs) {
      results.push({ locale, slug });
    }
  }
  return results;
}

export async function generateMetadata({ params }: { params: { locale: string; slug: string } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const post = await getPost(params.locale as Locale, params.slug);
  if (!post) return {};
  const url = `https://ziqia.cc/${params.locale}/posts/${post.slug}/`;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      tags: post.tags,
    },
    twitter: { card: 'summary_large_image' },
  };
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
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  return (
    <div className="py-8">
      {adsenseId && (
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
          crossOrigin="anonymous"
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            datePublished: post.date,
            description: post.excerpt,
            url: `https://ziqia.cc/${locale}/posts/${post.slug}/`,
            author: { '@type': 'Organization', name: 'ZiQia.cc' },
            publisher: { '@type': 'Organization', name: 'ZiQia.cc' },
          }),
        }}
      />
      <div className="grid gap-10 lg:grid-cols-[1fr_220px]">
        <article>
          <div className="mb-6">
            <span className="inline-block rounded-full px-3 py-1 text-xs font-bold" style={{ background: cat.bgColor, color: cat.color }}>{cat.label}</span>
            <h1 className="mt-4 font-heading text-3xl font-bold leading-tight tracking-tight md:text-4xl">{post.title}</h1>
            <div className="mt-3 flex items-center gap-3 text-sm text-on-surface-variant">
              <span className="grid h-9 w-9 place-items-center rounded-full font-bold text-white" style={{ background: `linear-gradient(135deg, ${cat.color}, #34A853)` }}>Z</span>
              <span>ZiQia.cc · {post.date} · {tf(locale,'reading_time')(post.readingTime)}</span>
            </div>
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
