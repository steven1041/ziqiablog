'use client';
import { useEffect, useRef, useState } from 'react';
import type { TocItem } from '@/lib/toc';
import { t } from '@/lib/i18n';
import type { Locale } from '@/lib/types';

export function TableOfContents({ items, locale }: { items: TocItem[]; locale: Locale }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (items.length === 0) return;
    const els = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (els.length === 0) return;
    observer.current?.disconnect();
    observer.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a,b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    );
    els.forEach((el) => observer.current!.observe(el));
    return () => observer.current?.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <aside className="sticky top-24 hidden max-h-[calc(100vh-7rem)] overflow-auto lg:block">
      <div className="mb-3 font-heading text-sm font-bold text-on-surface-variant">{t(locale,'table_of_contents')}</div>
      <nav className="space-y-1 text-sm">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`block border-l-2 py-1 transition-colors ${item.level === 3 ? 'pl-5' : 'pl-3'} ${activeId === item.id ? 'border-google-blue-cta text-google-blue-cta' : 'border-outline-variant text-on-surface-variant hover:text-on-surface'}`}
          >
            {item.text}
          </a>
        ))}
      </nav>
    </aside>
  );
}
