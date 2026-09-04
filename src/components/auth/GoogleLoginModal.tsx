'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, ShieldCheck, Sparkles, UserCheck, X } from 'lucide-react';

function getSignInErrorMessage(error: unknown): string {
  const code =
    error && typeof error === 'object' && 'code' in error
      ? String(error.code)
      : '';

  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return 'Google sign-in was cancelled. Your requested save is still ready to retry.';
  }
  if (code === 'auth/popup-blocked') {
    return 'Your browser blocked the Google sign-in window. Allow pop-ups for this site and try again.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Google sign-in could not reach Firebase. Check your connection and try again.';
  }
  if (code === 'auth/unauthorized-domain') {
    return 'Google sign-in is not enabled for this website domain. Please contact the store.';
  }

  return error instanceof Error
    ? error.message
    : 'Google sign-in failed. Please try again.';
}

export const GoogleLoginModal: React.FC = () => {
  const { isLoginModalOpen, closeLoginModal, login } = useAuth();
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isLoginModalOpen) {
      document.body.style.overflow = 'unset';
      return;
    }

    document.body.style.overflow = 'hidden';
    setErrorMessage('');
    setTimeout(() => closeButtonRef.current?.focus(), 50);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeLoginModal();
        return;
      }

      if (event.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
          lastElement.focus();
          event.preventDefault();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          firstElement.focus();
          event.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [closeLoginModal, isLoginModalOpen]);

  if (!isLoginModalOpen) return null;

  const handleSignIn = async () => {
    if (isSubmitting) return;

    setErrorMessage('');
    setIsSubmitting(true);
    try {
      await login();
    } catch (error) {
      setErrorMessage(getSignInErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="google-login-title"
    >
      <div
        className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-xs transition-opacity"
        onClick={isSubmitting ? undefined : closeLoginModal}
        aria-hidden="true"
      />

      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-cream-50 border border-gold-300 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-6 animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-start justify-between gap-4 border-b border-gold-200/80 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-gold-100 text-maroon-900 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-gold-200">
              <Sparkles className="w-3 h-3 text-gold-700" />
              <span>Secure Google Sign-In</span>
            </div>
            <h2
              id="google-login-title"
              className="text-xl font-serif font-bold text-maroon-950"
            >
              Sign In to Save Jewellery
            </h2>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeLoginModal}
            disabled={isSubmitting}
            className="p-1.5 text-charcoal-500 hover:text-maroon-900 hover:bg-gold-100/70 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 disabled:opacity-50"
            aria-label="Close sign-in dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-start gap-2.5 text-xs text-charcoal-600 bg-gold-50/70 p-3 rounded-xl border border-gold-200 font-sans">
          <ShieldCheck className="w-4 h-4 text-gold-700 flex-shrink-0 mt-0.5" />
          <p>
            Continue with your Google account to securely save your Wishlist and Buying Shortlist across devices.
          </p>
        </div>

        {errorMessage && (
          <div
            className="flex items-start gap-2 p-3 bg-maroon-50 border border-maroon-200 rounded-xl text-xs text-maroon-900 font-medium"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle className="w-4 h-4 text-maroon-700 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={closeLoginModal}
            disabled={isSubmitting}
            className="py-2.5 px-4 rounded-xl text-xs font-semibold text-charcoal-700 hover:bg-gold-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSignIn}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 py-2.5 px-5 bg-maroon-800 hover:bg-maroon-900 text-cream-50 rounded-xl text-xs font-bold shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <UserCheck className="w-4 h-4 text-gold-300" />
            <span>{isSubmitting ? 'Opening Google…' : 'Continue with Google'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
