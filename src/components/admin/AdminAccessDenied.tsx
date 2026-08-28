'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { PRESET_ADMIN_PERSONAS } from '@/services/admin/adminAuthGuard';
import { ShieldAlert, Lock, ArrowLeft, UserCheck, Sparkles } from 'lucide-react';

export const AdminAccessDenied: React.FC = () => {
  const { user, login } = useAuth();

  const handleAdminSignIn = async (adminPersona: { name: string; email: string }) => {
    await login({
      name: adminPersona.name,
      email: adminPersona.email,
    });
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
          The Admin Dashboard is strictly restricted to authorized administrators.
          {user ? (
            <>
              {' '}
              Currently logged in as <strong className="text-maroon-950">{user.email}</strong>, which does not have administrative privileges.
            </>
          ) : (
            ' You are currently not signed in.'
          )}
        </p>
      </div>

      {/* Local Development Quick Switch Action */}
      <div className="bg-cream-50 border border-gold-300 rounded-3xl p-6 shadow-card space-y-4 text-left">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-maroon-900 border-b border-gold-200/80 pb-2">
          <Sparkles className="w-4 h-4 text-gold-700" />
          <span>Development Admin Mode (Testing Quick-Switch)</span>
        </div>
        <p className="text-xs text-charcoal-600 font-sans">
          In this mock local development phase, you can switch to one of the authorized mock owner identities:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {PRESET_ADMIN_PERSONAS.map((admin) => (
            <button
              key={admin.email}
              type="button"
              onClick={() => handleAdminSignIn(admin)}
              className="flex items-center gap-3 p-3 bg-cream-100/80 hover:bg-gold-100 border border-gold-300 rounded-xl text-left transition-all group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-maroon-800 text-cream-50 font-serif font-bold text-xs flex items-center justify-center flex-shrink-0">
                {admin.name.charAt(0)}
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-maroon-950 group-hover:text-maroon-800">
                  {admin.name}
                </p>
                <p className="text-[11px] font-mono text-charcoal-500 truncate max-w-[170px]">
                  {admin.email}
                </p>
              </div>
            </button>
          ))}
        </div>
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
