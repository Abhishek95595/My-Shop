import { describe, it, expect, beforeEach, vi } from 'vitest';
import { productRepository, normalizeProduct } from './productRepository';
import { Product } from '../productTypes';

let store: Record<string, string> = {};

const mockLocalStorage = {
  getItem: vi.fn((key: string) => store[key] || null),
  setItem: vi.fn((key: string, val: string) => {
    store[key] = String(val);
  }),
  removeItem: vi.fn((key: string) => {
    delete store[key];
  }),
  clear: vi.fn(() => {
    store = {};
  }),
};

const mockWindow = {
  localStorage: mockLocalStorage,
  dispatchEvent: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

if (typeof globalThis.window === 'undefined') {
  (globalThis as unknown as { window: typeof mockWindow }).window = mockWindow;
}
if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as unknown as { localStorage: typeof mockLocalStorage }).localStorage = mockLocalStorage;
}

describe('Product Form Validation & Occasion/Description Persistence', () => {
  beforeEach(() => {
    store = {};
    mockLocalStorage.clear();
  });

  describe('normalizeProduct helper', () => {
    it('normalizes missing or undefined descriptions to canonical empty strings ""', () => {
      const rawLegacy = {
        id: 'legacy-1',
        sku: 'KOH-GLD-RNG-099',
        name: 'Legacy Solitaire Ring',
        slug: 'legacy-solitaire-ring',
        category: 'Rings',
        gender: 'Women',
        purity: '22K',
        approxWeight: 5.5,
        availability: 'available',
        images: [],
        occasion: 'Wedding',
        status: 'published',
      } as unknown as Product;

      const normalized = normalizeProduct(rawLegacy);
      expect(normalized.shortDescription).toBe('');
      expect(typeof normalized.shortDescription).toBe('string');
      expect(normalized.detailedDescription).toBe('');
      expect(typeof normalized.detailedDescription).toBe('string');
    });

    it('preserves existing descriptions and empty string values', () => {
      const productWithEmptyDesc = {
        shortDescription: '',
        detailedDescription: '',
        occasion: 'Engagement',
      };
      const normalized = normalizeProduct(productWithEmptyDesc);
      expect(normalized.shortDescription).toBe('');
      expect(normalized.detailedDescription).toBe('');
      expect(normalized.occasion).toBe('Engagement');

      const productWithText = {
        shortDescription: 'Exquisite 22K gold bangle',
        detailedDescription: 'Handcrafted by master artisans with traditional filigree work.',
        occasion: 'Festive',
      };
      const normalizedText = normalizeProduct(productWithText);
      expect(normalizedText.shortDescription).toBe('Exquisite 22K gold bangle');
      expect(normalizedText.detailedDescription).toBe(
        'Handcrafted by master artisans with traditional filigree work.'
      );
      expect(normalizedText.occasion).toBe('Festive');
    });

    it('preserves custom occasions and normalizes missing legacy occasion to empty string ""', () => {
      const customOccasion = normalizeProduct({ occasion: 'Anniversary' });
      expect(customOccasion.occasion).toBe('Anniversary');

      const legacyOccasion = normalizeProduct({ occasion: 'Cocktail Gala' });
      expect(legacyOccasion.occasion).toBe('Cocktail Gala');

      const emptyOccasion = normalizeProduct({ occasion: '' });
      expect(emptyOccasion.occasion).toBe('');

      const undefinedOccasion = normalizeProduct({});
      expect(undefinedOccasion.occasion).toBe('');
    });
  });

  describe('validateForPublish', () => {
    const validBase: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
      sku: 'KOH-GLD-RNG-001',
      name: 'Royal Heritage Solitaire Ring',
      slug: 'royal-heritage-solitaire-ring',
      category: 'Rings',
      gender: 'Women',
      purity: '22K',
      approxWeight: 4.5,
      availability: 'available',
      shortDescription: '',
      detailedDescription: '',
      occasion: 'Wedding',
      tags: ['Bridal', 'Ring'],
      isFeatured: false,
      status: 'published',
      images: [
        {
          id: 'img-1',
          url: 'https://images.unsplash.com/photo-ring',
          altText: 'Royal Heritage Solitaire Ring front view',
          sortOrder: 0,
          isPrimary: true,
        },
      ],
    };

    it('passes validation when shortDescription and detailedDescription are empty strings', () => {
      const result = productRepository.validateForPublish({
        ...validBase,
        shortDescription: '',
        detailedDescription: '',
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('passes validation when custom occasion is selected', () => {
      const result = productRepository.validateForPublish({
        ...validBase,
        occasion: 'Golden Jubilee Gala',
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('strictly requires occasion to publish (fails if missing, empty, or whitespace)', () => {
      const missingOccasion = productRepository.validateForPublish({
        ...validBase,
        occasion: '',
      });
      expect(missingOccasion.isValid).toBe(false);
      expect(missingOccasion.errors).toContain('Occasion is required.');

      const whitespaceOccasion = productRepository.validateForPublish({
        ...validBase,
        occasion: '   ',
      });
      expect(whitespaceOccasion.isValid).toBe(false);
      expect(whitespaceOccasion.errors).toContain('Occasion is required.');
    });

    it('still requires essential publish attributes (name, slug, weight, images)', () => {
      const invalid = productRepository.validateForPublish({
        ...validBase,
        name: '',
        slug: '',
        approxWeight: 0,
        images: [],
      });

      expect(invalid.isValid).toBe(false);
      expect(invalid.errors.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Product Creation & Update Persistence', () => {
    it('creates and persists a product with empty descriptions as canonical strings', async () => {
      const created = await productRepository.createProduct({
        sku: 'KOH-GLD-RNG-991',
        name: 'Minimalist Band',
        slug: 'minimalist-band',
        category: 'Rings',
        gender: 'Women',
        purity: '22K',
        approxWeight: 3.2,
        availability: 'available',
        shortDescription: '',
        detailedDescription: '',
        occasion: 'Daily Wear',
        tags: ['Daily'],
        isFeatured: false,
        status: 'draft',
        images: [],
      });

      expect(created.id).toBeDefined();
      expect(created.shortDescription).toBe('');
      expect(typeof created.shortDescription).toBe('string');
      expect(created.detailedDescription).toBe('');
      expect(typeof created.detailedDescription).toBe('string');
      expect(created.occasion).toBe('Daily Wear');

      // Verify retrieval from repository
      const retrieved = productRepository.getProductById(created.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.shortDescription).toBe('');
      expect(retrieved?.detailedDescription).toBe('');
      expect(retrieved?.occasion).toBe('Daily Wear');
    });

    it('creates and updates a product with a custom occasion', async () => {
      const created = await productRepository.createProduct({
        sku: 'KOH-GLD-EAR-992',
        name: 'Chandelier Drop Earrings',
        slug: 'chandelier-drop-earrings',
        category: 'Earrings',
        gender: 'Women',
        purity: '22K',
        approxWeight: 8.5,
        availability: 'available',
        shortDescription: '',
        detailedDescription: '',
        occasion: 'Sangeet Night', // Custom occasion
        tags: ['Earrings'],
        isFeatured: true,
        status: 'draft',
        images: [],
      });

      expect(created.occasion).toBe('Sangeet Night');

      // Update occasion to another custom value
      const updated = await productRepository.updateProduct(created.id, {
        occasion: 'Mehendi Ceremony',
      });

      expect(updated?.occasion).toBe('Mehendi Ceremony');

      const reFetched = productRepository.getProductById(created.id);
      expect(reFetched?.occasion).toBe('Mehendi Ceremony');
    });

    it('maintains canonical empty strings when updating with undefined or missing description values', async () => {
      const created = await productRepository.createProduct({
        sku: 'KOH-GLD-CHN-993',
        name: 'Sleek Gold Chain',
        slug: 'sleek-gold-chain',
        category: 'Chains',
        gender: 'Men',
        purity: '22K',
        approxWeight: 12.0,
        availability: 'available',
        shortDescription: 'Initial description',
        detailedDescription: 'Initial detailed description',
        occasion: 'Festive',
        tags: [],
        isFeatured: false,
        status: 'draft',
        images: [],
      });

      // Clear descriptions
      const updated = await productRepository.updateProduct(created.id, {
        shortDescription: '',
        detailedDescription: '',
      });

      expect(updated?.shortDescription).toBe('');
      expect(updated?.detailedDescription).toBe('');

      const inRepo = productRepository.getProductById(created.id);
      expect(inRepo?.shortDescription).toBe('');
      expect(inRepo?.detailedDescription).toBe('');
    });
  });
});
