import type { Metadata } from 'next';
import { ThemeProvider } from '@/providers/theme-provider';
import '@/styles/globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://ziqia.cc'),
  title: { default: 'ziqia.cc — AI 开发技术博客', template: '%s — ziqia.cc' },
  description: '关于提示工程、AI 编码工作流、工具生态等 AI 开发技术文章',
  openGraph: {
    type: 'website',
    siteName: 'ziqia.cc',
    locale: 'zh_CN',
    url: 'https://ziqia.cc',
  },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: 'https://ziqia.cc/cn/' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}