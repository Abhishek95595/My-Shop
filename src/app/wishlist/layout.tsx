import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Wishlist',
  alternates: { canonical: '/wishlist' },
  robots: { index: false, follow: false },
};

export default function WishlistLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
