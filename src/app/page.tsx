import React from 'react';
import type { Metadata } from 'next';
import { HeroSection } from '@/components/hero/HeroSection';
import { Shield, Sparkles, MapPin } from 'lucide-react';
import { ShopByCategory } from '@/components/home/ShopByCategory';
import { WeddingCollectionPreview } from '@/components/home/WeddingCollectionPreview';
import { FeaturedProductsSection } from '@/components/home/FeaturedProductsSection';
import { WhyUsSection } from '@/components/home/WhyUsSection';
import { CustomJewellerySection } from '@/components/home/CustomJewellerySection';
import { OwnerRatesModule } from '@/components/home/OwnerRatesModule';
import { GalleryPreviewModule } from '@/components/home/GalleryPreviewModule';
import { TestimonialsModule } from '@/components/home/TestimonialsModule';
import { StoreInfoSection } from '@/components/home/StoreInfoSection';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return (
    <div className="space-y-10 sm:space-y-16 md:space-y-20 pb-16 sm:pb-24">
      {/* 1. Mobile-Optimized Hero Section */}
      <HeroSection />

      {/* 2. Compact Scannable Luxury Trust Strip */}
      <section id="trust" className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="relative bg-gradient-to-r from-cream-50 via-gold-50/50 to-cream-50 border border-gold-300/90 rounded-2xl sm:rounded-3xl p-3 sm:p-6 lg:p-7 shadow-luxury grid grid-cols-3 gap-2 sm:gap-6 overflow-hidden">
          {/* Subtle gold filigree accent on top edge */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold-400 to-transparent"
            aria-hidden="true"
          />

          <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-2 sm:gap-4">
            <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-gradient-to-br from-gold-100 to-gold-200/90 border border-gold-300/80 flex items-center justify-center text-maroon-800 flex-shrink-0 shadow-xs">
              <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-gold-700" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-maroon-950 text-xs sm:text-base">
                25+ Years Trust
              </h4>
              <p className="hidden sm:block text-xs text-charcoal-600 font-sans mt-0.5">
                Serving Gorakhpur with transparent purity
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-2 sm:gap-4 border-x border-gold-200/80 sm:border-none px-1 sm:px-0">
            <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-gradient-to-br from-gold-100 to-gold-200/90 border border-gold-300/80 flex items-center justify-center text-maroon-800 flex-shrink-0 shadow-xs">
              <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-gold-700" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-maroon-950 text-xs sm:text-base">
                Custom Orders
              </h4>
              <p className="hidden sm:block text-xs text-charcoal-600 font-sans mt-0.5">
                Bespoke artisan jewellery to order
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-2 sm:gap-4">
            <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-gradient-to-br from-gold-100 to-gold-200/90 border border-gold-300/80 flex items-center justify-center text-maroon-800 flex-shrink-0 shadow-xs">
              <MapPin className="w-4 h-4 sm:w-6 sm:h-6 text-gold-700" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-maroon-950 text-xs sm:text-base">
                Showroom Visit
              </h4>
              <p className="hidden sm:block text-xs text-charcoal-600 font-sans mt-0.5">
                Personal in-store bridal consultation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Shop by Category */}
      <ShopByCategory />

      {/* 4. Wedding Collection Preview */}
      <WeddingCollectionPreview />

      {/* 5. Featured Products Grid */}
      <FeaturedProductsSection />

      {/* 6. Why Khushi Ornament House */}
      <WhyUsSection />

      {/* 7. Custom Jewellery 3-Step Process */}
      <CustomJewellerySection />

      {/* 8. Optional Owner-Entered Rates Module (Hidden completely when empty) */}
      <OwnerRatesModule />

      {/* 9. Gallery Preview Module (Hidden completely when empty) */}
      <GalleryPreviewModule items={[]} />

      {/* 10. Testimonials Module (Hidden completely when empty) */}
      <TestimonialsModule testimonials={[]} />

      {/* 11. Showroom Location & Hours */}
      <StoreInfoSection />
    </div>
  );
}
