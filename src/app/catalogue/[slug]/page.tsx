import React from 'react';
import { Metadata } from 'next';
import {
  getAllPublishedProducts,
  getProductBySlug,
} from '@/services/mockProducts';
import { ClientProductDetailResolver } from '@/components/products/ClientProductDetailResolver';
import { STORE_NAME } from '@/lib/constants';

interface ProductDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const products = getAllPublishedProducts();
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {
      title: `Gold Jewellery | ${STORE_NAME}`,
      description:
        'Explore exquisite gold jewellery collections crafted with 25+ years of trust at Khushi Ornament House in Gorakhpur.',
    };
  }

  return {
    title: `${product.name} (${product.purity} Gold) | ${STORE_NAME}`,
    description: product.shortDescription,
    openGraph: {
      title: `${product.name} | ${STORE_NAME}`,
      description: product.shortDescription,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const initialProduct = getProductBySlug(slug) || null;

  return (
    <ClientProductDetailResolver
      slug={slug}
      initialProduct={initialProduct}
    />
  );
}
