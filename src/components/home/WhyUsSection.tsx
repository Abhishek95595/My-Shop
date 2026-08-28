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
      'Serving generations of Gorakhpur families since 1999 with transparent dealing and genuine relationships.',
  },
  {
    icon: Gem,
    title: '18K, 22K & 24K Gold Only',
    description:
      'Committed exclusively to pure gold jewellery, crafted with traditional care and strict purity standards.',
  },
  {
    icon: Sparkles,
    title: 'Bespoke Custom Jewellery',
    description:
      'Bring your design ideas, photos, or family heirlooms. We manufacture custom bridal sets and jewellery to order.',
  },
  {
    icon: Repeat,
    title: 'Old Gold Exchange',
    description:
      'Fair valuation and seamless exchange for your old gold jewellery to create fresh, contemporary designs.',
  },
  {
    icon: Users,
    title: 'Personal In-Store Guidance',
    description:
      'Direct consultation with our family team at our Gorakhpur showroom for bridal sets and investment purchases.',
  },
  {
    icon: Clock,
    title: 'Timely Wedding Deliveries',
    description:
      'Reliable turnaround for custom bridal orders, ensuring your jewellery is ready well before your auspicious date.',
  },
];

export const WhyUsSection: React.FC = () => {
  return (
    <section id="why-us" className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-800 uppercase tracking-widest bg-gold-100/90 border border-gold-300 px-3.5 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-gold-700" />
          <span>Our Heritage &amp; Commitment</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-maroon-950">
          Why Choose {STORE_NAME}
        </h2>
        <p className="text-sm sm:text-base text-charcoal-600 font-sans leading-relaxed">
          More than two decades of craftsmanship, fair dealing, and dedicated service in the heart of Gorakhpur.
        </p>
      </div>

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PILLARS.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <div
              key={pillar.title}
              className="bg-cream-50 rounded-2xl border border-gold-200/90 p-6 shadow-card hover:shadow-card-hover transition-all duration-300 space-y-3 flex flex-col"
            >
              <div className="w-12 h-12 rounded-xl bg-gold-100 border border-gold-200 flex items-center justify-center text-maroon-800 flex-shrink-0">
                <Icon className="w-6 h-6 text-gold-700" />
              </div>
              <h3 className="font-serif font-bold text-lg text-maroon-950">
                {pillar.title}
              </h3>
              <p className="text-sm text-charcoal-600 font-sans leading-relaxed flex-1">
                {pillar.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
