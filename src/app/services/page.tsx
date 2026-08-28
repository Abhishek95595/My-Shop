import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  STORE_NAME,
  STORE_TAGLINE,
  CONTACT_CONFIG,
} from '@/lib/constants';
import {
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Coins,
  RefreshCw,
  Gem,
  Store,
  MessageCircle,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Our Jewellery Services',
  description: `Explore services offered by ${STORE_NAME} in Gorakhpur: custom gold jewellery manufacturing, old-gold exchange, retail & wholesale, wedding jewellery, and gold/silver coins.`,
  alternates: { canonical: '/services' },
};

export default function ServicesPage() {
  const servicesList = [
    {
      title: 'Custom Gold Jewellery Manufacturing',
      icon: Gem,
      description:
        'Discuss a specific design or bridal requirement, preferred approximate weight, and 18K, 22K or 24K gold option with the showroom team.',
      link: '/custom-jewellery',
      linkText: 'Custom Jewellery Details',
    },
    {
      title: 'Wedding & Bridal Jewellery',
      icon: Sparkles,
      description:
        'Wedding jewellery options include bridal necklace sets, matching earrings, maang tikka, bangles, and rings. Confirm current availability in store.',
      link: '/catalogue?occasion=Wedding',
      linkText: 'View Wedding Jewellery',
    },
    {
      title: 'Old-Gold Exchange',
      icon: RefreshCw,
      description:
        'Old-gold exchange requires physical in-store inspection. Final valuation is confirmed only after the showroom assessment.',
      link: '/old-gold-exchange',
      linkText: 'Old-Gold Exchange Details',
    },
    {
      title: 'Gold Buying and Selling',
      icon: Coins,
      description:
        'Gold buying and selling services are available at the Gorakhpur showroom. Applicable conditions are confirmed in person.',
      link: '/contact',
      linkText: 'Inquire with Store',
    },
    {
      title: 'Retail and Wholesale Supply',
      icon: Store,
      description:
        'Retail and wholesale services are available; product scope and current availability are confirmed directly with the store.',
      link: '/contact',
      linkText: 'Connect with Us',
    },
    {
      title: 'Gold/Silver Coins & In-Store Silver Articles',
      icon: Layers,
      description:
        'Gold and silver coins and in-store silver articles are available for direct showroom inquiry.',
      link: '/contact',
      linkText: 'Inquire In-Store Items',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
      {/* Header Section */}
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-2 bg-gold-100/90 border border-gold-300 text-maroon-900 text-xs font-semibold px-3 py-1 rounded-full shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-gold-700" />
          <span>Our Showroom Capabilities</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-maroon-950">
          Jewellery Services in Gorakhpur
        </h1>
        <p className="text-sm sm:text-base text-charcoal-700 font-sans leading-relaxed">
          {STORE_TAGLINE}. We offer a comprehensive suite of gold manufacturing, exchange, and consultation services at our Urdu Bazar showroom.
        </p>
      </div>

      {/* Scope Disclaimer Banner */}
      <div className="bg-cream-50 border border-gold-300/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3 shadow-sm text-xs font-sans text-charcoal-700">
        <Sparkles className="w-5 h-5 text-gold-700 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-maroon-950 block mb-0.5">Digital Catalogue Scope Notice:</strong>
          Our online catalogue currently displays our core gold jewellery collection. Silver articles, coins, and physical evaluations are conducted directly at our Gorakhpur showroom.
        </div>
      </div>

      {/* Services Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servicesList.map((srv) => {
          const Icon = srv.icon;
          return (
            <div
              key={srv.title}
              className="bg-cream-50 border border-gold-200/90 rounded-3xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gold-100 text-maroon-800 flex items-center justify-center border border-gold-300">
                  <Icon className="w-6 h-6 text-gold-700" />
                </div>
                <h2 className="text-lg font-serif font-bold text-maroon-950">
                  {srv.title}
                </h2>
                <p className="text-xs text-charcoal-600 font-sans leading-relaxed">
                  {srv.description}
                </p>
              </div>

              <div className="pt-3 border-t border-gold-200/60">
                <Link
                  href={srv.link}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-maroon-800 hover:text-maroon-950 transition-colors"
                >
                  <span>{srv.linkText}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gold-700" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Direct WhatsApp Consultation Box */}
      <div className="bg-cream-100 border border-gold-300 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-card">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-xl font-serif font-bold text-maroon-950">
            Have a Specific Requirement?
          </h3>
          <p className="text-xs text-charcoal-600 font-sans">
            Connect directly with our Gorakhpur showroom for quotes and consultation.
          </p>
        </div>
        <a
          href={`https://wa.me/${CONTACT_CONFIG.whatsappNumberRaw}?text=${encodeURIComponent(
            'Hello Khushi Ornament House, I would like to inquire about your jewellery services.'
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-3 px-6 rounded-xl shadow-xs transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Inquire on WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
