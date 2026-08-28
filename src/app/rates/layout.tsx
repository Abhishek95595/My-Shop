import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Showroom Reference Rates',
  description:
    'View manually entered reference rates from Khushi Ornament House and confirm final rates directly with the showroom.',
  alternates: { canonical: '/rates' },
};

export default function RatesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
