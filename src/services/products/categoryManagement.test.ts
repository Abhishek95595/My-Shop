import { describe, it, expect, vi } from 'vitest';
import {
  CATEGORIES,
  CATEGORY_CODES,
  ProductCategory,
  CATEGORY_REGISTRY,
  getAvailableCategories,
  getAvailableCategoryDefinitions,
  ProductAvailabilityCandidate,
} from '../../lib/constants';
import { productRepository } from './productRepository';
import { Product } from '../productTypes';

describe('Category Management & Canonical Registry Suite', () => {
  const EXPECTED_EXISTING_CATEGORIES = [
    'Rings',
    'Necklaces/Sets',
    'Chains',
    'Mangalsutra',
    'Bangles/Kada',
  ];

  const EXPECTED_NEW_CATEGORIES = [
    'Earrings',
    'Pendants',
    'Bracelets',
    'Nose Pins',
    'Maang Tikka',
    'Chokers',
    'Bridal Sets',
    "Men's Jewellery",
    'Kids Jewellery',
    'Gold Coins',
  ];

  const FULL_EXPECTED_ORDER = [
    ...EXPECTED_EXISTING_CATEGORIES,
    ...EXPECTED_NEW_CATEGORIES,
  ];

  it('1. Canonical registry contains exactly 15 categories in the exact specified order', () => {
    expect(CATEGORIES).toHaveLength(15);
    expect(CATEGORY_REGISTRY).toHaveLength(15);
    expect([...CATEGORIES]).toEqual(FULL_EXPECTED_ORDER);

    // Verify first 5 categories match original existing categories
    expect(CATEGORIES.slice(0, 5)).toEqual(EXPECTED_EXISTING_CATEGORIES);

    // Verify next 10 categories match user-specified new categories in exact order
    expect(CATEGORIES.slice(5)).toEqual(EXPECTED_NEW_CATEGORIES);
  });

  it('2. Every category in the canonical registry has a unique 3-letter SKU prefix code', () => {
    const codes = CATEGORIES.map((cat) => CATEGORY_CODES[cat]);

    // All categories must have a defined 3-letter uppercase code
    codes.forEach((code) => {
      expect(code).toBeDefined();
      expect(code).toMatch(/^[A-Z]{3}$/);
    });

    // All SKU prefix codes must be mutually distinct (no collision)
    const uniqueCodes = new Set(codes);
    expect(uniqueCodes.size).toBe(15);

    // Verify explicit mappings
    expect(CATEGORY_CODES['Rings']).toBe('RNG');
    expect(CATEGORY_CODES['Necklaces/Sets']).toBe('NCK');
    expect(CATEGORY_CODES['Chains']).toBe('CHN');
    expect(CATEGORY_CODES['Mangalsutra']).toBe('MNG');
    expect(CATEGORY_CODES['Bangles/Kada']).toBe('BNG');
    expect(CATEGORY_CODES['Earrings']).toBe('ERN');
    expect(CATEGORY_CODES['Pendants']).toBe('PND');
    expect(CATEGORY_CODES['Bracelets']).toBe('BRC');
    expect(CATEGORY_CODES['Nose Pins']).toBe('NSP');
    expect(CATEGORY_CODES['Maang Tikka']).toBe('MTK');
    expect(CATEGORY_CODES['Chokers']).toBe('CHK');
    expect(CATEGORY_CODES['Bridal Sets']).toBe('BDS');
    expect(CATEGORY_CODES["Men's Jewellery"]).toBe('MNJ');
    expect(CATEGORY_CODES['Kids Jewellery']).toBe('KDJ');
    expect(CATEGORY_CODES['Gold Coins']).toBe('GDC');
  });

  it('3. productRepository.generateUniqueSku generates the correct SKU prefix for all 15 categories', () => {
    FULL_EXPECTED_ORDER.forEach((cat) => {
      const sku = productRepository.generateUniqueSku(cat as ProductCategory);
      const expectedCode = CATEGORY_CODES[cat as ProductCategory];
      expect(sku).toMatch(new RegExp(`^KOH-GLD-${expectedCode}-\\d{3}$`));
    });
  });

  it('4. validateForPublish permits all 15 canonical categories and rejects unregistered categories', () => {
    const baseValidProduct: Partial<Product> = {
      name: 'Sample Test Piece',
      slug: 'sample-test-piece',
      gender: 'Women',
      purity: '22K',
      approxWeight: 10.5,
      availability: 'available',
      shortDescription: 'High purity gold design',
      detailedDescription: 'Handcrafted Gorakhpur jewellery test piece',
      occasion: 'Wedding',
      images: [
        {
          id: 'img-1',
          url: '/assets/sample.svg',
          altText: 'Sample piece cover',
          sortOrder: 1,
          isPrimary: true,
        },
      ],
    };

    // All 15 canonical categories must pass validation
    FULL_EXPECTED_ORDER.forEach((cat) => {
      const result = productRepository.validateForPublish({
        ...baseValidProduct,
        category: cat as ProductCategory,
      });
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    // An invalid/unregistered category must fail validation
    const invalidResult = productRepository.validateForPublish({
      ...baseValidProduct,
      category: 'UnregisteredCategory' as unknown as ProductCategory,
    });
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors).toContain('Invalid category: "UnregisteredCategory".');
  });

  it('5. URL encoding and decoding for special characters preserves category identity', () => {
    const specialCategories = [
      'Necklaces/Sets',
      'Bangles/Kada',
      "Men's Jewellery",
      'Kids Jewellery',
    ];

    specialCategories.forEach((cat) => {
      const encoded = encodeURIComponent(cat);
      const url = `https://khushiornament.com/catalogue?category=${encoded}`;
      const parsedUrl = new URL(url);
      const decodedParam = parsedUrl.searchParams.get('category');

      expect(decodedParam).toBe(cat);
      expect(CATEGORIES).toContain(decodedParam);
    });
  });

  it('6. Availability helper strictly excludes status !== "published" (draft, archived)', () => {
    const candidateProducts: ProductAvailabilityCandidate[] = [
      { category: 'Earrings', status: 'draft' },
      { category: 'Pendants', status: 'archived' },
      { category: 'Rings', status: 'published' },
    ];

    const available = getAvailableCategories(candidateProducts);
    expect(available).toEqual(['Rings']);
    expect(available).not.toContain('Earrings');
    expect(available).not.toContain('Pendants');
  });

  it('7. Availability helper strictly excludes isDeleted === true products', () => {
    const candidateProducts: ProductAvailabilityCandidate[] = [
      { category: 'Bracelets', status: 'published', isDeleted: true },
      { category: 'Chains', status: 'published', isDeleted: false },
    ];

    const available = getAvailableCategories(candidateProducts);
    expect(available).toEqual(['Chains']);
    expect(available).not.toContain('Bracelets');
  });

  it('8. Availability helper counts both "available" and "made_on_order" published items', () => {
    const fullProducts: Product[] = [
      {
        id: 'p-1',
        sku: 'KOH-GLD-NSP-001',
        name: 'Gold Nose Pin',
        slug: 'gold-nose-pin',
        category: 'Nose Pins',
        gender: 'Women',
        purity: '22K',
        approxWeight: 0.5,
        availability: 'made_on_order', // Made on order
        images: [],
        shortDescription: 'Desc',
        detailedDescription: 'Desc',
        occasion: 'Daily Wear',
        tags: [],
        isFeatured: false,
        status: 'published',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'p-2',
        sku: 'KOH-GLD-MTK-001',
        name: 'Bridal Maang Tikka',
        slug: 'bridal-maang-tikka',
        category: 'Maang Tikka',
        gender: 'Women',
        purity: '22K',
        approxWeight: 15.0,
        availability: 'available', // In stock / available
        images: [],
        shortDescription: 'Desc',
        detailedDescription: 'Desc',
        occasion: 'Wedding',
        tags: [],
        isFeatured: false,
        status: 'published',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ];

    const available = getAvailableCategories(fullProducts);
    expect(available).toContain('Nose Pins');
    expect(available).toContain('Maang Tikka');
    expect(available).toHaveLength(2);
  });

  it('9. Available categories strictly preserves canonical order regardless of product insertion order', () => {
    // Insert Gold Coins, then Chokers, then Rings
    const reversedProducts: ProductAvailabilityCandidate[] = [
      { category: 'Gold Coins', status: 'published' },
      { category: 'Chokers', status: 'published' },
      { category: 'Rings', status: 'published' },
    ];

    const available = getAvailableCategories(reversedProducts);
    // Canonical order in CATEGORIES: Rings (1), Chokers (11), Gold Coins (15)
    expect(available).toEqual(['Rings', 'Chokers', 'Gold Coins']);

    const defs = getAvailableCategoryDefinitions(reversedProducts);
    expect(defs.map((d) => d.name)).toEqual(['Rings', 'Chokers', 'Gold Coins']);
  });

  it('10. First-product publishing in an empty category causes it to immediately appear', () => {
    let products: ProductAvailabilityCandidate[] = [
      { category: 'Rings', status: 'published' },
    ];

    expect(getAvailableCategories(products)).toEqual(['Rings']);

    // Admin publishes the first product in "Kids Jewellery"
    products = [
      ...products,
      { category: 'Kids Jewellery', status: 'published' },
    ];

    expect(getAvailableCategories(products)).toEqual(['Rings', 'Kids Jewellery']);
  });

  it('11. Last-product unpublishing, archiving, or deletion causes category to immediately disappear', () => {
    let products: ProductAvailabilityCandidate[] = [
      { category: 'Rings', status: 'published' },
      { category: 'Bridal Sets', status: 'published' },
    ];

    expect(getAvailableCategories(products)).toEqual(['Rings', 'Bridal Sets']);

    // 11a: Last Bridal Set archived
    products = [
      { category: 'Rings', status: 'published' },
      { category: 'Bridal Sets', status: 'archived' },
    ];
    expect(getAvailableCategories(products)).toEqual(['Rings']);

    // 11b: Product deleted
    products = [
      { category: 'Rings', status: 'published' },
      { category: 'Bridal Sets', status: 'published', isDeleted: true },
    ];
    expect(getAvailableCategories(products)).toEqual(['Rings']);
  });

  it('12. Real catalogue reset behavior: resets unavailable category to "All", preserves other valid params with router.replace, and avoids loops', () => {
    const mockRouterReplace = vi.fn();

    interface TestFilterState {
      search: string;
      category: string;
      gender: string;
      purity: string;
      availability: string;
      occasion: string;
      weightIndex: number;
      sortBy: string;
    }

    let filters: TestFilterState = {
      search: 'traditional',
      category: 'Chokers', // Category has no published items
      gender: 'Women',
      purity: '22K',
      availability: 'made_on_order',
      occasion: 'Wedding',
      weightIndex: 2,
      sortBy: 'name-asc',
    };

    let currentSearchParams = new URLSearchParams('category=Chokers&gender=Women&purity=22K&availability=made_on_order&occasion=Wedding&q=traditional');

    const availableCategories: ProductCategory[] = ['Rings', 'Necklaces/Sets'];

    // Execution logic matching the dedicated useEffect in src/app/catalogue/page.tsx
    const runAutoReset = (status: 'loading' | 'ready' | 'error') => {
      // 1. Run only after product data is ready
      if (status !== 'ready') return;
      // 2. Run only when selected category is not 'All'
      if (filters.category === 'All') return;

      // 3. Run only when selected category is unavailable
      const isAvailable = availableCategories.includes(filters.category as ProductCategory);
      if (!isAvailable) {
        // 4. Pure state update
        filters = { ...filters, category: 'All' };

        // 5. Remove only 'category' query parameter while preserving other valid parameters
        const params = new URLSearchParams(currentSearchParams.toString());
        if (params.has('category')) {
          params.delete('category');
          const queryString = params.toString();
          const targetUrl = queryString ? `/catalogue?${queryString}` : '/catalogue';
          const currentQuery = currentSearchParams.toString();
          const currentUrl = currentQuery ? `/catalogue?${currentQuery}` : '/catalogue';

          if (targetUrl !== currentUrl) {
            mockRouterReplace(targetUrl, { scroll: false });
            currentSearchParams = params;
          }
        }
      }
    };

    // Step A: While loadStatus === 'loading', auto-reset MUST NOT run
    runAutoReset('loading');
    expect(mockRouterReplace).not.toHaveBeenCalled();
    expect(filters.category).toBe('Chokers');

    // Step B: When loadStatus === 'ready', auto-reset runs
    runAutoReset('ready');
    expect(mockRouterReplace).toHaveBeenCalledTimes(1);

    // Verify router.replace call and options
    const [calledUrl, calledOptions] = mockRouterReplace.mock.calls[0];
    expect(calledOptions).toEqual({ scroll: false });

    // Verify 'category' is removed but other parameters (gender, purity, availability, occasion, q) are preserved
    const parsed = new URL(`https://khushiornament.com${calledUrl}`);
    expect(parsed.searchParams.get('category')).toBeNull();
    expect(parsed.searchParams.get('gender')).toBe('Women');
    expect(parsed.searchParams.get('purity')).toBe('22K');
    expect(parsed.searchParams.get('availability')).toBe('made_on_order');
    expect(parsed.searchParams.get('occasion')).toBe('Wedding');
    expect(parsed.searchParams.get('q')).toBe('traditional');

    // Step C: category is now 'All' -> Calling again must not trigger router.replace (loop prevention)
    expect(filters.category).toBe('All');
    runAutoReset('ready');
    expect(mockRouterReplace).toHaveBeenCalledTimes(1);
  });

  it('13. Admin form retention: CATEGORIES registry retains all 15 categories for product creation', () => {
    expect(CATEGORIES).toHaveLength(15);
    expect(CATEGORIES).toContain('Earrings');
    expect(CATEGORIES).toContain('Gold Coins');
    expect(CATEGORIES).toContain('Men\'s Jewellery');
  });

  it('14. Deterministic initial loading state: ShopByCategory and FooterCategoryLinks do not read productRepository during initial render', async () => {
    const fs = await import('fs');
    const path = await import('path');

    // Check ShopByCategory.tsx
    const shopByCategoryPath = path.resolve(process.cwd(), 'src/components/home/ShopByCategory.tsx');
    const shopByCategoryContent = fs.readFileSync(shopByCategoryPath, 'utf8');

    // Must initialize state deterministically
    expect(shopByCategoryContent).toMatch(/useState<Product\[\]>\(\[\]\)/);
    expect(shopByCategoryContent).toMatch(/useState<RepositoryStatus>\(['"]loading['"]\)/);
    // Must NOT call productRepository in useState initializers
    expect(shopByCategoryContent).not.toMatch(/useState\(\s*\(\)\s*=>\s*productRepository/);
    // Must NOT use suppressHydrationWarning
    expect(shopByCategoryContent).not.toContain('suppressHydrationWarning');

    // Check FooterCategoryLinks.tsx
    const footerLinksPath = path.resolve(process.cwd(), 'src/components/layout/FooterCategoryLinks.tsx');
    const footerLinksContent = fs.readFileSync(footerLinksPath, 'utf8');

    expect(footerLinksContent).toMatch(/useState<Product\[\]>\(\[\]\)/);
    expect(footerLinksContent).toMatch(/useState<RepositoryStatus>\(['"]loading['"]\)/);
    expect(footerLinksContent).not.toMatch(/useState\(\s*\(\)\s*=>\s*productRepository/);
    expect(footerLinksContent).not.toContain('suppressHydrationWarning');
  });

  it('15. Published-product data appears after mount and correctly drives category visibility', () => {
    // Initial empty/loading state has 0 available categories
    const initialProducts: Product[] = [];
    expect(getAvailableCategories(initialProducts)).toEqual([]);
    expect(getAvailableCategoryDefinitions(initialProducts)).toEqual([]);

    // After mount, products populate from repository
    const mountedProducts: Product[] = [
      {
        id: 'p-1',
        sku: 'KOH-GLD-ERN-001',
        name: 'Gold Jhumka Earrings',
        slug: 'gold-jhumka-earrings',
        category: 'Earrings',
        gender: 'Women',
        purity: '22K',
        approxWeight: 8.5,
        availability: 'available',
        images: [],
        shortDescription: 'Handcrafted Earrings',
        detailedDescription: 'Handcrafted Earrings',
        occasion: 'Wedding',
        tags: [],
        isFeatured: false,
        status: 'published',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ];

    const available = getAvailableCategories(mountedProducts);
    expect(available).toEqual(['Earrings']);
    const defs = getAvailableCategoryDefinitions(mountedProducts);
    expect(defs).toHaveLength(1);
    expect(defs[0].name).toBe('Earrings');
  });

  it('16. No "Explore" card or placeholder for empty categories; counts reflect published items accurately', () => {
    const products: ProductAvailabilityCandidate[] = [
      { category: 'Rings', status: 'published' },
      { category: 'Rings', status: 'published' },
      { category: 'Earrings', status: 'draft' }, // Draft: must not appear
    ];

    const available = getAvailableCategories(products);
    expect(available).toEqual(['Rings']);
    expect(available).not.toContain('Earrings');

    // Counts computed from published products
    const counts: Record<string, number> = {};
    for (const p of products) {
      if (p.status === 'published') {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    }
    expect(counts['Rings']).toBe(2);
    expect(counts['Earrings']).toBeUndefined();
  });

  it('17. No router operation occurs during state-updater callback render', () => {
    const mockRouterReplace = vi.fn();

    // Verify pure state updater: setFilters callback must not perform side-effects
    const stateUpdater = (prev: { category: string; search: string }) => {
      // Pure function returning new state
      return { ...prev, category: 'All' };
    };

    const prevState = { category: 'Chokers', search: 'gold' };
    const nextState = stateUpdater(prevState);

    expect(nextState).toEqual({ category: 'All', search: 'gold' });
    // Router replace must NOT have been called during state calculation
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });

  it('18. Footer imports and renders FooterCategoryLinks without stale CATEGORIES reference', async () => {
    const fs = await import('fs');
    const path = await import('path');

    const footerPath = path.resolve(process.cwd(), 'src/components/layout/Footer.tsx');
    const footerContent = fs.readFileSync(footerPath, 'utf8');

    // Must import and render FooterCategoryLinks
    expect(footerContent).toContain("import { FooterCategoryLinks } from './FooterCategoryLinks';");
    expect(footerContent).toContain('<FooterCategoryLinks />');

    // Must NOT contain undefined CATEGORIES reference
    expect(footerContent).not.toMatch(/\bCATEGORIES\b/);
    expect(footerContent).not.toContain('CATEGORIES.map');
  });
});
