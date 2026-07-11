import { Inter, Roboto, Noto_Sans_SC } from 'next/font/google';
import { ThemeProvider } from '@/providers/theme-provider';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-heading', display: 'swap' });
const roboto = Roboto({ subsets: ['latin'], weight: ['300','400','500','700'], variable: '--font-body', display: 'swap' });
const notoSC = Noto_Sans_SC({ subsets: ['latin'], variable: '--font-noto-sc', display: 'swap' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className={`${inter.variable} ${roboto.variable} ${notoSC.variable}`}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}