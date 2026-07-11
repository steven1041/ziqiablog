'use client';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface PagefindResult {
  id: string;
  data: () => Promise<{ url: string; meta: { title: string }; excerpt: string }>;
  score: number;
}

interface PagefindModule {
  search: (query: string) => Promise<{ results: PagefindResult[] }>;
}

export function SearchBox({ locale }: { locale: 'cn' | 'en' | 'all' }) {
  const params = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const [results, setResults] = useState<PagefindResult[]>([]);
  const [loaded, setLoaded] = useState(false);
  const lib = useRef<PagefindModule | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mod = await import(/* webpackIgnore: true */ '/pagefind/pagefind.js' as string);
      if (!cancelled && mod && typeof mod.search === 'function') {
        lib.current = mod as PagefindModule;
        setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!q || !lib.current) { setResults([]); return; }
    let cancelled = false;
    (async () => {
      const { results } = await lib.current!.search(q);
      const resolved = await Promise.all(results.slice(0, 30).map(async (r) => {
        const data = await r.data();
        return { r, data };
      }));
      const localeFiltered = locale === 'all' ? resolved : resolved.filter(({ data }) => data.url.startsWith(`/${locale}/`));
      if (!cancelled) setResults(localeFiltered.map((m) => m.r));
    })();
    return () => { cancelled = true; };
  }, [q, loaded, locale]);

  return (
    <div className="mx-auto max-w-2xl py-12">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="搜索文章…"
        className="w-full rounded-full border border-outline-variant px-5 py-3 text-base outline-none focus:border-google-blue-cta"
        aria-label="Search"
      />
      {!q && <p className="mt-8 text-center text-on-surface-variant">输入关键词开始搜索</p>}
      {q && results.length === 0 && loaded && <p className="mt-8 text-center text-on-surface-variant">没有找到相关结果</p>}
      <ul className="mt-6 space-y-3">
        {results.map((r) => <ResultItem key={r.id} result={r} />)}
      </ul>
    </div>
  );
}

function ResultItem({ result }: { result: PagefindResult }) {
  const [data, setData] = useState<null | { url: string; meta: { title: string }; excerpt: string }>(null);
  useEffect(() => { result.data().then(setData); }, [result]);
  if (!data) return null;
  return (
    <li>
      <a href={data.url} className="block rounded-card border border-outline-variant p-4 transition-colors hover:bg-surface-variant">
        <div className="font-bold">{data.meta.title}</div>
        <div className="mt-1 text-sm text-on-surface-variant" dangerouslySetInnerHTML={{ __html: data.excerpt }} />
      </a>
    </li>
  );
}
