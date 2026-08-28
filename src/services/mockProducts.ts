import { Product, ProductImage, ProductAvailability } from './productTypes';

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'prod-bridal-necklace-01',
    sku: 'KOH-GLD-NCK-001',
    name: 'Bridal Gold Necklace Set',
    slug: 'bridal-gold-necklace-set',
    category: 'Necklaces/Sets',
    gender: 'Women',
    purity: '22K',
    approxWeight: 48.5,
    availability: 'made_on_order',
    images: [
      {
        id: 'img-nck-01-primary',
        url: '/assets/products/bridal-necklace-main.svg',
        altText: 'Bridal Gold Necklace Set - Main View',
        sortOrder: 1,
        isPrimary: true,
      },
      {
        id: 'img-nck-01-detail-1',
        url: '/assets/products/bridal-necklace-detail.svg',
        altText: 'Bridal Gold Necklace Set - Matching Earring Detail',
        sortOrder: 2,
        isPrimary: false,
      },
      {
        id: 'img-nck-01-craft-2',
        url: '/assets/products/bridal-necklace-craft.svg',
        altText: 'Bridal Gold Necklace Set - Artisan Filigree Detailing',
        sortOrder: 3,
        isPrimary: false,
      },
    ],
    shortDescription:
      '22K yellow gold bridal necklace featuring traditional filigree craftsmanship with matching drop earrings.',
    detailedDescription:
      'Handcrafted for weddings and celebrations, this bridal necklace set showcases intricate floral and filigree work by Gorakhpur artisans. The set includes a choker necklace and matching statement earrings crafted in 22 Karat gold with antique polish accents.',
    occasion: 'Wedding',
    tags: ['Bridal', 'Wedding', 'Necklace Set', '22K Gold', 'Traditional'],
    isFeatured: true,
    status: 'published',
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-02-15T11:30:00.000Z',
  },
  {
    id: 'prod-classic-ring-02',
    sku: 'KOH-GLD-RNG-002',
    name: 'Classic Gold Ring',
    slug: 'classic-gold-ring',
    category: 'Rings',
    gender: 'Women',
    purity: '22K',
    approxWeight: 4.8,
    availability: 'available',
    images: [
      {
        id: 'img-rng-02-primary',
        url: '/assets/products/classic-ring-main.svg',
        altText: 'Classic Gold Ring - Front Showcase',
        sortOrder: 1,
        isPrimary: true,
      },
      {
        id: 'img-rng-02-side',
        url: '/assets/products/classic-ring-side.svg',
        altText: 'Classic Gold Ring - Side Profile',
        sortOrder: 2,
        isPrimary: false,
      },
    ],
    shortDescription:
      'Timeless 22K floral motif gold ring with delicate milgrain detailing, suitable for daily wear and celebrations.',
    detailedDescription:
      'A 22K yellow gold ring shaped with floral petals and high-polish center contour. Designed for comfort and durability, making it an enduring personal keepsake or gift for milestones.',
    occasion: 'Daily Wear',
    tags: ['Ring', '22K Gold', 'Floral', 'Daily Wear', 'Classic'],
    isFeatured: true,
    status: 'published',
    createdAt: '2026-01-12T10:00:00.000Z',
    updatedAt: '2026-02-10T14:00:00.000Z',
  },
  {
    id: 'prod-mangalsutra-03',
    sku: 'KOH-GLD-MNG-003',
    name: 'Traditional Mangalsutra',
    slug: 'traditional-mangalsutra',
    category: 'Mangalsutra',
    gender: 'Women',
    purity: '22K',
    approxWeight: 14.2,
    availability: 'available',
    images: [
      {
        id: 'img-mng-03-primary',
        url: '/assets/products/mangalsutra-main.svg',
        altText: 'Traditional Mangalsutra - Pendant and Bead Display',
        sortOrder: 1,
        isPrimary: true,
      },
      {
        id: 'img-mng-03-pendant',
        url: '/assets/products/mangalsutra-pendant.svg',
        altText: 'Traditional Mangalsutra - Embossed Pendant Close-up',
        sortOrder: 2,
        isPrimary: false,
      },
    ],
    shortDescription:
      'Traditional 22K gold Mangalsutra with black auspicious beads and handcrafted heritage pendant.',
    detailedDescription:
      'This 22K yellow gold mangalsutra combines dual-strand black beads with an embossed gold pendant. Suitable for daily wear and traditional ceremonies.',
    occasion: 'Wedding',
    tags: ['Mangalsutra', 'Wedding', '22K Gold', 'Heritage', 'Auspicious'],
    isFeatured: true,
    status: 'published',
    createdAt: '2026-01-15T11:00:00.000Z',
    updatedAt: '2026-02-12T16:20:00.000Z',
  },
  {
    id: 'prod-mens-chain-04',
    sku: 'KOH-GLD-CHN-004',
    name: 'Men’s Gold Chain',
    slug: 'mens-gold-chain',
    category: 'Chains',
    gender: 'Men',
    purity: '22K',
    approxWeight: 24.0,
    availability: 'available',
    images: [
      {
        id: 'img-chn-04-primary',
        url: '/assets/products/mens-chain-main.svg',
        altText: 'Men’s Gold Chain - Full Length Curb Link View',
        sortOrder: 1,
        isPrimary: true,
      },
      {
        id: 'img-chn-04-clasp',
        url: '/assets/products/mens-chain-clasp.svg',
        altText: 'Men’s Gold Chain - Link and Clasp Detail',
        sortOrder: 2,
        isPrimary: false,
      },
    ],
    shortDescription:
      'Substantial 22K curb link chain with secure clasp for men.',
    detailedDescription:
      'A 22K men’s curb-link gold chain with a polished finish for everyday or formal festive wear.',
    occasion: 'Daily Wear',
    tags: ['Men', 'Chain', '22K Gold', 'Curb Link', 'Classic'],
    isFeatured: true,
    status: 'published',
    createdAt: '2026-01-18T12:00:00.000Z',
    updatedAt: '2026-02-14T09:45:00.000Z',
  },
  {
    id: 'prod-wedding-bangles-05',
    sku: 'KOH-GLD-BNG-005',
    name: 'Wedding Gold Bangles',
    slug: 'wedding-gold-bangles',
    category: 'Bangles/Kada',
    gender: 'Women',
    purity: '22K',
    approxWeight: 38.0,
    availability: 'made_on_order',
    images: [
      {
        id: 'img-bng-05-primary',
        url: '/assets/products/wedding-bangles-main.svg',
        altText: 'Wedding Gold Bangles - Pair Showcase',
        sortOrder: 1,
        isPrimary: true,
      },
      {
        id: 'img-bng-05-detail',
        url: '/assets/products/wedding-bangles-detail.svg',
        altText: 'Wedding Gold Bangles - Carving Detail',
        sortOrder: 2,
        isPrimary: false,
      },
    ],
    shortDescription:
      'Pair of 22K gold bridal bangles with embossed traditional motifs and antique finish.',
    detailedDescription:
      'A pair of 22K wedding bangles (kada pair) carved with traditional motifs. Handcrafted with screw-open mechanism for comfortable fitting, ideal for brides and family celebrations.',
    occasion: 'Wedding',
    tags: ['Bangles', 'Kada', 'Wedding', 'Bridal', '22K Gold', 'Antique'],
    isFeatured: true,
    status: 'published',
    createdAt: '2026-01-20T14:30:00.000Z',
    updatedAt: '2026-02-18T10:15:00.000Z',
  },
];

/**
 * Validation function for product publication and image rules.
 * Rules:
 * 1. Must have at least one image.
 * 2. Exactly one image must have isPrimary === true.
 * 3. Every image must have non-empty altText.
 * 4. Must have a valid numeric approxWeight > 0.
 */
export function validateProductContract(product: Product): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!product.images || product.images.length === 0) {
    errors.push(`Product ${product.sku} has no images.`);
  } else {
    const primaryImages = product.images.filter((img) => img.isPrimary === true);
    if (primaryImages.length !== 1) {
      errors.push(
        `Product ${product.sku} must have exactly one primary image, found ${primaryImages.length}.`
      );
    }

    product.images.forEach((img, idx) => {
      if (!img.altText || img.altText.trim() === '') {
        errors.push(
          `Image at index ${idx} for product ${product.sku} is missing altText.`
        );
      }
      if (typeof img.sortOrder !== 'number') {
        errors.push(
          `Image at index ${idx} for product ${product.sku} is missing a valid sortOrder.`
        );
      }
    });
  }

  if (typeof product.approxWeight !== 'number' || product.approxWeight <= 0) {
    errors.push(`Product ${product.sku} must have a positive numeric approxWeight.`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Helper to get sorted images by sortOrder.
 */
export function getSortedImages(images: ProductImage[]): ProductImage[] {
  return [...images].sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Helper to derive primary image explicitly from isPrimary flag.
 */
export function getPrimaryImage(images: ProductImage[]): ProductImage | undefined {
  return images.find((img) => img.isPrimary) || images[0];
}

/**
 * Helper to format numeric weight into display string.
 */
export function formatWeight(weight: number): string {
  return `${weight.toFixed(2)}g`;
}

/**
 * Helper to format availability status into customer-facing label.
 */
export function formatAvailability(availability: ProductAvailability): string {
  switch (availability) {
    case 'available':
      return 'Available';
    case 'made_on_order':
      return 'Made on Order';
    default:
      return availability;
  }
}

/**
 * Public catalogue query: returns ONLY products with status === 'published'.
 * Combines baseline sample products and locally published custom admin products.
 */
export function getAllPublishedProducts(): Product[] {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('koh_admin_custom_products');
      const overridesRaw = localStorage.getItem('koh_admin_sample_overrides');
      const overrides = overridesRaw ? JSON.parse(overridesRaw) : {};
      const baseline = SAMPLE_PRODUCTS.map((p) => overrides[p.id] || p);
      const custom = raw ? JSON.parse(raw) : [];
      const all: Product[] = [...baseline, ...custom];
      return all.filter((p) => p.status === 'published');
    } catch {
      return SAMPLE_PRODUCTS.filter((p) => p.status === 'published');
    }
  }
  return SAMPLE_PRODUCTS.filter((p) => p.status === 'published');
}

/**
 * Public product lookup by slug: returns only if published.
 */
export function getProductBySlug(slug: string): Product | undefined {
  const published = getAllPublishedProducts();
  return published.find((p) => p.slug === slug);
}

/**
 * Public query for featured products.
 */
export function getFeaturedProducts(): Product[] {
  return getAllPublishedProducts().filter((p) => p.isFeatured);
}

/**
 * Public query for wedding collection (derived from occasion or tags).
 */
export function getWeddingProducts(): Product[] {
  return getAllPublishedProducts().filter(
    (p) =>
      p.occasion.toLowerCase() === 'wedding' ||
      p.tags.some((t) => t.toLowerCase() === 'wedding' || t.toLowerCase() === 'bridal')
  );
}
