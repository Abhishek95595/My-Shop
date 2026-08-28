import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  STORE_NAME,
  STORE_TAGLINE,
  STORE_OWNER,
  CONTACT_CONFIG,
  GSTIN,
  APPROVED_SERVICES,
} from '@/lib/constants';
import {
  ShieldCheck,
  Building,
  UserCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  MapPin,
} from 'lucide-react';

export const metadata: Metadata = {
  title: `About Us | ${STORE_NAME}`,
  description: `Learn about ${STORE_NAME}, owned and operated by ${STORE_OWNER} in Gorakhpur with 25+ years of trust and dedicated jewellery craftsmanship.`,
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Page Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 bg-gold-100/90 border border-gold-300 text-maroon-900 text-xs font-semibold px-3 py-1 rounded-full shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-gold-700" />
          <span>25+ Years of Trust</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-maroon-950">
          About Khushi Ornament House
        </h1>
        <p className="text-base sm:text-lg text-charcoal-700 font-sans leading-relaxed">
          {STORE_TAGLINE} under the leadership of store proprietor <strong className="text-maroon-950">{STORE_OWNER}</strong>.
        </p>
      </div>

      {/* Main Narrative Card */}
      <div className="bg-cream-50 border border-gold-200/90 rounded-3xl p-6 sm:p-10 shadow-card space-y-6 text-charcoal-800 font-sans text-sm sm:text-base leading-relaxed">
        <div className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-maroon-950 border-b border-gold-200/60 pb-3 flex items-center gap-2">
            <Building className="w-5 h-5 text-gold-700" />
            <span>Store Introduction</span>
          </h2>
          <p>
            Welcome to <strong className="text-maroon-950">Khushi Ornament House</strong>, located at Urdu Bazar in Gorakhpur, Uttar Pradesh. For over 25 years, our establishment has served individuals and families looking for dependable gold jewellery, personalized ornaments, and reliable service.
          </p>
          <p>
            Our showroom offers a curated selection of 18K, 22K and 24K gold jewellery, including bridal necklace sets, rings, chains, mangalsutras, and bangles. Every piece is crafted with meticulous attention to detail, finish, and wearability.
          </p>
        </div>

        {/* Business Commitments */}
        <div className="pt-4 border-t border-gold-200/60 space-y-4">
          <h3 className="font-serif font-bold text-base text-maroon-950">
            Our Business Principles
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="flex items-start gap-3 p-4 bg-cream-100/70 border border-gold-200 rounded-2xl">
              <ShieldCheck className="w-5 h-5 text-gold-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-maroon-950 block mb-0.5">25+ Years of Trust</strong>
                <span className="text-charcoal-600">
                  Decades of established goodwill serving generations of local customers in Gorakhpur.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-cream-100/70 border border-gold-200 rounded-2xl">
              <UserCheck className="w-5 h-5 text-gold-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-maroon-950 block mb-0.5">Personalized Owner Consultation</strong>
                <span className="text-charcoal-600">
                  Direct guidance from proprietor {STORE_OWNER} for custom manufacturing and bespoke designs.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Store Services List */}
        <div className="pt-4 border-t border-gold-200/60 space-y-3">
          <h3 className="font-serif font-bold text-base text-maroon-950">
            Showroom Services
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
            {APPROVED_SERVICES.map((srv) => (
              <li key={srv} className="flex items-center gap-2 text-charcoal-700">
                <CheckCircle2 className="w-4 h-4 text-gold-700 flex-shrink-0" />
                <span>{srv}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-charcoal-500 italic pt-1">
            Note: Our online digital catalogue highlights gold jewellery. Silver articles, coins, and physical evaluations are conducted directly at our showroom.
          </p>
        </div>

        {/* Business Registration Details */}
        <div className="pt-4 border-t border-gold-200/60 bg-gold-50/50 p-4 rounded-2xl flex flex-col sm:flex-row justify-between gap-4 text-xs">
          <div>
            <span className="text-charcoal-500 block">Registered Business</span>
            <span className="font-bold text-maroon-950">{STORE_NAME}</span>
          </div>
          <div>
            <span className="text-charcoal-500 block">Proprietor</span>
            <span className="font-bold text-maroon-950">{STORE_OWNER}</span>
          </div>
          <div>
            <span className="text-charcoal-500 block">GSTIN</span>
            <span className="font-mono font-bold text-maroon-950">{GSTIN}</span>
          </div>
        </div>
      </div>

      {/* Call to Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-maroon-900 text-cream-50 rounded-3xl p-6 sm:p-8 shadow-card">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-xl font-serif font-bold text-cream-50">
            Visit Our Gorakhpur Showroom
          </h3>
          <p className="text-xs text-cream-200/80 font-sans">
            Open daily from {CONTACT_CONFIG.hours} at Urdu Bazar, Gorakhpur.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-1.5 bg-gold-400 hover:bg-gold-300 text-maroon-950 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <span>Explore Catalogue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 bg-cream-50/10 hover:bg-cream-50/20 text-cream-50 text-xs font-bold px-4 py-2.5 rounded-xl border border-cream-50/30 transition-colors"
          >
            <span>Contact Us</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
