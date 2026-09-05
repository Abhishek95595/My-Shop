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
      <div className="bg-cream-50 rounded-2xl sm:rounded-3xl border border-gold-300/80 p-4 sm:p-8 lg:p-12 shadow-card space-y-6 sm:space-y-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2 sm:space-y-3">
          <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-gold-800 uppercase tracking-widest bg-gold-100/90 border border-gold-300 px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-gold-700" />
            <span>Bespoke Manufacturing</span>
          </div>
          <h2 className="text-xl sm:text-3xl md:text-4xl font-serif font-bold text-maroon-950">
            Custom Jewellery Process
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-charcoal-600 font-sans leading-relaxed">
            Discuss a reference design, preferred gold purity, approximate target weight, and showroom handover through a clear consultation process.
          </p>
        </div>

        {/* 3 Step Process Cards - Clean vertical stack on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 relative">
          {PROCESS_STEPS.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative bg-cream-100/80 rounded-xl sm:rounded-2xl border border-gold-200/90 p-4 sm:p-6 shadow-xs hover:shadow-card transition-all duration-300 flex flex-col justify-between space-y-2.5 sm:space-y-4"
              >
                {/* Step Number Bubble */}
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gold-200/80 text-maroon-900 font-serif font-bold text-base sm:text-lg flex items-center justify-center border border-gold-300">
                    {item.step}
                  </div>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-gold-700" />
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <h3 className="font-serif font-bold text-base sm:text-lg text-maroon-950">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal-600 font-sans leading-relaxed">
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
        <div className="bg-maroon-900 text-cream-50 rounded-xl sm:rounded-2xl p-4 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 shadow-sm">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="font-serif font-bold text-base sm:text-xl text-cream-50">
              Have a Design in Mind?
            </h3>
            <p className="text-xs sm:text-sm text-cream-200/80 font-sans">
              Connect with our Gorakhpur showroom team on WhatsApp or phone.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 w-full md:w-auto">
            <a
              href={`https://wa.me/${CONTACT_CONFIG.whatsappNumberRaw}?text=${whatsappCustomMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl shadow-xs transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 min-h-[44px]"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Discuss Design</span>
            </a>

            <a
              href={`tel:+${CONTACT_CONFIG.primaryPhoneRaw}`}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-cream-50 hover:bg-gold-50 active:scale-95 text-maroon-950 text-xs sm:text-sm font-semibold px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl shadow-xs transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 min-h-[44px]"
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
