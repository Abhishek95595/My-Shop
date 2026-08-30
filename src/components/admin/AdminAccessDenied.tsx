'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { isFirebaseConfigured } from '@/lib/firebase/client';
import { ShieldAlert, Lock, ArrowLeft, UserCheck } from 'lucide-react';

export const AdminAccessDenied: React.FC = () => {
  const { user } = useAuth();
  const { adminLogin } = useAdminAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleAdminSignIn = async () => {
    setIsSigningIn(true);
    try {
      await adminLogin();
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-8">
      <div className="w-16 h-16 rounded-full bg-maroon-100 text-maroon-800 flex items-center justify-center mx-auto shadow-inner">
        <Lock className="w-8 h-8 text-maroon-800" />
      </div>

      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 bg-maroon-100 text-maroon-900 text-xs font-semibold px-3 py-1 rounded-full border border-maroon-200">
          <ShieldAlert className="w-4 h-4 text-maroon-700" />
          <span>Access Restricted</span>
        </div>
        <h1 className="text-3xl font-serif font-bold text-maroon-950">
          Admin Dashboard Access Denied
        </h1>
        <p className="text-sm text-charcoal-600 font-sans leading-relaxed max-w-lg mx-auto">
          The Admin Dashboard is strictly restricted to authorized store owners.
          {user ? (
            <>
              {' '}
              Currently signed in as <strong className="text-maroon-950">{user.email}</strong>, which does not have administrative privileges.
            </>
          ) : (
            ' You are currently not signed in.'
          )}
        </p>
      </div>

      {/* Admin Sign-In: Google account must additionally hold an admins/{uid} record */}
      <div className="bg-cream-50 border border-gold-300 rounded-3xl p-6 shadow-card space-y-4">
        {isFirebaseConfigured ? (
          <>
            <p className="text-xs text-charcoal-600 font-sans leading-relaxed">
              Sign in with the authorized store owner Google account. Access is granted only if that
              account holds an administrator record in the store database; there is no local or
              development override.
            </p>
            <button
              type="button"
              onClick={handleAdminSignIn}
              disabled={isSigningIn}
              className="inline-flex items-center gap-2 bg-maroon-800 hover:bg-maroon-900 disabled:opacity-60 disabled:cursor-not-allowed text-cream-50 font-bold px-6 py-3 rounded-xl shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-gold-300" />
              <span>{isSigningIn ? 'Opening Google Sign-In…' : 'Sign In as Administrator'}</span>
            </button>
          </>
        ) : (
          <p className="text-xs text-charcoal-600 font-sans leading-relaxed">
            Administrator sign-in is unavailable because this build has no Firebase project
            configured. Admin access requires a verified Firebase account with an administrator
            record in the store database.
          </p>
        )}
      </div>

      {/* Return to Home Action */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-maroon-900 bg-gold-100 hover:bg-gold-200 border border-gold-300 px-5 py-2.5 rounded-xl transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Homepage</span>
        </Link>
      </div>
    </div>
  );
};
