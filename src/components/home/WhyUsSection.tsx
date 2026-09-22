import React from 'react';
import {
  ShieldCheck,
  Sparkles,
  Users,
  Repeat,
  Gem,
  Clock,
} from 'lucide-react';
import { STORE_NAME } from '@/lib/constants';

const PILLARS = [
  {
    icon: ShieldCheck,
    title: '25+ Years of Trust',
    description:
      'Serving generations of families across Gorakhpur with transparent craftsmanship.',
  },
  {
    icon: Gem,
    title: '18K, 22K & 24K Gold',
    description:
      'Fine gold jewellery crafted in certified 18K, 22K, and 24K purity standards.',
  },
  {
    icon: Sparkles,
    title: 'Custom Jewellery',
    description:
      'Bring reference sketches or old gold to manufacture custom bridal designs.',
  },
  {
    icon: Repeat,
    title: 'Old Gold Exchange',
    description:
      'Fair, transparent old-gold exchange after physical valuation at the showroom.',
  },
  {
    icon: Users,
    title: 'Personal Guidance',
    description:
      'Attentive showroom guidance for bridal trousseaus and everyday jewellery.',
  },
  {
    icon: Clock,
    title: 'Wedding Consultation',
    description:
      'Discuss bespoke bridal designs and expected timelines directly with our artisans.',
  },
];

export const WhyUsSection: React.FC = () => {
  return (
    <section id="why-us" className="max-w-7xl mx-auto px-3 sm:px-6 space-y-4 sm:space-y-8">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2 sm:space-y-3">
        <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-gold-800 uppercase tracking-widest bg-gold-50 border border-gold-300/80 px-3 py-1 rounded-full shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-gold-700" />
          <span>Heritage of Integrity</span>
        </div>
        <h2 className="text-xl sm:text-3xl md:text-4xl font-serif font-bold text-maroon-950 tracking-tight">
          Why Choose {STORE_NAME}
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-charcoal-600 font-sans leading-relaxed">
          Approved gold jewellery services, certified purity, and dedicated in-store consultation in Gorakhpur.
        </p>
      </div>

      {/* Pillars Grid - Heraldic luxury cards with scannable summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 lg:gap-6">
        {PILLARS.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <div
              key={pillar.title}
              className="group relative bg-gradient-to-b from-cream-50 to-cream-100/60 rounded-2xl border border-gold-300/80 hover:border-gold-400/90 p-4 sm:p-6 shadow-card hover:shadow-card-hover transition-all duration-300 space-y-2.5 flex flex-col overflow-hidden"
            >
              {/* Subtle top gold accent */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold-400/60 to-transparent"
                aria-hidden="true"
              />

              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-gold-100 to-gold-200/80 border border-gold-300/80 flex items-center justify-center text-maroon-800 flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform duration-300">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-gold-700" />
                </div>
                <h3 className="font-serif font-bold text-base sm:text-lg text-maroon-950 group-hover:text-maroon-700 transition-colors">
                  {pillar.title}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-charcoal-700 font-sans leading-relaxed flex-1 pt-1">
                {pillar.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
