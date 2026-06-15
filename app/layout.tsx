import type { Metadata } from 'next';
import { Figtree } from 'next/font/google';
import './globals.css';

const figtree = Figtree({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-figtree',
});

export const metadata: Metadata = {
  title: 'G2 Quiz Arena',
  description: 'Real-time trivia battles powered by G2 — no login required',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={figtree.variable}>
      <body style={{ fontFamily: 'var(--font-figtree), Inter, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
