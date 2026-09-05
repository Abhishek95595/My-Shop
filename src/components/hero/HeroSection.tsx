import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Phone, MessageCircle, Sparkles, ArrowRight } from 'lucide-react';
import { CONTACT_CONFIG } from '@/lib/constants';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-2 sm:pt-4 pb-6 sm:pb-12 md:pb-16 bg-gradient-to-b from-cream-100 to-cream-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 space-y-4 sm:space-y-8">
        {/* Approved Graphic Showcase Container - Stable, non-shifting aspect ratio */}
        <div className="relative aspect-[16/9] sm:aspect-[21/9] md:aspect-[24/10] w-full rounded-xl sm:rounded-2xl border border-gold-200/90 shadow-card bg-cream-50 overflow-hidden">
          <Image
            src="/assets/khushi-wedding-hero.png"
            alt="Khushi Ornament House — Heritage Bridal Jewellery and Logo"
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
            className="object-contain block"
          />
        </div>

        {/* Live Text & Accessible Actions (Compact on mobile 55vh-65vh viewport budget) */}
        <div className="max-w-4xl mx-auto text-center space-y-3 sm:space-y-4 px-2">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-1.5 bg-gold-100/90 border border-gold-300 text-maroon-800 text-[11px] sm:text-xs font-semibold px-3 py-1 rounded-full shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-gold-700" />
            <span>25+ Years of Trust in Gorakhpur</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-xl sm:text-3xl md:text-5xl font-serif font-bold text-maroon-900 leading-tight">
            Exquisite Bridal &amp; Heritage Gold Jewellery
          </h1>

          {/* Subtext Description */}
          <p className="text-xs sm:text-base text-charcoal-700 font-sans leading-relaxed max-w-xl mx-auto line-clamp-2 sm:line-clamp-none">
            Crafting timeless bridal sets, classic gold pieces, and custom heirlooms with 25+ years of trust in Gorakhpur.
          </p>

          {/* Action CTAs: View Catalogue, WhatsApp, Call */}
          <div className="pt-1 sm:pt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {/* View Catalogue Primary CTA */}
            <Link
              href="/catalogue"
              className="inline-flex items-center justify-center gap-1.5 bg-maroon-800 hover:bg-maroon-900 active:scale-95 text-cream-50 font-semibold px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl shadow-xs text-xs sm:text-sm min-h-[44px] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-maroon-700"
            >
              <span>View Catalogue</span>
              <ArrowRight className="w-3.5 h-3.5 text-gold-300" />
            </Link>

            {/* WhatsApp Enquiry CTA */}
            <a
              href={`https://wa.me/${CONTACT_CONFIG.whatsappNumberRaw}?text=${encodeURIComponent(
                'Hello Khushi Ornament House, I am interested in inquiring about your wedding jewellery collections.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-semibold px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl shadow-xs text-xs sm:text-sm min-h-[44px] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              aria-label="Inquire on WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>

            {/* Call Store CTA */}
            <a
              href={`tel:+${CONTACT_CONFIG.primaryPhoneRaw}`}
              className="inline-flex items-center justify-center gap-1.5 bg-cream-50 hover:bg-gold-50 active:scale-95 text-maroon-900 border border-gold-300 font-semibold px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl shadow-xs text-xs sm:text-sm min-h-[44px] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
              aria-label={`Call Store at ${CONTACT_CONFIG.primaryPhone}`}
            >
              <Phone className="w-3.5 h-3.5 text-gold-700" />
              <span>Call: {CONTACT_CONFIG.primaryPhone}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
