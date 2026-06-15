import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'G2 Quiz Arena',
  description: 'Real-time trivia game powered by G2',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
