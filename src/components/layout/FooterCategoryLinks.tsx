'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getAvailableCategories, ProductCategory } from '@/lib/constants';
import { productRepository } from '@/services/products/productRepository';
import { Product } from '@/services/productTypes';
import { RepositoryStatus } from '@/services/types';

export const FooterCategoryLinks: React.FC = () => {
  const [publishedProducts, setPublishedProducts] = useState<Product[]>([]);
  const [loadStatus, setLoadStatus] = useState<RepositoryStatus>('loading');

  useEffect(() => {
    const handleSync = () => {
      setPublishedProducts(productRepository.getPublishedProducts());
      setLoadStatus(productRepository.getPublishedStatus());
    };
    handleSync();
    window.addEventListener('koh_products_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('koh_products_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const availableCategories = useMemo(() => {
    return getAvailableCategories(publishedProducts);
  }, [publishedProducts]);

  // Loading skeleton while Firebase initializes to prevent brief empty display
  if (loadStatus === 'loading') {
    return (
      <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-charcoal-400 font-sans animate-pulse">
        <div className="h-3.5 bg-gold-200/50 rounded w-20" />
        <div className="h-3.5 bg-gold-200/50 rounded w-24" />
        <div className="h-3.5 bg-gold-200/50 rounded w-16" />
        <div className="h-3.5 bg-gold-200/50 rounded w-22" />
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-charcoal-700 font-sans">
      {availableCategories.map((cat: ProductCategory) => (
        <li key={cat}>
          <Link
            href={`/catalogue?category=${encodeURIComponent(cat)}`}
            className="hover:text-maroon-800 hover:underline transition-colors block truncate"
            title={cat}
          >
            {cat}
          </Link>
        </li>
      ))}
      <li className="col-span-2 pt-1 border-t border-gold-200/60">
        <Link
          href="/catalogue?occasion=Wedding"
          className="font-semibold text-maroon-800 hover:underline transition-colors"
        >
          Wedding Collection →
        </Link>
      </li>
    </ul>
  );
};
