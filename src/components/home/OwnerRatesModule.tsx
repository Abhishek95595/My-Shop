import React from 'react';
import { OwnerRatesState } from '@/services/productTypes';

interface OwnerRatesModuleProps {
  ratesState?: OwnerRatesState | null;
}

export const OwnerRatesModule: React.FC<OwnerRatesModuleProps> = ({
  ratesState,
}) => {
  // Requirement: Optional owner-entered rates module, hidden completely while empty
  if (
    !ratesState ||
    !ratesState.rates ||
    ratesState.rates.length === 0 ||
    ratesState.rates.every((r) => !r.ratePerGram)
  ) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="bg-cream-50 border border-gold-300/80 rounded-2xl p-6 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gold-200/60 pb-3">
          <div>
            <h3 className="font-serif font-bold text-lg text-maroon-950">
              Today’s Indicative Gold Rates
            </h3>
            <p className="text-xs text-charcoal-600 font-sans">
              Owner-entered indicative benchmark per gram (excl. making &amp; taxes)
            </p>
          </div>
          {ratesState.lastUpdated && (
            <span className="text-[11px] text-charcoal-500 font-mono">
              Updated: {ratesState.lastUpdated}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {ratesState.rates.map((rateItem) => (
            <div
              key={rateItem.purity}
              className="bg-cream-100 p-4 rounded-xl border border-gold-200 text-center space-y-1"
            >
              <span className="text-xs font-bold text-maroon-800 uppercase tracking-wider">
                {rateItem.purity} Gold
              </span>
              <div className="text-xl font-serif font-bold text-maroon-950">
                ₹{rateItem.ratePerGram?.toLocaleString('en-IN')}{' '}
                <span className="text-xs font-sans text-charcoal-500 font-normal">
                  / gram
                </span>
              </div>
            </div>
          ))}
        </div>

        {ratesState.notes && (
          <p className="text-[11px] text-charcoal-500 italic font-sans text-center">
            {ratesState.notes}
          </p>
        )}
      </div>
    </section>
  );
};
