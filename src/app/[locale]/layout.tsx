import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LOCALES, isLocale } from '@/lib/i18n';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const currentPath = `/${locale}`;
  return (
    <>
      <Header locale={locale} currentPath={currentPath} />
      <main className="mx-auto max-w-[1280px] px-5 md:px-10">{children}</main>
      <Footer />
    </>
  );
}
