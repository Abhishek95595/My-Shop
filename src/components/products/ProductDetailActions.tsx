'use client';

import React from 'react';
import { Product } from '@/services/productTypes';
import { useSavedItems } from '@/context/SavedItemsContext';
import { CONTACT_CONFIG, SITE_URL } from '@/lib/constants';
import { Heart, ShoppingBag, MessageCircle, Phone, Check } from 'lucide-react';

interface ProductDetailActionsProps {
  product: Product;
}

export const ProductDetailActions: React.FC<ProductDetailActionsProps> = ({
  product,
}) => {
  const { isInWishlist, isInShortlist, toggleWishlist, toggleShortlist } =
    useSavedItems();

  const isFav = isInWishlist(product.id);
  const isShortlisted = isInShortlist(product.id);

  const productUrl = `${SITE_URL}/catalogue/${product.slug}`;
  const whatsappMessage = encodeURIComponent(
    `Hello Khushi Ornament House,\n\nI would like to inquire about this jewellery piece:\n- Product: ${product.name}\n- SKU: ${product.sku}\n- Link: ${productUrl}\n\nPlease share more details and availability.`
  );

  return (
    <>
      {/* In-Page Actions (Visible across all viewports) */}
      <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4">
        {/* Wishlist and Buying Shortlist Actions Row */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => toggleWishlist(product.id, product.name)}
            className={`flex items-center justify-center gap-2 py-3 px-3 sm:px-4 rounded-xl border text-xs sm:text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 active:scale-95 min-h-[44px] cursor-pointer ${
              isFav
                ? 'bg-maroon-800 text-white border-maroon-900 shadow-sm'
                : 'bg-cream-50 hover:bg-gold-50 text-maroon-900 border-gold-300'
            }`}
            aria-label={
              isFav
                ? `Remove ${product.name} from Wishlist`
                : `Save ${product.name} to Wishlist`
            }
            aria-pressed={isFav}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
            <span>{isFav ? 'In Wishlist' : 'Add to Wishlist'}</span>
          </button>

          <button
            type="button"
            onClick={() => toggleShortlist(product.id, product.name)}
            className={`flex items-center justify-center gap-2 py-3 px-3 sm:px-4 rounded-xl border text-xs sm:text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 active:scale-95 min-h-[44px] cursor-pointer ${
              isShortlisted
                ? 'bg-gold-600 text-white border-gold-700 shadow-sm'
                : 'bg-cream-50 hover:bg-gold-50 text-maroon-900 border-gold-300'
            }`}
            aria-label={
              isShortlisted
                ? `Remove ${product.name} from Buying Shortlist`
                : `Add ${product.name} to Buying Shortlist`
            }
            aria-pressed={isShortlisted}
          >
            <ShoppingBag
              className={`w-4 h-4 ${isShortlisted ? 'fill-current' : ''}`}
            />
            <span>{isShortlisted ? 'In Shortlist' : 'Buying Shortlist'}</span>
          </button>
        </div>

        {/* WhatsApp & Call Direct Enquiry Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          <a
            href={`https://wa.me/${CONTACT_CONFIG.whatsappNumberRaw}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-semibold py-3 px-5 sm:py-3.5 sm:px-6 rounded-xl shadow-sm hover:shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 min-h-[44px]"
            aria-label={`Inquire about ${product.name} on WhatsApp`}
          >
            <MessageCircle className="w-5 h-5" />
            <span>Inquire on WhatsApp</span>
          </a>

          <a
            href={`tel:+${CONTACT_CONFIG.primaryPhoneRaw}`}
            className="inline-flex items-center justify-center gap-2 bg-maroon-800 hover:bg-maroon-900 active:scale-95 text-cream-50 font-semibold py-3 px-5 sm:py-3.5 sm:px-6 rounded-xl shadow-sm hover:shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 min-h-[44px]"
            aria-label={`Call Store at ${CONTACT_CONFIG.primaryPhone}`}
          >
            <Phone className="w-5 h-5 text-gold-300" />
            <span>Call {CONTACT_CONFIG.primaryPhone}</span>
          </a>
        </div>
      </div>

      {/* Sticky Mobile Action Bar (Sits immediately above the sticky bottom navigation) */}
      <div
        aria-label="Quick Product Actions"
        className="fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))] inset-x-0 z-30 bg-cream-50/95 backdrop-blur-md border-t border-gold-200/90 p-2.5 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] md:hidden"
      >
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          {/* Shortlist Toggle Button */}
          <button
            type="button"
            onClick={() => toggleShortlist(product.id, product.name)}
            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 active:scale-95 min-h-[44px] ${
              isShortlisted
                ? 'bg-gold-600 text-white border-gold-700 shadow-xs'
                : 'bg-white text-maroon-900 border-gold-300'
            }`}
            aria-label={
              isShortlisted
                ? `Remove ${product.name} from Buying Shortlist`
                : `Add ${product.name} to Buying Shortlist`
            }
            aria-pressed={isShortlisted}
          >
            {isShortlisted ? (
              <Check className="w-4 h-4" />
            ) : (
              <ShoppingBag className="w-4 h-4 text-gold-700" />
            )}
            <span>{isShortlisted ? 'Shortlisted' : 'Shortlist'}</span>
          </button>

          {/* Call Button */}
          <a
            href={`tel:+${CONTACT_CONFIG.primaryPhoneRaw}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-maroon-800 hover:bg-maroon-900 active:scale-95 text-cream-50 font-semibold py-2.5 px-3 rounded-xl shadow-xs transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-maroon-600 min-h-[44px] text-xs"
            aria-label={`Call store at ${CONTACT_CONFIG.primaryPhone}`}
          >
            <Phone className="w-4 h-4 text-gold-300" />
            <span>Call</span>
          </a>

          {/* WhatsApp Enquiry Button */}
          <a
            href={`https://wa.me/${CONTACT_CONFIG.whatsappNumberRaw}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-[1.4] inline-flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-semibold py-2.5 px-3 rounded-xl shadow-xs transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 min-h-[44px] text-xs"
            aria-label={`Inquire about ${product.name} on WhatsApp`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </>
  );
};
