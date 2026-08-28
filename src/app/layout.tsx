import type { Metadata } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FloatingWhatsApp } from '@/components/layout/FloatingWhatsApp';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Khushi Ornament House | 25+ Years of Trust | Gorakhpur Gold Jewellery',
  description:
    'Explore exquisite 22K and 18K bridal gold jewellery, bespoke necklaces, bangles, and custom heirlooms at Khushi Ornament House in Gorakhpur. Quality craftsmanship and competitive rates.',
  icons: {
    icon: '/assets/khushi-logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${plusJakarta.variable}`}>
      <body className="min-h-screen flex flex-col bg-cream-100 text-charcoal-900 font-sans selection:bg-maroon-700 selection:text-cream-50">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
