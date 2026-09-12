/**
 * Canonical Gold Jewellery Category Registry for Khushi Ornament House (KOH).
 *
 * Single source of truth for:
 * - Category names and canonical display order
 * - Standardized 3-letter SKU prefix codes
 * - Category presentation metadata (subtitles, imagery, and icon associations)
 *
 * All types (ProductCategory), arrays (CATEGORIES), and mappings (CATEGORY_CODES)
 * are derived directly from this registry to prevent duplicate definitions.
 */

export const CATEGORY_REGISTRY = [

  {
    name: 'Rings',
    code: 'RNG',
    subtitle: 'Classic & Floral Gold Bands',
    image: '/assets/products/classic-ring-main.svg',
    iconName: 'CircleDot',
  },
  {
    name: 'Necklaces/Sets',
    code: 'NCK',
    subtitle: 'Bridal & Heritage Chokers',
    image: '/assets/products/bridal-necklace-main.svg',
    iconName: 'Sparkles',
  },
  {
    name: 'Chains',
    code: 'CHN',
    subtitle: 'Curb & Classic Links',
    image: '/assets/products/mens-chain-main.svg',
    iconName: 'Link',
  },
  {
    name: 'Mangalsutra',
    code: 'MNG',
    subtitle: 'Black Beads & Gold Pendants',
    image: '/assets/products/mangalsutra-main.svg',
    iconName: 'Heart',
  },
  {
    name: 'Bangles/Kada',
    code: 'BNG',
    subtitle: 'Heritage Bridal Bangles',
    image: '/assets/products/wedding-bangles-main.svg',
    iconName: 'Circle',
  },
  {
    name: 'Earrings',
    code: 'ERN',
    subtitle: 'Jhumkas, Studs & Drops',
    image: '/assets/products/gold-earrings-main.svg',
    iconName: 'Sparkles',
  },
  {
    name: 'Pendants',
    code: 'PND',
    subtitle: 'Devotional & Daily Charms',
    image: '/assets/products/gold-pendant-main.svg',
    iconName: 'Award',
  },
  {
    name: 'Bracelets',
    code: 'BRC',
    subtitle: 'Delicate & Modern Chains',
    iconName: 'CircleDot',
  },
  {
    name: 'Nose Pins',
    code: 'NSP',
    subtitle: 'Classic Studs & Floral Naths',
    iconName: 'Flame',
  },
  {
    name: 'Maang Tikka',
    code: 'MTK',
    subtitle: 'Bridal Matha Patti & Tikkas',
    iconName: 'Crown',
  },
  {
    name: 'Chokers',
    code: 'CHK',
    subtitle: 'Regal Collar & Royal Sets',
    iconName: 'Layers',
  },
  {
    name: 'Bridal Sets',
    code: 'BDS',
    subtitle: 'Complete Wedding Ensembles',
    iconName: 'Gem',
  },
  {
    name: "Men's Jewellery",
    code: 'MNJ',
    subtitle: 'Kadas, Rings & Bold Chains',
    iconName: 'User',
  },
  {
    name: 'Kids Jewellery',
    code: 'KDJ',
    subtitle: 'Nazariya, Bangles & Charms',
    iconName: 'Baby',
  },
  {
    name: 'Gold Coins',
    code: 'GDC',
    subtitle: '24K Investment Coins',
    iconName: 'Coins',
  },
] as const;

export type ProductCategory = (typeof CATEGORY_REGISTRY)[number]['name'];

export interface CategoryDefinition {
  readonly name: ProductCategory;
  readonly code: string;
  readonly subtitle: string;
  readonly image?: string;
  readonly iconName: string;
}


export const CATEGORIES = CATEGORY_REGISTRY.map(
  (c) => c.name
) as unknown as readonly [
  'Rings',
  'Necklaces/Sets',
  'Chains',
  'Mangalsutra',
  'Bangles/Kada',
  'Earrings',
  'Pendants',
  'Bracelets',
  'Nose Pins',
  'Maang Tikka',
  'Chokers',
  'Bridal Sets',
  "Men's Jewellery",
  'Kids Jewellery',
  'Gold Coins'
];

export const CATEGORY_CODES: Record<ProductCategory, string> = Object.freeze(
  CATEGORY_REGISTRY.reduce((acc, cat) => {
    acc[cat.name] = cat.code;
    return acc;
  }, {} as Record<ProductCategory, string>)
);

export type ProductAvailabilityCandidate = {
  category: ProductCategory;
  status: 'draft' | 'published' | 'archived';
  isDeleted?: boolean;
};

/**
 * Derives categories with at least one published, non-archived, non-deleted product.
 *
 * Enforces:
 * - Exclusion of status !== 'published' (excludes draft and archived)
 * - Exclusion of isDeleted === true
 * - Counts both 'available' and 'made_on_order' published products
 * - Strictly preserves canonical CATEGORIES display order
 */
export function getAvailableCategories(
  products: ProductAvailabilityCandidate[]
): ProductCategory[] {
  const availableSet = new Set<ProductCategory>();
  for (const p of products) {
    if (p.status === 'published' && !p.isDeleted) {
      availableSet.add(p.category);
    }
  }
  return CATEGORIES.filter((cat) => availableSet.has(cat));
}

/**
 * Derives full category definitions for available categories, preserving canonical order.
 */
export function getAvailableCategoryDefinitions(
  products: ProductAvailabilityCandidate[]
): CategoryDefinition[] {
  const availableSet = new Set<ProductCategory>();
  for (const p of products) {
    if (p.status === 'published' && !p.isDeleted) {
      availableSet.add(p.category);
    }
  }
  return CATEGORY_REGISTRY.filter((catDef) => availableSet.has(catDef.name));
}
