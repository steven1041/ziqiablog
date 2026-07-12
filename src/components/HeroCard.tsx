import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';
import { t, tf, localePath } from '@/lib/i18n';
import { formatDate } from '@/lib/date';
import type { Locale, PostMeta } from '@/lib/types';

export function HeroCard({ post, locale }: { post: PostMeta; locale: Locale }) {
  const cat = CATEGORIES[post.category];
  const href = localePath(locale, 'posts', post.slug) + '/';
  return (
    <div className="grid gap-0 overflow-hidden rounded-hero border border-outline-variant bg-surface-dim md:grid-cols-[1.3fr_1fr]">
      <div
        className="relative flex min-h-[260px] items-center justify-center overflow-hidden p-10 text-white md:min-h-[420px]"
        style={{ background: `linear-gradient(135deg, ${cat.color} 0%, #174EA6 100%)` }}
      >
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/15" />
        <div className="relative z-10 text-center">
          <span className="mb-5 inline-block rounded-full border border-white/30 bg-white/20 px-4 py-1 text-xs font-medium backdrop-blur">
            {t(locale,'featured')}
          </span>
          <div className="font-heading text-5xl font-bold tracking-tight">
            {post.title.split(' ').slice(0,3).join(' ')}
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center p-8 md:p-12">
        <div className="mb-3 font-heading text-[13px] font-bold uppercase tracking-wider text-google-blue-cta">{t(locale,'featured')}</div>
        <h1 className="mb-4 font-heading text-2xl font-bold leading-tight tracking-tight md:text-4xl">{post.title}</h1>
        <p className="mb-7 max-w-md text-base leading-relaxed text-on-surface-variant">{post.excerpt}</p>
        <div className="flex items-center gap-3 border-t border-outline-variant pt-5">
          <span className="grid h-10 w-10 place-items-center rounded-full font-bold text-white" style={{ background: `linear-gradient(135deg, ${cat.color}, #34A853)` }}>Z</span>
          <div className="text-sm">
            <div className="font-bold">ZiQia.cc</div>
            <div className="text-[13px] text-on-surface-variant">{formatDate(post.date)} · {tf(locale,'reading_time')(post.readingTime)}</div>
          </div>
          <Link href={href} className="ml-auto rounded-full bg-google-blue-cta px-6 py-3 text-sm font-bold text-white shadow-[0_1px_3px_rgba(60,64,67,0.3)] transition-colors hover:bg-[#1765CC]">
            {t(locale,'read_more')}
          </Link>
        </div>
      </div>
    </div>
  );
}
