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
    <section className="max-w-7xl mx-auto px-3 sm:px-6 space-y-4 sm:space-y-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-2.5 sm:gap-4 border-b border-gold-200/60 pb-3 sm:pb-4">
        <div className="space-y-1 sm:space-y-2">
          <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-gold-800 uppercase tracking-widest bg-gold-50 border border-gold-300/80 px-2.5 py-0.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-gold-700" />
            <span>Curated Showcase</span>
          </div>
          <h2 className="text-xl sm:text-3xl md:text-4xl font-serif font-bold text-maroon-950">
            Featured Gold Jewellery
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-charcoal-600 font-sans max-w-2xl leading-relaxed">
            Showcasing hallmark craftsmanship across heirloom bridal sets, floral rings, sacred mangalsutras, and pure gold chains.
          </p>
        </div>

        <Link
          href="/catalogue"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-maroon-900 hover:text-maroon-950 bg-gold-100/70 hover:bg-gold-200/80 border border-gold-300/80 px-3.5 py-2 rounded-xl transition-all group flex-shrink-0 self-start md:self-auto min-h-[40px] shadow-xs active:scale-95"
        >
          <span>Explore All Designs</span>
          <ArrowRight className="w-3.5 h-3.5 text-gold-800 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Products Grid - 2 columns on mobile, 3 on tablet, 4 on desktop */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
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
