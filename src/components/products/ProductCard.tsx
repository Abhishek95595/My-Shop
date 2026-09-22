'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, MessageCircle, ArrowRight, Shield, Heart, ShoppingBag } from 'lucide-react';
import { Product } from '@/services/productTypes';
import {
  getPrimaryImage,
  formatWeight,
  formatAvailability,
} from '@/services/mockProducts';
import { CONTACT_CONFIG, EXACT_WEIGHT_DISCLAIMER, SITE_URL } from '@/lib/constants';
import { useSavedItems } from '@/context/SavedItemsContext';
import { ProductShareButton } from './ProductShareButton';

interface ProductCardProps {
  product: Product;
  isSample?: boolean;
  eagerImage?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isSample = true,
  eagerImage = false,
}) => {
  const primaryImage = getPrimaryImage(product.images);
  const [resolvedImageUrl, setResolvedImageUrl] = React.useState<string>(
    primaryImage?.url && !primaryImage.url.startsWith('indexeddb://')
      ? primaryImage.url
      : ''
  );

  React.useEffect(() => {
    let active = true;
    let acquiredObjectUrl: string | null = null;

    if (primaryImage?.url.startsWith('indexeddb://')) {
      setResolvedImageUrl('');
      import('@/services/images/imageStorageService').then(({ imageStorageService }) => {
        imageStorageService.getImageUrl(primaryImage.id).then((resolved) => {
          if (!resolved) return;
          acquiredObjectUrl = resolved;
          if (active) {
            setResolvedImageUrl(acquiredObjectUrl);
          } else {
            imageStorageService.revokeImageUrl(acquiredObjectUrl);
          }
        });
      });
    } else {
      setResolvedImageUrl(primaryImage?.url || '');
    }
    return () => {
      active = false;
      if (acquiredObjectUrl) {
        import('@/services/images/imageStorageService').then(({ imageStorageService }) => {
          imageStorageService.revokeImageUrl(acquiredObjectUrl!);
        });
      }
    };
  }, [primaryImage]);

  const { isInWishlist, isInShortlist, toggleWishlist, toggleShortlist } =
    useSavedItems();

  const isFav = isInWishlist(product.id);
  const isShortlisted = isInShortlist(product.id);

  const productUrl = `${SITE_URL}/catalogue/${product.slug}`;
  const whatsappMessage = encodeURIComponent(
    `Hello Khushi Ornament House, I am inquiring about the ${product.name} (SKU: ${product.sku}): ${productUrl}`
  );

  return (
    <div className="group bg-cream-50 rounded-2xl border border-gold-300/80 hover:border-gold-400/90 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Image Container with Badges & Save Actions */}
      <div className="relative aspect-square w-full bg-cream-100/70 overflow-hidden border-b border-gold-200/70">
        <Link
          href={`/catalogue/${product.slug}`}
          className="relative block w-full h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
          aria-label={`View details for ${product.name}`}
        >
          {resolvedImageUrl ? (
            <Image
              src={resolvedImageUrl}
              alt={primaryImage?.altText || product.name}
              fill
              loading={eagerImage ? 'eager' : 'lazy'}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              unoptimized={resolvedImageUrl.startsWith('blob:')}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-charcoal-500 text-xs"
              role="img"
              aria-label={`Image unavailable for ${product.name}`}
            >
              No image preview
            </div>
          )}
        </Link>

        {/* Top Left Badges */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col items-start gap-1 pointer-events-none z-10">
          {/* Sample Product Badge */}
          {isSample && (
            <span className="inline-flex items-center gap-1 bg-maroon-950/90 text-gold-300 border border-gold-400/30 text-[9px] sm:text-[11px] font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-xs backdrop-blur-xs">
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gold-400" />
              <span className="hidden xs:inline">Sample Product</span>
              <span className="xs:hidden">Sample</span>
            </span>
          )}

          {/* Availability Badge */}
          <span
            className={`text-[9px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full shadow-xs backdrop-blur-xs ${
              product.availability === 'available'
                ? 'bg-emerald-900/90 text-cream-50 border border-emerald-500/30'
                : 'bg-gold-900/90 text-cream-50 border border-gold-500/30'
            }`}
          >
            {formatAvailability(product.availability)}
          </span>
        </div>

        {/* Top Right Quick Action Buttons */}
        <div className="absolute top-1 right-1 sm:top-2 sm:right-2 flex flex-col items-center gap-0 sm:gap-0.5 z-10">
          {/* Wishlist Button (44px min touch target container) */}
          <div className="flex items-center justify-center min-w-[44px] min-h-[44px]">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist(product.id, product.name);
              }}
              className={`w-9 h-9 flex items-center justify-center rounded-full shadow-xs backdrop-blur-xs border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 active:scale-95 cursor-pointer ${
                isFav
                  ? 'bg-maroon-800 text-white border-maroon-900 hover:bg-maroon-900'
                  : 'bg-white/95 text-charcoal-700 border-gold-200/80 hover:text-maroon-800 hover:border-gold-400'
              }`}
              aria-label={
                isFav
                  ? `Remove ${product.name} from Wishlist`
                  : `Add ${product.name} to Wishlist`
              }
              aria-pressed={isFav}
            >
              <Heart
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFav ? 'fill-current' : ''}`}
              />
            </button>
          </div>

          {/* Buying Shortlist Button (44px min touch target container) */}
          <div className="flex items-center justify-center min-w-[44px] min-h-[44px]">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleShortlist(product.id, product.name);
              }}
              className={`w-9 h-9 flex items-center justify-center rounded-full shadow-xs backdrop-blur-xs border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 active:scale-95 cursor-pointer ${
                isShortlisted
                  ? 'bg-gold-600 text-white border-gold-700 hover:bg-gold-700'
                  : 'bg-white/95 text-charcoal-700 border-gold-200/80 hover:text-gold-800 hover:border-gold-400'
              }`}
              aria-label={
                isShortlisted
                  ? `Remove ${product.name} from Buying Shortlist`
                  : `Add ${product.name} to Buying Shortlist`
              }
              aria-pressed={isShortlisted}
            >
              <ShoppingBag
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isShortlisted ? 'fill-current' : ''}`}
              />
            </button>
          </div>

          {/* Share Button (44px min touch target container) */}
          <ProductShareButton
            product={product}
            imageUrl={resolvedImageUrl}
            variant="card"
          />
        </div>

        {/* Bottom Purity Pill */}
        <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 pointer-events-none">
          <span className="inline-flex items-center gap-1 bg-cream-50/95 backdrop-blur-xs border border-gold-300 text-maroon-950 text-[9px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full shadow-xs">
            <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gold-700" />
            <span>{product.purity} Gold</span>
          </span>
        </div>
      </div>

      {/* Card Content Area - Compact for 2-column mobile */}
      <div className="p-3 sm:p-4 md:p-5 flex-1 flex flex-col justify-between space-y-2.5 sm:space-y-3 bg-gradient-to-b from-cream-50 to-cream-100/40">
        <div className="space-y-1.5 sm:space-y-2">
          {/* Category & Gender & Occasion Meta */}
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-charcoal-600 font-sans">
            <span className="uppercase tracking-wider font-semibold text-gold-800 truncate max-w-[65%]">
              {product.category}
            </span>
            <span className="bg-gold-100/70 border border-gold-200/80 text-maroon-900 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium truncate">
              {product.occasion}
            </span>
          </div>

          {/* Product Name */}
          <h3 className="font-serif font-bold text-xs sm:text-base md:text-lg text-maroon-950 leading-snug group-hover:text-maroon-700 transition-colors line-clamp-2">
            <Link
              href={`/catalogue/${product.slug}`}
              className="focus:outline-none focus-visible:ring-1 focus-visible:ring-gold-500 rounded"
            >
              {product.name}
            </Link>
          </h3>

          {/* SKU & Short Description */}
          <p className="text-[10px] sm:text-xs font-mono text-charcoal-500 tracking-wide truncate">
            SKU: {product.sku}
          </p>
          {product.shortDescription?.trim() ? (
            <p className="hidden sm:block text-xs text-charcoal-700 line-clamp-2 leading-relaxed font-sans mt-1">
              {product.shortDescription}
            </p>
          ) : null}
        </div>

        {/* Specifications & Weight Block */}
        <div className="pt-2 sm:pt-2.5 border-t border-gold-200/80 space-y-1 sm:space-y-1.5">
          <div className="flex items-center justify-between text-[11px] sm:text-xs">
            <span className="text-charcoal-600 font-sans font-medium">
              Approx. Weight:
            </span>
            <span className="font-serif font-bold text-maroon-950 text-xs sm:text-sm">
              {formatWeight(product.approxWeight)}
            </span>
          </div>

          {/* Exact Required Weight Disclaimer on Cards */}
          <p className="hidden sm:block text-[10px] text-charcoal-500 italic leading-tight font-sans">
            {EXACT_WEIGHT_DISCLAIMER}
          </p>
        </div>

        {/* Card Actions */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 pt-1 sm:pt-1.5">
          <Link
            href={`/catalogue/${product.slug}`}
            className="inline-flex items-center justify-center gap-1 text-[11px] sm:text-xs font-semibold text-maroon-950 bg-gold-100/90 hover:bg-gold-200/90 border border-gold-300/90 min-h-[40px] sm:min-h-[44px] py-2 sm:py-2.5 px-2 rounded-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 active:scale-95 shadow-xs"
          >
            <span>Details</span>
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gold-700" />
          </Link>

          <a
            href={`https://wa.me/${CONTACT_CONFIG.whatsappNumberRaw}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1 text-[11px] sm:text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 min-h-[40px] sm:min-h-[44px] py-2 sm:py-2.5 px-2 rounded-xl transition-all shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 active:scale-95"
            aria-label={`Inquire about ${product.name} on WhatsApp`}
          >
            <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Enquire</span>
          </a>
        </div>
      </div>
    </div>
  );
};
