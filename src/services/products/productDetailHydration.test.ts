import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Product } from '../productTypes';
import {
  resolveProductDetailState,
  ProductDetailResolutionState,
} from './productDetailResolver';

function createMockProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'prod-test-necklace',
    sku: 'KOH-GLD-NCK-test',
    name: 'Royal Heritage Choker',
    slug: 'royal-heritage-choker',
    category: 'Necklaces/Sets',
    gender: 'Women',
    purity: '22K',
    approxWeight: 28.5,
    availability: 'available',
    occasion: 'Wedding',
    tags: ['Bridal', 'Choker', '22K Gold'],
    shortDescription: 'Exquisite 22K bridal choker.',
    detailedDescription: 'Handcrafted gold choker with intricate detailing.',
    isFeatured: true,
    status: 'published',
    images: [],
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
    ...overrides,
  };
}

describe('Product Detail Resolution & Hydration Lifecycle', () => {
  const publishedProduct = createMockProduct({
    slug: 'royal-heritage-choker',
    status: 'published',
  });

  describe('1. Pure State Resolver Contract', () => {
    it('1: initial/repository loading state returns { status: "loading" }', () => {
      const state = resolveProductDetailState('loading', null, null);
      expect(state).toEqual({ status: 'loading' });
    });

    it('2: repository loading + no cached product returns loading, NOT unavailable', () => {
      const state = resolveProductDetailState('loading', null, null);
      expect(state.status).toBe('loading');
      expect(state.status).not.toBe('ready_missing');
    });

    it('3: repository loading + stale/null lookup remains strictly loading', () => {
      const state = resolveProductDetailState('loading', null, null);
      expect(state).toEqual({ status: 'loading' });
    });

    it('4: repository ready + valid published product returns ready_with_product', () => {
      const state = resolveProductDetailState('ready', publishedProduct, null);
      expect(state).toEqual({
        status: 'ready_with_product',
        product: publishedProduct,
      });
    });

    it('5: repository ready + unknown slug returns ready_missing (unavailable)', () => {
      const state = resolveProductDetailState('ready', null, null);
      expect(state).toEqual({ status: 'ready_missing' });
    });

    it('6: repository ready + archived product absent from published set returns ready_missing', () => {
      // Archived products are excluded from published set, returning null
      const state = resolveProductDetailState('ready', null, null);
      expect(state).toEqual({ status: 'ready_missing' });
    });

    it('7: repository ready + draft product absent from published set returns ready_missing', () => {
      // Draft products are excluded from published set, returning null
      const state = resolveProductDetailState('ready', null, null);
      expect(state).toEqual({ status: 'ready_missing' });
    });

    it('8: loading -> ready/product transition resolves correctly', () => {
      let state = resolveProductDetailState('loading', null, null);
      expect(state.status).toBe('loading');

      // Transition when Firestore snapshot arrives with published product
      state = resolveProductDetailState('ready', publishedProduct, null);
      expect(state.status).toBe('ready_with_product');
      if (state.status === 'ready_with_product') {
        expect(state.product.name).toBe('Royal Heritage Choker');
      }
    });

    it('9: loading -> ready/missing transition resolves correctly without intermediate false states', () => {
      let state = resolveProductDetailState('loading', null, null);
      expect(state.status).toBe('loading');

      // Transition when Firestore snapshot arrives and slug genuinely does not exist
      state = resolveProductDetailState('ready', null, null);
      expect(state.status).toBe('ready_missing');
    });

    it('10: loading -> error transition preserves error detail rather than claiming product is missing', () => {
      let state = resolveProductDetailState('loading', null, null);
      expect(state.status).toBe('loading');

      const firestoreError = new Error('Quota exceeded or network offline');
      state = resolveProductDetailState('error', null, firestoreError);
      expect(state.status).toBe('error');
      if (state.status === 'error') {
        expect(state.message).toBe('Quota exceeded or network offline');
      }
    });

    it('13: no false unavailable state occurs before repository status reaches ready', () => {
      const statesBeforeReady: ProductDetailResolutionState[] = [
        resolveProductDetailState('loading', null, null),
        resolveProductDetailState('loading', null, new Error('transient')),
      ];

      for (const st of statesBeforeReady) {
        expect(st.status).toBe('loading');
        expect(st.status).not.toBe('ready_missing');
      }
    });
  });

  describe('2. Component Lifecycle & Event Synchronization Simulator', () => {
    let listeners: Record<string, (() => void)[]> = {};

    beforeEach(() => {
      listeners = {};
    });

    function addMockListener(event: string, cb: () => void) {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(cb);
    }

    function removeMockListener(event: string, cb: () => void) {
      if (!listeners[event]) return;
      listeners[event] = listeners[event].filter((fn) => fn !== cb);
    }

    function emitMockEvent(event: string) {
      (listeners[event] || []).forEach((cb) => cb());
    }

    it('11: repository update event can resolve a product that was not initially in cache', () => {
      let repoStatus: 'loading' | 'ready' | 'error' = 'loading';
      let publishedMap: Record<string, Product> = {};

      let currentState: ProductDetailResolutionState = { status: 'loading' };

      const sync = (slug: string) => {
        const found = repoStatus === 'ready' ? publishedMap[slug] || null : null;
        currentState = resolveProductDetailState(repoStatus, found, null);
      };

      const handleUpdate = () => sync('royal-heritage-choker');
      addMockListener('koh_products_updated', handleUpdate);

      // Mount: Firestore still loading
      sync('royal-heritage-choker');
      expect(currentState.status).toBe('loading');

      // Cold load snapshot arrives in background
      repoStatus = 'ready';
      publishedMap['royal-heritage-choker'] = publishedProduct;
      emitMockEvent('koh_products_updated');

      const resolvedState = currentState as ProductDetailResolutionState;
      expect(resolvedState.status).toBe('ready_with_product');
      if (resolvedState.status === 'ready_with_product') {
        expect(resolvedState.product.slug).toBe('royal-heritage-choker');
      }

      removeMockListener('koh_products_updated', handleUpdate);
    });

    it('12: repository update can make a previously published product unavailable (e.g. archived in admin)', () => {
      let repoStatus: 'loading' | 'ready' | 'error' = 'ready';
      let publishedMap: Record<string, Product> = {
        'royal-heritage-choker': publishedProduct,
      };

      let currentState: ProductDetailResolutionState = resolveProductDetailState(
        repoStatus,
        publishedMap['royal-heritage-choker'] || null,
        null
      );
      expect(currentState.status).toBe('ready_with_product');

      const sync = (slug: string) => {
        const found = repoStatus === 'ready' ? publishedMap[slug] || null : null;
        currentState = resolveProductDetailState(repoStatus, found, null);
      };

      const handleUpdate = () => sync('royal-heritage-choker');
      addMockListener('koh_products_updated', handleUpdate);

      // Operator archives the product in admin dashboard
      delete publishedMap['royal-heritage-choker'];
      emitMockEvent('koh_products_updated');

      const resolvedState = currentState as ProductDetailResolutionState;
      expect(resolvedState.status).toBe('ready_missing');

      removeMockListener('koh_products_updated', handleUpdate);
    });

    it('14: event listeners are cleaned up properly on unmount', () => {
      const handleUpdate = vi.fn();
      addMockListener('koh_products_updated', handleUpdate);
      addMockListener('storage', handleUpdate);

      expect(listeners['koh_products_updated'].length).toBe(1);
      expect(listeners['storage'].length).toBe(1);

      // Unmount cleanup
      removeMockListener('koh_products_updated', handleUpdate);
      removeMockListener('storage', handleUpdate);

      expect(listeners['koh_products_updated'].length).toBe(0);
      expect(listeners['storage'].length).toBe(0);

      emitMockEvent('koh_products_updated');
      expect(handleUpdate).not.toHaveBeenCalled();
    });

    it('15: slug changes re-resolve correctly when navigating between product pages', () => {
      const repoStatus = 'ready';
      const publishedMap: Record<string, Product> = {
        'royal-heritage-choker': publishedProduct,
        'classic-gold-ring': createMockProduct({
          id: 'prod-ring',
          slug: 'classic-gold-ring',
          name: 'Classic Gold Ring',
        }),
      };

      let currentSlug = 'royal-heritage-choker';
      let state = resolveProductDetailState(repoStatus, publishedMap[currentSlug] || null, null);
      expect(state.status).toBe('ready_with_product');
      if (state.status === 'ready_with_product') {
        expect(state.product.slug).toBe('royal-heritage-choker');
      }

      // User clicks related item / navigates to different product
      currentSlug = 'classic-gold-ring';
      state = resolveProductDetailState(repoStatus, publishedMap[currentSlug] || null, null);
      expect(state.status).toBe('ready_with_product');
      if (state.status === 'ready_with_product') {
        expect(state.product.slug).toBe('classic-gold-ring');
      }

      // User navigates to deleted / nonexistent slug
      currentSlug = 'archived-bangles';
      state = resolveProductDetailState(repoStatus, publishedMap[currentSlug] || null, null);
      expect(state.status).toBe('ready_missing');
    });
  });
});
