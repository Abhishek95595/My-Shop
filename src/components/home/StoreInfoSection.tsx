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
      <div className="bg-cream-50 rounded-2xl sm:rounded-3xl border border-gold-300/80 p-4 sm:p-8 lg:p-12 shadow-card space-y-5 sm:space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4 border-b border-gold-200/80 pb-4 sm:pb-6">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-gold-800 uppercase tracking-widest bg-gold-100/90 border border-gold-300 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-gold-700" />
              <span>Visit Our Gorakhpur Showroom</span>
            </div>
            <h2 className="text-xl sm:text-3xl md:text-4xl font-serif font-bold text-maroon-950">
              Personal Consultation &amp; Location
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-charcoal-600 font-sans max-w-2xl">
              Visit us in person to explore the bridal catalogue and discuss custom jewellery requirements backed by 25+ years of trust.
            </p>
          </div>

          <a
            href={CONTACT_CONFIG.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-maroon-800 hover:bg-maroon-900 active:scale-95 text-cream-50 text-xs sm:text-sm font-semibold px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl shadow-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 flex-shrink-0 self-start md:self-auto min-h-[44px]"
          >
            <MapPin className="w-4 h-4 text-gold-300" />
            <span>Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5 text-gold-300" />
          </a>
        </div>

        {/* Store Detail Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
          {/* Address Card with Map CTA */}
          <div className="bg-cream-100/80 rounded-xl sm:rounded-2xl border border-gold-200 p-4 sm:p-6 space-y-3 shadow-xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-gold-100 text-maroon-800 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-gold-700" />
              </div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-maroon-950">
                Showroom Address
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-700 font-sans leading-relaxed">
                <strong>{STORE_NAME}</strong>
                <br />
                {CONTACT_CONFIG.address}
              </p>
            </div>

            <a
              href={CONTACT_CONFIG.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-gold-300 rounded-lg text-xs font-semibold text-maroon-900 hover:bg-gold-50 active:scale-95 transition-all min-h-[44px]"
            >
              <MapPin className="w-3.5 h-3.5 text-gold-700" />
              <span>Get Directions</span>
              <ExternalLink className="w-3 h-3 text-charcoal-400" />
            </a>
          </div>

          {/* Opening Hours Card */}
          <div className="bg-cream-100/80 rounded-xl sm:rounded-2xl border border-gold-200 p-4 sm:p-6 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-gold-100 text-maroon-800 flex items-center justify-center">
              <Clock className="w-5 h-5 text-gold-700" />
            </div>
            <h3 className="font-serif font-bold text-base sm:text-lg text-maroon-950">
              Opening Hours
            </h3>
            <div className="text-xs sm:text-sm text-charcoal-700 font-sans space-y-1">
              <p className="font-bold text-maroon-900 text-sm sm:text-base">
                11:00 AM – 8:00 PM
              </p>
              <p className="text-[11px] sm:text-xs text-charcoal-500">
                Open all regular working days. Feel free to call ahead before your visit.
              </p>
            </div>
          </div>

          {/* Direct Assistance Card with Visible Call and WhatsApp Buttons */}
          <div className="bg-cream-100/80 rounded-xl sm:rounded-2xl border border-gold-200 p-4 sm:p-6 space-y-3 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-gold-100 text-maroon-800 flex items-center justify-center mb-2 sm:mb-3">
                <Phone className="w-5 h-5 text-gold-700" />
              </div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-maroon-950">
                Direct Assistance
              </h3>
              <p className="text-xs text-charcoal-600 font-sans">
                Call or WhatsApp our team directly for any showroom enquiries.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row md:flex-col gap-2">
              <a
                href={`tel:+${CONTACT_CONFIG.primaryPhoneRaw}`}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 bg-maroon-800 text-cream-50 rounded-lg text-xs font-semibold hover:bg-maroon-900 active:scale-95 transition-all min-h-[44px]"
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
                className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 active:scale-95 transition-all min-h-[44px]"
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
