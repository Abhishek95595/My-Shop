'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, MessageCircle, Menu } from 'lucide-react';
import { CONTACT_CONFIG, NAV_LINKS } from '@/lib/constants';
import { MobileNav } from './MobileNav';

export const Header: React.FC = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <>
      <header
        id="top"
        className="sticky top-0 z-40 bg-cream-50/95 backdrop-blur-sm border-b border-gold-200/60 shadow-header transition-colors"
      >
        {/* Top Utility Bar */}
        <div className="bg-maroon-800 text-cream-100 text-xs py-1.5 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline text-gold-200">
                ✨ 25+ Years of Trust &amp; Quality Craftsmanship
              </span>
              <span className="text-gold-200 font-medium">Gorakhpur Store</span>
            </div>
            <div className="flex items-center gap-4 font-sans">
              <span className="hidden md:inline text-cream-200/90">
                {CONTACT_CONFIG.hours}
              </span>
              <a
                href={`tel:${CONTACT_CONFIG.primaryPhoneRaw}`}
                className="flex items-center gap-1.5 text-gold-300 hover:text-white transition-colors"
                aria-label={`Call Store at ${CONTACT_CONFIG.primaryPhone}`}
              >
                <Phone className="w-3 h-3 text-gold-400" />
                <span>{CONTACT_CONFIG.primaryPhone}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 flex-shrink-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 rounded"
            aria-label="Khushi Ornament House Home"
          >
            <Image
              src="/assets/khushi-logo.png"
              alt="Khushi Ornament House Logo"
              width={160}
              height={50}
              priority
              className="h-10 sm:h-12 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation Links (Active routes only) */}
          <nav
            className="hidden md:flex items-center gap-1 xl:gap-2 text-sm font-medium text-charcoal-800"
            aria-label="Main Navigation"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded-lg hover:text-maroon-800 hover:bg-gold-100/70 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* WhatsApp Quick Action */}
            <a
              href={`https://wa.me/${CONTACT_CONFIG.whatsappNumberRaw}?text=${encodeURIComponent(
                'Hello Khushi Ornament House, I would like to inquire about your jewellery collections.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition-colors"
              aria-label="Inquire on WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>

            {/* Call Action */}
            <a
              href={`tel:${CONTACT_CONFIG.primaryPhoneRaw}`}
              className="hidden sm:inline-flex items-center gap-1.5 bg-maroon-700 hover:bg-maroon-800 text-cream-50 text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition-colors"
              aria-label="Call Store"
            >
              <Phone className="w-4 h-4 text-gold-300" />
              <span>Call Us</span>
            </a>

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="md:hidden p-2 text-charcoal-800 hover:text-maroon-700 hover:bg-gold-50 rounded-lg"
              aria-label="Open Mobile Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
    </>
  );
};
