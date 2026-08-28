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
import { CONTACT_CONFIG, EXACT_WEIGHT_DISCLAIMER } from '@/lib/constants';
import { useSavedItems } from '@/context/SavedItemsContext';

interface ProductCardProps {
  product: Product;
  isSample?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isSample = true,
}) => {
  const primaryImage = getPrimaryImage(product.images);
  const { isInWishlist, isInShortlist, toggleWishlist, toggleShortlist } =
    useSavedItems();

  const isFav = isInWishlist(product.id);
  const isShortlisted = isInShortlist(product.id);

  const whatsappMessage = encodeURIComponent(
    `Hello Khushi Ornament House, I am inquiring about the ${product.name} (SKU: ${product.sku}).`
  );

  return (
    <div className="group bg-cream-50 rounded-2xl border border-gold-200/90 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Image Container with Badges & Save Actions */}
      <div className="relative aspect-square w-full bg-cream-100/60 overflow-hidden border-b border-gold-200/60">
        <Link
          href={`/catalogue/${product.slug}`}
          className="block w-full h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
          aria-label={`View details for ${product.name}`}
        >
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.altText || product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-charcoal-500 text-xs">
              No image preview
            </div>
          )}
        </Link>

        {/* Top Left Badges */}
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5 pointer-events-none">
          {/* Sample Product Badge */}
          {isSample && (
            <span className="inline-flex items-center gap-1 bg-maroon-900/90 text-cream-50 text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-xs">
              <Sparkles className="w-3 h-3 text-gold-300" />
              <span>Sample Product</span>
            </span>
          )}

          {/* Availability Badge */}
          <span
            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-sm backdrop-blur-xs ${
              product.availability === 'available'
                ? 'bg-emerald-800/90 text-cream-50'
                : 'bg-gold-800/90 text-cream-50'
            }`}
          >
            {formatAvailability(product.availability)}
          </span>
        </div>

        {/* Top Right Quick Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col items-center gap-1.5 z-10">
          {/* Wishlist Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product.id, product.name);
            }}
            className={`p-2 rounded-full shadow-sm backdrop-blur-xs transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 ${
              isFav
                ? 'bg-maroon-800 text-white hover:bg-maroon-900'
                : 'bg-cream-50/90 text-charcoal-700 hover:text-maroon-800 hover:bg-white'
            }`}
            aria-label={
              isFav
                ? `Remove ${product.name} from Wishlist`
                : `Add ${product.name} to Wishlist`
            }
            aria-pressed={isFav}
          >
            <Heart
              className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`}
            />
          </button>

          {/* Buying Shortlist Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              toggleShortlist(product.id, product.name);
            }}
            className={`p-2 rounded-full shadow-sm backdrop-blur-xs transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 ${
              isShortlisted
                ? 'bg-gold-600 text-white hover:bg-gold-700'
                : 'bg-cream-50/90 text-charcoal-700 hover:text-gold-800 hover:bg-white'
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
          </button>
        </div>

        {/* Bottom Purity Pill */}
        <div className="absolute bottom-3 left-3 pointer-events-none">
          <span className="inline-flex items-center gap-1 bg-cream-50/95 border border-gold-300 text-maroon-900 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
            <Shield className="w-3 h-3 text-gold-700" />
            <span>{product.purity} Gold</span>
          </span>
        </div>
      </div>

      {/* Card Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Category & Gender & Occasion Meta */}
          <div className="flex items-center justify-between text-xs text-charcoal-600 font-sans">
            <span className="uppercase tracking-wider font-medium text-gold-800">
              {product.category} • {product.gender}
            </span>
            <span className="bg-gold-50 border border-gold-200 text-maroon-800 px-2 py-0.5 rounded-full text-[11px]">
              {product.occasion}
            </span>
          </div>

          {/* Product Name */}
          <h3 className="font-serif font-bold text-lg text-maroon-950 leading-snug group-hover:text-maroon-700 transition-colors">
            <Link
              href={`/catalogue/${product.slug}`}
              className="focus:outline-none focus-visible:ring-1 focus-visible:ring-gold-500 rounded"
            >
              {product.name}
            </Link>
          </h3>

          {/* SKU & Short Description */}
          <p className="text-xs font-mono text-charcoal-500 tracking-wide">
            SKU: {product.sku}
          </p>
          <p className="text-xs text-charcoal-700 line-clamp-2 leading-relaxed font-sans">
            {product.shortDescription}
          </p>
        </div>

        {/* Specifications & Weight Block */}
        <div className="pt-3 border-t border-gold-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-charcoal-600 font-sans font-medium">
              Approx. Weight:
            </span>
            <span className="font-serif font-bold text-maroon-900 text-sm">
              {formatWeight(product.approxWeight)}
            </span>
          </div>

          {/* Exact Required Weight Disclaimer on Cards */}
          <p className="text-[11px] text-charcoal-500 italic leading-snug font-sans">
            {EXACT_WEIGHT_DISCLAIMER}
          </p>
        </div>

        {/* Card Actions */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Link
            href={`/catalogue/${product.slug}`}
            className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-maroon-900 bg-gold-100/90 hover:bg-gold-200 border border-gold-300 py-2.5 px-3 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <a
            href={`https://wa.me/${CONTACT_CONFIG.whatsappNumberRaw}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 py-2.5 px-3 rounded-lg transition-colors shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            aria-label={`Inquire about ${product.name} on WhatsApp`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Enquire</span>
          </a>
        </div>
      </div>
    </div>
  );
};
