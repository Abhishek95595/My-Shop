import { Product } from '../productTypes';
import { getAllPublishedProducts } from '../mockProducts';
import { ISavedItemsService, SavedListType } from './savedItemsTypes';

function getStorageKey(userId: string, listType: SavedListType): string {
  const safeUser = userId.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `koh_saved_${listType}_${safeUser}`;
}

class LocalStorageSavedItemsService implements ISavedItemsService {
  public getSavedProductIds(userId: string, listType: SavedListType): string[] {
    if (!userId || typeof window === 'undefined') return [];
    try {
      const key = getStorageKey(userId, listType);
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Return only unique non-empty string IDs
        return Array.from(new Set(parsed.filter((id): id is string => typeof id === 'string' && id.trim().length > 0)));
      }
      return [];
    } catch (err) {
      console.warn(`Failed reading ${listType} for user ${userId}:`, err);
      return [];
    }
  }

  /**
   * Reconciles saved IDs against published products.
   * Excludes draft, archived, or invalid IDs.
   */
  public getSavedProducts(userId: string, listType: SavedListType): Product[] {
    const savedIds = this.getSavedProductIds(userId, listType);
    if (savedIds.length === 0) return [];

    const published = getAllPublishedProducts();
    const productMap = new Map<string, Product>();
    published.forEach((p) => productMap.set(p.id, p));

    const matchedProducts: Product[] = [];
    savedIds.forEach((id) => {
      const product = productMap.get(id);
      if (product) {
        matchedProducts.push(product);
      }
    });

    return matchedProducts;
  }

  public addProduct(userId: string, listType: SavedListType, productId: string): boolean {
    if (!userId || !productId || typeof window === 'undefined') return false;

    // Verify product exists and is published
    const published = getAllPublishedProducts();
    const exists = published.some((p) => p.id === productId);
    if (!exists) return false;

    const currentIds = this.getSavedProductIds(userId, listType);
    if (currentIds.includes(productId)) {
      return false; // Already present (prevent duplicate)
    }

    const updatedIds = [...currentIds, productId];
    try {
      const key = getStorageKey(userId, listType);
      localStorage.setItem(key, JSON.stringify(updatedIds));
      return true;
    } catch (err) {
      console.warn(`Failed saving ${listType} item:`, err);
      return false;
    }
  }

  public removeProduct(userId: string, listType: SavedListType, productId: string): boolean {
    if (!userId || !productId || typeof window === 'undefined') return false;

    const currentIds = this.getSavedProductIds(userId, listType);
    if (!currentIds.includes(productId)) return false;

    const updatedIds = currentIds.filter((id) => id !== productId);
    try {
      const key = getStorageKey(userId, listType);
      localStorage.setItem(key, JSON.stringify(updatedIds));
      return true;
    } catch (err) {
      console.warn(`Failed removing ${listType} item:`, err);
      return false;
    }
  }

  public clearList(userId: string, listType: SavedListType): void {
    if (!userId || typeof window === 'undefined') return;
    try {
      const key = getStorageKey(userId, listType);
      localStorage.removeItem(key);
    } catch (err) {
      console.warn(`Failed clearing ${listType}:`, err);
    }
  }

  public isProductSaved(userId: string, listType: SavedListType, productId: string): boolean {
    if (!userId || !productId) return false;
    const currentIds = this.getSavedProductIds(userId, listType);
    return currentIds.includes(productId);
  }
}

export const savedItemsService: ISavedItemsService = new LocalStorageSavedItemsService();
