'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ArrowRight, HeartHandshake, ShieldCheck } from 'lucide-react';
import { Product } from '@/services/productTypes';
import { productRepository } from '@/services/products/productRepository';
import { formatWeight, getPrimaryImage } from '@/services/mockProducts';

export const WeddingCollectionPreview: React.FC = () => {
  const [weddingProducts, setWeddingProducts] = useState<Product[]>([]);

  useEffect(() => {
    const load = () => {
      setWeddingProducts(productRepository.getWeddingPublishedProducts().slice(0, 3));
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

  // Hidden when no wedding products available
  if (weddingProducts.length === 0) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6">
      <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-maroon-950 via-maroon-900 to-maroon-800 text-cream-50 p-4 sm:p-8 lg:p-12 overflow-hidden shadow-card border border-gold-400/30 space-y-5 sm:space-y-8">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-maroon-600/20 rounded-full blur-2xl pointer-events-none" />

        {/* Section Header */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-6 border-b border-gold-300/20 pb-4 sm:pb-6">
          <div className="space-y-1.5 sm:space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 bg-gold-500/20 border border-gold-400/40 text-gold-300 text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>Launch Spotlight</span>
            </div>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-serif font-bold text-cream-50">
              The Royal Wedding Collection
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-cream-200/90 font-sans leading-relaxed">
              Designed for auspicious beginnings. Explore signature bridal sets, wedding bangles, and mangalsutras crafted in 22K gold.
            </p>
          </div>

          <Link
            href="/catalogue?occasion=Wedding"
            className="inline-flex items-center justify-center gap-2 bg-gold-400 hover:bg-gold-500 text-maroon-950 font-bold px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl transition-all shadow-md hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 flex-shrink-0 text-xs sm:text-sm active:scale-95 self-start md:self-auto min-h-[44px]"
          >
            <span>Explore Wedding Collection</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Wedding Highlights Grid - 2 columns on mobile, 3 on desktop */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4 lg:gap-6">
          {weddingProducts.map((product) => {
            const primaryImg = getPrimaryImage(product.images);
            return (
              <Link
                key={product.id}
                href={`/catalogue/${product.slug}`}
                className="group bg-maroon-900/60 hover:bg-maroon-900/90 border border-gold-300/30 hover:border-gold-400 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 transition-all duration-300 flex flex-col space-y-2 sm:space-y-4 shadow-sm active:scale-[0.98]"
              >
                <div className="relative aspect-square w-full rounded-lg sm:rounded-xl overflow-hidden bg-cream-50/10">
                  {primaryImg && (
                    <Image
                      src={primaryImg.url}
                      alt={primaryImg.altText || product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-gold-400 text-maroon-950 text-[9px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full shadow-xs">
                    {product.purity} Gold
                  </span>
                </div>

                <div className="space-y-1 sm:space-y-1.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-xs sm:text-base text-cream-50 group-hover:text-gold-300 transition-colors line-clamp-1 sm:line-clamp-2">
                      {product.name}
                    </h3>
                    {product.shortDescription?.trim() ? (
                      <p className="hidden sm:block text-xs text-cream-200/70 font-sans line-clamp-2">
                        {product.shortDescription}
                      </p>
                    ) : null}
                  </div>

                  <div className="pt-1 sm:pt-2 flex items-center justify-between text-[10px] sm:text-xs text-gold-300 border-t border-gold-300/20">
                    <span className="font-serif font-semibold">Approx. {formatWeight(product.approxWeight)}</span>
                    <span className="font-medium group-hover:underline inline-flex items-center gap-0.5 sm:gap-1">
                      View <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Wedding Highlights Bottom Strip */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 pt-1 text-xs text-cream-200 font-sans">
          <div className="flex items-center gap-2 bg-maroon-900/40 p-2.5 sm:p-3 rounded-xl border border-gold-300/20">
            <HeartHandshake className="w-4 h-4 text-gold-400 flex-shrink-0" />
            <span className="text-[11px] sm:text-xs">Bridal trousseau consultation available at our Gorakhpur showroom.</span>
          </div>
          <div className="flex items-center gap-2 bg-maroon-900/40 p-2.5 sm:p-3 rounded-xl border border-gold-300/20">
            <ShieldCheck className="w-4 h-4 text-gold-400 flex-shrink-0" />
            <span className="text-[11px] sm:text-xs">Final weight, purity, and availability confirmed at the showroom.</span>
          </div>
        </div>
      </div>
    </section>
  );
};
