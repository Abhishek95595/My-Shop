'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Phone, MessageCircle } from 'lucide-react';
import { CONTACT_CONFIG, NAV_LINKS } from '@/lib/constants';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-cream-50 shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-gold-200">
        {/* Top Header */}
        <div className="p-4 border-b border-gold-200/80 flex items-center justify-between">
          <Link href="/" onClick={onClose} className="flex items-center">
            <Image
              src="/assets/khushi-logo.png"
              alt="Khushi Ornament House Logo"
              width={140}
              height={44}
              className="h-9 w-auto object-contain"
            />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-charcoal-700 hover:text-maroon-700 hover:bg-gold-50 rounded-lg"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="py-4 px-3 flex-1 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="block px-4 py-2.5 rounded-lg text-base font-medium text-charcoal-800 hover:bg-gold-100/70 hover:text-maroon-800 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Bottom Contact Actions */}
        <div className="p-4 border-t border-gold-200/80 bg-cream-100 space-y-2.5">
          <a
            href={`https://wa.me/${CONTACT_CONFIG.whatsappNumberRaw}?text=${encodeURIComponent(
              'Hello Khushi Ornament House, I would like to inquire about your jewellery collections.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white py-2.5 px-4 rounded-lg font-semibold text-sm shadow-sm transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Enquiry</span>
          </a>

          <a
            href={`tel:${CONTACT_CONFIG.primaryPhoneRaw}`}
            className="w-full flex items-center justify-center gap-2 bg-maroon-700 hover:bg-maroon-800 text-cream-50 py-2.5 px-4 rounded-lg font-semibold text-sm shadow-sm transition-colors"
          >
            <Phone className="w-4 h-4 text-gold-300" />
            <span>Call: {CONTACT_CONFIG.primaryPhone}</span>
          </a>

          <p className="text-center text-xs text-charcoal-600 pt-1 font-sans">
            {CONTACT_CONFIG.addressLine1}
          </p>
        </div>
      </div>
    </div>
  );
};
