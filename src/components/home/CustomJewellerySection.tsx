import React from 'react';
import { MessageCircle, Phone, Sparkles, PencilRuler, Flame, Gift } from 'lucide-react';
import { CONTACT_CONFIG } from '@/lib/constants';

const PROCESS_STEPS = [
  {
    step: '01',
    icon: PencilRuler,
    title: 'Design Consultation',
    description:
      'Share a design sketch, sample photograph, or discuss your requirements with the showroom team in Gorakhpur.',
  },
  {
    icon: Flame,
    step: '02',
    title: 'Artisan Crafting & Purity',
    description:
      'Confirm the chosen 18K, 22K or 24K gold option, design details, and approximate target weight before production.',
  },
  {
    icon: Gift,
    step: '03',
    title: 'Final Weighing & Handover',
    description:
      'Inspect the finished jewellery and confirm its final weight in person at the showroom before handover.',
  },
];

export const CustomJewellerySection: React.FC = () => {
  const whatsappCustomMessage = encodeURIComponent(
    'Hello Khushi Ornament House, I am interested in custom jewellery manufacturing. I would like to discuss a custom design.'
  );

  return (
    <section id="custom-jewellery" className="max-w-7xl mx-auto px-3 sm:px-6">
      <div className="relative bg-gradient-to-b from-cream-50 via-gold-50/30 to-cream-50 rounded-2xl sm:rounded-3xl border border-gold-300/90 p-4 sm:p-8 lg:p-12 shadow-luxury space-y-6 sm:space-y-10 overflow-hidden">
        {/* Subtle gold filigree accent on top edge */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold-400 to-transparent"
          aria-hidden="true"
        />

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2 sm:space-y-3">
          <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-gold-800 uppercase tracking-widest bg-gold-50 border border-gold-300/80 px-3 py-1 rounded-full shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-gold-700" />
            <span>Bespoke Atelier</span>
          </div>
          <h2 className="text-xl sm:text-3xl md:text-4xl font-serif font-bold text-maroon-950 tracking-tight">
            Custom Jewellery Process
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-charcoal-600 font-sans leading-relaxed">
            Turn your reference sketches or family heirlooms into certified fine gold creations through our 3-step master artisan consultation.
          </p>
        </div>

        {/* 3 Step Process Cards - Clean vertical stack on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 relative">
          {PROCESS_STEPS.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="group relative bg-cream-50 rounded-2xl border border-gold-300/80 hover:border-gold-400/90 p-5 sm:p-6 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between space-y-3 sm:space-y-4"
              >
                {/* Step Number & Icon */}
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-gold-100 to-gold-200/90 text-maroon-950 font-serif font-bold text-base sm:text-lg flex items-center justify-center border border-gold-300/90 shadow-xs group-hover:scale-105 transition-transform duration-300">
                    {item.step}
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-gold-50 flex items-center justify-center text-gold-700 border border-gold-200/60">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gold-700" />
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <h3 className="font-serif font-bold text-base sm:text-lg text-maroon-950 group-hover:text-maroon-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal-700 font-sans leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {index < 2 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-gold-400 z-10 font-bold">
                    →
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Call to Action Bar */}
        <div className="bg-gradient-to-r from-[#24040C] via-maroon-950 to-maroon-900 text-cream-50 rounded-2xl p-4 sm:p-7 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 shadow-lg border border-gold-400/30">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="font-serif font-bold text-base sm:text-xl text-cream-50">
              Have a Bespoke Design in Mind?
            </h3>
            <p className="text-xs sm:text-sm text-cream-200/80 font-sans">
              Connect with our Gorakhpur showroom team on WhatsApp or phone for immediate consultation.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 w-full md:w-auto flex-shrink-0">
            <a
              href={`https://wa.me/${CONTACT_CONFIG.whatsappNumberRaw}?text=${whatsappCustomMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl transition-all shadow-xs text-xs sm:text-sm min-h-[44px] active:scale-95 flex-1 sm:flex-initial"
              aria-label="Discuss Custom Jewellery on WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Design</span>
            </a>

            <a
              href={`tel:+${CONTACT_CONFIG.primaryPhoneRaw}`}
              className="inline-flex items-center justify-center gap-2 bg-cream-50 hover:bg-gold-50/90 text-maroon-950 border border-gold-300 font-semibold px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl transition-all shadow-xs text-xs sm:text-sm min-h-[44px] active:scale-95 flex-1 sm:flex-initial"
              aria-label={`Call Showroom at ${CONTACT_CONFIG.primaryPhone}`}
            >
              <Phone className="w-3.5 h-3.5 text-gold-700" />
              <span>Call Showroom</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
