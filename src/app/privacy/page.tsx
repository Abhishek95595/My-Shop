import React from 'react';
import { Metadata } from 'next';
import {
  STORE_NAME,
  STORE_OWNER,
  CONTACT_CONFIG,
  GSTIN,
} from '@/lib/constants';
import { Shield, FileText, AlertTriangle, Info } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy (Draft)',
  description: `Privacy policy draft describing Firebase, local storage, customer privacy, and data handling practices at ${STORE_NAME}.`,
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Draft Disclaimer Notice */}
      <div className="bg-gold-100 border border-gold-400 rounded-2xl p-4 sm:p-5 flex items-center gap-3 text-xs sm:text-sm text-maroon-950 font-sans shadow-xs">
        <AlertTriangle className="w-5 h-5 text-gold-800 flex-shrink-0" />
        <div>
          <strong className="font-serif font-bold uppercase tracking-wider block text-maroon-900">
            Draft — Pending Legal Approval
          </strong>
          <span>
            This document is a working draft describing the Firebase and browser-local data used by the Khushi Ornament House web platform.
          </span>
        </div>
      </div>

      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-maroon-950">
          Privacy Policy
        </h1>
        <p className="text-xs font-mono text-charcoal-500">
          Last Updated: 4 September 2026 • Khushi Ornament House ({GSTIN})
        </p>
      </div>

      {/* Policy Content */}
      <div className="bg-cream-50 border border-gold-200/90 rounded-3xl p-6 sm:p-10 shadow-card space-y-8 text-charcoal-800 font-sans text-xs sm:text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-serif font-bold text-maroon-950 border-b border-gold-200/60 pb-1">
            1. Overview &amp; Data Architecture
          </h2>
          <p>
            Khushi Ornament House operates this web platform as a digital catalogue and customer consultation tool. Customer authentication is provided by <strong>Google through Firebase Authentication</strong>, while catalogue data, saved lists, inquiries, and owner-entered rates are stored in <strong>Cloud Firestore</strong>.
          </p>
          <p>
            Product images uploaded through the current admin interface may also use browser-local IndexedDB storage. WhatsApp and phone actions are separate external handoffs described below.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-serif font-bold text-maroon-950 border-b border-gold-200/60 pb-1">
            2. Information Processed and Stored
          </h2>
          <ul className="list-disc list-inside space-y-1.5 text-charcoal-700 pl-2">
            <li>
              <strong>Google Account Identity:</strong> Firebase Authentication processes your Google account identifier, display name, email address, and profile photo when available to maintain your signed-in session.
            </li>
            <li>
              <strong>Wishlist &amp; Buying Shortlist:</strong> Saved product identifiers are stored in Cloud Firestore under your Firebase user ID and are accessible only to that authenticated account.
            </li>
            <li>
              <strong>Customer Inquiries:</strong> Contact details and inquiry content submitted through the form are stored in Cloud Firestore and may also be used to prepare a WhatsApp message.
            </li>
            <li>
              <strong>Catalogue Administration &amp; Images:</strong> Catalogue records and rates are stored in Cloud Firestore. Admin-uploaded image files currently use browser IndexedDB (<code className="bg-cream-200 px-1 py-0.5 rounded">KOH_ImageDB</code>).
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-serif font-bold text-maroon-950 border-b border-gold-200/60 pb-1">
            3. Communications via WhatsApp &amp; Phone
          </h2>
          <p>
            When you choose a WhatsApp handoff, the website opens WhatsApp with a prefilled message that may contain the inquiry details you entered. The customer must tap Send in WhatsApp before the message is delivered to the showroom. WhatsApp and phone interactions are governed by the applicable provider&apos;s policies.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-serif font-bold text-maroon-950 border-b border-gold-200/60 pb-1">
            4. Absence of Payment Processing &amp; Tracking
          </h2>
          <p>
            This website does not collect credit card numbers, debit card details, UPI PINs, or bank account credentials. All financial transactions and invoicing take place physically in our showroom at Urdu Bazar, Gorakhpur.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-serif font-bold text-maroon-950 border-b border-gold-200/60 pb-1">
            5. Your Data Controls
          </h2>
          <p>
            Signing out ends your Firebase Authentication session but does not delete your saved lists from Cloud Firestore. You can remove individual saved products or clear a list in the application. Clearing browser site data removes local caches and IndexedDB images but does not delete cloud records. Contact the store for requests concerning inquiry or account-linked data.
          </p>
        </section>

        <section className="space-y-2 border-t border-gold-200/60 pt-4">
          <h2 className="text-base font-serif font-bold text-maroon-950">
            6. Contact for Privacy Inquiries
          </h2>
          <p>
            For any questions regarding data handling or store policies, please contact proprietor <strong className="text-maroon-950">{STORE_OWNER}</strong> at <a href={`mailto:${CONTACT_CONFIG.email}`} className="text-maroon-900 underline font-mono">{CONTACT_CONFIG.email}</a> or visit our store at {CONTACT_CONFIG.address}.
          </p>
        </section>
      </div>
    </div>
  );
}
