import { Product, ProductCategory } from '../productTypes';
import { RepositoryStatus } from '../types';
import { SAMPLE_PRODUCTS } from '../mockProducts';
import { db, isFirebaseConfigured } from '../../lib/firebase/client';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  runTransaction,
  query,
  where
} from 'firebase/firestore';
import {
  generateStableProductId,
  isValidPreallocatedProductId,
} from '../images/productImageLifecycle';

const CUSTOM_PRODUCTS_STORAGE_KEY = 'koh_admin_custom_products';
const SAMPLE_OVERRIDES_STORAGE_KEY = 'koh_admin_sample_overrides';

export const CATEGORY_CODES: Record<ProductCategory, string> = {
  Rings: 'RNG',
  'Necklaces/Sets': 'NCK',
  Chains: 'CHN',
  Mangalsutra: 'MNG',
  'Bangles/Kada': 'BNG',
};

export interface ProductValidationResult {
  isValid: boolean;
  errors: string[];
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
          list.push({ ...(d.data() as Product), id: d.id });
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
          list.push({ ...(d.data() as Product), id: d.id });
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
    const baseline = SAMPLE_PRODUCTS.map((p) => overrides[p.id] || p);
    const custom = this.getStoredCustomProducts();
    return [...baseline, ...custom];
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
    if (!product.category) errors.push('Category is required.');
    if (!product.gender) errors.push('Gender classification is required.');
    if (!product.purity) errors.push('Purity is required.');
    if (typeof product.approxWeight !== 'number' || product.approxWeight <= 0) {
      errors.push('Approximate weight must be a positive number in grams.');
    }
    if (!product.availability) errors.push('Availability is required.');
    if (!product.shortDescription || !product.shortDescription.trim()) {
      errors.push('Short description is required.');
    }
    if (!product.detailedDescription || !product.detailedDescription.trim()) {
      errors.push('Detailed description is required.');
    }
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

    const newProduct: Product = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };

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
    const updated: Product = {
      ...existing,
      ...updates,
      id: existing.id,
      sku: existing.sku,
      createdAt: existing.createdAt,
      updatedAt: now,
    };

    if (isFirebaseConfigured && db) {
      const docRef = doc(db, 'products', id);
      await this.runWrite(
        'Product update',
        updateDoc(docRef, {
          ...updates,
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
}

export const productRepository = new ProductRepository();
