import { Product, ProductCategory } from '../productTypes';
import { SAMPLE_PRODUCTS } from '../mockProducts';
import { db, isFirebaseConfigured } from '@/lib/firebase/client';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc
} from 'firebase/firestore';

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

class ProductRepository {
  private productsCache: Product[] = [];
  private isLoaded = false;

  constructor() {
    if (isFirebaseConfigured && db) {
      try {
        const productsRef = collection(db, 'products');
        onSnapshot(productsRef, (snapshot) => {
          const list: Product[] = [];
          snapshot.forEach((d) => {
            list.push({ id: d.id, ...d.data() } as Product);
          });
          this.productsCache = list;
          this.isLoaded = true;
          this.dispatchStorageUpdate();
        }, (err) => {
          console.error('Firestore products sync error:', err);
        });
      } catch (err) {
        console.error('Failed setting up Firestore onSnapshot:', err);
      }
    }
  }

  private getStoredCustomProducts(): Product[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(CUSTOM_PRODUCTS_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as Product[]) : [];
    } catch (err) {
      console.warn('Failed reading custom products from localStorage:', err);
      return [];
    }
  }

  private saveCustomProducts(products: Product[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(CUSTOM_PRODUCTS_STORAGE_KEY, JSON.stringify(products));
      this.dispatchStorageUpdate();
    } catch (err) {
      console.warn('Failed saving custom products to localStorage:', err);
      throw new Error('Failed to save product metadata in browser storage.');
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

  public getAllProducts(): Product[] {
    if (isFirebaseConfigured && db && this.isLoaded) {
      return this.productsCache;
    }
    const overrides = this.getStoredSampleOverrides();
    const baseline = SAMPLE_PRODUCTS.map((p) => overrides[p.id] || p);
    const custom = this.getStoredCustomProducts();
    return [...baseline, ...custom];
  }

  public getPublishedProducts(): Product[] {
    return this.getAllProducts().filter((p) => p.status === 'published');
  }

  public getProductById(id: string): Product | null {
    const all = this.getAllProducts();
    return all.find((p) => p.id === id) || null;
  }

  public getProductBySlug(slug: string): Product | null {
    const all = this.getAllProducts();
    return all.find((p) => p.slug === slug) || null;
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

  public createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const id = `prod-custom-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date().toISOString();

    const newProduct: Product = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };

    if (isFirebaseConfigured && db) {
      const docRef = doc(db, 'products', id);
      setDoc(docRef, newProduct).catch((err) => {
        console.error('Failed to create product in Firestore:', err);
      });
    } else {
      const current = this.getStoredCustomProducts();
      this.saveCustomProducts([...current, newProduct]);
    }

    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Omit<Product, 'id' | 'sku' | 'createdAt'>>): Product | null {
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
      updateDoc(docRef, {
        ...updates,
        updatedAt: now
      }).catch((err) => {
        console.error('Failed to update product in Firestore:', err);
      });
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

  public setStatus(id: string, status: 'draft' | 'published' | 'archived'): Product | null {
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

  public toggleFeatured(id: string): Product | null {
    const existing = this.getProductById(id);
    if (!existing) return null;
    return this.updateProduct(id, { isFeatured: !existing.isFeatured });
  }
}

export const productRepository = new ProductRepository();
