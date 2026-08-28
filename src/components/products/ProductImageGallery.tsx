'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ProductImage } from '@/services/productTypes';
import { getSortedImages } from '@/services/mockProducts';
import { imageStorageService } from '@/services/images/imageStorageService';
import { Sparkles, Image as ImageIcon } from 'lucide-react';

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  productName,
}) => {
  const sortedImages = React.useMemo(() => getSortedImages(images), [images]);
  const primaryIndex = sortedImages.findIndex((img) => img.isPrimary);
  const initialIndex = primaryIndex !== -1 ? primaryIndex : 0;

  const [selectedIndex, setSelectedIndex] = useState<number>(initialIndex);
  const [resolvedUrls, setResolvedUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    setSelectedIndex(initialIndex);
  }, [initialIndex, sortedImages]);

  useEffect(() => {
    let active = true;
    const acquiredObjectUrls: string[] = [];

    async function loadAllUrls() {
      const map: Record<string, string> = {};
      for (const img of sortedImages) {
        if (img.url.startsWith('indexeddb://')) {
          const resolved = await imageStorageService.getImageUrl(img.id);
          if (resolved) {
            acquiredObjectUrls.push(resolved);
            map[img.id] = resolved;
          }
        } else {
          map[img.id] = img.url;
        }
      }
      if (active) {
        setResolvedUrls(map);
      } else {
        acquiredObjectUrls.forEach((url) => imageStorageService.revokeImageUrl(url));
        acquiredObjectUrls.length = 0;
      }
    }

    loadAllUrls();
    return () => {
      active = false;
      acquiredObjectUrls.forEach((url) => imageStorageService.revokeImageUrl(url));
      acquiredObjectUrls.length = 0;
    };
  }, [sortedImages]);

  const activeImage = sortedImages[selectedIndex] || sortedImages[0];
  const activeUrl = activeImage
    ? resolvedUrls[activeImage.id] ||
      (activeImage.url.startsWith('indexeddb://') ? '' : activeImage.url)
    : '';

  return (
    <div className="space-y-4">
      {/* Main Image Showcase */}
      <div className="relative aspect-square w-full bg-cream-50 border border-gold-200/90 rounded-2xl overflow-hidden shadow-card">
        {activeUrl ? (
          <Image
            src={activeUrl}
            alt={activeImage?.altText || productName}
            fill
            loading="eager"
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-opacity duration-300"
            unoptimized={activeUrl.startsWith('blob:')}
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center text-charcoal-400 font-sans gap-2 bg-cream-100/60"
            role="img"
            aria-label={`Image unavailable for ${productName}`}
          >
            <ImageIcon className="w-8 h-8 text-charcoal-400" />
            <span className="text-xs">No image available</span>
          </div>
        )}

        {/* Primary Indicator */}
        {activeImage?.isPrimary && (
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center gap-1.5 bg-maroon-900/90 text-cream-50 text-xs font-semibold px-3 py-1 rounded-full shadow-sm backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-gold-300" />
              <span>Primary View</span>
            </span>
          </div>
        )}

        {/* Image Slot Counter */}
        {sortedImages.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-charcoal-900/80 text-cream-50 text-xs font-mono px-2.5 py-1 rounded-md backdrop-blur-xs">
            {selectedIndex + 1} / {sortedImages.length}
          </div>
        )}
      </div>

      {/* Ordered Thumbnails Strip */}
      {sortedImages.length > 1 && (
        <div
          className="flex items-center gap-3 overflow-x-auto pb-2 focus:outline-none"
          role="region"
          aria-label="Product Image Thumbnails"
        >
          {sortedImages.map((img, index) => {
            const isSelected = index === selectedIndex;
            const thumbUrl =
              resolvedUrls[img.id] ||
              (img.url.startsWith('indexeddb://') ? '' : img.url);
            return (
              <button
                key={img.id}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 ${
                  isSelected
                    ? 'border-maroon-700 shadow-md ring-2 ring-gold-400/50 scale-102'
                    : 'border-gold-200 hover:border-gold-400 opacity-80 hover:opacity-100'
                }`}
                aria-label={`Show ${img.altText || `View ${index + 1}`}`}
                aria-pressed={isSelected}
              >
                {thumbUrl ? (
                  <Image
                    src={thumbUrl}
                    alt={img.altText || `${productName} view ${index + 1}`}
                    fill
                    sizes="96px"
                    className="object-cover"
                    unoptimized={thumbUrl.startsWith('blob:')}
                  />
                ) : (
                  <div
                    className="w-full h-full bg-cream-200 flex items-center justify-center"
                    role="img"
                    aria-label={`Thumbnail unavailable for ${img.altText || productName}`}
                  >
                    <ImageIcon className="w-4 h-4 text-charcoal-400" />
                  </div>
                )}
                {img.isPrimary && (
                  <span className="absolute top-1 left-1 w-2 h-2 rounded-full bg-gold-400" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
