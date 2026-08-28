import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  STORE_NAME,
  STORE_TAGLINE,
  CONTACT_CONFIG,
} from '@/lib/constants';
import {
  RefreshCw,
  Scale,
  ShieldCheck,
  Building,
  Info,
  ArrowRight,
  MessageCircle,
  MapPin,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Old-Gold Exchange Service',
  description: `Old-gold exchange information for ${STORE_NAME}, Gorakhpur. Final valuation requires physical in-store inspection.`,
  alternates: { canonical: '/old-gold-exchange' },
};

export default function OldGoldExchangePage() {
  const steps = [
    {
      step: '1',
      title: 'In-Store Physical Inspection',
      description:
        'Bring your old gold ornaments to our Gorakhpur showroom for direct physical assessment and purity verification.',
    },
    {
      step: '2',
      title: 'Weighing & Evaluation',
      description:
        'The showroom assesses net gold weight, purity, deductions, and applicable store rates during the physical visit.',
    },
    {
      step: '3',
      title: 'Exchange Value Toward New Ornaments',
      description:
        'Apply the agreed exchange value directly toward purchasing new 18K, 22K or 24K gold jewellery designs from our catalogue.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
      {/* Header Section */}
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-2 bg-gold-100/90 border border-gold-300 text-maroon-900 text-xs font-semibold px-3 py-1 rounded-full shadow-xs">
          <RefreshCw className="w-3.5 h-3.5 text-gold-700" />
          <span>Exchange Services</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-maroon-950">
          Old-Gold Exchange
        </h1>
        <p className="text-sm sm:text-base text-charcoal-700 font-sans leading-relaxed">
          {STORE_TAGLINE}. Old-gold exchange inquiries are completed through physical inspection and final in-store valuation.
        </p>
      </div>

      {/* Mandatory In-Store Physical Valuation Notice */}
      <div className="bg-gold-50 border border-gold-300 rounded-3xl p-6 shadow-sm space-y-2 text-xs sm:text-sm font-sans text-charcoal-800">
        <div className="flex items-center gap-2 font-serif font-bold text-maroon-950 text-base">
          <Info className="w-5 h-5 text-gold-700 flex-shrink-0" />
          <span>Physical In-Store Evaluation Policy</span>
        </div>
        <p className="leading-relaxed">
          <strong>Important:</strong> Gold valuation depends on physical purity testing, applicable deductions, and weighing. Therefore, <strong>final exchange valuation is provided only upon physical inspection at our showroom</strong>. This website does not provide an automated or online valuation calculator.
        </p>
      </div>

      {/* Process Steps */}
      <div className="space-y-4">
        <h2 className="text-xl font-serif font-bold text-maroon-950 border-b border-gold-200/60 pb-2">
          Exchange Procedure
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div
              key={s.step}
              className="bg-cream-50 border border-gold-200/90 rounded-3xl p-6 shadow-card space-y-3"
            >
              <div className="w-10 h-10 rounded-2xl bg-gold-100 text-maroon-900 font-serif font-bold text-lg flex items-center justify-center border border-gold-300">
                {s.step}
              </div>
              <h3 className="font-serif font-bold text-base text-maroon-950">
                {s.title}
              </h3>
              <p className="text-xs text-charcoal-600 font-sans leading-relaxed">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Showroom Visit CTA */}
      <div className="bg-cream-50 border border-gold-200/90 rounded-3xl p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-lg font-serif font-bold text-maroon-950 flex items-center justify-center sm:justify-start gap-2">
            <Building className="w-5 h-5 text-gold-700" />
            <span>Visit Our Gorakhpur Showroom for Evaluation</span>
          </h3>
          <p className="text-xs text-charcoal-600 font-sans">
            {CONTACT_CONFIG.address} • Open {CONTACT_CONFIG.hours}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 bg-maroon-800 hover:bg-maroon-900 text-cream-50 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <span>Showroom Details</span>
            <ArrowRight className="w-4 h-4 text-gold-300" />
          </Link>
          <a
            href={`https://wa.me/${CONTACT_CONFIG.whatsappNumberRaw}?text=${encodeURIComponent(
              'Hello Khushi Ornament House, I would like to inquire about old-gold exchange at your showroom.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-xs"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
