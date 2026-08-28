import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, MessageCircle, MapPin, Clock, ShieldCheck } from 'lucide-react';
import { CONTACT_CONFIG, STORE_NAME } from '@/lib/constants';

export const Footer: React.FC = () => {
  return (
    <footer id="store-info" className="bg-cream-100 border-t border-gold-200/90 text-charcoal-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 pb-10 border-b border-gold-200/80">
          {/* Brand & Introduction */}
          <div className="space-y-4">
            <Link href="/" className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 rounded">
              <Image
                src="/assets/khushi-logo.png"
                alt="Khushi Ornament House Logo"
                width={180}
                height={56}
                className="h-12 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-charcoal-600 leading-relaxed font-sans">
              25+ Years of Trust & Quality Craftsmanship in Gorakhpur. Dedicated to bespoke wedding jewellery, gold collections, and personal customer service.
            </p>
            <div className="flex items-center gap-2 text-xs text-maroon-700 font-semibold bg-gold-50 border border-gold-200 rounded px-3 py-1.5 w-fit">
              <ShieldCheck className="w-4 h-4 text-gold-700" />
              <span>Trusted Local Jeweller Since 1999</span>
            </div>
          </div>

          {/* Store Hours & Visiting Information */}
          <div className="space-y-3">
            <h3 className="text-base font-serif font-bold text-maroon-800 tracking-wide uppercase">
              Store Timings & Address
            </h3>
            <div className="space-y-3 text-sm text-charcoal-700 font-sans">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold-700 flex-shrink-0 mt-1" />
                <span>{CONTACT_CONFIG.addressLine1}, {CONTACT_CONFIG.city}, {CONTACT_CONFIG.state}</span>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-gold-700 flex-shrink-0 mt-1" />
                <span>{CONTACT_CONFIG.hours}</span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h3 className="text-base font-serif font-bold text-maroon-800 tracking-wide uppercase">
              Contact Us
            </h3>
            <div className="space-y-2.5 text-sm text-charcoal-700 font-sans">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-maroon-700 flex-shrink-0" />
                <a
                  href={`tel:${CONTACT_CONFIG.primaryPhoneRaw}`}
                  className="font-medium text-maroon-800 hover:underline"
                  aria-label={`Primary Call: ${CONTACT_CONFIG.primaryPhone}`}
                >
                  {CONTACT_CONFIG.primaryPhone} (Primary Call)
                </a>
              </div>

              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <a
                  href={`https://wa.me/${CONTACT_CONFIG.whatsappNumberRaw}?text=${encodeURIComponent(
                    'Hello Khushi Ornament House, I would like to inquire about your jewellery collections.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-emerald-800 hover:underline"
                  aria-label={`WhatsApp Enquiry: ${CONTACT_CONFIG.whatsappNumber}`}
                >
                  {CONTACT_CONFIG.whatsappNumber} (WhatsApp)
                </a>
              </div>

              <div className="text-xs text-charcoal-600 pl-6 pt-1">
                <span>Secondary Line: </span>
                <span className="font-medium text-charcoal-800">{CONTACT_CONFIG.secondaryPhone} (Store Info Only)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-charcoal-600 font-sans">
          <p>© {new Date().getFullYear()} {STORE_NAME}. All rights reserved.</p>
          <p className="text-gold-700">Gorakhpur, Uttar Pradesh, India</p>
        </div>
      </div>
    </footer>
  );
};
