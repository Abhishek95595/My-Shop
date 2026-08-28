'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ratesRepository } from '@/services/rates/ratesRepository';
import { RateItem } from '@/services/rates/ratesTypes';
import {
  STORE_NAME,
  STORE_TAGLINE,
  CONTACT_CONFIG,
} from '@/lib/constants';
import {
  Coins,
  Sparkles,
  Info,
  Clock,
  ArrowRight,
  MessageCircle,
  ShieldAlert,
} from 'lucide-react';

export default function RatesPage() {
  const [rates, setRates] = useState<RateItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadRates = () => {
      const active = ratesRepository.getActiveRates();
      setRates(active);
      setIsLoaded(true);
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Header Section */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 bg-gold-100/90 border border-gold-300 text-maroon-900 text-xs font-semibold px-3 py-1 rounded-full shadow-xs">
          <Coins className="w-3.5 h-3.5 text-gold-700" />
          <span>Showroom Indicative Rates</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-maroon-950">
          {isLoaded && rates.length > 0
            ? 'Owner-Updated Current Rates'
            : 'Showroom Reference Rates'}
        </h1>
        <p className="text-sm sm:text-base text-charcoal-700 font-sans leading-relaxed">
          {STORE_TAGLINE}. Indicative bullion reference rates manually updated by our showroom proprietor.
        </p>
      </div>

      {/* When Rates are Active */}
      {isLoaded && rates.length > 0 ? (
        <div className="space-y-6">
          {/* Rates Table / Cards Grid */}
          <div className="bg-cream-50 border border-gold-300 rounded-3xl shadow-card overflow-hidden">
            <div className="p-6 border-b border-gold-200/80 bg-cream-100/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-serif font-bold text-maroon-950 text-base">
                <Sparkles className="w-4 h-4 text-gold-700" />
                <span>Current Gold &amp; Bullion Rates</span>
              </div>
              <span className="text-[11px] text-charcoal-500 font-sans flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gold-700" />
                <span>Manually Updated by Store Owner</span>
              </span>
            </div>

            <div className="divide-y divide-gold-200/60 font-sans">
              {rates.map((item) => (
                <div
                  key={item.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gold-50/40 transition-colors"
                >
                  <div className="space-y-0.5">
                    <h3 className="font-serif font-bold text-maroon-950 text-base">
                      {item.label}
                    </h3>
                    <p className="text-xs text-charcoal-600">
                      Material: <strong className="text-charcoal-800">{item.material}</strong> • Unit: {item.unit}
                    </p>
                  </div>

                  <div className="text-left sm:text-right space-y-0.5">
                    <p className="text-xl sm:text-2xl font-serif font-bold text-maroon-950">
                      ₹{item.rate.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[11px] font-mono text-charcoal-500">
                      Last updated: {new Date(item.lastUpdated).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mandatory Confirmation Disclaimer */}
          <div className="p-4 bg-gold-50 border border-gold-300 rounded-2xl flex items-start gap-3 text-xs font-sans text-charcoal-700">
            <Info className="w-5 h-5 text-gold-700 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-maroon-950 block">Store Rate Confirmation Notice:</strong>
              <p className="leading-relaxed">
                Rates displayed above are owner-entered reference values and are not automatic market feeds. Precious metal rates may fluctuate throughout business hours. <strong>Always confirm the final effective rate directly with our showroom team before transacting.</strong>
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State: Rates Unavailable */
        <div className="bg-cream-50 border border-gold-200/90 rounded-3xl p-10 sm:p-14 text-center shadow-card space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-gold-100 text-maroon-800 flex items-center justify-center mx-auto">
            <Coins className="w-8 h-8 text-gold-700" />
          </div>
          <h2 className="text-xl font-serif font-bold text-maroon-950">
            Rates are currently unavailable.
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-600 font-sans leading-relaxed">
            Owner-updated reference rates have not been published for today. Please contact our Gorakhpur showroom directly for current gold bullion rates and making charge inquiries.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <a
              href={`tel:${CONTACT_CONFIG.primaryPhoneRaw}`}
              className="inline-flex items-center gap-1.5 bg-maroon-800 hover:bg-maroon-900 text-cream-50 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              <span>Call Showroom</span>
            </a>
            <a
              href={`https://wa.me/${CONTACT_CONFIG.whatsappNumberRaw}?text=${encodeURIComponent(
                'Hello Khushi Ornament House, I would like to inquire about today\'s gold rates.'
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
      )}
    </div>
  );
}
