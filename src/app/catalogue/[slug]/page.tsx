import React from 'react';
import { Metadata } from 'next';
import { db, isFirebaseConfigured } from '@/lib/firebase/client';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Product } from '@/services/productTypes';
import { ClientProductDetailResolver } from '@/components/products/ClientProductDetailResolver';
import { STORE_NAME } from '@/lib/constants';

interface ProductDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * In Firebase mode, uses a direct Firestore query constrained to published
 * products. Returns [] when Firestore is unavailable so the build never fails —
 * product detail pages still work dynamically through the client resolver.
 */
export async function generateStaticParams() {
  if (!isFirebaseConfigured || !db) return [];

  try {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('status', '==', 'published'));
    const snapshot = await getDocs(q);
    const params: { slug: string }[] = [];
    snapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      if (data && data.slug) {
        params.push({ slug: data.slug });
      }
    });
    return params;
  } catch (err) {
    console.warn('generateStaticParams failed to fetch products from Firestore:', err);
    return [];
  }
}

/**
 * In Firebase mode, uses a direct Firestore query for the slug to generate
 * metadata. Falls back to generic metadata when Firestore is unavailable or
 * the product is not found.
 */
export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;

  let product: Product | null = null;

  if (isFirebaseConfigured && db) {
    try {
      const productsRef = collection(db, 'products');
      const q = query(
        productsRef,
        where('slug', '==', slug),
        where('status', '==', 'published')
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        product = { ...data, id: snapshot.docs[0].id } as Product;
      }
    } catch (err) {
      console.warn('generateMetadata failed to fetch product from Firestore:', err);
    }
  }

  if (!product) {
    return {
      title: 'Gold Jewellery',
      description:
        'Explore exquisite gold jewellery collections crafted with 25+ years of trust at Khushi Ornament House in Gorakhpur.',
      alternates: { canonical: `/catalogue/${slug}` },
    };
  }

  const pageDescription =
    product.shortDescription?.trim() ||
    product.detailedDescription?.trim() ||
    `Explore handcrafted ${product.purity} ${product.category} at ${STORE_NAME} in Gorakhpur. 25+ Years of Trust.`;

  return {
    title: `${product.name} (${product.purity} Gold)`,
    description: pageDescription,
    alternates: { canonical: `/catalogue/${slug}` },
    openGraph: {
      title: `${product.name} | ${STORE_NAME}`,
      description: pageDescription,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;

  return (
    <ClientProductDetailResolver
      slug={slug}
      initialProduct={null}
    />
  );
}
