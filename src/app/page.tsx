import React from 'react';
import { HeroSection } from '@/components/hero/HeroSection';
import { Shield, Sparkles, MapPin, Phone, MessageCircle } from 'lucide-react';
import { CONTACT_CONFIG } from '@/lib/constants';

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

      {/* 3. Store Visit & Direct Inquiry Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-maroon-800 text-cream-50 rounded-2xl p-8 sm:p-12 shadow-card border border-gold-400/40 relative overflow-hidden">
          <div className="max-w-2xl space-y-4">
            <span className="text-xs uppercase tracking-widest text-gold-300 font-semibold">
              Visit Our Boutique
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-cream-100 leading-snug">
              Experience Our Gold Collections in Person
            </h2>
            <p className="text-sm sm:text-base text-cream-200/90 font-sans leading-relaxed">
              We look forward to welcoming you at our Gorakhpur boutique. Inquire beforehand on WhatsApp or call our store line directly.
            </p>

            <div className="pt-4 flex flex-wrap gap-4">
              <a
                href={`https://wa.me/${CONTACT_CONFIG.whatsappNumberRaw}?text=${encodeURIComponent(
                  'Hello Khushi Ornament House, I would like to plan a visit to your store.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-3 rounded-lg shadow transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp: {CONTACT_CONFIG.whatsappNumber}</span>
              </a>

              <a
                href={`tel:${CONTACT_CONFIG.primaryPhoneRaw}`}
                className="inline-flex items-center gap-2 bg-cream-50 hover:bg-gold-100 text-maroon-900 text-sm font-semibold px-5 py-3 rounded-lg shadow transition-colors"
              >
                <Phone className="w-4 h-4 text-gold-700" />
                <span>Call: {CONTACT_CONFIG.primaryPhone}</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
