import React from 'react';
import { Metadata } from 'next';
import {
  STORE_NAME,
  CONTACT_CONFIG,
  GSTIN,
  EXACT_WEIGHT_DISCLAIMER,
} from '@/lib/constants';
import { Scale, FileCheck, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service (Draft)',
  description: `Terms of service draft describing the catalogue, inquiry, and offline transaction conditions for ${STORE_NAME}.`,
  alternates: { canonical: '/terms' },
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Draft Disclaimer Notice */}
      <div className="bg-gold-100 border border-gold-400 rounded-2xl p-4 sm:p-5 flex items-center gap-3 text-xs sm:text-sm text-maroon-950 font-sans shadow-xs">
        <AlertTriangle className="w-5 h-5 text-gold-800 flex-shrink-0" />
        <div>
          <strong className="font-serif font-bold uppercase tracking-wider block text-maroon-900">
            Draft — Pending Legal Approval
          </strong>
          <span>
            This document outlines the operational and inquiry terms governing the Khushi Ornament House web showcase.
          </span>
        </div>
      </div>

      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-maroon-950">
          Terms of Service
        </h1>
        <p className="text-xs font-mono text-charcoal-500">
          Last Updated: 29 August 2026 • Khushi Ornament House ({GSTIN})
        </p>
      </div>

      {/* Terms Content */}
      <div className="bg-cream-50 border border-gold-200/90 rounded-3xl p-6 sm:p-10 shadow-card space-y-8 text-charcoal-800 font-sans text-xs sm:text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-serif font-bold text-maroon-950 border-b border-gold-200/60 pb-1">
            1. Nature of the Digital Catalogue
          </h2>
          <p>
            The website of <strong>{STORE_NAME}</strong> functions strictly as an informational online showcase and inquiry interface. It is designed to assist customers in discovering jewellery designs, compiling consultation shortlists, and initiating direct communications with our showroom.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-serif font-bold text-maroon-950 border-b border-gold-200/60 pb-1">
            2. Offline Transactions &amp; In-Store Purchases
          </h2>
          <p>
            No online sales contracts, payments, or doorstep deliveries are conducted through this website. All commercial transactions, price calculations, billing, invoicing, and jewellery handovers take place exclusively in person at our showroom located at {CONTACT_CONFIG.address}.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-serif font-bold text-maroon-950 border-b border-gold-200/60 pb-1">
            3. Approximate Weights &amp; Specifications
          </h2>
          <p>
            {EXACT_WEIGHT_DISCLAIMER} Final gram weight, dimensions, and any applicable deductions are confirmed during physical in-store selection.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-serif font-bold text-maroon-950 border-b border-gold-200/60 pb-1">
            4. Owner-Entered Reference Rates
          </h2>
          <p>
            Bullion rates published on the Rates page are entered manually by the store owner as general reference indications. Gold and silver market rates fluctuate continuously. You must confirm the actual effective rate directly with the showroom team prior to finalizing any transaction.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-serif font-bold text-maroon-950 border-b border-gold-200/60 pb-1">
            5. Old-Gold Valuation Policy
          </h2>
          <p>
            Old-gold valuations and exchange estimates require physical testing and inspection at our Gorakhpur showroom. No binding price or exchange valuation can be provided through online inquiries alone.
          </p>
        </section>

        <section className="space-y-2 border-t border-gold-200/60 pt-4">
          <h2 className="text-base font-serif font-bold text-maroon-950">
            6. Governing Jurisdiction
          </h2>
          <p>
            Any disputes or matters arising in connection with store transactions or inquiries are subject exclusively to the jurisdiction of the competent courts in Gorakhpur, Uttar Pradesh, India.
          </p>
        </section>
      </div>
    </div>
  );
}
