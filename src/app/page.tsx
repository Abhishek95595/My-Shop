import React from 'react';
import { HeroSection } from '@/components/hero/HeroSection';
import { Shield, Sparkles, MapPin } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-12 sm:space-y-16 pb-12">
      {/* 1. Approved Hero Section with Live CTAs Below */}
      <HeroSection />

      {/* 2. Trust Strip (Phase 1 Scope) */}
      <section id="trust" className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-cream-50 border border-gold-200/90 rounded-xl p-6 shadow-card grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center text-maroon-700 flex-shrink-0">
              <Shield className="w-6 h-6 text-gold-700" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-maroon-900 text-sm">25+ Years of Trust</h4>
              <p className="text-xs text-charcoal-600 font-sans">Serving Gorakhpur families since 1999</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center text-maroon-700 flex-shrink-0">
              <Sparkles className="w-6 h-6 text-gold-700" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-maroon-900 text-sm">Custom Jewellery</h4>
              <p className="text-xs text-charcoal-600 font-sans">Bespoke manufacturing to order</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center text-maroon-700 flex-shrink-0">
              <MapPin className="w-6 h-6 text-gold-700" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-maroon-900 text-sm">Gorakhpur Store</h4>
              <p className="text-xs text-charcoal-600 font-sans">Visit us for personal consultation</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
