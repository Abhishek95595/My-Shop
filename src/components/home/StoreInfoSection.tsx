import React from 'react';
import {
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { CONTACT_CONFIG, STORE_NAME } from '@/lib/constants';

export const StoreInfoSection: React.FC = () => {
  return (
    <section id="store-location" className="max-w-7xl mx-auto px-3 sm:px-6">
      <div className="relative bg-gradient-to-b from-cream-50 via-gold-50/30 to-cream-50 rounded-2xl sm:rounded-3xl border border-gold-300/90 p-4 sm:p-8 lg:p-12 shadow-luxury space-y-6 sm:space-y-8 overflow-hidden">
        {/* Subtle gold filigree accent on top edge */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold-400 to-transparent"
          aria-hidden="true"
        />

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4 border-b border-gold-200/80 pb-4 sm:pb-6">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-gold-800 uppercase tracking-widest bg-gold-50 border border-gold-300/80 px-3 py-1 rounded-full shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-gold-700" />
              <span>Flagship Gorakhpur Boutique</span>
            </div>
            <h2 className="text-xl sm:text-3xl md:text-4xl font-serif font-bold text-maroon-950 tracking-tight">
              Personal Consultation &amp; Location
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-charcoal-600 font-sans max-w-2xl leading-relaxed">
              Visit us in person to explore our bridal jewellery collections and discuss custom craftsmanship backed by 25+ years of trust.
            </p>
          </div>

          <a
            href={CONTACT_CONFIG.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-maroon-900 hover:bg-maroon-950 active:scale-95 text-cream-50 text-xs sm:text-sm font-semibold px-4 py-2.5 sm:px-5 sm:py-3.5 rounded-xl border border-gold-400/40 shadow-xs transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 flex-shrink-0 self-start md:self-auto min-h-[44px] group"
          >
            <MapPin className="w-4 h-4 text-gold-300" />
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5 text-gold-300 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        {/* Store Detail Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-6">
          {/* Address Card with Map CTA */}
          <div className="group bg-cream-50 rounded-2xl border border-gold-300/80 hover:border-gold-400 p-5 sm:p-6 space-y-4 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-gold-100 to-gold-200/80 border border-gold-300/80 text-maroon-950 flex items-center justify-center shadow-xs">
                <MapPin className="w-5 h-5 text-gold-700" />
              </div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-maroon-950">
                Showroom Address
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-700 font-sans leading-relaxed">
                <strong className="text-maroon-950">{STORE_NAME}</strong>
                <br />
                {CONTACT_CONFIG.address}
              </p>
            </div>

            <a
              href={CONTACT_CONFIG.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-cream-50 to-gold-50/80 hover:to-gold-100 border border-gold-300 rounded-xl text-xs font-semibold text-maroon-950 active:scale-95 transition-all min-h-[44px] shadow-xs"
            >
              <MapPin className="w-3.5 h-3.5 text-gold-700" />
              <span>Get Directions</span>
              <ExternalLink className="w-3 h-3 text-charcoal-400" />
            </a>
          </div>

          {/* Opening Hours Card */}
          <div className="group bg-cream-50 rounded-2xl border border-gold-300/80 hover:border-gold-400 p-5 sm:p-6 space-y-4 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-gold-100 to-gold-200/80 border border-gold-300/80 text-maroon-950 flex items-center justify-center shadow-xs">
                <Clock className="w-5 h-5 text-gold-700" />
              </div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-maroon-950">
                Opening Hours
              </h3>
              <div className="text-xs sm:text-sm text-charcoal-700 font-sans space-y-1.5">
                <p className="font-serif font-bold text-maroon-950 text-base sm:text-lg">
                  11:00 AM – 8:00 PM
                </p>
                <p className="text-[11px] sm:text-xs text-charcoal-600 leading-relaxed">
                  Open all regular working days. Feel free to call ahead before your visit for dedicated bridal appointments.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-gold-200/60 text-[11px] text-gold-800 font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gold-600" />
              <span>Personal bridal assistance available</span>
            </div>
          </div>

          {/* Direct Assistance Card with Visible Call and WhatsApp Buttons */}
          <div className="group bg-cream-50 rounded-2xl border border-gold-300/80 hover:border-gold-400 p-5 sm:p-6 space-y-4 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-gold-100 to-gold-200/80 border border-gold-300/80 text-maroon-950 flex items-center justify-center shadow-xs mb-3">
                <Phone className="w-5 h-5 text-gold-700" />
              </div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-maroon-950">
                Direct Assistance
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-600 font-sans leading-relaxed mt-1">
                Call or WhatsApp our Gorakhpur showroom artisans directly for any collection queries.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row md:flex-col gap-2.5">
              <a
                href={`tel:+${CONTACT_CONFIG.primaryPhoneRaw}`}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3.5 bg-maroon-900 text-cream-50 border border-gold-400/30 rounded-xl text-xs font-semibold hover:bg-maroon-950 active:scale-95 transition-all min-h-[44px] shadow-xs"
              >
                <Phone className="w-3.5 h-3.5 text-gold-300" />
                <span>Call {CONTACT_CONFIG.primaryPhone}</span>
              </a>

              <a
                href={`https://wa.me/${CONTACT_CONFIG.whatsappNumberRaw}?text=${encodeURIComponent(
                  'Hello Khushi Ornament House, I would like to inquire about showroom visiting hours and gold jewellery.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3.5 bg-emerald-700 text-white rounded-xl text-xs font-semibold hover:bg-emerald-800 active:scale-95 transition-all min-h-[44px] shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Us</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
