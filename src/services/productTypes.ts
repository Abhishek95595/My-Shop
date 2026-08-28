export type ProductCategory =
  | 'Rings'
  | 'Necklaces/Sets'
  | 'Chains'
  | 'Mangalsutra'
  | 'Bangles/Kada';

export type ProductGender = 'Women' | 'Men';

export type GoldPurity = '18K' | '22K' | '24K';

export type ProductAvailability = 'Available' | 'Made on Order';

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  category: ProductCategory;
  gender: ProductGender;
  purity: GoldPurity;
  approximateWeight: string;
  approximateWeightGrams: number;
  status: ProductAvailability;
  shortDescription: string;
  detailedDescription: string;
  occasion: string;
  tags: string[];
  images: ProductImage[];
  isSampleProduct: boolean;
  isFeatured?: boolean;
  isWeddingCollection?: boolean;
  createdAt?: string;
  updatedAt?: string;
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
