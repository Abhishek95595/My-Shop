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
  HelpCircle,
  Sparkles,
  ChevronDown,
  ArrowRight,
  MessageCircle,
} from 'lucide-react';

export const metadata: Metadata = {
  title: `Frequently Asked Questions (FAQ) | ${STORE_NAME}`,
  description: `Find answers about gold jewellery collections, custom manufacturing, old-gold exchange, showroom consultations, and store policies at ${STORE_NAME} in Gorakhpur.`,
};

export default function FaqPage() {
  const faqs = [
    {
      question: 'What types of jewellery are shown on this website?',
      answer:
        'Our online digital catalogue currently features gold jewellery only, available in 18K, 22K (916 Standard), and 24K purities. We specialize in bridal necklace sets, rings, chains, mangalsutras, and bangles. In-store silver articles and gold/silver coins are available directly at our Gorakhpur showroom.',
    },
    {
      question: 'Can I purchase jewellery or pay online directly through this website?',
      answer:
        'No. This website operates as a showcase catalogue and inquiry platform. All purchases, physical inspections, exact weighings, and transactions occur offline at our showroom in Urdu Bazar, Gorakhpur.',
    },
    {
      question: 'Why are product weights listed as "approximate"?',
      answer:
        'Because handcrafted gold ornaments involve master artisanal goldsmithing, the final weight of an individual piece may vary slightly depending on finger size, design adjustment, and metal finishing. Final invoice weight is determined on calibrated scales during in-store purchase.',
    },
    {
      question: 'What is the difference between "Available" and "Made on Order"?',
      answer:
        '"Available" indicates designs that are typically ready for viewing in our showroom or available for immediate purchase. "Made on Order" indicates bespoke designs crafted specifically upon customer request according to custom size and weight preferences.',
    },
    {
      question: 'How do I request a custom gold jewellery design?',
      answer:
        'You can submit an inquiry through our Custom Jewellery page, reach out via WhatsApp with design sketches, or visit our Gorakhpur showroom to consult directly with store proprietor Dilip Kumar Verma.',
    },
    {
      question: 'How does old-gold exchange work?',
      answer:
        'Bring your pre-owned gold ornaments to our Gorakhpur showroom. Our team performs in-person purity testing and net weighing to determine the exact exchange value toward new jewellery. Final valuation requires physical inspection.',
    },
    {
      question: 'What are the Wishlist and Buying Shortlist features?',
      answer:
        'The Wishlist allows you to save your favourite pieces for future reference. The Buying Shortlist compiles selected items into a consultation list that you can bring to our showroom or discuss via WhatsApp.',
    },
    {
      question: 'What are your showroom hours and location?',
      answer: `Our showroom is located at ${CONTACT_CONFIG.address}. We are open daily from ${CONTACT_CONFIG.hours}. You can reach us at ${CONTACT_CONFIG.primaryPhone}.`,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
      {/* Header Section */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 bg-gold-100/90 border border-gold-300 text-maroon-900 text-xs font-semibold px-3 py-1 rounded-full shadow-xs">
          <HelpCircle className="w-3.5 h-3.5 text-gold-700" />
          <span>Customer Assistance</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-maroon-950">
          Frequently Asked Questions
        </h1>
        <p className="text-sm sm:text-base text-charcoal-700 font-sans leading-relaxed">
          {STORE_TAGLINE}. Find clear answers about our gold collections, custom orders, exchange process, and store policies.
        </p>
      </div>

      {/* Accordion / FAQ List */}
      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <details
            key={idx}
            className="group bg-cream-50 border border-gold-200/90 rounded-2xl p-5 shadow-card open:shadow-md transition-all duration-200"
          >
            <summary className="font-serif font-bold text-base sm:text-lg text-maroon-950 flex items-center justify-between cursor-pointer list-none gap-4">
              <span>{faq.question}</span>
              <ChevronDown className="w-5 h-5 text-gold-700 group-open:rotate-180 transition-transform flex-shrink-0" />
            </summary>
            <p className="mt-3 text-xs sm:text-sm text-charcoal-700 font-sans leading-relaxed border-t border-gold-200/60 pt-3">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>

      {/* Still Have Questions CTA */}
      <div className="bg-cream-100 border border-gold-300 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-card">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-lg font-serif font-bold text-maroon-950">
            Have a Specific Question?
          </h3>
          <p className="text-xs text-charcoal-600 font-sans">
            Our team is available by phone or WhatsApp during showroom hours ({CONTACT_CONFIG.hours}).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 bg-maroon-800 hover:bg-maroon-900 text-cream-50 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <span>Contact Us</span>
            <ArrowRight className="w-4 h-4 text-gold-300" />
          </Link>
          <a
            href={`https://wa.me/${CONTACT_CONFIG.whatsappNumberRaw}?text=${encodeURIComponent(
              'Hello Khushi Ornament House, I have a question regarding your jewellery.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-xs"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
