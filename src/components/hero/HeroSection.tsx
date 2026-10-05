import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Phone, MessageCircle, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { CONTACT_CONFIG } from '@/lib/constants';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-2 sm:pt-4 pb-6 sm:pb-12 md:pb-16 bg-gradient-to-b from-cream-100 via-cream-50/80 to-cream-100/60 overflow-hidden">
      {/* Ambient luxury warmth backdrop */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.14),_transparent_70%)] pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 space-y-4 sm:space-y-8">
        {/* Approved Graphic Showcase Container - Stable, non-shifting aspect ratio with luxury frame */}
        <div className="relative aspect-[16/9] sm:aspect-[21/9] md:aspect-[24/10] w-full rounded-2xl sm:rounded-3xl border border-gold-300/80 shadow-luxury bg-gradient-to-b from-cream-50 to-gold-50/30 overflow-hidden group">
          <Image
            src="/assets/khushi-wedding-hero.webp"
            alt="Khushi Ornament House — Heritage Bridal Jewellery and Logo"
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
            className="object-contain block transition-transform duration-700 group-hover:scale-[1.01]"
          />
          {/* Subtle gold corner vignette */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-maroon-950/10 via-transparent to-transparent pointer-events-none"
            aria-hidden="true"
          />
        </div>

        {/* Live Text & Accessible Actions */}
        <div className="max-w-4xl mx-auto text-center space-y-3.5 sm:space-y-5 px-2">
          {/* Trust Badge with Gold Starburst */}
          <div className="inline-flex items-center gap-2 bg-gold-badge border border-gold-400/60 text-maroon-950 text-[11px] sm:text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-xs tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-gold-700 flex-shrink-0" />
            <span>25+ Years of Trust in Gorakhpur</span>
            <span className="text-gold-400 hidden xs:inline" aria-hidden="true">•</span>
            <span className="text-maroon-800/80 hidden xs:inline font-normal">Certified 18K, 22K &amp; 24K</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-maroon-950 leading-[1.18] tracking-tight">
            Exquisite Bridal &amp; Heritage Gold Jewellery
          </h1>

          {/* Subtext Description */}
          <p className="text-xs sm:text-base md:text-lg text-charcoal-700 font-sans leading-relaxed max-w-2xl mx-auto line-clamp-2 sm:line-clamp-none">
            Crafting timeless bridal sets, classic gold pieces, and bespoke heirlooms with generational trust and transparent purity in Gorakhpur.
          </p>

          {/* Action CTAs: View Catalogue, WhatsApp, Call */}
          <div className="pt-2 sm:pt-3 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5">
            {/* View Catalogue Primary CTA */}
            <Link
              href="/catalogue"
              className="inline-flex items-center justify-center gap-2 bg-maroon-900 hover:bg-maroon-950 active:scale-95 text-cream-50 font-semibold px-5 py-2.5 sm:px-7 sm:py-3.5 rounded-xl border border-gold-400/40 shadow-sm hover:shadow-md text-xs sm:text-sm min-h-[44px] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 group"
            >
              <span>View Catalogue</span>
              <ArrowRight className="w-3.5 h-3.5 text-gold-300 group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* WhatsApp Enquiry CTA */}
            <a
              href={`https://wa.me/${CONTACT_CONFIG.whatsappNumberRaw}?text=${encodeURIComponent(
                'Hello Khushi Ornament House, I am interested in inquiring about your wedding jewellery collections.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-semibold px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-xl shadow-xs text-xs sm:text-sm min-h-[44px] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              aria-label="Inquire on WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>

            {/* Call Store CTA */}
            <a
              href={`tel:+${CONTACT_CONFIG.primaryPhoneRaw}`}
              className="inline-flex items-center justify-center gap-2 bg-cream-50 hover:bg-gold-50/90 active:scale-95 text-maroon-950 border border-gold-300 font-semibold px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-xl shadow-xs text-xs sm:text-sm min-h-[44px] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
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
