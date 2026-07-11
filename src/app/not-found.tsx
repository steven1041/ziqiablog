import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="font-heading text-6xl font-bold text-google-blue-cta">404</p>
        <p className="mt-3 text-on-surface-variant">Page not found.</p>
        <Link href="/cn" className="mt-6 inline-block rounded-full bg-google-blue-cta px-5 py-2.5 text-sm font-bold text-white">Back home →</Link>
      </div>
    </div>
  );
}
