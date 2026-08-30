'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '@/services/productTypes';
import { productRepository } from '@/services/products/productRepository';
import { ProductCard } from '@/components/products/ProductCard';

export const FeaturedProductsSection: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const load = () => {
      setFeaturedProducts(productRepository.getFeaturedPublishedProducts());
    };

    load();

    const handleUpdate = () => load();
    window.addEventListener('koh_products_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('koh_products_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Hidden when no featured published products available
  if (featuredProducts.length === 0) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-800 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-gold-700" />
            <span>Showcase Pieces</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-maroon-950">
            Featured Gold Jewellery
          </h2>
          <p className="text-sm sm:text-base text-charcoal-600 font-sans max-w-2xl">
            Showcasing our craftsmanship across wedding sets, daily rings, sacred mangalsutras, and solid curb chains.
          </p>
        </div>

        <Link
          href="/catalogue"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-maroon-800 hover:text-maroon-950 group flex-shrink-0"
        >
          <span>Explore All Designs</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {featuredProducts.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            eagerImage={index === 0}
          />
        ))}
      </div>
    </section>
  );
};
