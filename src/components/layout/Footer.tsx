import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import {
  CONTACT_CONFIG,
  STORE_NAME,
  STORE_TAGLINE,
  STORE_OWNER,
  GSTIN,
  FOOTER_QUICK_LINKS,
  FOOTER_LEGAL_LINKS,
} from '@/lib/constants';
import { OwnerRatesFooterLink } from './OwnerRatesFooterLink';
import { FooterCategoryLinks } from './FooterCategoryLinks';

export const Footer: React.FC = () => {
  return (
    <footer
      id="store-info"
      className="bg-cream-100 border-t border-gold-200/90 text-charcoal-800 pt-12 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-gold-200/80">
          {/* Brand & Introduction */}
          <div className="space-y-4 lg:col-span-1">
            <Link
              href="/"
              className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 rounded"
            >
              <Image
                src="/assets/khushi-logo.png"
                alt="Khushi Ornament House Logo"
                width={180}
                height={56}
                className="h-12 w-auto object-contain"
              />
            </Link>
            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed font-sans">
              {STORE_TAGLINE}. Gold jewellery in 18K, 22K and 24K options, bespoke bridal sets, and in-store consultations in Gorakhpur.
            </p>
            <div className="space-y-1 text-xs text-charcoal-600 font-sans">
              <p>
                Proprietor: <strong className="text-maroon-950">{STORE_OWNER}</strong>
              </p>
              <p>
                GSTIN: <strong className="font-mono text-maroon-950">{GSTIN}</strong>
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-maroon-800 font-semibold bg-gold-100/80 border border-gold-300 rounded-xl px-3 py-1.5 w-fit">
              <ShieldCheck className="w-4 h-4 text-gold-700" />
              <span>25+ Years of Trust</span>
            </div>
          </div>

          {/* Quick Categories Navigation */}
          <div className="space-y-3">
            <h3 className="text-xs font-serif font-bold text-maroon-950 uppercase tracking-widest">
              Gold Collections
            </h3>
            <FooterCategoryLinks />
          </div>


          {/* Showroom & Services */}
          <div className="space-y-3">
            <h3 className="text-xs font-serif font-bold text-maroon-950 uppercase tracking-widest">
              Services &amp; Information
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-charcoal-700 font-sans">
              {FOOTER_QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-maroon-800 hover:underline transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <OwnerRatesFooterLink />
            </ul>
          </div>

          {/* Store Location & Hours */}
          <div className="space-y-3">
            <h3 className="text-xs font-serif font-bold text-maroon-950 uppercase tracking-widest">
              Showroom &amp; Hours
            </h3>
            <div className="space-y-3 text-xs sm:text-sm text-charcoal-700 font-sans">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold-700 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="leading-snug">{CONTACT_CONFIG.address}</p>
                  <a
                    href={CONTACT_CONFIG.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-maroon-800 font-bold hover:underline pt-0.5"
                  >
                    <span>View on Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-gold-700 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-maroon-950 block">
                    {CONTACT_CONFIG.hours}
                  </span>
                  <span className="text-xs text-charcoal-500">
                    Call ahead to confirm the visiting day
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Phone className="w-4 h-4 text-maroon-800 flex-shrink-0" />
                <a
                  href={`tel:+${CONTACT_CONFIG.primaryPhoneRaw}`}
                  className="font-bold text-maroon-900 hover:underline"
                >
                  {CONTACT_CONFIG.primaryPhone}
                </a>
              </div>

              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <a
                  href={`https://wa.me/${CONTACT_CONFIG.whatsappNumberRaw}?text=${encodeURIComponent(
                    'Hello Khushi Ornament House, I would like to inquire about your jewellery.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-emerald-800 hover:underline"
                >
                  {CONTACT_CONFIG.whatsappNumber} (WhatsApp)
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-charcoal-600 font-sans">
          <p>
            © {new Date().getFullYear()} {STORE_NAME}. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            {FOOTER_LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-maroon-900 hover:underline transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <p className="text-gold-800 font-medium">Gorakhpur, Uttar Pradesh, India</p>
        </div>
      </div>
    </footer>
  );
};
