export type ProductCategory =
  | 'Rings'
  | 'Necklaces/Sets'
  | 'Chains'
  | 'Mangalsutra'
  | 'Bangles/Kada';

export type ProductGender = 'Women' | 'Men';

export type GoldPurity = '18K' | '22K' | '24K';

export type ProductAvailability = 'available' | 'made_on_order';

export type ProductPublicationStatus = 'draft' | 'published' | 'archived';

export interface ProductImage {
  id: string;
  url: string;
  altText: string;
  sortOrder: number;
  isPrimary: boolean;
  storagePath?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  category: ProductCategory;
  gender: 'Women' | 'Men';
  purity: '18K' | '22K' | '24K';
  approxWeight: number;
  availability: 'available' | 'made_on_order';
  images: ProductImage[];
  shortDescription: string;
  detailedDescription: string;
  occasion: string;
  tags: string[];
  isFeatured: boolean;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface GoldRateItem {
  purity: GoldPurity;
  ratePerGram?: number;
  updatedAt?: string;
}

export interface OwnerRatesState {
  lastUpdated?: string;
  rates?: GoldRateItem[];
  notes?: string;
}
