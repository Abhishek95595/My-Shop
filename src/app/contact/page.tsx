import React from 'react';
import { Metadata } from 'next';
import { ContactForm } from '@/components/contact/ContactForm';
import {
  STORE_NAME,
  STORE_TAGLINE,
  STORE_OWNER,
  CONTACT_CONFIG,
  GSTIN,
} from '@/lib/constants';
import {
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  Clock,
  ShieldCheck,
  Building,
  ExternalLink,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact & Showroom Location',
  description: `Visit ${STORE_NAME} in Urdu Bazar, Gorakhpur for gold jewellery inquiries, custom orders, and showroom consultations.`,
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
      {/* Header Section */}
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-2 bg-gold-100/90 border border-gold-300 text-maroon-900 text-xs font-semibold px-3 py-1 rounded-full shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-gold-700" />
          <span>Showroom &amp; Consultations</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-maroon-950">
          Contact Khushi Ornament House
        </h1>
        <p className="text-sm sm:text-base text-charcoal-700 font-sans leading-relaxed">
          {STORE_TAGLINE}. We welcome you to visit our showroom in Urdu Bazar, Gorakhpur, for physical gold jewellery viewings and personalized design consultations.
        </p>
      </div>

      {/* Two Column Layout: Info Cards on Left, Contact Form on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Business & Store Details */}
        <div className="lg:col-span-6 space-y-6">
          {/* Main Showroom Card */}
          <div className="bg-cream-50 border border-gold-200/90 rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
            <h2 className="text-lg font-serif font-bold text-maroon-950 border-b border-gold-200/60 pb-3 flex items-center gap-2">
              <Building className="w-5 h-5 text-gold-700" />
              <span>Showroom Information</span>
            </h2>

            <div className="space-y-4 text-xs sm:text-sm font-sans text-charcoal-800">
              {/* Address */}
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-maroon-800 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-maroon-950">Store Address</p>
                  <p className="text-charcoal-700 leading-relaxed">
                    {CONTACT_CONFIG.address}
                  </p>
                  <a
                    href={CONTACT_CONFIG.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-maroon-800 hover:underline pt-1"
                  >
                    <span>View on Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5 text-gold-700" />
                  </a>
                </div>
              </div>

              {/* Business Hours */}
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-maroon-800 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-maroon-950">Showroom Timings</p>
                  <p className="text-charcoal-700">{CONTACT_CONFIG.hours}</p>
                </div>
              </div>

              {/* Primary Call & WhatsApp */}
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-maroon-800 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-maroon-950">Primary Contact (Call / WhatsApp)</p>
                  <a
                    href={`tel:${CONTACT_CONFIG.primaryPhoneRaw}`}
                    className="block text-maroon-900 font-mono font-bold hover:underline"
                  >
                    {CONTACT_CONFIG.primaryPhone}
                  </a>
                </div>
              </div>

              {/* Secondary Phone */}
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-charcoal-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-maroon-950">Secondary Store Line</p>
                  <a
                    href={`tel:${CONTACT_CONFIG.secondaryPhoneRaw}`}
                    className="block text-charcoal-700 font-mono hover:underline"
                  >
                    {CONTACT_CONFIG.secondaryPhone}
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-maroon-800 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-maroon-950">Email Address</p>
                  <a
                    href={`mailto:${CONTACT_CONFIG.email}`}
                    className="text-maroon-900 font-mono hover:underline"
                  >
                    {CONTACT_CONFIG.email}
                  </a>
                </div>
              </div>

              {/* Owner & GSTIN Identification */}
              <div className="pt-4 border-t border-gold-200/60 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-charcoal-500 block">Proprietor / Owner</span>
                  <span className="font-bold text-maroon-950">{STORE_OWNER}</span>
                </div>
                <div>
                  <span className="text-charcoal-500 block">GSTIN</span>
                  <span className="font-mono font-bold text-maroon-950">{GSTIN}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Contact & Enquiry Form */}
        <div className="lg:col-span-6">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
