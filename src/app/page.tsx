import React from 'react';
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

export default function HomePage() {
  return (
    <div className="space-y-16 sm:space-y-20 pb-16">
      {/* 1. Approved Hero Section */}
      <HeroSection />

      {/* 2. Approved Trust Strip */}
      <section id="trust" className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-cream-50 border border-gold-200/90 rounded-2xl p-6 sm:p-8 shadow-card grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center text-maroon-700 flex-shrink-0">
              <Shield className="w-6 h-6 text-gold-700" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-maroon-900 text-sm">
                25+ Years of Trust
              </h4>
              <p className="text-xs text-charcoal-600 font-sans">
                Serving Gorakhpur families since 1999
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center text-maroon-700 flex-shrink-0">
              <Sparkles className="w-6 h-6 text-gold-700" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-maroon-900 text-sm">
                Custom Jewellery
              </h4>
              <p className="text-xs text-charcoal-600 font-sans">
                Bespoke manufacturing to order
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center text-maroon-700 flex-shrink-0">
              <MapPin className="w-6 h-6 text-gold-700" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-maroon-900 text-sm">
                Gorakhpur Store
              </h4>
              <p className="text-xs text-charcoal-600 font-sans">
                Visit us for personal consultation
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
