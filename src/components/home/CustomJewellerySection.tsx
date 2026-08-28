import React from 'react';
import { MessageCircle, Phone, Sparkles, PencilRuler, Flame, Gift } from 'lucide-react';
import { CONTACT_CONFIG } from '@/lib/constants';

const PROCESS_STEPS = [
  {
    step: '01',
    icon: PencilRuler,
    title: 'Design Consultation',
    description:
      'Share your design sketch, sample photograph, or discuss your vision with our master craftsmen in Gorakhpur.',
  },
  {
    step: '02',
    icon: Flame,
    title: 'Artisan Crafting & Purity',
    description:
      'Your piece is precision-crafted in 18K, 22K or 24K gold with meticulous detailing and weight accuracy.',
  },
  {
    step: '03',
    icon: Gift,
    title: 'Final Weighing & Handover',
    description:
      'Inspect your finished heirloom in person at our showroom with exact weighing and heirloom gift packaging.',
  },
];

export const CustomJewellerySection: React.FC = () => {
  const whatsappCustomMessage = encodeURIComponent(
    'Hello Khushi Ornament House, I am interested in custom jewellery manufacturing. I would like to discuss a custom design.'
  );

  return (
    <section id="custom-jewellery" className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="bg-cream-50 rounded-3xl border border-gold-300/80 p-6 sm:p-10 lg:p-12 shadow-card space-y-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-800 uppercase tracking-widest bg-gold-100/90 border border-gold-300 px-3.5 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-gold-700" />
            <span>Bespoke Manufacturing</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-maroon-950">
            Custom Jewellery Process
          </h2>
          <p className="text-sm sm:text-base text-charcoal-600 font-sans leading-relaxed">
            From a personal sketch to a timeless gold heirloom — experience seamless bespoke craftsmanship tailored to your exact weight and design preferences.
          </p>
        </div>

        {/* 3 Step Process Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {PROCESS_STEPS.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative bg-cream-100/80 rounded-2xl border border-gold-200/90 p-6 shadow-sm hover:shadow-card transition-all duration-300 flex flex-col justify-between space-y-4"
              >
                {/* Step Number Bubble */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-gold-200/80 text-maroon-900 font-serif font-bold text-lg flex items-center justify-center border border-gold-300">
                    {item.step}
                  </div>
                  <Icon className="w-6 h-6 text-gold-700" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-serif font-bold text-lg text-maroon-950">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal-600 font-sans leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {index < 2 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-gold-400 z-10">
                    →
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Call to Action Bar */}
        <div className="bg-maroon-900 text-cream-50 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="font-serif font-bold text-xl text-cream-50">
              Have a Design in Mind?
            </h3>
            <p className="text-xs sm:text-sm text-cream-200/80 font-sans">
              Connect directly with our Gorakhpur master jeweller on WhatsApp or phone.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={`https://wa.me/${CONTACT_CONFIG.whatsappNumberRaw}?text=${whatsappCustomMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold px-5 py-3 rounded-xl shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Discuss Custom Design</span>
            </a>

            <a
              href={`tel:${CONTACT_CONFIG.primaryPhoneRaw}`}
              className="inline-flex items-center gap-2 bg-cream-50 hover:bg-gold-50 text-maroon-950 text-xs sm:text-sm font-semibold px-5 py-3 rounded-xl shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
            >
              <Phone className="w-4 h-4 text-gold-700" />
              <span>Call: {CONTACT_CONFIG.primaryPhone}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
