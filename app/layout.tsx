import type { Metadata } from 'next';
import { Barlow_Condensed, DM_Sans } from 'next/font/google';
import { Providers } from '@/components/Providers';
import './globals.css';

const barlowCondensed = Barlow_Condensed({
  weight: ['700', '900'],
  subsets: ['latin'],
  variable: '--font-barlow-condensed',
  display: 'swap',
});

const dmSans = DM_Sans({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ClubChain — Fantasy Football on Solana',
  description: 'Daily AI-simulated fantasy football leagues on Solana. Entry fee becomes prize pool. No middlemen.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${barlowCondensed.variable} ${dmSans.variable}`}>
      <body className="bg-[#0a0a0f] font-body text-[#f0f0f0] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
