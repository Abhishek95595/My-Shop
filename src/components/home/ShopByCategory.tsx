'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CircleDot,
  Link as LinkIcon,
  Heart,
  Circle,
  Award,
  Flame,
  Crown,
  Layers,
  Gem,
  User,
  Baby,
  Coins,
} from 'lucide-react';
import { Product } from '@/services/productTypes';
import {
  ProductCategory,
  getAvailableCategoryDefinitions,
} from '@/lib/constants';
import { productRepository } from '@/services/products/productRepository';
import { RepositoryStatus } from '@/services/types';

const CATEGORY_ICON_MAP: Record<ProductCategory, React.ComponentType<{ className?: string }>> = {
  Rings: CircleDot,
  'Necklaces/Sets': Sparkles,
  Chains: LinkIcon,
  Mangalsutra: Heart,
  'Bangles/Kada': Circle,
  Earrings: Sparkles,
  Pendants: Award,
  Bracelets: CircleDot,
  'Nose Pins': Flame,
  'Maang Tikka': Crown,
  Chokers: Layers,
  'Bridal Sets': Gem,
  "Men's Jewellery": User,
  'Kids Jewellery': Baby,
  'Gold Coins': Coins,
};

export const ShopByCategory: React.FC = () => {
  const [showAllMobile, setShowAllMobile] = useState(false);
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

  // Compute live published product counts per category
  const categoryCounts = useMemo(() => {
    const counts: Partial<Record<ProductCategory, number>> = {};
    for (const p of publishedProducts) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    }
    return counts;
  }, [publishedProducts]);

  // Available categories: strictly categories containing at least one published, non-archived product
  const availableCategories = useMemo(() => {
    return getAvailableCategoryDefinitions(publishedProducts);
  }, [publishedProducts]);

  // 1. Loading State: Render skeleton placeholder while Firebase initializes to prevent empty category flashing
  if (loadStatus === 'loading') {
    return (
      <section
        className="max-w-7xl mx-auto px-3 sm:px-6 space-y-4 sm:space-y-6"
        aria-busy="true"
        aria-label="Loading categories"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 sm:gap-4 animate-pulse">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gold-200/60 rounded-full" />
            <div className="h-8 w-64 bg-gold-200/80 rounded-xl" />
            <div className="h-4 w-80 bg-gold-100 rounded-md" />
          </div>
          <div className="h-5 w-36 bg-gold-200/60 rounded-md" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4 lg:gap-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-cream-100 border border-gold-200/60 rounded-xl sm:rounded-2xl overflow-hidden animate-pulse flex flex-col"
            >
              <div className="aspect-square w-full bg-gold-100/50" />
              <div className="p-3 sm:p-4 space-y-2">
                <div className="h-4 w-3/4 bg-gold-200/60 rounded" />
                <div className="h-3 w-1/2 bg-gold-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // 2. Zero-product complete collapse: If no categories contain published products, hide the entire section
  if (availableCategories.length === 0) {
    return null;
  }

  // Mobile progressive disclosure is needed ONLY when available categories exceed the mobile threshold of 6
  const isExpandableOnMobile = availableCategories.length > 6;

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 space-y-4 sm:space-y-6">
      {/* Section Heading */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-2.5 sm:gap-4 border-b border-gold-200/60 pb-3 sm:pb-4">
        <div className="space-y-1 sm:space-y-2">
          <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-gold-800 uppercase tracking-widest bg-gold-50 border border-gold-300/80 px-2.5 py-0.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-gold-700" />
            <span>Curated Collections</span>
          </div>
          <h2 className="text-xl sm:text-3xl md:text-4xl font-serif font-bold text-maroon-950">
            Shop by Gold Category
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-charcoal-600 font-sans max-w-2xl leading-relaxed">
            Explore handcrafted gold jewellery across {availableCategories.length} available categories, from everyday elegance to regal bridal sets.
          </p>
        </div>

        <Link
          href="/catalogue"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-maroon-900 hover:text-maroon-950 bg-gold-100/70 hover:bg-gold-200/80 border border-gold-300/80 px-3.5 py-2 rounded-xl transition-all group flex-shrink-0 self-start md:self-auto min-h-[40px] shadow-xs active:scale-95"
        >
          <span>View Full Catalogue</span>
          <ArrowRight className="w-3.5 h-3.5 text-gold-800 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* 1-Tap Category Quick Chips on Mobile (< sm, hidden on tablet and desktop) - only available categories */}
      <div className="sm:hidden flex items-center gap-2 overflow-x-auto overscroll-x-contain touch-pan-x scrollbar-none py-1.5 -mx-3 px-3">
        {availableCategories.map((item) => (
          <Link
            key={item.name}
            href={`/catalogue?category=${encodeURIComponent(item.name)}`}
            className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-cream-50 to-gold-50/60 text-maroon-950 border border-gold-300/90 hover:bg-gold-100 active:scale-95 transition-all min-h-[40px] flex items-center shadow-xs whitespace-nowrap"
          >
            {item.name}
          </Link>
        ))}
        {/* Trailing spacer ensures final chip is never clipped on narrow viewports */}
        <div className="w-1 flex-shrink-0" aria-hidden="true" />
      </div>

      {/* Categories Grid - Consistent Breakpoint:
          Mobile (< sm): 2 columns, shows top 6 when > 6 available with smooth toggle
          Tablet (sm to lg): 3 columns, all available categories visible
          Desktop (lg+): 5 columns, all available categories visible
      */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4 lg:gap-5">
        {availableCategories.map((item, index) => {
          const isHiddenOnMobile = isExpandableOnMobile && index >= 6 && !showAllMobile;
          const IconComponent = CATEGORY_ICON_MAP[item.name] || Sparkles;
          const count = categoryCounts[item.name] || 0;
          const itemImage = 'image' in item ? (item.image as string) : undefined;

          return (
            <Link
              key={item.name}
              href={`/catalogue?category=${encodeURIComponent(item.name)}`}
              className={`group bg-cream-50 rounded-2xl border border-gold-200/90 hover:border-gold-400/80 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 active:scale-[0.98] ${
                isHiddenOnMobile ? 'hidden sm:flex' : 'flex'
              }`}
            >
              {/* Preview Container: 1:1 Aspect Ratio with Luxury Framing */}
              <div className="relative aspect-square w-full bg-cream-100/70 overflow-hidden border-b border-gold-200/60 flex items-center justify-center">
                {itemImage ? (
                  <Image
                    src={itemImage}
                    alt={`Explore ${item.name}`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-cream-50 via-gold-50/70 to-cream-100 p-4 group-hover:from-gold-100/50 transition-colors">
                    <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-cream-50 border border-gold-300/90 shadow-xs flex items-center justify-center text-maroon-800 group-hover:text-maroon-950 group-hover:scale-110 group-hover:border-gold-400 transition-all duration-300">
                      <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-gold-700 group-hover:text-maroon-800 transition-colors" />
                    </div>
                    <span className="text-[10px] text-gold-800 font-serif tracking-widest uppercase mt-2 font-semibold">
                      KOH Gold
                    </span>
                  </div>
                )}
                {/* Subtle sheen highlight on hover */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-maroon-950/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  aria-hidden="true"
                />
              </div>

              {/* Text Description */}
              <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-1.5 sm:space-y-2 bg-gradient-to-b from-cream-50 to-cream-100/60">
                <div>
                  <h3 className="font-serif font-bold text-xs sm:text-base text-maroon-950 group-hover:text-maroon-700 transition-colors truncate">
                    {item.name}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-charcoal-600 line-clamp-1 font-sans">
                    {item.subtitle}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-gold-800 group-hover:text-maroon-800 pt-0.5">
                  <span className="bg-gold-100/80 px-2 py-0.5 rounded-full border border-gold-200">
                    {count} {count === 1 ? 'Design' : 'Designs'}
                  </span>
                  <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Expand/Collapse Toggle on Mobile (< sm) - Rendered ONLY if available categories > 6 */}
      {isExpandableOnMobile && (
        <div className="sm:hidden pt-1 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAllMobile((prev) => !prev)}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-cream-100 via-gold-50/70 to-cream-100 hover:bg-gold-100/70 border border-gold-300/80 rounded-xl text-xs font-semibold text-maroon-950 flex items-center justify-center gap-2 min-h-[44px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 shadow-xs"
            aria-expanded={showAllMobile}
            aria-label={showAllMobile ? 'Show fewer categories' : `View all ${availableCategories.length} categories`}
          >
            <span>
              {showAllMobile
                ? 'Show Fewer Categories'
                : `View All ${availableCategories.length} Categories`}
            </span>
            {showAllMobile ? (
              <ChevronUp className="w-4 h-4 text-gold-700" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gold-700" />
            )}
          </button>
        </div>
      )}
    </section>
  );
};
