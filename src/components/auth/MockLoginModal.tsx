'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PRESET_MOCK_USERS } from '@/services/auth/mockAuthService';
import { X, Sparkles, User, Mail, ShieldAlert, Check } from 'lucide-react';

export const MockLoginModal: React.FC = () => {
  const { isLoginModalOpen, closeLoginModal, login } = useAuth();

  const [selectedPreset, setSelectedPreset] = useState<string>(
    PRESET_MOCK_USERS[0].id
  );
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus management & Escape key handler
  useEffect(() => {
    if (isLoginModalOpen) {
      document.body.style.overflow = 'hidden';
      // Focus the close button or first actionable element
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          closeLoginModal();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isLoginModalOpen, closeLoginModal]);

  if (!isLoginModalOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isCustomMode) {
        if (!customEmail.trim()) return;
        await login({
          name: customName.trim() || 'Valued Customer',
          email: customEmail.trim(),
        });
      } else {
        const preset =
          PRESET_MOCK_USERS.find((u) => u.id === selectedPreset) ||
          PRESET_MOCK_USERS[0];
        await login({
          name: preset.name,
          email: preset.email,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mock-login-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-xs transition-opacity"
        onClick={closeLoginModal}
        aria-hidden="true"
      />

      {/* Dialog Box */}
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-cream-50 border border-gold-300 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-6 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-gold-200/80 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-gold-100 text-maroon-900 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-gold-200">
              <Sparkles className="w-3 h-3 text-gold-700" />
              <span>Development / Mock Google Sign-In</span>
            </div>
            <h2
              id="mock-login-title"
              className="text-xl font-serif font-bold text-maroon-950"
            >
              Sign In to Save Jewellery
            </h2>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeLoginModal}
            className="p-1.5 text-charcoal-500 hover:text-maroon-900 hover:bg-gold-100/70 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
            aria-label="Close sign-in dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice Info */}
        <div className="flex items-start gap-2.5 text-xs text-charcoal-600 bg-gold-50/70 p-3 rounded-xl border border-gold-200 font-sans">
          <ShieldAlert className="w-4 h-4 text-gold-700 flex-shrink-0 mt-0.5" />
          <p>
            This is a mock authentication module for saving Wishlist and Buying Shortlists. No password, phone number, or external connection is needed.
          </p>
        </div>

        {/* Form Selection */}
        <form onSubmit={handleSignIn} className="space-y-5">
          {!isCustomMode ? (
            /* Preset Google Personas */
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-maroon-900 uppercase tracking-wider">
                Select Mock Google Account
              </label>
              <div className="space-y-2">
                {PRESET_MOCK_USERS.map((preset) => {
                  const isSelected = selectedPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedPreset(preset.id)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-maroon-700 bg-gold-100/60 ring-2 ring-gold-400/40 shadow-xs'
                          : 'border-gold-200 bg-cream-100/60 hover:bg-gold-50/80 hover:border-gold-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-maroon-800 text-cream-50 font-serif font-bold text-sm flex items-center justify-center flex-shrink-0">
                          {preset.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-xs text-maroon-950">
                            {preset.name}
                          </p>
                          <p className="text-[11px] text-charcoal-500 font-mono">
                            {preset.email}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-maroon-800" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => setIsCustomMode(true)}
                  className="text-xs font-semibold text-maroon-800 hover:text-maroon-950 underline"
                >
                  Or enter custom name / email
                </button>
              </div>
            </div>
          ) : (
            /* Custom Persona Form */
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-maroon-900">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gold-700 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-cream-100 border border-gold-200 rounded-lg text-charcoal-900 focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-maroon-900">
                  Gmail Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gold-700 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. ramesh.kumar@gmail.com"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-cream-100 border border-gold-200 rounded-lg text-charcoal-900 focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  className="text-xs font-semibold text-maroon-800 hover:text-maroon-950 underline"
                >
                  Back to preset mock accounts
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeLoginModal}
              className="py-2.5 px-4 rounded-xl text-xs font-semibold text-charcoal-700 hover:bg-gold-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2.5 px-5 bg-maroon-800 hover:bg-maroon-900 text-cream-50 rounded-xl text-xs font-bold shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
            >
              {isSubmitting ? 'Signing In...' : 'Continue with Mock Google'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
