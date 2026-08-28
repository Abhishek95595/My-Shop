import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';
import { CATEGORIES } from '@/lib/constants';

interface CategoryCardItem {
  title: (typeof CATEGORIES)[number];
  subtitle: string;
  image: string;
  count: string;
}

const CATEGORY_ITEMS: CategoryCardItem[] = [
  {
    title: 'Rings',
    subtitle: 'Classic & Floral Gold Bands',
    image: '/assets/products/classic-ring-main.svg',
    count: 'Explore Rings',
  },
  {
    title: 'Necklaces/Sets',
    subtitle: 'Bridal & Heritage Chokers',
    image: '/assets/products/bridal-necklace-main.svg',
    count: 'Explore Sets',
  },
  {
    title: 'Chains',
    subtitle: 'Curb & Classic Links for Men & Women',
    image: '/assets/products/mens-chain-main.svg',
    count: 'Explore Chains',
  },
  {
    title: 'Mangalsutra',
    subtitle: 'Sacred Black Beads & Gold Pendants',
    image: '/assets/products/mangalsutra-main.svg',
    count: 'Explore Designs',
  },
  {
    title: 'Bangles/Kada',
    subtitle: 'Embossed Heritage Bridal Bangles',
    image: '/assets/products/wedding-bangles-main.svg',
    count: 'Explore Bangles',
  },
];

export const ShopByCategory: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
      {/* Section Heading */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-800 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-gold-700" />
            <span>Curated Collections</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-maroon-950">
            Shop by Gold Category
          </h2>
          <p className="text-sm sm:text-base text-charcoal-600 font-sans max-w-2xl">
            Explore pure gold craftsmanship across classic rings, grand bridal necklaces, daily chains, sacred mangalsutras, and wedding bangles.
          </p>
        </div>

        <Link
          href="/catalogue"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-maroon-800 hover:text-maroon-950 group flex-shrink-0"
        >
          <span>View Full Catalogue</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {CATEGORY_ITEMS.map((item) => (
          <Link
            key={item.title}
            href={`/catalogue?category=${encodeURIComponent(item.title)}`}
            className="group bg-cream-50 rounded-2xl border border-gold-200/90 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
          >
            {/* Image Preview Container */}
            <div className="relative aspect-square w-full bg-cream-100/70 overflow-hidden border-b border-gold-200/60">
              <Image
                src={item.image}
                alt={`Explore ${item.title}`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Text Description */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-2 bg-gradient-to-b from-cream-50 to-cream-100/50">
              <div>
                <h3 className="font-serif font-bold text-base text-maroon-950 group-hover:text-maroon-700 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-charcoal-600 line-clamp-1 font-sans">
                  {item.subtitle}
                </p>
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold text-gold-800 group-hover:text-maroon-800 pt-1">
                <span>{item.count}</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
