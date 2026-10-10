import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Providers } from '@/providers';

export const metadata: Metadata = {
  title: 'Dream App',
  description: 'An app for your dreams!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        {' '}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
