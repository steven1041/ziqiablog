import { notFound } from 'next/navigation';
import { isLocale, LOCALES } from '@/lib/i18n';
import { getAbout } from '@/lib/about';
import { MDXContent } from '@/components/MDXContent';
import type { Locale } from '@/lib/types';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function AboutPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const about = await getAbout(locale);
  if (!about) notFound();
  return (
    <div className="prose prose-neutral mx-auto max-w-2xl py-12 dark:prose-invert">
      <MDXContent source={about.content} />
    </div>
  );
}
