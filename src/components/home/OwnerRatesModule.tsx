'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ratesRepository } from '@/services/rates/ratesRepository';
import { RateItem } from '@/services/rates/ratesTypes';
import { Coins, Sparkles, Clock, ArrowRight, Info } from 'lucide-react';

export const OwnerRatesModule: React.FC = () => {
  const [activeRates, setActiveRates] = useState<RateItem[]>([]);

  useEffect(() => {
    const loadRates = () => {
      setActiveRates(ratesRepository.getActiveRates());
    };

    loadRates();

    const handleUpdate = () => loadRates();
    window.addEventListener('koh_rates_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('koh_rates_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Requirement: Hidden completely when empty or no active rates
  if (activeRates.length === 0) {
    return null;
  }

  const latestUpdate = activeRates.reduce((latest, item) => {
    return item.lastUpdated > latest ? item.lastUpdated : latest;
  }, activeRates[0].lastUpdated);

  return (
    <section id="owner-rates" className="max-w-7xl mx-auto px-3 sm:px-6">
      <div className="relative bg-gradient-to-b from-cream-50 via-gold-50/40 to-cream-50 border border-gold-300/90 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-luxury space-y-6 overflow-hidden">
        {/* Subtle gold filigree accent on top edge */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold-400 to-transparent"
          aria-hidden="true"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gold-200/80 pb-4 sm:pb-5">
          <div className="space-y-1 sm:space-y-1.5">
            <div className="inline-flex items-center gap-2 bg-gold-50 border border-gold-300/80 text-maroon-950 text-[11px] font-semibold px-3 py-1 rounded-full shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              <Sparkles className="w-3 h-3 text-gold-700" />
              <span>Showroom Reference Bullion Rates</span>
            </div>
            <h3 className="font-serif font-bold text-xl sm:text-2xl text-maroon-950 tracking-tight">
              Owner-Updated Current Rates
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-600 font-sans">
              Indicative bullion reference rates manually updated by store proprietor.
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5">
            <span className="text-[11px] sm:text-xs text-charcoal-500 font-mono flex items-center gap-1.5 bg-cream-100/80 px-2.5 py-1 rounded-lg border border-gold-200/60">
              <Clock className="w-3.5 h-3.5 text-gold-700" />
              <span>Updated: {new Date(latestUpdate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}</span>
            </span>
            <Link
              href="/rates"
              className="text-xs font-bold text-maroon-900 hover:text-maroon-950 inline-flex items-center gap-1 group"
            >
              <span>View Full Rates Page</span>
              <ArrowRight className="w-3.5 h-3.5 text-gold-700 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Rates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {activeRates.map((item) => (
            <div
              key={item.id}
              className="group bg-cream-50 p-4 sm:p-5 rounded-2xl border border-gold-300/80 hover:border-gold-400 flex items-center justify-between gap-3 shadow-card hover:shadow-card-hover transition-all duration-300"
            >
              <div>
                <span className="text-xs sm:text-sm font-bold text-maroon-950 block font-serif">
                  {item.label}
                </span>
                <span className="text-[11px] sm:text-xs text-charcoal-500 font-sans mt-0.5 block">
                  {item.material} • {item.unit}
                </span>
              </div>
              <div className="text-right">
                <span className="text-lg sm:text-xl font-serif font-bold text-maroon-950 block">
                  ₹{item.rate.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Rate Disclaimer Notice */}
        <div className="flex items-start gap-2.5 text-xs text-charcoal-600 bg-gold-50/70 p-3 sm:p-3.5 rounded-xl border border-gold-200/80 shadow-xs">
          <Info className="w-4 h-4 text-gold-700 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Rates are indicative reference values updated by the owner for showroom visits. Final gold transactions are calculated at prevailing showroom billing rates at the time of purchase.
          </p>
        </div>
      </div>
    </section>
  );
};
