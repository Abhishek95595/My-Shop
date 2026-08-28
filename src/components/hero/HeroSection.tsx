import React from 'react';
import Image from 'next/image';
import { Phone, MessageCircle, Sparkles } from 'lucide-react';
import { CONTACT_CONFIG } from '@/lib/constants';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-4 pb-12 sm:pb-16 bg-gradient-to-b from-cream-100 to-cream-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-10">
        
        {/* Approved Graphic Showcase Container - Untouched & Uncovered */}
        <div className="relative rounded-2xl border border-gold-200/90 shadow-card bg-cream-50 overflow-hidden">
          <Image
            src="/assets/khushi-wedding-hero.png"
            alt="Khushi Ornament House — Heritage Bridal Jewellery and Logo"
            width={1920}
            height={800}
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
            className="w-full h-auto object-contain block"
          />
        </div>

        {/* Live Text & Accessible Actions (Placed Cleanly Below the Image) */}
        <div className="max-w-4xl mx-auto text-center space-y-5 px-2">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-gold-100/90 border border-gold-300 text-maroon-800 text-xs sm:text-sm font-semibold px-3.5 py-1.5 rounded-full shadow-sm">
            <Sparkles className="w-4 h-4 text-gold-700" />
            <span>25+ Years of Trust in Gorakhpur</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-maroon-900 leading-tight">
            Exquisite Bridal & Heritage Gold Jewellery
          </h1>

          {/* Subtext Description */}
          <p className="text-base sm:text-lg text-charcoal-700 font-sans leading-relaxed max-w-2xl mx-auto">
            Crafting timeless bridal sets, classic gold pieces, and custom heirlooms with 25+ years of trust in Gorakhpur.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <a
              href={`https://wa.me/${CONTACT_CONFIG.whatsappNumberRaw}?text=${encodeURIComponent(
                'Hello Khushi Ornament House, I am interested in inquiring about your wedding jewellery collections.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Inquire on WhatsApp</span>
            </a>

            <a
              href={`tel:${CONTACT_CONFIG.primaryPhoneRaw}`}
              className="inline-flex items-center gap-2 bg-cream-50 hover:bg-gold-50 text-maroon-800 border border-gold-300 font-semibold px-5 py-3 rounded-lg shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
            >
              <Phone className="w-4 h-4 text-gold-700" />
              <span>Call: {CONTACT_CONFIG.primaryPhone}</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
