import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Product } from '../productTypes';
import { productRepository } from './productRepository';
import { RepositoryStatus } from '../types';

let mockIsFirebaseConfigured = false;
let mockDb: unknown = null;

vi.mock('../../lib/firebase/client', () => {
  return {
    get isFirebaseConfigured() {
      return mockIsFirebaseConfigured;
    },
    get db() {
      return mockDb;
    },
    auth: null,
    storage: null,
  };
});

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

type EventListener = (e: Event) => void;
const eventListeners: Record<string, EventListener[]> = {};

const mockWindow = {
  localStorage: mockLocalStorage,
  dispatchEvent: vi.fn((event: Event) => {
    const list = eventListeners[event.type] || [];
    list.forEach((cb) => cb(event));
    return true;
  }),
  addEventListener: vi.fn((type: string, listener: EventListener) => {
    if (!eventListeners[type]) eventListeners[type] = [];
    eventListeners[type].push(listener);
  }),
  removeEventListener: vi.fn((type: string, listener: EventListener) => {
    if (!eventListeners[type]) return;
    eventListeners[type] = eventListeners[type].filter((cb) => cb !== listener);
  }),
};

if (typeof globalThis.window === 'undefined') {
  (globalThis as unknown as { window: typeof mockWindow }).window = mockWindow;
}
if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as unknown as { localStorage: typeof mockLocalStorage }).localStorage = mockLocalStorage;
}

function makeProduct(id: string, status: 'published' | 'draft' | 'archived', name = `Jewellery ${id}`): Product {
  return {
    id,
    sku: `KOH-GLD-${id}`,
    name,
    slug: `jewellery-${id}`,
    category: 'Rings',
    gender: 'Women',
    purity: '22K',
    approxWeight: 5.5,
    availability: 'available',
    images: [],
    shortDescription: 'Gold jewellery piece',
    detailedDescription: 'Handcrafted gold jewellery Gorakhpur',
    occasion: 'Wedding',
    tags: ['Gold', '22K'],
    isFeatured: false,
    status,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

/**
 * Models the exact state lifecycle in src/app/catalogue/page.tsx:
 * 1. Initial render (SSR & Client first render):
 *    products: [], status: 'loading'
 * 2. On mount (useEffect):
 *    syncCatalogue() pulls from productRepository
 *    subscribes to 'koh_products_updated' & 'storage'
 */
class CatalogueStateLifecycle {
  public products: Product[];
  public status: RepositoryStatus;
  private isMounted = false;
  private cleanupSubscription: (() => void) | null = null;

  constructor() {
    // Exact initial state in src/app/catalogue/page.tsx
    this.products = [];
    this.status = 'loading';
  }

  public mount() {
    this.isMounted = true;
    const syncCatalogue = () => {
      this.products = productRepository.getPublishedProducts();
      this.status = productRepository.getPublishedStatus();
    };

    syncCatalogue();

    window.addEventListener('koh_products_updated', syncCatalogue);
    window.addEventListener('storage', syncCatalogue);

    this.cleanupSubscription = () => {
      window.removeEventListener('koh_products_updated', syncCatalogue);
      window.removeEventListener('storage', syncCatalogue);
    };
  }

  public unmount() {
    if (this.cleanupSubscription) {
      this.cleanupSubscription();
      this.cleanupSubscription = null;
    }
    this.isMounted = false;
  }

  public getRenderDecision(): 'loading' | 'error' | 'empty' | 'grid' {
    if (this.status === 'loading') return 'loading';
    if (this.status === 'error') return 'error';
    if (this.products.length === 0) return 'empty';
    return 'grid';
  }
}

describe('Catalogue Hydration & Lifecycle Regression Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    store = {};
    for (const k in eventListeners) {
      delete eventListeners[k];
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('1. Deterministic initial catalogue loading state (matches SSR and client first render)', () => {
    // Both server render and browser first render before effects run must initialize identically
    const lifecycle = new CatalogueStateLifecycle();

    expect(lifecycle.status).toBe('loading');
    expect(lifecycle.products).toEqual([]);
    expect(lifecycle.getRenderDecision()).toBe('loading');
  });

  it('2. Successful published-product load transitions from loading to ready grid', () => {
    const publishedList = [
      makeProduct('p-1', 'published', 'Gold Necklace'),
      makeProduct('p-2', 'published', 'Bridal Choker'),
    ];

    vi.spyOn(productRepository, 'getPublishedProducts').mockReturnValue(publishedList);
    vi.spyOn(productRepository, 'getPublishedStatus').mockReturnValue('ready');

    const lifecycle = new CatalogueStateLifecycle();
    // Before mount: loading
    expect(lifecycle.getRenderDecision()).toBe('loading');

    // Mount runs useEffect sync
    lifecycle.mount();

    expect(lifecycle.status).toBe('ready');
    expect(lifecycle.products).toHaveLength(2);
    expect(lifecycle.products[0].name).toBe('Gold Necklace');
    expect(lifecycle.getRenderDecision()).toBe('grid');

    lifecycle.unmount();
  });

  it('3. Firestore/repository error state surfaces error card, not empty or loading', () => {
    vi.spyOn(productRepository, 'getPublishedProducts').mockReturnValue([]);
    vi.spyOn(productRepository, 'getPublishedStatus').mockReturnValue('error');

    const lifecycle = new CatalogueStateLifecycle();
    lifecycle.mount();

    expect(lifecycle.status).toBe('error');
    expect(lifecycle.products).toEqual([]);
    expect(lifecycle.getRenderDecision()).toBe('error');

    lifecycle.unmount();
  });

  it('4. Zero-product empty state is distinct from loading and error', () => {
    vi.spyOn(productRepository, 'getPublishedProducts').mockReturnValue([]);
    vi.spyOn(productRepository, 'getPublishedStatus').mockReturnValue('ready');

    const lifecycle = new CatalogueStateLifecycle();
    lifecycle.mount();

    expect(lifecycle.status).toBe('ready');
    expect(lifecycle.products).toEqual([]);
    expect(lifecycle.getRenderDecision()).toBe('empty');

    lifecycle.unmount();
  });

  it('5. Archived and draft products are strictly excluded from published catalogue', () => {
    const allProducts = [
      makeProduct('prod-pub-1', 'published', 'Published Ring'),
      makeProduct('prod-draft-1', 'draft', 'Draft Bangle'),
      makeProduct('prod-arch-1', 'archived', 'Archived Necklace'),
      makeProduct('prod-pub-2', 'published', 'Published Mangalsutra'),
    ];

    // Verify local-mode filtering behavior in productRepository
    store['koh_admin_custom_products'] = JSON.stringify(allProducts);

    const published = productRepository.getPublishedProducts();
    const publishedIds = published.map((p) => p.id);

    expect(publishedIds).toContain('prod-pub-1');
    expect(publishedIds).toContain('prod-pub-2');
    expect(publishedIds).not.toContain('prod-draft-1');
    expect(publishedIds).not.toContain('prod-arch-1');
    expect(published.every((p) => p.status === 'published')).toBe(true);
  });

  it('6. koh_products_updated event updates catalogue after initial mount', () => {
    let currentProducts = [makeProduct('p-1', 'published', 'Original Product')];
    vi.spyOn(productRepository, 'getPublishedProducts').mockImplementation(() => currentProducts);
    vi.spyOn(productRepository, 'getPublishedStatus').mockReturnValue('ready');

    const lifecycle = new CatalogueStateLifecycle();
    lifecycle.mount();

    expect(lifecycle.products).toHaveLength(1);
    expect(lifecycle.products[0].name).toBe('Original Product');

    // Simulate product update from admin or background sync
    currentProducts = [
      makeProduct('p-1', 'published', 'Original Product'),
      makeProduct('p-2', 'published', 'New Royal Bangle'),
    ];

    // Dispatch koh_products_updated event
    window.dispatchEvent(new Event('koh_products_updated'));

    expect(lifecycle.products).toHaveLength(2);
    expect(lifecycle.products[1].name).toBe('New Royal Bangle');

    lifecycle.unmount();
  });
});
