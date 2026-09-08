import { Product, ProductCategory } from '../productTypes';
import { RepositoryStatus } from '../types';
import { SAMPLE_PRODUCTS } from '../mockProducts';
import { db, isFirebaseConfigured } from '../../lib/firebase/client';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  runTransaction,
  query,
  where
} from 'firebase/firestore';
import {
  generateStableProductId,
  isValidPreallocatedProductId,
  validateProductStoragePath,
} from '../images/productImageLifecycle';
import { firebaseStorageService } from '../images/firebaseStorageService';
import { imageStorageService } from '../images/imageStorageService';

import { CATEGORY_CODES, CATEGORIES, getAvailableCategories } from '../../lib/categoryRegistry';


const CUSTOM_PRODUCTS_STORAGE_KEY = 'koh_admin_custom_products';
const SAMPLE_OVERRIDES_STORAGE_KEY = 'koh_admin_sample_overrides';

export { CATEGORY_CODES };


export interface ProductValidationResult {
  isValid: boolean;
  errors: string[];
}

export type ProductDeletionErrorCode =
  | 'PRODUCT_NOT_FOUND'
  | 'PRODUCT_NOT_ARCHIVED'
  | 'INVALID_STORAGE_PATH'
  | 'STORAGE_CLEANUP_FAILED'
  | 'FIRESTORE_DELETE_FAILED_AFTER_STORAGE_CLEANUP';

export class ProductDeletionError extends Error {
  public readonly code: ProductDeletionErrorCode;
  public readonly productId: string;
  public readonly failedPaths?: { path: string; error: string }[];
  public readonly cleanedPaths?: string[];
  public readonly originalError?: unknown;

  constructor(
    code: ProductDeletionErrorCode,
    message: string,
    details: {
      productId: string;
      failedPaths?: { path: string; error: string }[];
      cleanedPaths?: string[];
      originalError?: unknown;
    }
  ) {
    super(message);
    this.name = 'ProductDeletionError';
    this.code = code;
    this.productId = details.productId;
    this.failedPaths = details.failedPaths;
    this.cleanedPaths = details.cleanedPaths;
    this.originalError = details.originalError;
  }
}

/**
 * Two independent Firestore streams back this repository, because Firestore
 * security rules are not filters:
 *
 * - The PUBLIC stream is constrained with where('status', '==', 'published') so
 *   it satisfies `allow read: if resource.data.status == 'published'` for
 *   unauthenticated visitors. Every public catalogue surface reads this stream.
 * - The ADMIN stream lists the products collection unfiltered, which only
 *   satisfies the rules for a caller matching isAdmin(). It is started lazily so
 *   a public visitor never issues a query that is guaranteed to be denied.
 */
export function normalizeProduct(raw: any): Product {
  if (!raw || typeof raw !== 'object') {
    return raw;
  }
  return {
    ...raw,
    shortDescription: typeof raw.shortDescription === 'string' ? raw.shortDescription : '',
    detailedDescription: typeof raw.detailedDescription === 'string' ? raw.detailedDescription : '',
    occasion: typeof raw.occasion === 'string' ? raw.occasion : '',
    tags: Array.isArray(raw.tags) ? raw.tags : [],
  };
}

class ProductRepository {
  private publishedCache: Product[] = [];
  private publishedStatus: RepositoryStatus = 'ready';
  private publishedError: Error | null = null;
  private publishedListenerStarted = false;

  private adminCache: Product[] = [];
  private adminStatus: RepositoryStatus = 'ready';
  private adminError: Error | null = null;
  private adminListenerStarted = false;

  /** Public catalogue stream: published products only, readable by anyone. */
  private ensurePublishedListener(): void {
    if (!isFirebaseConfigured || !db || this.publishedListenerStarted) return;
    this.publishedListenerStarted = true;
    this.publishedStatus = 'loading';

    try {
      const publishedQuery = query(
        collection(db, 'products'),
        where('status', '==', 'published')
      );

      onSnapshot(publishedQuery, (snapshot) => {
        const list: Product[] = [];
        snapshot.forEach((d) => {
          list.push(normalizeProduct({ ...(d.data() as Product), id: d.id }));
        });
        this.publishedCache = list;
        this.publishedStatus = 'ready';
        this.publishedError = null;
        this.dispatchStorageUpdate();
      }, (err) => {
        console.error('Firestore published products sync error:', err);
        this.publishedCache = [];
        this.publishedStatus = 'error';
        this.publishedError = err instanceof Error ? err : new Error(String(err));
        this.dispatchStorageUpdate();
      });
    } catch (err) {
      console.error('Failed setting up Firestore published products listener:', err);
      this.publishedCache = [];
      this.publishedStatus = 'error';
      this.publishedError = err instanceof Error ? err : new Error(String(err));
      this.dispatchStorageUpdate();
    }
  }

  /** Admin stream: the full products collection, permitted only for isAdmin(). */
  private ensureAdminListener(): void {
    if (!isFirebaseConfigured || !db || this.adminListenerStarted) return;
    this.adminListenerStarted = true;
    this.adminStatus = 'loading';

    try {
      const productsRef = collection(db, 'products');
      onSnapshot(productsRef, (snapshot) => {
        const list: Product[] = [];
        snapshot.forEach((d) => {
          list.push(normalizeProduct({ ...(d.data() as Product), id: d.id }));
        });
        this.adminCache = list;
        this.adminStatus = 'ready';
        this.adminError = null;
        this.dispatchStorageUpdate();
      }, (err) => {
        console.error('Firestore admin products sync error:', err);
        this.setAdminLoadFailure(err);
      });
    } catch (err) {
      console.error('Failed setting up Firestore admin products listener:', err);
      this.setAdminLoadFailure(err);
    }
  }

  /**
   * Records a Firestore load failure. The cache is cleared so callers can never
   * mistake a failed load for an empty collection, and no local or sample data
   * is substituted in Firebase mode.
   */
  private setAdminLoadFailure(err: unknown): void {
    this.adminCache = [];
    this.adminStatus = 'error';
    this.adminError = err instanceof Error ? err : new Error(String(err));
    this.dispatchStorageUpdate();
  }

  /** Load state of the admin (unfiltered) Firestore products listener. */
  public getStatus(): RepositoryStatus {
    if (isFirebaseConfigured && db) {
      this.ensureAdminListener();
      return this.adminStatus;
    }
    return 'ready';
  }

  /** The Firestore failure that put the admin stream into the 'error' state. */
  public getLoadError(): Error | null {
    return this.adminError;
  }

  /** Load state of the public published-products Firestore listener. */
  public getPublishedStatus(): RepositoryStatus {
    if (isFirebaseConfigured && db) {
      this.ensurePublishedListener();
      return this.publishedStatus;
    }
    return 'ready';
  }

  /** The Firestore failure that put the public stream into the 'error' state. */
  public getPublishedLoadError(): Error | null {
    return this.publishedError;
  }

  /**
   * Wraps a Firestore write so failures surface to the caller with the operation
   * named, instead of being swallowed into the console.
   */
  private async runWrite(action: string, operation: Promise<void>): Promise<void> {
    try {
      await operation;
    } catch (err) {
      console.error(`${action} failed in Firestore:`, err);
      const detail = err instanceof Error ? err.message : String(err);
      throw new Error(`${action} failed in Cloud Firestore: ${detail}`);
    }
  }

  private localCustomProducts: Product[] = [];

  private getStoredCustomProducts(): Product[] {
    if (typeof window === 'undefined') return this.localCustomProducts;
    try {
      const raw = localStorage.getItem(CUSTOM_PRODUCTS_STORAGE_KEY);
      if (!raw) return this.localCustomProducts;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as Product[]) : this.localCustomProducts;
    } catch (err) {
      console.warn('Failed reading custom products from localStorage:', err);
      return this.localCustomProducts;
    }
  }

  private saveCustomProducts(products: Product[]): void {
    this.localCustomProducts = products;
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(CUSTOM_PRODUCTS_STORAGE_KEY, JSON.stringify(products));
      this.dispatchStorageUpdate();
    } catch (err) {
      console.warn('Failed saving custom products to localStorage:', err);
      throw new Error('Failed to save product database updates.');
    }
  }

  private getStoredSampleOverrides(): Record<string, Product> {
    if (typeof window === 'undefined') return {};
    try {
      const raw = localStorage.getItem(SAMPLE_OVERRIDES_STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  private saveSampleOverrides(overrides: Record<string, Product>): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(SAMPLE_OVERRIDES_STORAGE_KEY, JSON.stringify(overrides));
      this.dispatchStorageUpdate();
    } catch (err) {
      console.warn('Failed saving sample overrides to localStorage:', err);
      throw new Error('Failed to save product metadata in browser storage.');
    }
  }

  private dispatchStorageUpdate() {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      try {
        window.dispatchEvent(new Event('koh_products_updated'));
      } catch (err) {
        console.warn('Dispatch event warning:', err);
      }
    }
  }

  /**
   * Sample + localStorage catalogue used ONLY when Firebase is not configured
   * (local development without credentials). Never consulted in Firebase mode.
   */
  private getLocalModeProducts(): Product[] {
    const overrides = this.getStoredSampleOverrides();
    const baseline = SAMPLE_PRODUCTS
      .map((p) => overrides[p.id] || p)
      .filter((p) => (p as unknown as { isDeleted?: boolean })?.isDeleted !== true);
    const custom = this.getStoredCustomProducts();
    return [...baseline, ...custom].map(normalizeProduct);
  }

  /**
   * ADMIN scope. In Firebase mode this returns only Firestore-backed data from
   * the unfiltered admin listener: empty while 'loading' and cleared on 'error'.
   * Callers must consult getStatus() to tell "zero products" from "Firestore
   * failed to load". There is no localStorage or SAMPLE_PRODUCTS fallback in
   * Firebase mode.
   */
  public getAllProducts(): Product[] {
    if (isFirebaseConfigured && db) {
      this.ensureAdminListener();
      return this.adminCache;
    }
    return this.getLocalModeProducts();
  }

  /**
   * PUBLIC scope. In Firebase mode this returns the where(status == 'published')
   * Firestore stream and nothing else: empty while 'loading' and cleared on
   * 'error'. An empty published collection yields an empty catalogue — samples
   * are never resurrected. Callers must consult getPublishedStatus().
   */
  public getPublishedProducts(): Product[] {
    if (isFirebaseConfigured && db) {
      this.ensurePublishedListener();
      return this.publishedCache;
    }
    return this.getLocalModeProducts().filter((p) => p.status === 'published');
  }

  /**
   * PUBLIC scope: returns only categories that contain at least one published,
   * non-archived, non-deleted product. Preserves canonical CATEGORIES order.
   */
  public getAvailableCategories(): ProductCategory[] {
    return getAvailableCategories(this.getPublishedProducts());
  }

  /** PUBLIC scope: featured products drawn from the published stream. */

  public getFeaturedPublishedProducts(): Product[] {
    return this.getPublishedProducts().filter((p) => p.isFeatured);
  }

  /** PUBLIC scope: wedding collection derived from occasion or tags. */
  public getWeddingPublishedProducts(): Product[] {
    return this.getPublishedProducts().filter(
      (p) =>
        (p.occasion || '').toLowerCase() === 'wedding' ||
        (Array.isArray(p.tags) &&
          p.tags.some((t) => t.toLowerCase() === 'wedding' || t.toLowerCase() === 'bridal'))
    );
  }

  /** PUBLIC scope: slug lookup restricted to the published stream. */
  public getPublishedProductBySlug(slug: string): Product | null {
    return this.getPublishedProducts().find((p) => p.slug === slug) || null;
  }

  /** ADMIN scope: id lookup across all statuses. */
  public getProductById(id: string): Product | null {
    const all = this.getAllProducts();
    return all.find((p) => p.id === id) || null;
  }

  public generateUniqueSku(category: ProductCategory): string {
    const categoryCode = CATEGORY_CODES[category] || 'GEN';
    const prefix = `KOH-GLD-${categoryCode}-`;
    const all = this.getAllProducts();

    let maxSeq = 0;
    const regex = new RegExp(`^KOH-GLD-${categoryCode}-(\\d+)$`);

    all.forEach((p) => {
      const match = p.sku.match(regex);
      if (match && match[1]) {
        const seq = parseInt(match[1], 10);
        if (!isNaN(seq) && seq > maxSeq) {
          maxSeq = seq;
        }
      }
    });

    const nextSeq = (maxSeq + 1).toString().padStart(3, '0');
    let candidate = `${prefix}${nextSeq}`;

    let counter = maxSeq + 1;
    while (all.some((p) => p.sku === candidate)) {
      counter++;
      candidate = `${prefix}${counter.toString().padStart(3, '0')}`;
    }

    return candidate;
  }

  public generateUniqueSlug(name: string, excludeProductId?: string): string {
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'product';

    const all = this.getAllProducts();
    let candidate = baseSlug;
    let counter = 2;

    while (all.some((p) => p.slug === candidate && p.id !== excludeProductId)) {
      candidate = `${baseSlug}-${counter}`;
      counter++;
    }

    return candidate;
  }

  public validateForPublish(product: Partial<Product>): ProductValidationResult {
    const errors: string[] = [];

    if (!product.name || !product.name.trim()) errors.push('Product name is required.');
    if (!product.slug || !product.slug.trim()) errors.push('Product slug is required.');
    if (!product.category) {
      errors.push('Category is required.');
    } else if (!CATEGORIES.includes(product.category)) {
      errors.push(`Invalid category: "${product.category}".`);
    }
    if (!product.gender) errors.push('Gender classification is required.');
    if (!product.purity) errors.push('Purity is required.');

    if (typeof product.approxWeight !== 'number' || product.approxWeight <= 0) {
      errors.push('Approximate weight must be a positive number in grams.');
    }
    if (!product.availability) errors.push('Availability is required.');
    if (!product.occasion || !product.occasion.trim()) {
      errors.push('Occasion is required.');
    }

    if (!product.images || product.images.length === 0) {
      errors.push('At least one product image is required to publish.');
    } else {
      const primaryImages = product.images.filter((img) => img.isPrimary);
      if (primaryImages.length !== 1) {
        errors.push('Exactly one primary/cover image must be selected before publishing.');
      }
      product.images.forEach((img, idx) => {
        if (!img.url || !img.url.trim()) {
          errors.push(`Image slot ${idx + 1} has an invalid URL.`);
        }
        if (!img.altText || !img.altText.trim()) {
          errors.push(`Image slot ${idx + 1} requires descriptive alt text.`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Allocates a stable, collision-resistant product ID before any storage
   * uploads begin.
   */
  public generateProductId(): string {
    return generateStableProductId();
  }

  /**
   * Resolves only after Firestore has accepted the write. A rejection propagates
   * to the caller so the UI can never report a success that did not happen.
   *
   * If a preallocatedId is provided, it is validated for safe format and checked
   * to ensure it cannot overwrite an existing product.
   */
  public async createProduct(
    data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
    preallocatedId?: string
  ): Promise<Product> {
    let id: string;

    if (preallocatedId) {
      if (!isValidPreallocatedProductId(preallocatedId)) {
        throw new Error(`Invalid preallocated product ID format: "${preallocatedId}".`);
      }
      id = preallocatedId;
    } else {
      id = this.generateProductId();
    }

    const now = new Date().toISOString();

    const newProduct: Product = normalizeProduct({
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    });

    if (isFirebaseConfigured && db) {
      const docRef = doc(db, 'products', id);

      // Atomic overwrite protection in Cloud Firestore via transaction
      await this.runWrite(
        'Product creation',
        runTransaction(db, async (transaction) => {
          const docSnap = await transaction.get(docRef);
          if (docSnap.exists()) {
            throw new Error(`Product with ID "${id}" already exists in Cloud Firestore. Overwrite prevented.`);
          }
          transaction.set(docRef, newProduct);
        })
      );
    } else {
      const current = this.getStoredCustomProducts();
      if (current.some((p) => p.id === id) || SAMPLE_PRODUCTS.some((p) => p.id === id)) {
        throw new Error(`Product with ID "${id}" already exists. Overwrite prevented.`);
      }
      this.saveCustomProducts([...current, newProduct]);
    }

    return newProduct;
  }

  public async updateProduct(
    id: string,
    updates: Partial<Omit<Product, 'id' | 'sku' | 'createdAt'>>
  ): Promise<Product | null> {
    const all = this.getAllProducts();
    const existing = all.find((p) => p.id === id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const updated: Product = normalizeProduct({
      ...existing,
      ...updates,
      id: existing.id,
      sku: existing.sku,
      createdAt: existing.createdAt,
      updatedAt: now,
    });

    if (isFirebaseConfigured && db) {
      const docRef = doc(db, 'products', id);
      await this.runWrite(
        'Product update',
        updateDoc(docRef, {
          ...updates,
          ...(updates.shortDescription !== undefined
            ? { shortDescription: typeof updates.shortDescription === 'string' ? updates.shortDescription : '' }
            : {}),
          ...(updates.detailedDescription !== undefined
            ? { detailedDescription: typeof updates.detailedDescription === 'string' ? updates.detailedDescription : '' }
            : {}),
          updatedAt: now
        })
      );
    } else {
      const isBaseline = SAMPLE_PRODUCTS.some((p) => p.id === id);
      if (isBaseline) {
        const overrides = this.getStoredSampleOverrides();
        overrides[id] = updated;
        this.saveSampleOverrides(overrides);
      } else {
        const custom = this.getStoredCustomProducts();
        const nextCustom = custom.map((p) => (p.id === id ? updated : p));
        this.saveCustomProducts(nextCustom);
      }
    }

    return updated;
  }

  public async setStatus(
    id: string,
    status: 'draft' | 'published' | 'archived'
  ): Promise<Product | null> {
    const existing = this.getProductById(id);
    if (!existing) return null;

    if (status === 'published') {
      const validation = this.validateForPublish(existing);
      if (!validation.isValid) {
        throw new Error(`Cannot publish: ${validation.errors.join(' ')}`);
      }
    }

    return this.updateProduct(id, { status });
  }

  public async toggleFeatured(id: string): Promise<Product | null> {
    const existing = this.getProductById(id);
    if (!existing) return null;
    return this.updateProduct(id, { isFeatured: !existing.isFeatured });
  }

  /**
   * Permanently deletes an archived product and all of its owned media.
   *
   * Execution Sequence:
   * 1. Extract product ID from argument.
   * 2. Re-read authoritative Firestore document to verify current state (guards against stale UI).
   * 3. Validate status === 'archived'. Draft or published products cannot be deleted.
   * 4. Collect and validate owned Firebase Storage paths. Reject foreign/traversal paths.
   * 5. Attempt deletion of all owned Firebase Storage paths.
   * 6. If any genuine Storage deletion fails, ABORT Firestore deletion to avoid orphaned files.
   * 7. Delete the Firestore document (/products/{productId}).
   * 8. Reconcile in-memory/local repository structures (adminCache, publishedCache, custom/sample storage).
   * 9. Perform best-effort cleanup for legacy IndexedDB images (non-fatal if local cleanup fails).
   * 10. Dispatch 'koh_products_updated' event to notify dashboard listeners.
   */
  public async deleteProductPermanently(
    productOrId: string | Product
  ): Promise<void> {
    const productId = typeof productOrId === 'string' ? productOrId.trim() : productOrId?.id;
    if (!productId) {
      throw new ProductDeletionError(
        'PRODUCT_NOT_FOUND',
        'A valid product ID is required to permanently delete a product.',
        { productId: '' }
      );
    }

    let authoritativeProduct: Product;

    if (isFirebaseConfigured && db) {
      const docRef = doc(db, 'products', productId);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) {
        throw new ProductDeletionError(
          'PRODUCT_NOT_FOUND',
          `Product "${productId}" no longer exists in Cloud Firestore.`,
          { productId }
        );
      }
      authoritativeProduct = { ...(snapshot.data() as Product), id: snapshot.id };
    } else {
      const local = this.getProductById(productId);
      if (!local) {
        throw new ProductDeletionError(
          'PRODUCT_NOT_FOUND',
          `Product "${productId}" no longer exists in product database.`,
          { productId }
        );
      }
      authoritativeProduct = local;
    }

    // Strict lifecycle gate: only archived products can be permanently deleted
    if (authoritativeProduct.status !== 'archived') {
      throw new ProductDeletionError(
        'PRODUCT_NOT_ARCHIVED',
        `Cannot delete product "${authoritativeProduct.name}". Only archived products can be permanently deleted (current status: ${authoritativeProduct.status}).`,
        { productId: authoritativeProduct.id }
      );
    }

    // Strict Storage Ownership Validation:
    // Only delete storage objects belonging to this product. Reject foreign/traversal paths.
    const declaredStoragePaths = (authoritativeProduct.images || [])
      .map((img) => img.storagePath)
      .filter((path): path is string => Boolean(path && typeof path === 'string' && path.trim().length > 0));

    for (const path of declaredStoragePaths) {
      const validation = validateProductStoragePath(path, authoritativeProduct.id);
      if (!validation.isValid) {
        throw new ProductDeletionError(
          'INVALID_STORAGE_PATH',
          `Cannot delete product "${authoritativeProduct.name}". Invalid storage path "${path}": ${validation.error || 'Foreign or invalid storage path'}. Firestore document was preserved.`,
          {
            productId: authoritativeProduct.id,
            failedPaths: [{ path, error: validation.error || 'Invalid path' }],
          }
        );
      }
    }

    const uniqueStoragePaths = Array.from(new Set(declaredStoragePaths));

    // Attempt deletion of all owned Firebase Storage objects
    const storageResults = await Promise.allSettled(
      uniqueStoragePaths.map((path) => firebaseStorageService.deleteProductImage(path))
    );

    const failedItems: { path: string; error: string }[] = [];
    let succeededCount = 0;

    storageResults.forEach((result, idx) => {
      const path = uniqueStoragePaths[idx];
      if (result.status === 'rejected') {
        const error = result.reason instanceof Error ? result.reason.message : String(result.reason);
        failedItems.push({ path, error });
      } else {
        succeededCount++;
      }
    });

    if (failedItems.length > 0) {
      const reasons = failedItems.map((f) => `${f.path}: ${f.error}`).join('; ');
      const partialWarning =
        succeededCount > 0
          ? ` (${succeededCount} media object(s) were removed before failure; some cloud media may already have been deleted)`
          : '';
      throw new ProductDeletionError(
        'STORAGE_CLEANUP_FAILED',
        `Product was not deleted because media cleanup was incomplete: ${failedItems.length} file(s) failed (${reasons}).${partialWarning} The product document was preserved in Firestore. You can safely retry permanent deletion.`,
        {
          productId: authoritativeProduct.id,
          failedPaths: failedItems,
        }
      );
    }

    // Delete Firestore document only after all required Storage cleanups succeed
    try {
      if (isFirebaseConfigured && db) {
        const docRef = doc(db, 'products', authoritativeProduct.id);
        await this.runWrite('Product deletion', deleteDoc(docRef));
      } else {
        if (SAMPLE_PRODUCTS.some((p) => p.id === authoritativeProduct.id)) {
          const overrides = this.getStoredSampleOverrides();
          overrides[authoritativeProduct.id] = {
            ...authoritativeProduct,
            isDeleted: true,
          } as unknown as Product;
          this.saveSampleOverrides(overrides);
        } else {
          const overrides = this.getStoredSampleOverrides();
          if (overrides[authoritativeProduct.id]) {
            delete overrides[authoritativeProduct.id];
            this.saveSampleOverrides(overrides);
          }
        }
        const custom = this.getStoredCustomProducts();
        this.saveCustomProducts(custom.filter((p) => p.id !== authoritativeProduct.id));
      }
    } catch (err: unknown) {
      const cleaned = uniqueStoragePaths;
      throw new ProductDeletionError(
        'FIRESTORE_DELETE_FAILED_AFTER_STORAGE_CLEANUP',
        `Cloud media cleanup completed (${cleaned.length} file(s) removed), but removing the Firestore document failed: ${err instanceof Error ? err.message : String(err)}. The product remains in the catalogue with missing media. Please retry.`,
        {
          productId: authoritativeProduct.id,
          cleanedPaths: cleaned,
          originalError: err,
        }
      );
    }

    // Reconcile repository in-memory caches
    this.adminCache = this.adminCache.filter((p) => p.id !== authoritativeProduct.id);
    this.publishedCache = this.publishedCache.filter((p) => p.id !== authoritativeProduct.id);

    // Best-effort IndexedDB cleanup for legacy/local images
    const legacyIndexedDbImages = (authoritativeProduct.images || []).filter(
      (img) => img.url && img.url.startsWith('indexeddb://')
    );

    if (legacyIndexedDbImages.length > 0) {
      try {
        await Promise.all(
          legacyIndexedDbImages.map((img) => imageStorageService.deleteImage(img.id))
        );
      } catch (err) {
        console.warn(
          `Product "${authoritativeProduct.name}" was deleted from Firestore, but some IndexedDB images could not be cleaned:`,
          err
        );
      }
    }

    // Notify dashboard subscribers
    this.dispatchStorageUpdate();
  }
}

export const productRepository = new ProductRepository();
