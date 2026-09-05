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
    <div className="space-y-8 sm:space-y-12 md:space-y-16 pb-12 sm:pb-16">
      {/* 1. Mobile-Optimized Hero Section */}
      <HeroSection />

      {/* 2. Compact Scannable Trust Strip */}
      <section id="trust" className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="bg-cream-50 border border-gold-200/90 rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-card grid grid-cols-3 gap-2 sm:gap-6">
          <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-1.5 sm:gap-4">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-gold-100 flex items-center justify-center text-maroon-700 flex-shrink-0">
              <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-gold-700" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-maroon-900 text-xs sm:text-sm">
                25+ Years Trust
              </h4>
              <p className="hidden sm:block text-xs text-charcoal-600 font-sans">
                Serving Gorakhpur over 25 years
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-1.5 sm:gap-4 border-x border-gold-200/60 sm:border-none px-1 sm:px-0">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-gold-100 flex items-center justify-center text-maroon-700 flex-shrink-0">
              <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-gold-700" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-maroon-900 text-xs sm:text-sm">
                Custom Orders
              </h4>
              <p className="hidden sm:block text-xs text-charcoal-600 font-sans">
                Bespoke design to order
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-1.5 sm:gap-4">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-gold-100 flex items-center justify-center text-maroon-700 flex-shrink-0">
              <MapPin className="w-4 h-4 sm:w-6 sm:h-6 text-gold-700" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-maroon-900 text-xs sm:text-sm">
                Showroom Visit
              </h4>
              <p className="hidden sm:block text-xs text-charcoal-600 font-sans">
                Personal in-store consultation
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
