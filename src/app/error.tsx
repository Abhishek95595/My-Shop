'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, ArrowRight } from 'lucide-react';

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ reset }: ErrorBoundaryProps) {

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12 sm:py-16">
      <div className="max-w-md w-full bg-cream-50 border border-gold-300 rounded-3xl p-6 sm:p-8 shadow-card text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-gold-100 text-maroon-800 flex items-center justify-center mx-auto border border-gold-200 shadow-xs">
          <AlertCircle className="w-8 h-8 text-gold-700" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-maroon-950">
            Something Went Wrong
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-600 font-sans leading-relaxed">
            We couldn&apos;t load this part of Khushi Ornament House right now. Please try again.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-maroon-800 hover:bg-maroon-900 text-cream-50 font-bold text-xs py-3 px-5 rounded-xl shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-gold-300" />
            <span>Try Again</span>
          </button>
          <Link
            href="/catalogue"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-cream-100 hover:bg-gold-100 text-maroon-900 font-semibold text-xs py-3 px-5 rounded-xl border border-gold-300 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
          >
            <span>Return to Catalogue</span>
            <ArrowRight className="w-3.5 h-3.5 text-gold-700" />
          </Link>
        </div>
      </div>
    </div>
  );
}
