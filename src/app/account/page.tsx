'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useSavedItems } from '@/context/SavedItemsContext';
import {
  User,
  Mail,
  Heart,
  ShoppingBag,
  LogOut,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Info,
  UserCheck,
} from 'lucide-react';

export default function AccountPage() {
  const { user, isAuthenticated, isLoading, openLoginModal, logout } = useAuth();
  const { wishlistIds, shortlistIds } = useSavedItems();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center text-charcoal-600 font-sans">
        Loading Account Details...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-gold-100 text-maroon-800 flex items-center justify-center mx-auto">
          <User className="w-8 h-8 text-gold-700" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-maroon-950">
            Sign In to Access Your Account
          </h1>
          <p className="text-sm text-charcoal-600 font-sans leading-relaxed">
            Please sign in with your mock Google account to manage your saved Wishlist and Buying Shortlist.
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={() => openLoginModal()}
            className="inline-flex items-center gap-2 bg-maroon-800 hover:bg-maroon-900 text-cream-50 font-bold px-6 py-3 rounded-xl shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
          >
            <UserCheck className="w-4 h-4 text-gold-300" />
            <span>Sign In (Mock Google)</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Account Header Card */}
      <div className="bg-cream-50 border border-gold-300/80 rounded-3xl p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-maroon-900 text-cream-50 font-serif font-bold text-2xl flex items-center justify-center border-2 border-gold-400 shadow-sm flex-shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Signed In (Mock Google Session)</span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-maroon-950">
              {user.name}
            </h1>
            <p className="text-xs text-charcoal-600 font-mono flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-gold-700" />
              <span>{user.email}</span>
            </p>
          </div>
        </div>

        {/* Sign Out Action */}
        <button
          type="button"
          onClick={() => logout()}
          className="inline-flex items-center gap-2 py-2.5 px-4 bg-cream-100 hover:bg-gold-100/80 border border-gold-300 rounded-xl text-xs font-bold text-maroon-900 transition-colors shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 self-stretch sm:self-auto justify-center"
        >
          <LogOut className="w-4 h-4 text-maroon-700" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Saved Lists Summary Cards */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-800 uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5 text-gold-700" />
          <span>Saved Jewellery Collections</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Wishlist Shortcut Card */}
          <Link
            href="/wishlist"
            className="group bg-cream-50 hover:bg-gold-50/50 border border-gold-200/90 hover:border-gold-400 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between space-y-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-maroon-100 flex items-center justify-center text-maroon-800">
                <Heart className="w-6 h-6 fill-current text-maroon-700" />
              </div>
              <span className="text-2xl font-serif font-bold text-maroon-950">
                {wishlistIds.length}
              </span>
            </div>

            <div>
              <h2 className="font-serif font-bold text-lg text-maroon-950 group-hover:text-maroon-800 transition-colors">
                My Wishlist
              </h2>
              <p className="text-xs text-charcoal-600 font-sans mt-1">
                Your favourite gold jewellery pieces saved for future inspiration.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-maroon-800 group-hover:underline">
              <span>View Wishlist</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Buying Shortlist Shortcut Card */}
          <Link
            href="/shortlist"
            className="group bg-cream-50 hover:bg-gold-50/50 border border-gold-200/90 hover:border-gold-400 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between space-y-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-gold-100 flex items-center justify-center text-maroon-800">
                <ShoppingBag className="w-6 h-6 fill-current text-gold-700" />
              </div>
              <span className="text-2xl font-serif font-bold text-maroon-950">
                {shortlistIds.length}
              </span>
            </div>

            <div>
              <h2 className="font-serif font-bold text-lg text-maroon-950 group-hover:text-maroon-800 transition-colors">
                Buying Shortlist
              </h2>
              <p className="text-xs text-charcoal-600 font-sans mt-1">
                Curated list for your physical Gorakhpur showroom consultation.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-gold-800 group-hover:underline">
              <span>View Shortlist</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Informational Future Deletion Request Section */}
      <div className="bg-cream-50 border border-gold-200/80 rounded-2xl p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-charcoal-700">
          <Info className="w-4 h-4 text-gold-700" />
          <span>Account &amp; Data Deletion Notice</span>
        </div>
        <p className="text-xs text-charcoal-600 font-sans leading-relaxed">
          In this version, your session and saved preferences are stored locally in your browser for testing. Official automated account and data deletion request workflows will be connected here in a future update when live customer accounts are enabled.
        </p>
      </div>
    </div>
  );
}
