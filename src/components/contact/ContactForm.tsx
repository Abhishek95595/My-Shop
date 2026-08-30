'use client';

import React, { useRef, useState } from 'react';
import { enquiryRepository } from '@/services/enquiries/enquiryRepository';
import { CONTACT_CONFIG, CATEGORIES } from '@/lib/constants';
import { useToast } from '@/context/ToastContext';
import {
  Send,
  MessageCircle,
  Phone,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const ContactForm: React.FC = () => {
  const { showToast } = useToast();
  const submitLockRef = useRef(false);

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [categoryOrProduct, setCategoryOrProduct] = useState('Bridal Jewellery');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<{
    name: string;
    whatsappUrl: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitLockRef.current) return;

    submitLockRef.current = true;
    setErrorMessage(null);
    setIsSubmitting(true);
    let succeeded = false;

    try {
      // 1. Save enquiry locally through repository
      const enquiry = await enquiryRepository.createEnquiry({
        name,
        mobile,
        categoryOrProduct,
        message,
      });

      // 2. Prepare prefilled WhatsApp message
      const text = encodeURIComponent(
        `Hello Khushi Ornament House,\n\nI submitted an inquiry via your website:\n- Name: ${enquiry.name}\n- Contact: ${enquiry.mobile}\n- Interest: ${enquiry.categoryOrProduct}${
          enquiry.message ? `\n- Note: ${enquiry.message}` : ''
        }\n\nPlease let me know availability and consultation details.`
      );
      const whatsappUrl = `https://wa.me/${CONTACT_CONFIG.whatsappNumberRaw}?text=${text}`;

      setSubmittedData({
        name: enquiry.name,
        whatsappUrl,
      });
      succeeded = true;

      showToast(
        'Inquiry Saved',
        'Your inquiry has been recorded. Tap Send on WhatsApp to connect with our showroom.',
        'success'
      );

      // Open WhatsApp automatically in a new window/tab
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to submit inquiry. Please try again.');
      }
    } finally {
      if (!succeeded) {
        submitLockRef.current = false;
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-cream-50 border border-gold-300 rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
      <div className="space-y-1 border-b border-gold-200/80 pb-4">
        <div className="inline-flex items-center gap-1.5 bg-gold-100 text-maroon-900 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-gold-200">
          <Sparkles className="w-3 h-3 text-gold-700" />
          <span>Showroom Inquiries &amp; Orders</span>
        </div>
        <h2 className="text-xl font-serif font-bold text-maroon-950">
          Send a Jewellery Inquiry
        </h2>
        <p className="text-xs text-charcoal-600 font-sans">
          Inquire about ready 18K, 22K and 24K gold designs or custom order consultations.
        </p>
      </div>

      {/* Success Notification Box */}
      {submittedData && (
        <div
          className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-3 animate-in fade-in duration-200"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-emerald-950">
                Thank you, {submittedData.name}! Your inquiry is prepared.
              </p>
              <p className="text-xs text-emerald-800 font-sans leading-relaxed">
                A prefilled WhatsApp message has been generated. Tap below to send it to our Gorakhpur store team directly.
              </p>
            </div>
          </div>
          <div className="pt-1">
            <a
              href={submittedData.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Send Inquiry on WhatsApp</span>
            </a>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div
          className="p-3.5 bg-maroon-50 border border-maroon-200 rounded-xl text-xs text-maroon-900 flex items-start gap-2"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 text-maroon-700 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Inquiry Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div className="space-y-1">
          <label
            htmlFor="enquiry-name"
            className="block text-xs font-bold uppercase tracking-wider text-maroon-900"
          >
            Full Name *
          </label>
          <input
            id="enquiry-name"
            type="text"
            required
            placeholder="e.g. Ramesh Kumar"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-xs p-3 bg-cream-100 border border-gold-200 rounded-xl text-charcoal-900 focus:outline-none focus:border-gold-500"
          />
        </div>

        {/* Mobile Number */}
        <div className="space-y-1">
          <label
            htmlFor="enquiry-mobile"
            className="block text-xs font-bold uppercase tracking-wider text-maroon-900"
          >
            Mobile Number (10-digit Indian Mobile) *
          </label>
          <input
            id="enquiry-mobile"
            type="tel"
            required
            placeholder="e.g. 9876543210"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="w-full text-xs p-3 bg-cream-100 border border-gold-200 rounded-xl text-charcoal-900 font-mono focus:outline-none focus:border-gold-500"
          />
        </div>

        {/* Category Interest */}
        <div className="space-y-1">
          <label
            htmlFor="enquiry-interest"
            className="block text-xs font-bold uppercase tracking-wider text-maroon-900"
          >
            Jewellery Interest *
          </label>
          <select
            id="enquiry-interest"
            required
            value={categoryOrProduct}
            onChange={(e) => setCategoryOrProduct(e.target.value)}
            className="w-full text-xs p-3 bg-cream-100 border border-gold-200 rounded-xl text-charcoal-900 focus:outline-none focus:border-gold-500"
          >
            <option value="Bridal Jewellery">Bridal Jewellery Sets</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
            <option value="Custom Bespoke Order">Custom Bespoke Order</option>
            <option value="Old-Gold Exchange">Old-Gold Exchange Inquiry</option>
            <option value="Gold/Silver Coins">Gold / Silver Coins &amp; Articles</option>
          </select>
        </div>

        {/* Optional Message */}
        <div className="space-y-1">
          <label
            htmlFor="enquiry-message"
            className="block text-xs font-bold uppercase tracking-wider text-maroon-900"
          >
            Message / Specification (Optional)
          </label>
          <textarea
            id="enquiry-message"
            rows={3}
            maxLength={1000}
            placeholder="Mention approximate weight, preferred purity, occasion date or specific design requests..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full text-xs p-3 bg-cream-100 border border-gold-200 rounded-xl text-charcoal-900 focus:outline-none focus:border-gold-500"
          />
        </div>

        {/* Submit Actions */}
        <div className="pt-2 space-y-2.5">
          <button
            type="submit"
            disabled={isSubmitting || !!submittedData}
            className="w-full inline-flex items-center justify-center gap-2 bg-maroon-800 hover:bg-maroon-900 disabled:bg-charcoal-400 disabled:cursor-not-allowed text-cream-50 font-bold text-xs py-3.5 px-6 rounded-xl shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 cursor-pointer"
          >
            <Send className="w-4 h-4 text-gold-300" />
            <span>
              {isSubmitting
                ? 'Saving Inquiry...'
                : submittedData
                  ? 'Inquiry Saved — Use WhatsApp Link Above'
                  : 'Submit Inquiry & Open WhatsApp'}
            </span>
          </button>

          <p className="text-[11px] text-charcoal-500 text-center font-sans">
            Your inquiry is saved locally and formatted into a ready WhatsApp message to {CONTACT_CONFIG.primaryPhone}.
          </p>
        </div>
      </form>
    </div>
  );
};
