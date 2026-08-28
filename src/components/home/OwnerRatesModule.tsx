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
    <section id="owner-rates" className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="bg-cream-50 border border-gold-300 rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gold-200/80 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-gold-100 text-maroon-900 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-gold-300">
              <Sparkles className="w-3 h-3 text-gold-700" />
              <span>Showroom Reference</span>
            </div>
            <h3 className="font-serif font-bold text-xl sm:text-2xl text-maroon-950">
              Owner-Updated Current Rates
            </h3>
            <p className="text-xs text-charcoal-600 font-sans">
              Indicative bullion reference rates manually updated by store proprietor.
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-1">
            <span className="text-[11px] text-charcoal-500 font-mono flex items-center gap-1">
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
              className="text-xs font-bold text-maroon-800 hover:text-maroon-950 inline-flex items-center gap-1"
            >
              <span>View Full Rates Page</span>
              <ArrowRight className="w-3.5 h-3.5 text-gold-700" />
            </Link>
          </div>
        </div>

        {/* Rates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeRates.map((item) => (
            <div
              key={item.id}
              className="bg-cream-100/80 p-4 rounded-2xl border border-gold-200 flex items-center justify-between gap-3"
            >
              <div>
                <span className="text-xs font-bold text-maroon-900 block font-serif">
                  {item.label}
                </span>
                <span className="text-[11px] text-charcoal-500 font-sans">
                  {item.material} • per {item.unit}
                </span>
              </div>
              <div className="text-right">
                <span className="text-lg font-serif font-bold text-maroon-950 block">
                  ₹{item.rate.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Rate Disclaimer Notice */}
        <div className="flex items-start gap-2 text-xs text-charcoal-600 bg-gold-50/60 p-3 rounded-xl border border-gold-200/60">
          <Info className="w-4 h-4 text-gold-700 flex-shrink-0 mt-0.5" />
          <p className="italic font-sans leading-snug">
            Reference rates only. Gold rates fluctuate continuously. Please confirm the final effective rate directly with our showroom team prior to transacting.
          </p>
        </div>
      </div>
    </section>
  );
};
