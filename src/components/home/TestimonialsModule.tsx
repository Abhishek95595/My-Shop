import React from 'react';

interface TestimonialItem {
  id: string;
  author: string;
  relation: string;
  quote: string;
}

interface TestimonialsModuleProps {
  testimonials?: TestimonialItem[];
}

export const TestimonialsModule: React.FC<TestimonialsModuleProps> = ({
  testimonials,
}) => {
  // Requirement: Testimonials preview only when approved content exists
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-maroon-950">
          Client Stories &amp; Trust
        </h2>
        <p className="text-sm text-charcoal-600 font-sans">
          Words from families who trust Khushi Ornament House.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className="bg-cream-50 rounded-2xl border border-gold-200/90 p-6 shadow-card space-y-3 flex flex-col justify-between"
          >
            <p className="text-sm text-charcoal-700 italic font-sans leading-relaxed">
              “{t.quote}”
            </p>
            <div className="pt-3 border-t border-gold-200/60">
              <h4 className="font-serif font-bold text-sm text-maroon-900">
                {t.author}
              </h4>
              <span className="text-xs text-charcoal-500 font-sans">
                {t.relation}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
