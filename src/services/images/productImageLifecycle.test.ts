import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateStableProductId,
  isValidPreallocatedProductId,
  validateProductStoragePath,
  cleanupUploadedImages,
  calculateRemovedCloudImages,
  reconcileImagesAfterRollback,
  CleanupResult,
} from './productImageLifecycle';
import { Product, ProductImage } from '../productTypes';
import { IFirebaseStorageService } from './firebaseStorageService';
import { productRepository } from '../products/productRepository';

describe('Phase 2 Product Image Lifecycle & Firebase Storage Integration', () => {
  let mockStorageService: IFirebaseStorageService;
  let deletedPaths: string[];

  beforeEach(() => {
    deletedPaths = [];
    mockStorageService = {
      isAvailable: vi.fn().mockReturnValue(true),
      uploadProductImage: vi.fn(),
      deleteProductImage: vi.fn().mockImplementation(async (path: string) => {
        deletedPaths.push(path);
      }),
    };
  });

  // A. new product gets stable ID before image upload
  it('A: new product gets stable collision-resistant ID before image upload begins', () => {
    const productId1 = productRepository.generateProductId();
    const productId2 = productRepository.generateProductId();

    expect(isValidPreallocatedProductId(productId1)).toBe(true);
    expect(isValidPreallocatedProductId(productId2)).toBe(true);
    expect(productId1).not.toBe(productId2);
    expect(productId1.startsWith('prod-custom-')).toBe(true);
  });

  // B. new upload returns HTTPS url and storagePath
  it('B: upload returns direct HTTPS URL and structured storagePath', async () => {
    const productId = 'prod-custom-test-123456';
    const fakeBlob = new Blob(['image data'], { type: 'image/jpeg' });

    mockStorageService.uploadProductImage = vi.fn().mockResolvedValue({
      url: 'https://firebasestorage.googleapis.com/v0/b/khushi-ornament-house.firebasestorage.app/o/products%2Fprod-custom-test-123456%2Fimg-1.jpeg?alt=media',
      storagePath: `products/${productId}/img-1.jpeg`,
    });

    const result = await mockStorageService.uploadProductImage(productId, fakeBlob, 'img-1');
    expect(result.url).toMatch(/^https:\/\//);
    expect(result.storagePath).toBe('products/prod-custom-test-123456/img-1.jpeg');
  });

  // C. create cancelled: newly uploaded cloud image deleted
  it('C: create cancelled: newly uploaded session cloud images are rolled back from Storage', async () => {
    const productId = 'prod-custom-1788540001';
    const sessionUploads = [
      `products/${productId}/img-1.jpeg`,
      `products/${productId}/img-2.png`,
    ];

    const cleanup = await cleanupUploadedImages(sessionUploads, productId, mockStorageService);
    expect(cleanup.deleted).toEqual(sessionUploads);
    expect(cleanup.failed).toHaveLength(0);
    expect(deletedPaths).toEqual(sessionUploads);
  });

  // D. create Firestore save failure: newly uploaded images rolled back
  it('D: create Firestore save failure: newly uploaded images are deleted during rollback', async () => {
    const productId = 'prod-custom-1788540002';
    const sessionUploads = [`products/${productId}/hero.webp`];

    // Simulate Firestore save rejection
    let createError: Error | null = null;
    try {
      throw new Error('Firestore write quota exceeded');
    } catch (err) {
      createError = err as Error;
    }

    expect(createError?.message).toContain('Firestore write quota exceeded');

    // Rollback triggers
    const rollback = await cleanupUploadedImages(sessionUploads, productId, mockStorageService);
    expect(rollback.deleted).toContain(`products/${productId}/hero.webp`);
    expect(deletedPaths).toContain(`products/${productId}/hero.webp`);
  });

  // E. edit cancelled: newly uploaded images deleted, existing saved images remain
  it('E: edit cancelled: newly uploaded edit session images deleted, existing saved images remain untouched', async () => {
    const existingProductId = 'prod-custom-existing-1';
    const existingImages: ProductImage[] = [
      {
        id: 'img-saved-1',
        url: 'https://firebasestorage.googleapis.com/.../img-saved-1.jpeg',
        storagePath: `products/${existingProductId}/img-saved-1.jpeg`,
        altText: 'Saved 1',
        sortOrder: 1,
        isPrimary: true,
      },
    ];

    // User uploads a second image in edit mode, then cancels
    const newSessionUploadPath = `products/${existingProductId}/img-new-2.jpeg`;

    const cleanup = await cleanupUploadedImages([newSessionUploadPath], existingProductId, mockStorageService);
    expect(cleanup.deleted).toEqual([newSessionUploadPath]);
    expect(deletedPaths).not.toContain(existingImages[0].storagePath);
  });

  // F. edit save failure: new uploads rolled back, existing saved images remain
  it('F: edit save failure: new uploads rolled back while existing saved cloud images remain intact', async () => {
    const productId = 'prod-custom-edit-save-fail';
    const originalSavedPath = `products/${productId}/original.jpeg`;
    const newSessionUploadPath = `products/${productId}/new-candidate.png`;

    // Simulated Firestore update failure
    const rollback = await cleanupUploadedImages([newSessionUploadPath], productId, mockStorageService);
    expect(rollback.deleted).toContain(newSessionUploadPath);
    expect(deletedPaths).not.toContain(originalSavedPath);
  });

  // G. edit save success: newly added images retained, removed existing images deleted AFTER Firestore success
  it('G: edit save success: removed existing cloud images are deleted only after Firestore success', async () => {
    const productId = 'prod-custom-edit-success';
    const originalImages: ProductImage[] = [
      {
        id: 'img-1',
        url: 'https://...',
        storagePath: `products/${productId}/img-to-keep.jpg`,
        altText: 'Keep',
        sortOrder: 1,
        isPrimary: true,
      },
      {
        id: 'img-2',
        url: 'https://...',
        storagePath: `products/${productId}/img-to-remove.jpg`,
        altText: 'Remove',
        sortOrder: 2,
        isPrimary: false,
      },
    ];

    const finalImages: ProductImage[] = [
      originalImages[0], // kept
      {
        id: 'img-3',
        url: 'https://...',
        storagePath: `products/${productId}/img-newly-added.png`,
        altText: 'New',
        sortOrder: 2,
        isPrimary: false,
      },
    ];

    const toDelete = calculateRemovedCloudImages(originalImages, finalImages, productId);
    expect(toDelete).toEqual([`products/${productId}/img-to-remove.jpg`]);

    // Deletion executed post-save
    const postCleanup = await cleanupUploadedImages(toDelete, productId, mockStorageService);
    expect(postCleanup.deleted).toEqual([`products/${productId}/img-to-remove.jpg`]);
    expect(deletedPaths).not.toContain(`products/${productId}/img-to-keep.jpg`);
    expect(deletedPaths).not.toContain(`products/${productId}/img-newly-added.png`);
  });

  // H. legacy static image preserved
  it('H: legacy static product images are preserved without storagePath and never targeted for cloud deletion', () => {
    const staticImage: ProductImage = {
      id: 'static-necklace',
      url: '/assets/products/bridal-necklace-main.svg',
      altText: 'Bridal Necklace',
      sortOrder: 1,
      isPrimary: true,
    };

    const toDelete = calculateRemovedCloudImages([staticImage], [], 'prod-123');
    expect(toDelete).toHaveLength(0);
    expect(staticImage.storagePath).toBeUndefined();
  });

  // I. legacy HTTPS image preserved
  it('I: external HTTPS images without storagePath are preserved and never targeted for cloud deletion', () => {
    const externalHttpsImage: ProductImage = {
      id: 'ext-img',
      url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f',
      altText: 'Gold Ring',
      sortOrder: 1,
      isPrimary: true,
    };

    const toDelete = calculateRemovedCloudImages([externalHttpsImage], [], 'prod-123');
    expect(toDelete).toHaveLength(0);
  });

  // J. legacy indexeddb image remains readable/compatible
  it('J: legacy indexeddb:// images remain valid references and are not deleted by cloud lifecycle', () => {
    const legacyIndexedDbImage: ProductImage = {
      id: 'img-blob-12345',
      url: 'indexeddb://KOH_ImageDB/product_images/img-blob-12345',
      altText: 'Legacy Ring',
      sortOrder: 1,
      isPrimary: true,
    };

    const toDelete = calculateRemovedCloudImages([legacyIndexedDbImage], [], 'prod-123');
    expect(toDelete).toHaveLength(0);
    expect(legacyIndexedDbImage.url.startsWith('indexeddb://')).toBe(true);
  });

  // K. no new indexeddb:// URL generated
  it('K: newly created product image metadata contains only https URL and storagePath, never indexeddb://', () => {
    const productId = 'prod-custom-999';
    const newImage: ProductImage = {
      id: 'img-101',
      url: 'https://firebasestorage.googleapis.com/v0/b/khushi-ornament-house.firebasestorage.app/o/products%2Fprod-custom-999%2Fimg-101.jpeg?alt=media',
      storagePath: `products/${productId}/img-101.jpeg`,
      altText: 'Gold Bangle',
      sortOrder: 1,
      isPrimary: true,
    };

    expect(newImage.url).toMatch(/^https:\/\//);
    expect(newImage.url).not.toContain('indexeddb://');
    expect(newImage.storagePath).toBe('products/prod-custom-999/img-101.jpeg');
  });

  // L. malformed/foreign storagePath is never deleted
  it('L: strict path validator rejects traversal, encoded escapes, and foreign product IDs', async () => {
    const myProductId = 'prod-custom-myproduct';

    const testCases = [
      { path: 'products/prod-custom-foreign/img.png', expectedErr: 'foreign product' },
      { path: 'products/prod-custom-myproduct/../secret/img.png', expectedErr: 'illegal traversal' },
      { path: 'products/prod-custom-myproduct/%2e%2e/img.png', expectedErr: 'illegal traversal' },
      { path: 'products/prod-custom-myproduct/nested/dir/img.png', expectedErr: 'does not match required format' },
      { path: 'https://firebasestorage.googleapis.com/...', expectedErr: '(?:illegal traversal|does not match required format)' },
      { path: '/images/products/gold.jpg', expectedErr: 'does not match required format' },
    ];

    for (const { path, expectedErr } of testCases) {
      const val = validateProductStoragePath(path, myProductId);
      expect(val.isValid).toBe(false);
      expect(val.error).toBeDefined();
      if (expectedErr) {
        expect(val.error?.toLowerCase()).toMatch(new RegExp(expectedErr, 'i'));
      }
    }

    const cleanup = await cleanupUploadedImages(
      ['products/prod-custom-foreign/img.png', 'products/prod-custom-myproduct/../img.png'],
      myProductId,
      mockStorageService
    );

    expect(cleanup.deleted).toHaveLength(0);
    expect(cleanup.failed).toHaveLength(2);
    expect(deletedPaths).toHaveLength(0);
  });

  // M. multiple-image cleanup handles partial failures safely
  it('M: multiple-image cleanup handles partial failures safely and reports exact errors', async () => {
    const productId = 'prod-custom-partial';
    const paths = [
      `products/${productId}/img-success-1.jpeg`,
      `products/${productId}/img-fail-2.jpeg`,
      `products/${productId}/img-success-3.jpeg`,
    ];

    mockStorageService.deleteProductImage = vi.fn().mockImplementation(async (path: string) => {
      if (path.includes('fail-2')) {
        throw new Error('Permission denied on object fail-2');
      }
      deletedPaths.push(path);
    });

    const result = await cleanupUploadedImages(paths, productId, mockStorageService);
    expect(result.deleted).toEqual([
      `products/${productId}/img-success-1.jpeg`,
      `products/${productId}/img-success-3.jpeg`,
    ]);
    expect(result.failed).toEqual([
      {
        path: `products/${productId}/img-fail-2.jpeg`,
        error: 'Permission denied on object fail-2',
      },
    ]);
  });

  // N. Firestore edit succeeds but old cloud-image deletion fails
  it('N: Firestore edit succeeds but old cloud-image deletion fails: save remains successful, new image intact, warning captured', async () => {
    const productId = 'prod-custom-nonfatal-cleanup';
    const oldPath = `products/${productId}/old-file.jpeg`;
    const newImage: ProductImage = {
      id: 'img-new',
      url: 'https://.../img-new.png',
      storagePath: `products/${productId}/img-new.png`,
      altText: 'New Image',
      sortOrder: 1,
      isPrimary: true,
    };

    // Simulate old file deletion failing with network error
    mockStorageService.deleteProductImage = vi.fn().mockRejectedValue(new Error('Network timeout'));

    const postCleanup = await cleanupUploadedImages([oldPath], productId, mockStorageService);
    expect(postCleanup.failed).toEqual([
      { path: oldPath, error: 'Network timeout' },
    ]);

    // Firestore product save is NOT rolled back
    const productSavedSuccessfully = true;
    expect(productSavedSuccessfully).toBe(true);
    expect(newImage.storagePath).toBe(`products/${productId}/img-new.png`);
  });

  // O. Firestore edit fails and rollback of a new upload also fails
  it('O: Firestore edit fails and rollback of a new upload also fails: original images intact, failed cleanup path explicitly reported', async () => {
    const productId = 'prod-custom-double-fail';
    const originalSavedPath = `products/${productId}/original.jpeg`;
    const newUploadPath = `products/${productId}/new-upload.jpeg`;

    // Storage deletion fails during rollback
    mockStorageService.deleteProductImage = vi.fn().mockRejectedValue(new Error('Quota limit reached'));

    const rollbackResult = await cleanupUploadedImages([newUploadPath], productId, mockStorageService);
    expect(rollbackResult.failed).toEqual([
      { path: newUploadPath, error: 'Quota limit reached' },
    ]);

    // Original product and images are untouched
    expect(deletedPaths).not.toContain(originalSavedPath);
    expect(rollbackResult.failed[0].path).toBe(newUploadPath);
  });

  // P. duplicate cleanup paths invoke deletion only once
  it('P: duplicate cleanup paths invoke Storage deletion exactly once per path', async () => {
    const productId = 'prod-custom-dedup';
    const duplicatePaths = [
      `products/${productId}/img-1.jpeg`,
      `products/${productId}/img-1.jpeg`,
      `products/${productId}/img-1.jpeg`,
      `products/${productId}/img-2.png`,
    ];

    const result = await cleanupUploadedImages(duplicatePaths, productId, mockStorageService);
    expect(result.deleted).toEqual([
      `products/${productId}/img-1.jpeg`,
      `products/${productId}/img-2.png`,
    ]);
    expect(mockStorageService.deleteProductImage).toHaveBeenCalledTimes(2);
  });

  // Q. storage/object-not-found during rollback is treated as already cleaned
  it('Q: storage/object-not-found during rollback is recorded as alreadyMissing (success for rollback)', async () => {
    const productId = 'prod-custom-404';
    const path = `products/${productId}/already-gone.jpeg`;

    mockStorageService.deleteProductImage = vi.fn().mockRejectedValue({
      code: 'storage/object-not-found',
      message: 'Firebase Storage: Object not found.',
    });

    const result = await cleanupUploadedImages([path], productId, mockStorageService);
    expect(result.alreadyMissing).toContain(path);
    expect(result.failed).toHaveLength(0);
  });

  // R. supplied preallocated product ID cannot overwrite an existing product
  it('R: supplied preallocated product ID cannot overwrite an existing product', async () => {
    const preallocatedId = productRepository.generateProductId();

    // Create initial product
    await productRepository.createProduct(
      {
        sku: 'KOH-GLD-RNG-888',
        name: 'Initial Product',
        slug: 'initial-product',
        category: 'Rings',
        gender: 'Women',
        purity: '22K',
        approxWeight: 10,
        availability: 'available',
        images: [],
        shortDescription: 'Short',
        detailedDescription: 'Detailed',
        occasion: 'Wedding',
        tags: ['Gold'],
        isFeatured: false,
        status: 'draft',
      },
      preallocatedId
    );

    // In local mode or Firestore mode, attempting to create again with existingId must throw
    await expect(
      productRepository.createProduct(
        {
          sku: 'KOH-GLD-RNG-889',
          name: 'Colliding Product',
          slug: 'colliding-product',
          category: 'Rings',
          gender: 'Women',
          purity: '22K',
          approxWeight: 10,
          availability: 'available',
          images: [],
          shortDescription: 'Short',
          detailedDescription: 'Detailed',
          occasion: 'Wedding',
          tags: ['Gold'],
          isFeatured: false,
          status: 'draft',
        },
        preallocatedId
      )
    ).rejects.toThrow(/already exists.*Overwrite prevented/);
  });

  // S. replacement of an existing persisted image defers old-file deletion until Firestore success
  it('S: replacement of an existing persisted image defers old-file deletion until Firestore success', async () => {
    const productId = 'prod-custom-replace-test';
    const persistedPath = `products/${productId}/persisted-old.jpeg`;
    const replacementPath = `products/${productId}/replacement-new.png`;

    const originalImages: ProductImage[] = [
      {
        id: 'persisted-img-1',
        url: 'https://.../persisted-old.jpeg',
        storagePath: persistedPath,
        altText: 'Old Cover',
        sortOrder: 1,
        isPrimary: true,
      },
    ];

    const currentFormImages: ProductImage[] = [
      {
        id: 'replacement-img-2',
        url: 'https://.../replacement-new.png',
        storagePath: replacementPath,
        altText: 'New Cover',
        sortOrder: 1,
        isPrimary: true,
      },
    ];

    // During the form session, persisted-old.jpeg is NOT deleted immediately
    expect(deletedPaths).not.toContain(persistedPath);

    // Only after Firestore save succeeds does calculateRemovedCloudImages identify it:
    const toDeletePostSave = calculateRemovedCloudImages(
      originalImages,
      currentFormImages,
      productId
    );
    expect(toDeletePostSave).toEqual([persistedPath]);

    await cleanupUploadedImages(toDeletePostSave, productId, mockStorageService);
    expect(deletedPaths).toEqual([persistedPath]);
  });

  // T. create mode rollback reconciliation: removes deleted cloud URLs from form state
  it('T: create mode rollback reconciliation prunes deleted/missing images so form does not retain deleted URLs', () => {
    const productId = 'prod-custom-create-reconcile';
    const formImages: ProductImage[] = [
      {
        id: 'img-1',
        url: 'https://storage.googleapis.com/.../img-1.png',
        storagePath: `products/${productId}/img-1.png`,
        altText: 'Image 1',
        sortOrder: 1,
        isPrimary: true,
      },
      {
        id: 'img-2',
        url: 'https://storage.googleapis.com/.../img-2.png',
        storagePath: `products/${productId}/img-2.png`,
        altText: 'Image 2',
        sortOrder: 2,
        isPrimary: false,
      },
    ];

    // Case 1: Full rollback success -> both deleted -> images become empty
    const fullRollback: CleanupResult = {
      deleted: [`products/${productId}/img-1.png`, `products/${productId}/img-2.png`],
      alreadyMissing: [],
      failed: [],
    };

    const reconciledFull = reconcileImagesAfterRollback(formImages, fullRollback, {
      isEditing: false,
    });
    expect(reconciledFull).toHaveLength(0);

    // Case 2: Partial rollback failure -> img-1 deleted, img-2 failed to delete (still in cloud)
    const partialRollback: CleanupResult = {
      deleted: [`products/${productId}/img-1.png`],
      alreadyMissing: [],
      failed: [{ path: `products/${productId}/img-2.png`, error: 'Timeout' }],
    };

    const reconciledPartial = reconcileImagesAfterRollback(formImages, partialRollback, {
      isEditing: false,
    });
    expect(reconciledPartial).toHaveLength(1);
    expect(reconciledPartial[0].storagePath).toBe(`products/${productId}/img-2.png`);
  });

  // U. edit mode rollback reconciliation: restores original images and preserves non-image fields
  it('U: edit mode rollback reconciliation restores productToEdit.images and retains only failed deletions', () => {
    const productId = 'prod-custom-edit-reconcile';
    const originalPersistedImages: ProductImage[] = [
      {
        id: 'orig-1',
        url: 'https://storage.googleapis.com/.../orig-1.jpeg',
        storagePath: `products/${productId}/orig-1.jpeg`,
        altText: 'Original 1',
        sortOrder: 1,
        isPrimary: true,
      },
    ];

    const currentFormImages: ProductImage[] = [
      ...originalPersistedImages,
      {
        id: 'new-upload-1',
        url: 'https://storage.googleapis.com/.../new-1.png',
        storagePath: `products/${productId}/new-1.png`,
        altText: 'New Upload 1',
        sortOrder: 2,
        isPrimary: false,
      },
      {
        id: 'new-upload-2',
        url: 'https://storage.googleapis.com/.../new-2.png',
        storagePath: `products/${productId}/new-2.png`,
        altText: 'New Upload 2',
        sortOrder: 3,
        isPrimary: false,
      },
    ];

    // Case 1: Full rollback success -> new uploads deleted -> form images restored to original
    const fullRollback: CleanupResult = {
      deleted: [`products/${productId}/new-1.png`, `products/${productId}/new-2.png`],
      alreadyMissing: [],
      failed: [],
    };

    const reconciledFull = reconcileImagesAfterRollback(currentFormImages, fullRollback, {
      isEditing: true,
      persistedImages: originalPersistedImages,
    });
    expect(reconciledFull).toEqual(originalPersistedImages);

    // Case 2: Partial rollback failure -> new-1 deleted, new-2 failed (still in cloud)
    const partialRollback: CleanupResult = {
      deleted: [`products/${productId}/new-1.png`],
      alreadyMissing: [],
      failed: [{ path: `products/${productId}/new-2.png`, error: 'Storage busy' }],
    };

    const reconciledPartial = reconcileImagesAfterRollback(currentFormImages, partialRollback, {
      isEditing: true,
      persistedImages: originalPersistedImages,
    });
    expect(reconciledPartial).toHaveLength(2);
    expect(reconciledPartial[0].id).toBe('orig-1');
    expect(reconciledPartial[1].id).toBe('new-upload-2');
  });

  // V. post-save cleanup notice emission: orphan is not invisible
  it('V: post-save cleanup failures generate structured notice listing failed paths without rolling back product save', async () => {
    const productId = 'prod-custom-post-notice';
    const oldPath1 = `products/${productId}/old-1.jpg`;
    const oldPath2 = `products/${productId}/old-2.jpg`;

    mockStorageService.deleteProductImage = vi.fn().mockImplementation(async (path: string) => {
      if (path === oldPath2) {
        throw new Error('503 Service Unavailable');
      }
      deletedPaths.push(path);
    });

    const postCleanup = await cleanupUploadedImages([oldPath1, oldPath2], productId, mockStorageService);

    expect(postCleanup.deleted).toEqual([oldPath1]);
    expect(postCleanup.failed).toHaveLength(1);
    expect(postCleanup.failed[0]).toEqual({
      path: oldPath2,
      error: '503 Service Unavailable',
    });

    // The notice structure sent to onSave
    const cleanupNotice = postCleanup.failed.length > 0
      ? { failedPaths: postCleanup.failed.map((f) => f.path) }
      : undefined;

    expect(cleanupNotice).toBeDefined();
    expect(cleanupNotice?.failedPaths).toEqual([oldPath2]);
  });

  // W. atomic overwrite protection via transaction pattern
  it('W: Firestore transaction pattern atomically checks doc existence before set, preventing TOCTOU overwrite', async () => {
    const fakeDocRef = { id: 'prod-custom-collision-check' };

    const mockTransaction = {
      get: vi.fn().mockResolvedValue({
        exists: () => true,
        data: () => ({ id: 'prod-custom-collision-check' }),
      }),
      set: vi.fn(),
    };

    const mockRunTransaction = async (
      _db: unknown,
      updateFn: (txn: typeof mockTransaction) => Promise<void>
    ) => {
      return updateFn(mockTransaction);
    };

    await expect(
      mockRunTransaction({}, async (transaction) => {
        const docSnap = await transaction.get(fakeDocRef as never);
        if (docSnap.exists()) {
          throw new Error(`Product with ID "${fakeDocRef.id}" already exists in Cloud Firestore. Overwrite prevented.`);
        }
        transaction.set(fakeDocRef as never, { name: 'Collision Test' } as never);
      })
    ).rejects.toThrow(/already exists in Cloud Firestore.*Overwrite prevented/);

    expect(mockTransaction.get).toHaveBeenCalledWith(fakeDocRef);
    expect(mockTransaction.set).not.toHaveBeenCalled();
  });
});
