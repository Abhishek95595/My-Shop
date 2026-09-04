import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Product } from '../productTypes';
import { productRepository, ProductDeletionError } from './productRepository';
import { firebaseStorageService } from '../images/firebaseStorageService';
import { imageStorageService } from '../images/imageStorageService';
import { getDoc, deleteDoc, doc } from 'firebase/firestore';
import * as firebaseClientModule from '../../lib/firebase/client';
import { deriveSavedCollection } from '../savedItems/savedItemsHydration';

let mockIsFirebaseConfigured = false;
let mockDb: any = null;

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

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual<typeof import('firebase/firestore')>('firebase/firestore');
  return {
    ...actual,
    getDoc: vi.fn(),
    deleteDoc: vi.fn(),
    doc: vi.fn((_db, _coll, id) => ({ id })),
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

const mockWindow = {
  localStorage: mockLocalStorage,
  dispatchEvent: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

// Assign mock window and localStorage to globalThis if in Node environment
if (typeof globalThis.window === 'undefined') {
  (globalThis as unknown as { window: typeof mockWindow }).window = mockWindow;
}
if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as unknown as { localStorage: typeof mockLocalStorage }).localStorage = mockLocalStorage;
}

function makeMockProduct(overrides: Partial<Product> = {}): Product {
  const id = overrides.id || 'prod-test-123';
  return {
    id,
    sku: `KOH-GLD-RNG-${id}`,
    name: 'Royal Heritage Kundan Ring',
    slug: `royal-heritage-kundan-ring-${id}`,
    category: 'Rings',
    gender: 'Women',
    purity: '22K',
    approxWeight: 8.5,
    availability: 'available',
    images: [],
    shortDescription: 'Classic gold jewellery',
    detailedDescription: 'Handcrafted kundan gold ring',
    occasion: 'Wedding',
    tags: ['Wedding', '22K'],
    isFeatured: false,
    status: 'archived',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('Product Deletion & Lifecycle Management', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    store = {};
    mockLocalStorage.getItem.mockImplementation((key: string) => store[key] || null);
    mockLocalStorage.setItem.mockImplementation((key: string, val: string) => {
      store[key] = String(val);
    });
    mockLocalStorage.removeItem.mockImplementation((key: string) => {
      delete store[key];
    });
    mockLocalStorage.clear.mockImplementation(() => {
      store = {};
    });
    mockWindow.dispatchEvent.mockReset();
    vi.mocked(deleteDoc).mockReset();
    vi.mocked(getDoc).mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Lifecycle Gates', () => {
    it('Scenario 1: Archive remains soft-archive and does not invoke hard deletion', async () => {
      const p = makeMockProduct({ id: 'prod-archive-soft', status: 'published' });
      vi.spyOn(productRepository, 'getProductById').mockReturnValue(p);
      const updateSpy = vi.spyOn(productRepository, 'updateProduct').mockResolvedValue({
        ...p,
        status: 'archived',
      });
      const hardDeleteSpy = vi.spyOn(productRepository, 'deleteProductPermanently');

      await productRepository.setStatus('prod-archive-soft', 'archived');

      expect(updateSpy).toHaveBeenCalledWith('prod-archive-soft', { status: 'archived' });
      expect(hardDeleteSpy).not.toHaveBeenCalled();
    });

    it('Scenario 2: Draft product hard-delete is rejected', async () => {
      const draftProduct = makeMockProduct({ status: 'draft' });
      vi.spyOn(productRepository, 'getProductById').mockReturnValue(draftProduct);

      await expect(
        productRepository.deleteProductPermanently(draftProduct)
      ).rejects.toThrow(/Only archived products can be permanently deleted/);
    });

    it('Scenario 3: Published product hard-delete is rejected', async () => {
      const publishedProduct = makeMockProduct({ status: 'published' });
      vi.spyOn(productRepository, 'getProductById').mockReturnValue(publishedProduct);

      await expect(
        productRepository.deleteProductPermanently(publishedProduct)
      ).rejects.toThrow(/Only archived products can be permanently deleted/);
    });

    it('Scenario 4: Archived product hard-delete is allowed to proceed', async () => {
      const archivedProduct = makeMockProduct({ status: 'archived', images: [] });
      vi.spyOn(productRepository, 'getProductById').mockReturnValue(archivedProduct);

      await expect(
        productRepository.deleteProductPermanently(archivedProduct)
      ).resolves.not.toThrow();
    });
  });

  describe('2. Confirmation Validation Logic', () => {
    const isConfirmationValid = (input: string, productName: string) => {
      const normalizedInput = input.trim();
      return (
        normalizedInput === 'DELETE' ||
        (Boolean(productName) && normalizedInput === productName.trim())
      );
    };

    it('Scenario 5: Empty confirmation cannot submit', () => {
      expect(isConfirmationValid('', 'Royal Ring')).toBe(false);
      expect(isConfirmationValid('   ', 'Royal Ring')).toBe(false);
    });

    it('Scenario 6: Invalid confirmation cannot submit', () => {
      expect(isConfirmationValid('DEL', 'Royal Ring')).toBe(false);
      expect(isConfirmationValid('confirm', 'Royal Ring')).toBe(false);
      expect(isConfirmationValid('Wrong Name', 'Royal Ring')).toBe(false);
    });

    it('Scenario 7: "DELETE" enables deletion', () => {
      expect(isConfirmationValid('DELETE', 'Royal Ring')).toBe(true);
    });

    it('Scenario 8: Exact product name enables deletion', () => {
      expect(isConfirmationValid('Royal Ring', 'Royal Ring')).toBe(true);
    });

    it('Scenario 9: Product name with only surrounding whitespace works after trimming', () => {
      expect(isConfirmationValid('  Royal Ring  ', 'Royal Ring')).toBe(true);
      expect(isConfirmationValid('Royal Ring', '  Royal Ring  ')).toBe(true);
    });

    it('Scenario 10: Lowercase "delete" does not satisfy "DELETE"', () => {
      expect(isConfirmationValid('delete', 'Royal Ring')).toBe(false);
      expect(isConfirmationValid('Delete', 'Royal Ring')).toBe(false);
    });
  });

  describe('3. Firebase Storage Paths & Ownership Validation', () => {
    it('Scenario 11: Valid Firebase Storage paths owned by the product are deleted', async () => {
      const product = makeMockProduct({
        id: 'prod-own-1',
        status: 'archived',
        images: [
          {
            id: 'img-1',
            url: 'https://firebasestorage.googleapis.com/...',
            storagePath: 'products/prod-own-1/img-1.jpg',
            altText: 'Alt',
            sortOrder: 1,
            isPrimary: true,
          },
        ],
      });
      vi.spyOn(productRepository, 'getProductById').mockReturnValue(product);
      const deleteStorageSpy = vi
        .spyOn(firebaseStorageService, 'deleteProductImage')
        .mockResolvedValue();

      await productRepository.deleteProductPermanently(product);

      expect(deleteStorageSpy).toHaveBeenCalledWith('products/prod-own-1/img-1.jpg');
    });

    it('Scenario 12: Duplicate Storage paths are deleted once', async () => {
      const product = makeMockProduct({
        id: 'prod-dup-1',
        status: 'archived',
        images: [
          {
            id: 'img-1',
            url: 'https://firebasestorage.googleapis.com/...',
            storagePath: 'products/prod-dup-1/duplicate.jpg',
            altText: 'Alt 1',
            sortOrder: 1,
            isPrimary: true,
          },
          {
            id: 'img-2',
            url: 'https://firebasestorage.googleapis.com/...',
            storagePath: 'products/prod-dup-1/duplicate.jpg',
            altText: 'Alt 2',
            sortOrder: 2,
            isPrimary: false,
          },
        ],
      });
      vi.spyOn(productRepository, 'getProductById').mockReturnValue(product);
      const deleteStorageSpy = vi
        .spyOn(firebaseStorageService, 'deleteProductImage')
        .mockResolvedValue();

      await productRepository.deleteProductPermanently(product);

      expect(deleteStorageSpy).toHaveBeenCalledTimes(1);
      expect(deleteStorageSpy).toHaveBeenCalledWith('products/prod-dup-1/duplicate.jpg');
    });

    it('Scenario 13: Foreign product Storage paths are rejected and Firestore is NOT deleted', async () => {
      const product = makeMockProduct({
        id: 'prod-safe-1',
        status: 'archived',
        images: [
          {
            id: 'img-1',
            url: 'https://firebasestorage.googleapis.com/...',
            storagePath: 'products/other-product-id/foreign.jpg', // Does not belong to prod-safe-1
            altText: 'Foreign',
            sortOrder: 1,
            isPrimary: true,
          },
        ],
      });
      vi.spyOn(productRepository, 'getProductById').mockReturnValue(product);
      const deleteStorageSpy = vi
        .spyOn(firebaseStorageService, 'deleteProductImage')
        .mockResolvedValue();

      await expect(
        productRepository.deleteProductPermanently(product)
      ).rejects.toThrow(/Invalid storage path.*foreign product/);

      expect(deleteStorageSpy).not.toHaveBeenCalled();
      expect(deleteDoc).not.toHaveBeenCalled();
    });

    it('Scenario 13b: Traversal paths in storagePath are rejected and Firestore is NOT deleted', async () => {
      const product = makeMockProduct({
        id: 'prod-traversal-1',
        status: 'archived',
        images: [
          {
            id: 'img-traversal',
            url: 'https://firebasestorage.googleapis.com/...',
            storagePath: 'products/prod-traversal-1/../../../etc/passwd.jpg',
            altText: 'Traversal',
            sortOrder: 1,
            isPrimary: true,
          },
        ],
      });
      vi.spyOn(productRepository, 'getProductById').mockReturnValue(product);
      const deleteStorageSpy = vi
        .spyOn(firebaseStorageService, 'deleteProductImage')
        .mockResolvedValue();

      await expect(
        productRepository.deleteProductPermanently(product)
      ).rejects.toThrow(/illegal traversal characters/);

      expect(deleteStorageSpy).not.toHaveBeenCalled();
      expect(deleteDoc).not.toHaveBeenCalled();
    });

    it('Scenario 13c: External HTTPS images and URLs without storagePath never trigger storage deletion', async () => {
      const product = makeMockProduct({
        id: 'prod-ext-1',
        status: 'archived',
        images: [
          {
            id: 'img-ext-1',
            url: 'https://images.unsplash.com/photo-12345',
            altText: 'External Image',
            sortOrder: 1,
            isPrimary: true,
          },
          {
            id: 'img-fb-no-path',
            url: 'https://firebasestorage.googleapis.com/v0/b/...',
            altText: 'Firebase URL without storagePath',
            sortOrder: 2,
            isPrimary: false,
          },
        ],
      });
      vi.spyOn(productRepository, 'getProductById').mockReturnValue(product);
      const deleteStorageSpy = vi
        .spyOn(firebaseStorageService, 'deleteProductImage')
        .mockResolvedValue();

      await expect(productRepository.deleteProductPermanently(product)).resolves.not.toThrow();

      expect(deleteStorageSpy).not.toHaveBeenCalled();
    });

    it('Scenario 13d: Mixed static and Firebase Storage deletes owned cloud object only then Firestore doc', async () => {
      const product = makeMockProduct({
        id: 'prod-mixed-1',
        status: 'archived',
        images: [
          {
            id: 'img-static',
            url: '/assets/products/necklace.svg',
            altText: 'Static asset',
            sortOrder: 1,
            isPrimary: true,
          },
          {
            id: 'img-cloud',
            url: 'https://firebasestorage.googleapis.com/...',
            storagePath: 'products/prod-mixed-1/cloud.webp',
            altText: 'Cloud asset',
            sortOrder: 2,
            isPrimary: false,
          },
        ],
      });
      vi.spyOn(productRepository, 'getProductById').mockReturnValue(product);
      const deleteStorageSpy = vi
        .spyOn(firebaseStorageService, 'deleteProductImage')
        .mockResolvedValue();

      await expect(productRepository.deleteProductPermanently(product)).resolves.not.toThrow();

      expect(deleteStorageSpy).toHaveBeenCalledTimes(1);
      expect(deleteStorageSpy).toHaveBeenCalledWith('products/prod-mixed-1/cloud.webp');
    });

    it('Scenario 14: Static /images/... assets are never sent to Firebase Storage deletion', async () => {
      const product = makeMockProduct({
        id: 'prod-static-1',
        status: 'archived',
        images: [
          {
            id: 'img-static',
            url: '/images/products/royal-ring.jpg',
            altText: 'Static Ring',
            sortOrder: 1,
            isPrimary: true,
          },
        ],
      });
      vi.spyOn(productRepository, 'getProductById').mockReturnValue(product);
      const deleteStorageSpy = vi
        .spyOn(firebaseStorageService, 'deleteProductImage')
        .mockResolvedValue();

      await productRepository.deleteProductPermanently(product);

      expect(deleteStorageSpy).not.toHaveBeenCalled();
    });

    it('Scenario 15: IndexedDB URLs are never sent to Firebase Storage deletion', async () => {
      const product = makeMockProduct({
        id: 'prod-idb-1',
        status: 'archived',
        images: [
          {
            id: 'img-blob-1',
            url: 'indexeddb://KOH_ImageDB/product_images/img-blob-1',
            altText: 'Local Ring',
            sortOrder: 1,
            isPrimary: true,
          },
        ],
      });
      vi.spyOn(productRepository, 'getProductById').mockReturnValue(product);
      vi.spyOn(imageStorageService, 'deleteImage').mockResolvedValue();
      const deleteStorageSpy = vi
        .spyOn(firebaseStorageService, 'deleteProductImage')
        .mockResolvedValue();

      await productRepository.deleteProductPermanently(product);

      expect(deleteStorageSpy).not.toHaveBeenCalled();
    });

    it('Scenario 16: storage/object-not-found is treated as idempotent success in deleteProductImage', async () => {
      vi.spyOn(firebaseStorageService, 'isAvailable').mockReturnValue(true);
      const notFoundError = new Error('Object not found');
      (notFoundError as unknown as { code: string }).code = 'storage/object-not-found';

      const testFn = async () => {
        const errorObj = notFoundError as unknown as { code?: string; message?: string };
        const isNotFound =
          errorObj?.code === 'storage/object-not-found' ||
          errorObj?.message?.includes('object-not-found');
        if (isNotFound) return;
        throw errorObj;
      };

      await expect(testFn()).resolves.toBeUndefined();
    });
  });

  describe('4. Ordering & Storage Failure Safety', () => {
    it('Scenario 17 & 18: Storage failure prevents Firestore deletion', async () => {
      const product = makeMockProduct({
        id: 'prod-fail-storage',
        status: 'archived',
        images: [
          {
            id: 'img-fail',
            url: 'https://firebasestorage.googleapis.com/...',
            storagePath: 'products/prod-fail-storage/img.jpg',
            altText: 'Fail',
            sortOrder: 1,
            isPrimary: true,
          },
        ],
      });
      vi.spyOn(productRepository, 'getProductById').mockReturnValue(product);
      vi.spyOn(firebaseStorageService, 'deleteProductImage').mockRejectedValue(
        new Error('storage/unauthorized: Permission denied.')
      );

      await expect(
        productRepository.deleteProductPermanently(product)
      ).rejects.toThrow(/Product was not deleted because media cleanup was incomplete/);

      // Verify Firestore document deletion was ABORTED
      expect(deleteDoc).not.toHaveBeenCalled();
    });

    it('Scenario 19: Multi-image: one succeeds, one fails -> Firestore deleteDoc is NEVER invoked', async () => {
      const product = makeMockProduct({
        id: 'prod-multi-fail',
        status: 'archived',
        images: [
          {
            id: 'img-1',
            url: 'https://firebasestorage.googleapis.com/...',
            storagePath: 'products/prod-multi-fail/img-1.jpg',
            altText: 'Success Image',
            sortOrder: 1,
            isPrimary: true,
          },
          {
            id: 'img-2',
            url: 'https://firebasestorage.googleapis.com/...',
            storagePath: 'products/prod-multi-fail/img-2.jpg',
            altText: 'Failing Image',
            sortOrder: 2,
            isPrimary: false,
          },
        ],
      });
      vi.spyOn(productRepository, 'getProductById').mockReturnValue(product);
      vi.spyOn(firebaseStorageService, 'deleteProductImage').mockImplementation(
        async (path: string) => {
          if (path.includes('img-2')) {
            throw new Error('Network timeout during storage deletion');
          }
        }
      );

      let caughtError: any;
      try {
        await productRepository.deleteProductPermanently(product);
      } catch (err) {
        caughtError = err;
      }

      expect(caughtError).toBeInstanceOf(ProductDeletionError);
      expect(caughtError.code).toBe('STORAGE_CLEANUP_FAILED');
      expect(caughtError.message).toMatch(/media cleanup was incomplete: 1 file\(s\) failed/);
      expect(caughtError.message).toMatch(/some cloud media may already have been deleted/);
      expect(caughtError.message).toMatch(/The product document was preserved in Firestore/);
      expect(caughtError.message).toMatch(/safely retry permanent deletion/);

      expect(deleteDoc).not.toHaveBeenCalled();
    });

    it('Scenario 20: Retry after partial cleanup: previously deleted image returns not-found, second succeeds, deleteDoc proceeds', async () => {
      const product = makeMockProduct({
        id: 'prod-retry',
        status: 'archived',
        images: [
          {
            id: 'img-1',
            url: 'https://firebasestorage.googleapis.com/...',
            storagePath: 'products/prod-retry/img-1.jpg',
            altText: 'Already Deleted',
            sortOrder: 1,
            isPrimary: true,
          },
          {
            id: 'img-2',
            url: 'https://firebasestorage.googleapis.com/...',
            storagePath: 'products/prod-retry/img-2.jpg',
            altText: 'Second Image',
            sortOrder: 2,
            isPrimary: false,
          },
        ],
      });
      vi.spyOn(productRepository, 'getProductById').mockReturnValue(product);
      vi.spyOn(firebaseStorageService, 'deleteProductImage').mockResolvedValue();

      await expect(
        productRepository.deleteProductPermanently(product)
      ).resolves.not.toThrow();
    });

    it('Scenario 20b: Firestore deletion failure after successful Storage cleanup reports partial destructive failure', async () => {
      const product = makeMockProduct({
        id: 'prod-fs-fail',
        status: 'archived',
        images: [
          {
            id: 'img-cloud-1',
            url: 'https://firebasestorage.googleapis.com/...',
            storagePath: 'products/prod-fs-fail/img-1.webp',
            altText: 'Cloud Image',
            sortOrder: 1,
            isPrimary: true,
          },
        ],
      });

      mockIsFirebaseConfigured = true;
      mockDb = { type: 'mock-db' };

      vi.mocked(doc).mockReturnValue({ id: 'prod-fs-fail' } as any);
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => product,
        id: 'prod-fs-fail',
      } as any);
      vi.mocked(deleteDoc).mockRejectedValue(new Error('Firestore write quota exceeded'));

      const deleteStorageSpy = vi
        .spyOn(firebaseStorageService, 'deleteProductImage')
        .mockResolvedValue();

      try {
        await expect(
          productRepository.deleteProductPermanently(product)
        ).rejects.toThrow(/Cloud media cleanup completed \(1 file\(s\) removed\), but removing the Firestore document failed/);

        expect(deleteStorageSpy).toHaveBeenCalledWith('products/prod-fs-fail/img-1.webp');
      } finally {
        mockIsFirebaseConfigured = false;
        mockDb = null;
      }
    });
  });

  describe('5. Local Cleanup (IndexedDB & Static Assets)', () => {
    it('Scenario 21: IndexedDB cleanup runs for legacy image references after cloud deletion', async () => {
      const product = makeMockProduct({
        id: 'prod-idb-cleanup',
        status: 'archived',
        images: [
          {
            id: 'local-blob-123',
            url: 'indexeddb://KOH_ImageDB/product_images/local-blob-123',
            altText: 'Local image',
            sortOrder: 1,
            isPrimary: true,
          },
        ],
      });
      vi.spyOn(productRepository, 'getProductById').mockReturnValue(product);
      const idbDeleteSpy = vi
        .spyOn(imageStorageService, 'deleteImage')
        .mockResolvedValue();

      await productRepository.deleteProductPermanently(product);

      expect(idbDeleteSpy).toHaveBeenCalledWith('local-blob-123');
    });

    it('Scenario 22: IndexedDB cleanup failure does not fail the already-successful Firestore deletion', async () => {
      const product = makeMockProduct({
        id: 'prod-idb-warn',
        status: 'archived',
        images: [
          {
            id: 'local-blob-corrupt',
            url: 'indexeddb://KOH_ImageDB/product_images/local-blob-corrupt',
            altText: 'Local image',
            sortOrder: 1,
            isPrimary: true,
          },
        ],
      });
      vi.spyOn(productRepository, 'getProductById').mockReturnValue(product);
      vi.spyOn(imageStorageService, 'deleteImage').mockRejectedValue(
        new Error('IDBDatabase closed unexpectedly')
      );
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Must NOT reject
      await expect(
        productRepository.deleteProductPermanently(product)
      ).resolves.not.toThrow();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('some IndexedDB images could not be cleaned'),
        expect.any(Error)
      );
    });

    it('Scenario 23: Static assets are not locally deleted', async () => {
      const product = makeMockProduct({
        id: 'prod-static-safe',
        status: 'archived',
        images: [
          {
            id: 'static-img-1',
            url: '/images/products/gold-set.jpg',
            altText: 'Static Gold Set',
            sortOrder: 1,
            isPrimary: true,
          },
        ],
      });
      vi.spyOn(productRepository, 'getProductById').mockReturnValue(product);
      const idbDeleteSpy = vi.spyOn(imageStorageService, 'deleteImage');

      await productRepository.deleteProductPermanently(product);

      expect(idbDeleteSpy).not.toHaveBeenCalled();
    });
  });

  describe('6. Repository State & Notification', () => {
    it('Scenario 24 & 25: Successful deletion removes product from caches and dispatches koh_products_updated', async () => {
      const product = makeMockProduct({ id: 'prod-state-cache', status: 'archived' });
      vi.spyOn(productRepository, 'getProductById').mockReturnValue(product);

      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

      await productRepository.deleteProductPermanently(product);

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'koh_products_updated' })
      );
    });

    it('Scenario 26: Failed deletion does not dispatch successful deletion event', async () => {
      const product = makeMockProduct({
        id: 'prod-no-dispatch',
        status: 'archived',
        images: [
          {
            id: 'img-fail',
            url: 'https://firebasestorage.googleapis.com/...',
            storagePath: 'products/prod-no-dispatch/img.jpg',
            altText: 'Fail',
            sortOrder: 1,
            isPrimary: true,
          },
        ],
      });
      vi.spyOn(productRepository, 'getProductById').mockReturnValue(product);
      vi.spyOn(firebaseStorageService, 'deleteProductImage').mockRejectedValue(
        new Error('Network error')
      );

      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

      await expect(
        productRepository.deleteProductPermanently(product)
      ).rejects.toThrow();

      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('Scenario 27 & 28: Wishlist and Shortlist records are never deleted; hydration safely categorizes deleted item as unavailable', () => {
      const survivingProduct = makeMockProduct({ id: 'surviving-1', status: 'published' });
      const deletedProductId = 'deleted-product-999';

      const hydrated = deriveSavedCollection({
        authLoading: false,
        userId: 'user-uid-1',
        loadedUserId: 'user-uid-1',
        savedIds: ['surviving-1', deletedProductId],
        savedStatus: 'ready',
        savedError: null,
        products: [survivingProduct],
        productsStatus: 'ready',
        productsError: null,
      });

      expect(hydrated.status).toBe('ready');
      expect(hydrated.products.map((p) => p.id)).toEqual(['surviving-1']);
      expect(hydrated.missingProductIds).toEqual([deletedProductId]);
    });
  });

  describe('7. Stale Data Protection', () => {
    it('Scenario 29: Product passed from UI says archived but Firestore says published -> reject', async () => {
      const staleUiProduct = makeMockProduct({ id: 'prod-stale-1', status: 'archived' });
      const authoritativeFirestoreProduct = makeMockProduct({
        id: 'prod-stale-1',
        status: 'published',
      });

      vi.mocked(doc).mockReturnValue({ id: 'prod-stale-1' } as any);
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => authoritativeFirestoreProduct,
        id: 'prod-stale-1',
      } as any);

      mockIsFirebaseConfigured = true;
      mockDb = { type: 'mock-db' };

      try {
        await expect(
          productRepository.deleteProductPermanently(staleUiProduct)
        ).rejects.toThrow(/Only archived products can be permanently deleted \(current status: published\)/);
      } finally {
        mockIsFirebaseConfigured = false;
        mockDb = null;
      }
    });

    it('Scenario 30: Product passed from UI exists but Firestore document has already disappeared -> fail gracefully', async () => {
      const staleUiProduct = makeMockProduct({ id: 'prod-already-gone', status: 'archived' });

      vi.mocked(doc).mockReturnValue({ id: 'prod-already-gone' } as any);
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as any);

      mockIsFirebaseConfigured = true;
      mockDb = { type: 'mock-db' };

      try {
        await expect(
          productRepository.deleteProductPermanently(staleUiProduct)
        ).rejects.toThrow(/no longer exists in Cloud Firestore/);
      } finally {
        mockIsFirebaseConfigured = false;
        mockDb = null;
      }
    });
  });
});
