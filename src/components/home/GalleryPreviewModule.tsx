import React from 'react';
import Image from 'next/image';

interface GalleryItem {
  id: string;
  url: string;
  caption: string;
}

interface GalleryPreviewModuleProps {
  items?: GalleryItem[];
}

export const GalleryPreviewModule: React.FC<GalleryPreviewModuleProps> = ({
  items,
}) => {
  // Requirement: Gallery preview only when content exists
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-maroon-950">
          Showroom &amp; Craft Gallery
        </h2>
        <p className="text-sm text-charcoal-600 font-sans">
          Moments and craftsmanship from our Gorakhpur boutique.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="relative aspect-square rounded-2xl overflow-hidden border border-gold-200 shadow-card bg-cream-50"
          >
            <Image
              src={item.url}
              alt={item.caption}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        ))}
      </div>
    </section>
  );
};
