import { ProductImage } from '../productTypes';
import { firebaseStorageService, IFirebaseStorageService } from './firebaseStorageService';

export const PREALLOCATED_PRODUCT_ID_REGEX = /^prod-custom-[a-zA-Z0-9_-]{8,64}$/;
export const STORAGE_PATH_REGEX = /^products\/([a-zA-Z0-9_-]{3,64})\/([a-zA-Z0-9_-]{3,64}\.(?:jpe?g|png|webp))$/i;

export interface PathValidationResult {
  isValid: boolean;
  productId?: string;
  filename?: string;
  error?: string;
}

export interface CleanupResult {
  deleted: string[];
  alreadyMissing: string[];
  failed: Array<{ path: string; error: string }>;
}

/**
 * Validates that a preallocated product ID meets safety and format standards:
 * - Must start with 'prod-custom-'
 * - Alphanumeric, underscores, and dashes only
 * - Length between 8 and 64 characters
 * - No path traversal characters or spaces
 */
export function isValidPreallocatedProductId(productId: string): boolean {
  if (!productId || typeof productId !== 'string') return false;
  return PREALLOCATED_PRODUCT_ID_REGEX.test(productId);
}

/**
 * Generates a collision-resistant stable product ID.
 * Prefers crypto.randomUUID() when available.
 */
export function generateStableProductId(): string {
  let randomPart = '';
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    randomPart = crypto.randomUUID().replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
  } else {
    randomPart = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 6);
  }
  return `prod-custom-${Date.now()}-${randomPart}`;
}

/**
 * Validates a storage path strictly:
 * - Must match products/{exactProductId}/{filename}
 * - Rejects path traversal (.., %2e, /, backslashes)
 * - Rejects foreign product IDs when expectedProductId is specified
 * - Rejects non-image extensions
 */
export function validateProductStoragePath(
  storagePath: string,
  expectedProductId?: string
): PathValidationResult {
  if (!storagePath || typeof storagePath !== 'string') {
    return { isValid: false, error: 'Storage path is empty or invalid.' };
  }

  // Reject URL encodings and directory traversal attempts
  if (
    storagePath.includes('..') ||
    storagePath.includes('%2e') ||
    storagePath.includes('%2E') ||
    storagePath.includes('\\') ||
    storagePath.includes('//')
  ) {
    return { isValid: false, error: 'Path contains illegal traversal characters or double slashes.' };
  }

  const match = storagePath.match(STORAGE_PATH_REGEX);
  if (!match) {
    return {
      isValid: false,
      error: `Storage path "${storagePath}" does not match required format: products/{productId}/{filename}.`,
    };
  }

  const [, productId, filename] = match;

  if (expectedProductId && productId !== expectedProductId) {
    return {
      isValid: false,
      productId,
      filename,
      error: `Storage path belongs to foreign product "${productId}", expected "${expectedProductId}".`,
    };
  }

  return { isValid: true, productId, filename };
}

/**
 * Safely cleans up uploaded images from Firebase Storage.
 *
 * Guarantees:
 * - Deduplicates paths before issuing deletion commands.
 * - Enforces strict ownership against expectedProductId.
 * - Treats 'storage/object-not-found' / 404 as alreadyMissing (success for rollback).
 * - Records individual failures without throwing, preserving full diagnostics.
 */
export async function cleanupUploadedImages(
  storagePaths: string[],
  expectedProductId?: string,
  storageService: IFirebaseStorageService = firebaseStorageService
): Promise<CleanupResult> {
  const result: CleanupResult = {
    deleted: [],
    alreadyMissing: [],
    failed: [],
  };

  if (!storagePaths || storagePaths.length === 0) {
    return result;
  }

  // Deduplicate paths
  const uniquePaths = Array.from(new Set(storagePaths.filter((p) => typeof p === 'string' && p.trim().length > 0)));

  for (const path of uniquePaths) {
    const validation = validateProductStoragePath(path, expectedProductId);
    if (!validation.isValid) {
      result.failed.push({
        path,
        error: validation.error || 'Invalid storage path.',
      });
      continue;
    }

    try {
      await storageService.deleteProductImage(path);
      result.deleted.push(path);
    } catch (err: unknown) {
      const errorObj = err as { code?: string; message?: string };
      const message = errorObj?.message || String(err);
      const isNotFound =
        errorObj?.code === 'storage/object-not-found' ||
        message.toLowerCase().includes('object-not-found') ||
        message.includes('404');

      if (isNotFound) {
        result.alreadyMissing.push(path);
      } else {
        result.failed.push({
          path,
          error: message,
        });
      }
    }
  }

  return result;
}

/**
 * Identifies cloud storage images that existed in originalImages but were
 * removed from finalImages during an edit session.
 *
 * Returns only valid storagePaths belonging strictly to productId.
 */
export function calculateRemovedCloudImages(
  originalImages: ProductImage[],
  finalImages: ProductImage[],
  productId: string
): string[] {
  if (!originalImages || originalImages.length === 0) return [];

  const finalPaths = new Set(
    (finalImages || [])
      .map((img) => img.storagePath)
      .filter((p): p is string => Boolean(p))
  );

  const removedPaths: string[] = [];

  for (const img of originalImages) {
    if (img.storagePath && !finalPaths.has(img.storagePath)) {
      const validation = validateProductStoragePath(img.storagePath, productId);
      if (validation.isValid) {
        removedPaths.push(img.storagePath);
      }
    }
  }

  return Array.from(new Set(removedPaths));
}

export interface ReconcileImagesOptions {
  isEditing: boolean;
  persistedImages?: ProductImage[];
}

/**
 * Reconciles the form's image metadata after a save failure and rollback.
 *
 * Guarantees:
 * - In create mode: removes all successfully deleted or already-missing session
 *   images from the form state so the user never saves deleted Cloud Storage URLs.
 *   Retains any uploads whose deletion failed (since their files still physically exist).
 * - In edit mode: restores the form's images to the original persisted state
 *   (productToEdit.images), while preserving any newly uploaded images whose
 *   rollback failed (since they still physically exist in storage).
 * - Leaves non-image form fields intact.
 */
export function reconcileImagesAfterRollback(
  currentImages: ProductImage[],
  rollbackResult: CleanupResult,
  options: ReconcileImagesOptions
): ProductImage[] {
  const rolledBackPaths = new Set([
    ...rollbackResult.deleted,
    ...rollbackResult.alreadyMissing,
  ]);

  if (options.isEditing && options.persistedImages) {
    const failedPaths = new Set(rollbackResult.failed.map((f) => f.path));
    const preservedFailedUploads = (currentImages || []).filter(
      (img) => img.storagePath && failedPaths.has(img.storagePath)
    );
    return [...options.persistedImages, ...preservedFailedUploads];
  }

  // Create mode: remove all successfully deleted or already-missing images
  return (currentImages || []).filter(
    (img) => !img.storagePath || !rolledBackPaths.has(img.storagePath)
  );
}
