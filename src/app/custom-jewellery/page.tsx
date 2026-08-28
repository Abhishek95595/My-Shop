import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  STORE_NAME,
  STORE_TAGLINE,
  STORE_OWNER,
  CONTACT_CONFIG,
} from '@/lib/constants';
import {
  Gem,
  Sparkles,
  Layers,
  CheckCircle2,
  ArrowRight,
  MessageCircle,
  Clock,
  Shield,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Custom Gold Jewellery Manufacturing',
  description: `Custom gold jewellery consultation at ${STORE_NAME}, Gorakhpur for bridal necklaces, rings, chains, and bangles.`,
  alternates: { canonical: '/custom-jewellery' },
};

export default function CustomJewelleryPage() {
  const steps = [
    {
      step: '01',
      title: 'Design Consultation & Idea',
      description:
        'Share your design sketch, reference photograph, or bridal aesthetic requirements with us during an in-store visit or via WhatsApp.',
    },
    {
      step: '02',
      title: 'Purity & Weight Planning',
      description:
        'Select your preferred gold purity (18K, 22K, or 24K) and target weight bracket to match your budget and lifestyle preferences.',
    },
    {
      step: '03',
      title: 'Artisan Craftsmanship',
      description:
        'The agreed design moves into manufacturing after its design, gold option, approximate target weight, and timeline are discussed.',
    },
    {
      step: '04',
      title: 'Inspection & Showroom Handover',
      description:
        'Inspect the completed custom jewellery and confirm its final specifications in person at our Gorakhpur showroom.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
      {/* Header Section */}
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-2 bg-gold-100/90 border border-gold-300 text-maroon-900 text-xs font-semibold px-3 py-1 rounded-full shadow-xs">
          <Gem className="w-3.5 h-3.5 text-gold-700" />
          <span>Bespoke Manufacturing</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-maroon-950">
          Custom Gold Jewellery
        </h1>
        <p className="text-sm sm:text-base text-charcoal-700 font-sans leading-relaxed">
          {STORE_TAGLINE}. Discuss made-to-order bridal and ceremonial gold jewellery through our showroom consultation process.
        </p>
      </div>

      {/* Step by Step Process Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-serif font-bold text-maroon-950 border-b border-gold-200/60 pb-2">
          How Custom Orders Work
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s) => (
            <div
              key={s.step}
              className="bg-cream-50 border border-gold-200/90 rounded-3xl p-5 shadow-card space-y-3 relative overflow-hidden"
            >
              <span className="text-3xl font-serif font-bold text-gold-300/80 block">
                {s.step}
              </span>
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

      {/* Specifications & Capabilities Card */}
      <div className="bg-cream-50 border border-gold-200/90 rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
        <h2 className="text-lg font-serif font-bold text-maroon-950 border-b border-gold-200/60 pb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-gold-700" />
          <span>Customization Options</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs sm:text-sm font-sans">
          <div className="space-y-2 p-4 bg-cream-100/70 border border-gold-200 rounded-2xl">
            <div className="flex items-center gap-2 text-maroon-950 font-bold">
              <Shield className="w-4 h-4 text-gold-700" />
              <span>Available Purities</span>
            </div>
            <p className="text-charcoal-600">
              Discuss 18 Karat, 22 Karat, or 24 Karat gold options during consultation.
            </p>
          </div>

          <div className="space-y-2 p-4 bg-cream-100/70 border border-gold-200 rounded-2xl">
            <div className="flex items-center gap-2 text-maroon-950 font-bold">
              <Layers className="w-4 h-4 text-gold-700" />
              <span>Jewellery Categories</span>
            </div>
            <p className="text-charcoal-600">
              Bridal sets, rings, chains, mangalsutras, and bangles/kadas.
            </p>
          </div>

          <div className="space-y-2 p-4 bg-cream-100/70 border border-gold-200 rounded-2xl">
            <div className="flex items-center gap-2 text-maroon-950 font-bold">
              <Clock className="w-4 h-4 text-gold-700" />
              <span>Timeline Planning</span>
            </div>
            <p className="text-charcoal-600">
              Timelines depend on design intricacy. Discuss deadlines during consultation.
            </p>
          </div>
        </div>
      </div>

      {/* Action Banner */}
      <div className="bg-maroon-900 text-cream-50 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-card">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-xl font-serif font-bold text-cream-50">
            Start Your Custom Design Consultation
          </h3>
          <p className="text-xs text-cream-200/80 font-sans">
            Connect with our showroom team at Urdu Bazar, Gorakhpur.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 bg-gold-400 hover:bg-gold-300 text-maroon-950 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <span>Inquire Online</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href={`https://wa.me/${CONTACT_CONFIG.whatsappNumberRaw}?text=${encodeURIComponent(
              'Hello Khushi Ornament House, I would like to inquire about a custom gold jewellery order.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-cream-50/10 hover:bg-cream-50/20 text-cream-50 text-xs font-bold px-4 py-2.5 rounded-xl border border-cream-50/30 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
