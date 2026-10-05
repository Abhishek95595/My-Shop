import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { PackageSearch, Home, Sparkles, ArrowRight } from 'lucide-react';
import { STORE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Page Not Found',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 sm:py-20">
      <div className="max-w-lg w-full bg-cream-50 border border-gold-300 rounded-3xl p-6 sm:p-10 shadow-luxury text-center space-y-6 relative overflow-hidden">
        {/* Subtle gold accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-300 via-gold-500 to-gold-300"
          aria-hidden="true"
        />

        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gold-100 text-maroon-900 flex items-center justify-center mx-auto border border-gold-300 shadow-xs">
          <PackageSearch className="w-8 h-8 sm:w-10 sm:h-10 text-gold-700" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-gold-100/90 text-maroon-900 text-xs font-semibold px-3 py-1 rounded-full border border-gold-200">
            <Sparkles className="w-3.5 h-3.5 text-gold-700" />
            <span>404 — Page Not Found</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-maroon-950">
            Jewellery Page Not Found
          </h1>

          <p className="text-xs sm:text-sm text-charcoal-600 font-sans leading-relaxed">
            The page or jewellery piece you are looking for does not exist, may have been moved, or is no longer available in our public collection.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-cream-100 hover:bg-gold-100 text-maroon-900 font-bold text-xs py-3 px-5 rounded-xl border border-gold-300 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 active:scale-95"
          >
            <Home className="w-4 h-4 text-gold-700" />
            <span>Go to Homepage</span>
          </Link>

          <Link
            href="/catalogue"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-maroon-800 hover:bg-maroon-900 text-cream-50 font-bold text-xs py-3 px-5 rounded-xl shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 cursor-pointer active:scale-95"
          >
            <span>Explore Catalogue</span>
            <ArrowRight className="w-4 h-4 text-gold-300" />
          </Link>
        </div>

        <p className="text-[11px] text-charcoal-500 font-sans pt-2">
          Looking for a specific 18K, 22K or 24K gold design? Call or WhatsApp {STORE_NAME} directly for personal showroom assistance.
        </p>
      </div>
    </div>
  );
}
