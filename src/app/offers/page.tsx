import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  STORE_NAME,
  STORE_TAGLINE,
  CONTACT_CONFIG,
} from '@/lib/constants';
import {
  Tag,
  Sparkles,
  ArrowRight,
  MessageCircle,
  PackageSearch,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Special Offers & Updates',
  description: `View owner-approved showroom offers and announcements from ${STORE_NAME} in Gorakhpur.`,
  alternates: { canonical: '/offers' },
};

export default function OffersPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Header Section */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 bg-gold-100/90 border border-gold-300 text-maroon-900 text-xs font-semibold px-3 py-1 rounded-full shadow-xs">
          <Tag className="w-3.5 h-3.5 text-gold-700" />
          <span>Announcements &amp; Offers</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-maroon-950">
          Offers &amp; Showroom Updates
        </h1>
        <p className="text-sm sm:text-base text-charcoal-700 font-sans leading-relaxed">
          {STORE_TAGLINE}. This page is reserved for owner-approved promotional announcements and showroom updates.
        </p>
      </div>

      {/* Empty State Card */}
      <div className="bg-cream-50 border border-gold-200/90 rounded-3xl p-10 sm:p-14 text-center shadow-card space-y-4 max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-full bg-gold-100 text-maroon-800 flex items-center justify-center mx-auto">
          <Tag className="w-8 h-8 text-gold-700" />
        </div>
        <h2 className="text-xl font-serif font-bold text-maroon-950">
          No active offers currently
        </h2>
        <p className="text-xs sm:text-sm text-charcoal-600 font-sans leading-relaxed">
          There are no owner-approved promotional announcements to display at this time. Contact the showroom for current catalogue and rate information.
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-1.5 bg-maroon-800 hover:bg-maroon-900 text-cream-50 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <span>Explore Catalogue</span>
            <ArrowRight className="w-4 h-4 text-gold-300" />
          </Link>
          <a
            href={`https://wa.me/${CONTACT_CONFIG.whatsappNumberRaw}?text=${encodeURIComponent(
              'Hello Khushi Ornament House, I am inquiring about current showroom rates and collections.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-xs"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Inquire on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
