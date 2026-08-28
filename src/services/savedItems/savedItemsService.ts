import { Product } from '../productTypes';
import { getAllPublishedProducts } from '../mockProducts';
import { ISavedItemsService, SavedListType } from './savedItemsTypes';

function getStorageKey(userId: string, listType: SavedListType): string {
  return `koh_saved_${listType}_${userId}`;
}

class LocalStorageSavedItemsService implements ISavedItemsService {
  /**
   * Safe one-time migration for legacy mock customer keys.
   * Merges legacy items into the new encoded key, removes duplicates,
   * reconciles against published products, and cleans up legacy keys only after success.
   */
  private migrateLegacyDataIfPresent(userId: string, listType: SavedListType): void {
    if (!userId || typeof window === 'undefined') return;

    const currentKey = getStorageKey(userId, listType);
    const legacyKeysToInspect: string[] = [];

    // Derive possible legacy keys from new userId (mock-user-gmail-<encodedEmail>)
    if (userId.startsWith('mock-user-gmail-')) {
      const encodedPart = userId.replace('mock-user-gmail-', '');
      try {
        const decodedEmail = decodeURIComponent(encodedPart).trim().toLowerCase();
        const legacySlug = decodedEmail.replace(/[^a-z0-9]/g, '_');
        const legacyKey1 = `koh_saved_${listType}_mock-user-gmail-${legacySlug}`;
        const legacyKey2 = `koh_saved_${listType}_mock-user-${legacySlug}`;
        const legacyKey3 = `koh_saved_${listType}_${legacySlug}`;

        if (legacyKey1 !== currentKey) legacyKeysToInspect.push(legacyKey1);
        if (legacyKey2 !== currentKey) legacyKeysToInspect.push(legacyKey2);
        if (legacyKey3 !== currentKey) legacyKeysToInspect.push(legacyKey3);
      } catch (err) {
        console.warn('Migration legacy decoding warning:', err);
      }
    }

    for (const legacyKey of legacyKeysToInspect) {
      try {
        const legacyRaw = localStorage.getItem(legacyKey);
        if (!legacyRaw) continue;

        let legacyIds: string[] = [];
        try {
          const parsed = JSON.parse(legacyRaw);
          if (Array.isArray(parsed)) {
            legacyIds = parsed.filter(
              (id): id is string => typeof id === 'string' && id.trim().length > 0
            );
          }
        } catch {
          // Corrupted legacy JSON, safely delete key
          localStorage.removeItem(legacyKey);
          continue;
        }

        if (legacyIds.length > 0) {
          // Read current items under new key (if any exist)
          let currentIds: string[] = [];
          const currentRaw = localStorage.getItem(currentKey);
          if (currentRaw) {
            try {
              const parsedCurrent = JSON.parse(currentRaw);
              if (Array.isArray(parsedCurrent)) {
                currentIds = parsedCurrent.filter(
                  (id): id is string => typeof id === 'string' && id.trim().length > 0
                );
              }
            } catch {
              currentIds = [];
            }
          }

          // Merge without duplicates and filter against published products
          const published = getAllPublishedProducts();
          const publishedIdSet = new Set(published.map((p) => p.id));
          const merged = Array.from(new Set([...currentIds, ...legacyIds])).filter(
            (id) => publishedIdSet.has(id)
          );

          localStorage.setItem(currentKey, JSON.stringify(merged));
        }

        // Remove legacy key after successful migration
        localStorage.removeItem(legacyKey);
      } catch (err) {
        console.warn(`Safe legacy migration encountered error for key ${legacyKey}:`, err);
      }
    }
  }

  public getSavedProductIds(userId: string, listType: SavedListType): string[] {
    if (!userId || typeof window === 'undefined') return [];
    try {
      // Run safe migration check first
      this.migrateLegacyDataIfPresent(userId, listType);

      const key = getStorageKey(userId, listType);
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return Array.from(
          new Set(parsed.filter((id): id is string => typeof id === 'string' && id.trim().length > 0))
        );
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
