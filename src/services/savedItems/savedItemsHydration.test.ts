import { describe, expect, it } from 'vitest';
import { Product } from '../productTypes';
import { deriveSavedCollection, resolveSavedProducts } from './savedItemsHydration';

function product(id: string, slug = `slug-${id}`): Product {
  return {
    id,
    slug,
    sku: `SKU-${id}`,
    name: `Product ${id}`,
    category: 'Rings',
    gender: 'Women',
    purity: '22K',
    approxWeight: 1,
    availability: 'available',
    images: [],
    shortDescription: '',
    detailedDescription: '',
    occasion: '',
    tags: [],
    isFeatured: false,
    status: 'published',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

const baseInput = {
  authLoading: false,
  userId: 'firebase-uid',
  loadedUserId: 'firebase-uid',
  savedIds: ['product-1'],
  savedStatus: 'ready' as const,
  savedError: null,
  products: [product('product-1')],
  productsStatus: 'ready' as const,
  productsError: null,
};

describe('saved-items hydration', () => {
  it('waits for products when auth and saved items restore first', () => {
    const beforeProducts = deriveSavedCollection({
      ...baseInput,
      products: [],
      productsStatus: 'loading',
    });
    expect(beforeProducts.status).toBe('loading');
    expect(beforeProducts.products).toEqual([]);

    const afterProducts = deriveSavedCollection(baseInput);
    expect(afterProducts.status).toBe('ready');
    expect(afterProducts.products.map((item) => item.id)).toEqual(['product-1']);
  });

  it('waits for auth and the UID-specific Firestore read when products load first', () => {
    const beforeAuth = deriveSavedCollection({
      ...baseInput,
      authLoading: true,
      userId: null,
      loadedUserId: null,
      savedIds: [],
      savedStatus: 'loading',
    });
    expect(beforeAuth.status).toBe('loading');

    const beforeSavedRead = deriveSavedCollection({
      ...baseInput,
      loadedUserId: null,
      savedIds: [],
      savedStatus: 'loading',
    });
    expect(beforeSavedRead.status).toBe('loading');
    expect(deriveSavedCollection(baseInput).products).toHaveLength(1);
  });

  it('recomputes after saved IDs arrive before the product catalogue', () => {
    const savedFirst = deriveSavedCollection({
      ...baseInput,
      savedIds: ['product-1', 'product-2'],
      products: [],
      productsStatus: 'loading',
    });
    expect(savedFirst.status).toBe('loading');

    const catalogueArrives = deriveSavedCollection({
      ...baseInput,
      savedIds: ['product-1', 'product-2'],
      products: [product('product-1'), product('product-2')],
    });
    expect(catalogueArrives.products.map((item) => item.id)).toEqual([
      'product-1',
      'product-2',
    ]);
  });

  it('hydrates a refreshed account with three saved items', () => {
    const result = deriveSavedCollection({
      ...baseInput,
      savedIds: ['product-1', 'product-2', 'product-3'],
      products: [product('product-3'), product('product-1'), product('product-2')],
    });
    expect(result.status).toBe('ready');
    expect(result.products.map((item) => item.id)).toEqual([
      'product-1',
      'product-2',
      'product-3',
    ]);
  });

  it('surfaces a Firestore read failure instead of treating it as an empty list', () => {
    const firestoreError = new Error('Missing or insufficient permissions.');
    const result = deriveSavedCollection({
      ...baseInput,
      savedIds: [],
      savedStatus: 'error',
      savedError: firestoreError,
    });
    expect(result.status).toBe('error');
    expect(result.error).toBe(firestoreError);
    expect(result.products).toEqual([]);
  });

  it('matches canonical product IDs, never slugs, and preserves unresolved references', () => {
    const catalogueProduct = product('firestore-product-id', 'display-product-slug');
    const result = deriveSavedCollection({
      ...baseInput,
      savedIds: ['display-product-slug', 'firestore-product-id'],
      products: [catalogueProduct],
    });
    expect(result.products).toEqual([catalogueProduct]);
    expect(result.missingProductIds).toEqual(['display-product-slug']);
  });

  it('deduplicates repeated saved IDs while preserving their saved order', () => {
    const result = resolveSavedProducts(
      ['product-2', 'product-1', 'product-2'],
      [product('product-1'), product('product-2')]
    );
    expect(result.products.map((item) => item.id)).toEqual(['product-2', 'product-1']);
    expect(result.missingProductIds).toEqual([]);
  });
});
