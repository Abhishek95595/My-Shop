'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { CONTACT_CONFIG } from '@/lib/constants';

export const FloatingWhatsApp: React.FC = () => {
  const pathname = usePathname();
  const isProductDetail =
    pathname.startsWith('/catalogue/') && pathname !== '/catalogue';

  return (
    <aside
      aria-label="Quick WhatsApp Support"
      className={`fixed ${
        isProductDetail
          ? 'hidden md:block bottom-6'
          : 'bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:bottom-6'
      } right-4 sm:right-6 z-30`}
    >
      <a
        href={`https://wa.me/${CONTACT_CONFIG.whatsappNumberRaw}?text=${encodeURIComponent(
          'Hello Khushi Ornament House, I would like to inquire about your jewellery.'
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 group"
        aria-label={`Chat with Khushi Ornament House on WhatsApp at ${CONTACT_CONFIG.whatsappNumber}`}
      >
        <MessageCircle className="w-6 h-6 fill-current" />
        <span className="hidden sm:inline font-semibold text-sm tracking-wide">
          WhatsApp Us
        </span>
      </a>
    </aside>
  );
};
