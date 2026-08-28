'use client';

import React from 'react';
import { Product } from '@/services/productTypes';
import { useSavedItems } from '@/context/SavedItemsContext';
import { CONTACT_CONFIG } from '@/lib/constants';
import { Heart, ShoppingBag, MessageCircle, Phone } from 'lucide-react';

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

  const productUrl = `https://khushiornamenthouse.com/catalogue/${product.slug}`;
  const whatsappMessage = encodeURIComponent(
    `Hello Khushi Ornament House,\n\nI would like to inquire about this jewellery piece:\n- Product: ${product.name}\n- SKU: ${product.sku}\n- Link: ${productUrl}\n\nPlease share more details and availability.`
  );

  return (
    <div className="space-y-4 pt-4">
      {/* Wishlist and Buying Shortlist Actions Row */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => toggleWishlist(product.id, product.name)}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs sm:text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 cursor-pointer ${
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
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs sm:text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 cursor-pointer ${
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <a
          href={`https://wa.me/${CONTACT_CONFIG.whatsappNumberRaw}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          aria-label={`Inquire about ${product.name} on WhatsApp`}
        >
          <MessageCircle className="w-5 h-5" />
          <span>Inquire on WhatsApp</span>
        </a>

        <a
          href={`tel:${CONTACT_CONFIG.primaryPhoneRaw}`}
          className="inline-flex items-center justify-center gap-2 bg-maroon-800 hover:bg-maroon-900 text-cream-50 font-semibold py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
          aria-label={`Call Store to discuss ${product.name}`}
        >
          <Phone className="w-5 h-5 text-gold-300" />
          <span>Call {CONTACT_CONFIG.primaryPhone}</span>
        </a>
      </div>
    </div>
  );
};
