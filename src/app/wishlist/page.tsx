'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useSavedItems } from '@/context/SavedItemsContext';
import { ProductCard } from '@/components/products/ProductCard';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';
import { Heart, Trash2, ArrowRight, Sparkles, UserCheck, AlertCircle } from 'lucide-react';

export default function WishlistPage() {
  const { user, isAuthenticated, isLoading, openLoginModal } = useAuth();
  const {
    wishlistProducts,
    wishlistStatus,
    wishlistError,
    missingWishlistProductIds,
    clearWishlist,
  } = useSavedItems();
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  if (isLoading || (isAuthenticated && wishlistStatus === 'loading')) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center text-charcoal-600 font-sans">
        Loading Wishlist...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-gold-100 text-maroon-800 flex items-center justify-center mx-auto">
          <Heart className="w-8 h-8 text-gold-700" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-maroon-950">
            Sign In to View Your Wishlist
          </h1>
          <p className="text-sm text-charcoal-600 font-sans leading-relaxed">
            Please sign in with your Google account to access your saved favourite gold jewellery pieces.
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={() => openLoginModal()}
            className="inline-flex items-center gap-2 bg-maroon-800 hover:bg-maroon-900 text-cream-50 font-bold px-6 py-3 rounded-xl shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
          >
            <UserCheck className="w-4 h-4 text-gold-300" />
            <span>Sign In with Google</span>
          </button>
        </div>
      </div>
    );
  }

  if (wishlistStatus === 'error') {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-700 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-maroon-950">
          Wishlist Could Not Be Loaded
        </h1>
        <p className="text-sm text-charcoal-600 font-sans leading-relaxed">
          {wishlistError?.message || 'Cloud Firestore did not return your saved items. Please refresh and try again.'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gold-200/80 pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-800 uppercase tracking-widest bg-gold-100/90 border border-gold-300 px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-gold-700" />
            <span>Customer Favourites</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-maroon-950">
            My Wishlist ({wishlistProducts.length})
          </h1>
          <p className="text-sm text-charcoal-600 font-sans">
            Saved items for <strong className="text-maroon-900">{user.name}</strong> ({user.email}).
          </p>
        </div>

        {wishlistProducts.length > 0 && (
          <button
            type="button"
            onClick={() => setIsClearModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-maroon-800 hover:text-maroon-950 bg-cream-50 hover:bg-gold-100 border border-gold-300 px-3.5 py-2 rounded-lg transition-colors shadow-2xs self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5 text-maroon-700" />
            <span>Clear Wishlist</span>
          </button>
        )}
      </div>

      {missingWishlistProductIds.length > 0 && (
        <div className="bg-gold-50 border border-gold-200 rounded-xl px-4 py-3 text-xs text-charcoal-700 font-sans">
          {missingWishlistProductIds.length} saved {missingWishlistProductIds.length === 1 ? 'item is' : 'items are'} currently unavailable in the published catalogue. The saved reference has been kept safely.
        </div>
      )}

      {/* Wishlist Items Grid */}
      {wishlistProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {wishlistProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-cream-50 border border-gold-200/90 rounded-3xl p-10 sm:p-14 text-center shadow-card space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-gold-100 text-maroon-800 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8 text-gold-700" />
          </div>
          <h2 className="text-xl font-serif font-bold text-maroon-950">
            Your Wishlist is Empty
          </h2>
          <p className="text-sm text-charcoal-600 font-sans leading-relaxed">
            You haven’t saved any jewellery pieces yet. Browse our gold catalogue to bookmark your favourites.
          </p>
          <div className="pt-2">
            <Link
              href="/catalogue"
              className="inline-flex items-center gap-2 bg-maroon-800 hover:bg-maroon-900 text-cream-50 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
            >
              <span>Explore Catalogue</span>
              <ArrowRight className="w-4 h-4 text-gold-300" />
            </Link>
          </div>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      <ConfirmationModal
        isOpen={isClearModalOpen}
        title="Clear Wishlist?"
        message="Are you sure you want to remove all saved items from your Wishlist? This action cannot be undone."
        confirmLabel="Yes, Clear All"
        onConfirm={() => {
          clearWishlist();
          setIsClearModalOpen(false);
        }}
        onCancel={() => setIsClearModalOpen(false)}
      />
    </div>
  );
}
