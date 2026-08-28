import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Buying Shortlist',
  alternates: { canonical: '/shortlist' },
  robots: { index: false, follow: false },
};

export default function ShortlistLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
