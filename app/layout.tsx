import type { Metadata, Viewport } from 'next';
import { Fredoka, Nunito } from 'next/font/google';
import './globals.css';

const fredoka = Fredoka({
  subsets: ['latin'],
  variable: '--font-fredoka',
});

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'CUZO - Kids Chess Learning Game',
  description: 'A fun and interactive way for kids to learn and play chess!',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${fredoka.variable} ${nunito.variable}`}>
      <body className="antialiased font-sans" suppressHydrationWarning>{children}</body>
    </html>
  );
}
