'use client';

import React, { useState } from 'react';
import { Share2, Check, Loader2 } from 'lucide-react';
import { Product } from '@/services/productTypes';
import { shareProduct } from '@/services/share/shareService';
import { useToast } from '@/context/ToastContext';

interface ProductShareButtonProps {
  product: Product;
  imageUrl?: string;
  variant?: 'card' | 'detail';
  className?: string;
}

export const ProductShareButton: React.FC<ProductShareButtonProps> = ({
  product,
  imageUrl,
  variant = 'card',
  className = '',
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const { showToast } = useToast();

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSharing) return;

    setIsSharing(true);
    try {
      const result = await shareProduct(product, imageUrl);

      if (result.success) {
        if (result.method === 'clipboard') {
          setCopiedSuccess(true);
          showToast('Product link copied!', 'Product details and link copied to clipboard.', 'success');
          setTimeout(() => setCopiedSuccess(false), 2500);
        } else if (result.method === 'file' || result.method === 'text') {
          // Native Web Share opened/succeeded
        }
      } else if (result.method === 'error') {
        showToast('Sharing failed', result.error || 'Could not share this product.', 'error');
      }
      // Note: result.method === 'cancelled' (AbortError) is swallowed cleanly without toast
    } catch {
      showToast('Sharing failed', 'An unexpected error occurred while sharing.', 'error');
    } finally {
      setIsSharing(false);
    }
  };

  if (variant === 'card') {
    return (
      <div className="relative flex items-center justify-center min-w-[44px] min-h-[44px]">
        <button
          type="button"
          onClick={handleShare}
          disabled={isSharing}
          className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full shadow-xs backdrop-blur-xs transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 active:scale-95 cursor-pointer ${
            copiedSuccess
              ? 'bg-emerald-800 text-white'
              : 'bg-cream-50/90 text-charcoal-700 hover:text-gold-900 hover:bg-white'
          } ${className}`}
          aria-label={`Share ${product.name}`}
          title={`Share ${product.name}`}
        >
          {isSharing ? (
            <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-gold-700" />
          ) : copiedSuccess ? (
            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          ) : (
            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          )}
        </button>
      </div>
    );
  }

  // Detail Page Variant
  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={isSharing}
      className={`inline-flex items-center justify-center gap-2 py-3 px-3 sm:px-4 rounded-xl border border-gold-300 bg-cream-50 hover:bg-gold-50 text-maroon-900 text-xs sm:text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 active:scale-95 min-h-[44px] cursor-pointer ${className}`}
      aria-label={`Share ${product.name}`}
    >
      {isSharing ? (
        <Loader2 className="w-4 h-4 animate-spin text-gold-700" />
      ) : copiedSuccess ? (
        <>
          <Check className="w-4 h-4 text-emerald-700" />
          <span>Link Copied!</span>
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4 text-gold-700" />
          <span>Share Product</span>
        </>
      )}
    </button>
  );
};
