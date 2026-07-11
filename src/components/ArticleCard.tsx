import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';
import { t, tf } from '@/lib/i18n';
import type { Locale, PostMeta } from '@/lib/types';
import { localePath } from '@/lib/i18n';

export function ArticleCard({ post, locale }: { post: PostMeta; locale: Locale }) {
  const cat = CATEGORIES[post.category];
  const href = localePath(locale, 'posts', post.slug) + '/';
  return (
    <article className="group overflow-hidden rounded-card border border-outline-variant bg-surface transition-shadow hover:shadow-[0_1px_3px_rgba(60,64,67,0.15),0_4px_12px_rgba(60,64,67,0.1)]">
      <Link href={href} className="block">
        <div
          className="h-36 w-full"
          style={{ background: `linear-gradient(135deg, ${cat.bgColor} 0%, ${cat.color} 60%, ${cat.color} 100%)` }}
        >
          <span
            className="m-3 inline-block rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold backdrop-blur"
            style={{ color: cat.color }}
          >
            {cat.label[locale]}
          </span>
        </div>
        <div className="p-4">
          <h3 className="mb-2 text-lg font-bold leading-snug">{post.title}</h3>
          <p className="mb-4 text-sm leading-relaxed text-on-surface-variant">{post.excerpt}</p>
          <div className="flex items-center justify-between text-[13px] text-on-surface-variant">
            <span>{post.date.slice(0,7)} · {tf(locale,'reading_time')(post.readingTime)}</span>
            <span className="font-semibold text-google-blue-cta">{t(locale,'read_more')} →</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
