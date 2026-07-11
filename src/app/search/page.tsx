import { SearchBox } from '@/components/SearchBox';
import { Suspense } from 'react';

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-on-surface-variant">Loading…</div>}>
      <SearchBox locale="all" />
    </Suspense>
  );
}
