import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 py-12 text-center">
      <h1 className="font-heading text-6xl font-bold text-on-surface-variant">404</h1>
      <p className="mt-4 text-lg text-on-surface-variant">页面未找到</p>
      <Link href="/cn/" className="mt-6 rounded-full bg-google-blue-cta px-6 py-2.5 text-sm font-bold text-white">
        返回首页
      </Link>
    </div>
  );
}
