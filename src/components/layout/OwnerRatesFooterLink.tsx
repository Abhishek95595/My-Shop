'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ratesRepository } from '@/services/rates/ratesRepository';

export const OwnerRatesFooterLink: React.FC = () => {
  const [hasActiveRates, setHasActiveRates] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setHasActiveRates(ratesRepository.getActiveRates().length > 0);
    };

    refresh();
    window.addEventListener('koh_rates_updated', refresh);
    window.addEventListener('storage', refresh);

    return () => {
      window.removeEventListener('koh_rates_updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  if (!hasActiveRates) return null;

  return (
    <li>
      <Link
        href="/rates"
        className="hover:text-maroon-800 hover:underline transition-colors"
      >
        Owner Rates
      </Link>
    </li>
  );
};
