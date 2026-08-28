import type { Metadata } from 'next';
import { STORE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: {
    default: 'Gold Jewellery Catalogue',
    template: `%s | ${STORE_NAME}`,
  },
  description:
    'Browse the Khushi Ornament House gold jewellery catalogue, including rings, necklaces, chains, mangalsutras, and bangles.',
  alternates: { canonical: '/catalogue' },
};

export default function CatalogueLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
