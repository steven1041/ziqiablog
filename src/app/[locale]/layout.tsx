import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LOCALES, isLocale } from '@/lib/i18n';
import type { Locale } from '@/lib/types';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params?: { locale?: string };
}) {
  if (!params || !params.locale || !isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const currentPath = `/${locale}`;
  return (
    <>
      <Header locale={locale} currentPath={currentPath} />
      <main className="mx-auto max-w-[1280px] px-5 md:px-10">{children}</main>
      <Footer locale={locale} />
    </>
  );
}
