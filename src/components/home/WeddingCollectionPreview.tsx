import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ArrowRight, HeartHandshake, ShieldCheck } from 'lucide-react';
import { getWeddingProducts } from '@/services/mockProducts';

export const WeddingCollectionPreview: React.FC = () => {
  const weddingProducts = getWeddingProducts().slice(0, 3);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="relative rounded-3xl bg-gradient-to-br from-maroon-950 via-maroon-900 to-maroon-800 text-cream-50 p-6 sm:p-10 lg:p-12 overflow-hidden shadow-card border border-gold-400/30 space-y-8">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-maroon-600/20 rounded-full blur-2xl pointer-events-none" />

        {/* Section Header */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gold-300/20 pb-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-gold-500/20 border border-gold-400/40 text-gold-300 text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>Launch Spotlight</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-cream-50">
              The Royal Wedding Collection
            </h2>
            <p className="text-sm sm:text-base text-cream-200/90 font-sans leading-relaxed">
              Designed for auspicious beginnings. Explore our signature bridal sets, heavy wedding bangles, and heirloom mangalsutras crafted with 22K pure gold.
            </p>
          </div>

          <Link
            href="/catalogue?occasion=Wedding"
            className="inline-flex items-center gap-2 bg-gold-400 hover:bg-gold-500 text-maroon-950 font-bold px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 flex-shrink-0"
          >
            <span>Explore Wedding Collection</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Wedding Highlights Grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {weddingProducts.map((product) => {
            const primaryImg =
              product.images.find((i) => i.isPrimary) || product.images[0];
            return (
              <Link
                key={product.id}
                href={`/catalogue/${product.slug}`}
                className="group bg-maroon-900/60 hover:bg-maroon-900/90 border border-gold-300/30 hover:border-gold-400 rounded-2xl p-4 transition-all duration-300 flex flex-col space-y-4 shadow-sm"
              >
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-cream-50/10">
                  {primaryImg && (
                    <Image
                      src={primaryImg.url}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <span className="absolute top-3 left-3 bg-gold-400 text-maroon-950 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                    {product.purity} Gold
                  </span>
                </div>

                <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-base text-cream-50 group-hover:text-gold-300 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-cream-200/70 font-sans line-clamp-2">
                      {product.shortDescription}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs text-gold-300 border-t border-gold-300/20">
                    <span>Approx. {product.approximateWeight}</span>
                    <span className="font-medium group-hover:underline inline-flex items-center gap-1">
                      View Piece <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Wedding Highlights Bottom Strip */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs text-cream-200 font-sans">
          <div className="flex items-center gap-2.5 bg-maroon-900/40 p-3 rounded-xl border border-gold-300/20">
            <HeartHandshake className="w-5 h-5 text-gold-400 flex-shrink-0" />
            <span>Complete bridal trousseau consultation available at our Gorakhpur showroom.</span>
          </div>
          <div className="flex items-center gap-2.5 bg-maroon-900/40 p-3 rounded-xl border border-gold-300/20">
            <ShieldCheck className="w-5 h-5 text-gold-400 flex-shrink-0" />
            <span>Exact weight and purity transparency on every custom bridal commission.</span>
          </div>
        </div>
      </div>
    </section>
  );
};
