import { Product } from './productTypes';

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'prod-bridal-necklace-01',
    sku: 'KOH-GLD-NCK-001',
    name: 'Bridal Gold Necklace Set',
    slug: 'bridal-gold-necklace-set',
    category: 'Necklaces/Sets',
    gender: 'Women',
    purity: '22K',
    approximateWeight: '48.50g',
    approximateWeightGrams: 48.5,
    status: 'Made on Order',
    shortDescription:
      'Opulent 22K yellow gold bridal necklace featuring traditional filigree craftsmanship with matching drop earrings.',
    detailedDescription:
      'Handcrafted for weddings and auspicious occasions, this bridal necklace set showcases intricate floral and filigree work by Gorakhpur artisans. The set includes a regal choker necklace and matching statement earrings crafted in pure 22 Karat gold with antique polish accents.',
    occasion: 'Wedding',
    tags: ['Bridal', 'Wedding', 'Necklace Set', '22K Gold', 'Traditional'],
    isSampleProduct: true,
    isFeatured: true,
    isWeddingCollection: true,
    images: [
      {
        id: 'img-nck-01-primary',
        url: '/assets/products/bridal-necklace-main.svg',
        alt: 'Bridal Gold Necklace Set - Main View',
        sortOrder: 1,
        isPrimary: true,
      },
      {
        id: 'img-nck-01-detail-1',
        url: '/assets/products/bridal-necklace-detail.svg',
        alt: 'Bridal Gold Necklace Set - Earring Detail',
        sortOrder: 2,
        isPrimary: false,
      },
      {
        id: 'img-nck-01-craft-2',
        url: '/assets/products/bridal-necklace-craft.svg',
        alt: 'Bridal Gold Necklace Set - Artisan Craftsmanship',
        sortOrder: 3,
        isPrimary: false,
      },
    ],
  },
  {
    id: 'prod-classic-ring-02',
    sku: 'KOH-GLD-RNG-002',
    name: 'Classic Gold Ring',
    slug: 'classic-gold-ring',
    category: 'Rings',
    gender: 'Women',
    purity: '22K',
    approximateWeight: '4.80g',
    approximateWeightGrams: 4.8,
    status: 'Available',
    shortDescription:
      'Timeless 22K floral motif gold ring with delicate milgrain detailing, ideal for daily elegance and celebrations.',
    detailedDescription:
      'A graceful 22K yellow gold ring shaped with floral petals and high-polish center contour. Designed for comfort and durability, making it an enduring personal keepsake or meaningful gift for family milestones.',
    occasion: 'Daily Wear',
    tags: ['Ring', '22K Gold', 'Floral', 'Daily Wear', 'Classic'],
    isSampleProduct: true,
    isFeatured: true,
    isWeddingCollection: false,
    images: [
      {
        id: 'img-rng-02-primary',
        url: '/assets/products/classic-ring-main.svg',
        alt: 'Classic Gold Ring - Front Showcase',
        sortOrder: 1,
        isPrimary: true,
      },
      {
        id: 'img-rng-02-side',
        url: '/assets/products/classic-ring-side.svg',
        alt: 'Classic Gold Ring - Side Profile',
        sortOrder: 2,
        isPrimary: false,
      },
    ],
  },
  {
    id: 'prod-mangalsutra-03',
    sku: 'KOH-GLD-MNG-003',
    name: 'Traditional Mangalsutra',
    slug: 'traditional-mangalsutra',
    category: 'Mangalsutra',
    gender: 'Women',
    purity: '22K',
    approximateWeight: '14.20g',
    approximateWeightGrams: 14.2,
    status: 'Available',
    shortDescription:
      'Sacred 22K gold Mangalsutra with black auspicious beads and handcrafted heritage pendant.',
    detailedDescription:
      'Embodying tradition and eternal bond, this 22K yellow gold mangalsutra combines dual-strand black beads with an embossed heritage gold pendant. Perfect for daily grace and traditional ceremonies.',
    occasion: 'Wedding',
    tags: ['Mangalsutra', 'Wedding', '22K Gold', 'Heritage', 'Auspicious'],
    isSampleProduct: true,
    isFeatured: true,
    isWeddingCollection: true,
    images: [
      {
        id: 'img-mng-03-primary',
        url: '/assets/products/mangalsutra-main.svg',
        alt: 'Traditional Mangalsutra - Pendant and Bead Display',
        sortOrder: 1,
        isPrimary: true,
      },
      {
        id: 'img-mng-03-pendant',
        url: '/assets/products/mangalsutra-pendant.svg',
        alt: 'Traditional Mangalsutra - Intricate Pendant Close-up',
        sortOrder: 2,
        isPrimary: false,
      },
    ],
  },
  {
    id: 'prod-mens-chain-04',
    sku: 'KOH-GLD-CHN-004',
    name: 'Men’s Gold Chain',
    slug: 'mens-gold-chain',
    category: 'Chains',
    gender: 'Men',
    purity: '22K',
    approximateWeight: '24.00g',
    approximateWeightGrams: 24.0,
    status: 'Available',
    shortDescription:
      'Solid 22K hallmark-styled curb link chain with secure lobster clasp for men.',
    detailedDescription:
      'Crafted with precision machine-cut curb links and hand-finished polish, this substantial 22K men’s gold chain delivers unmatched durability and subtle luxury for everyday or formal festive wear.',
    occasion: 'Daily Wear',
    tags: ['Men', 'Chain', '22K Gold', 'Curb Link', 'Classic'],
    isSampleProduct: true,
    isFeatured: true,
    isWeddingCollection: false,
    images: [
      {
        id: 'img-chn-04-primary',
        url: '/assets/products/mens-chain-main.svg',
        alt: 'Men’s Gold Chain - Full Length View',
        sortOrder: 1,
        isPrimary: true,
      },
      {
        id: 'img-chn-04-clasp',
        url: '/assets/products/mens-chain-clasp.svg',
        alt: 'Men’s Gold Chain - Link and Clasp Detail',
        sortOrder: 2,
        isPrimary: false,
      },
    ],
  },
  {
    id: 'prod-wedding-bangles-05',
    sku: 'KOH-GLD-BNG-005',
    name: 'Wedding Gold Bangles',
    slug: 'wedding-gold-bangles',
    category: 'Bangles/Kada',
    gender: 'Women',
    purity: '22K',
    approximateWeight: '38.00g',
    approximateWeightGrams: 38.0,
    status: 'Made on Order',
    shortDescription:
      'Pair of heavy 22K gold bridal bangles with embossed peacock motifs and antique finish.',
    detailedDescription:
      'A masterpiece pair of 22K wedding bangles (kada pair) carved with traditional heritage motifs. Handcrafted with screw-open mechanism for comfortable fitting, ideal for brides and milestone family celebrations.',
    occasion: 'Wedding',
    tags: ['Bangles', 'Kada', 'Wedding', 'Bridal', '22K Gold', 'Antique'],
    isSampleProduct: true,
    isFeatured: true,
    isWeddingCollection: true,
    images: [
      {
        id: 'img-bng-05-primary',
        url: '/assets/products/wedding-bangles-main.svg',
        alt: 'Wedding Gold Bangles - Pair Showcase',
        sortOrder: 1,
        isPrimary: true,
      },
      {
        id: 'img-bng-05-detail',
        url: '/assets/products/wedding-bangles-detail.svg',
        alt: 'Wedding Gold Bangles - Carving Detail',
        sortOrder: 2,
        isPrimary: false,
      },
    ],
  },
];

export function getAllProducts(): Product[] {
  return [...SAMPLE_PRODUCTS];
}

export function getProductBySlug(slug: string): Product | undefined {
  return SAMPLE_PRODUCTS.find((p) => p.slug === slug);
}

export function getFeaturedProducts(): Product[] {
  return SAMPLE_PRODUCTS.filter((p) => p.isFeatured);
}

export function getWeddingProducts(): Product[] {
  return SAMPLE_PRODUCTS.filter((p) => p.isWeddingCollection || p.occasion.toLowerCase() === 'wedding');
}
