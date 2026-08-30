import { Product } from '../productTypes';
import { productRepository } from '../products/productRepository';
import { ISavedItemsService, SavedListType } from './savedItemsTypes';
import { db, auth, isFirebaseConfigured } from '@/lib/firebase/client';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { savedItemsService as mockSavedItemsService } from './savedItemsService';

class FirestoreSavedItemsService implements ISavedItemsService {
  private wishlistCache: Record<string, string[]> = {};
  private shortlistCache: Record<string, string[]> = {};
  private unsubscribes: Record<string, () => void> = {};

  public startUserSync(userId: string, onUpdate: () => void) {
    if (!isFirebaseConfigured || !db || !userId) return;

    this.stopUserSync(userId);

    const wishlistRef = collection(db!, 'users', userId, 'wishlist');
    const unsubWishlist = onSnapshot(wishlistRef, (snapshot) => {
      const ids: string[] = [];
      snapshot.forEach((d) => ids.push(d.id));
      this.wishlistCache[userId] = ids;
      onUpdate();
    }, (err) => {
      console.error('Firestore wishlist sync error:', err);
    });

    const shortlistRef = collection(db!, 'users', userId, 'shortlist');
    const unsubShortlist = onSnapshot(shortlistRef, (snapshot) => {
      const ids: string[] = [];
      snapshot.forEach((d) => ids.push(d.id));
      this.shortlistCache[userId] = ids;
      onUpdate();
    }, (err) => {
      console.error('Firestore shortlist sync error:', err);
    });

    this.unsubscribes[userId] = () => {
      unsubWishlist();
      unsubShortlist();
    };

    this.migrateLegacyData(userId);
  }

  public stopUserSync(userId: string) {
    if (this.unsubscribes[userId]) {
      this.unsubscribes[userId]();
      delete this.unsubscribes[userId];
    }
  }

  private async migrateLegacyData(userId: string) {
    if (!isFirebaseConfigured || !db || !userId || !auth) return;
    
    const currentUserEmail = auth.currentUser?.email;
    if (!currentUserEmail) return;

    const normalizedEmail = currentUserEmail.trim().toLowerCase();
    const migrationMarkerKey = `koh_migration_done_${userId}`;
    if (localStorage.getItem(migrationMarkerKey)) return;

    const oldCustomerId = `mock-user-gmail-${encodeURIComponent(normalizedEmail)}`;
    const legacyWishlistIds = mockSavedItemsService.getSavedProductIds(oldCustomerId, 'wishlist');
    const legacyShortlistIds = mockSavedItemsService.getSavedProductIds(oldCustomerId, 'shortlist');

    if (legacyWishlistIds.length === 0 && legacyShortlistIds.length === 0) {
      localStorage.setItem(migrationMarkerKey, 'true');
      return;
    }

    try {
      // Do not migrate while the Firestore published-products cache is still
      // loading. A temporary [] must NOT be interpreted as "no valid products"
      // and accidentally discard legacy wishlist/shortlist IDs.
      const publishedStatus = productRepository.getPublishedStatus();
      if (publishedStatus !== 'ready') {
        // Retry migration on the next 'koh_products_updated' event.
        return;
      }

      const publishedProducts = productRepository.getPublishedProducts();
      const publishedIds = new Set(publishedProducts.map((p) => p.id));

      const validWishlistIds = legacyWishlistIds.filter((id) => publishedIds.has(id));
      const validShortlistIds = legacyShortlistIds.filter((id) => publishedIds.has(id));

      const batch = writeBatch(db!);
      
      validWishlistIds.forEach((productId) => {
        const ref = doc(db!, 'users', userId, 'wishlist', productId);
        batch.set(ref, { savedAt: new Date().toISOString() });
      });

      validShortlistIds.forEach((productId) => {
        const ref = doc(db!, 'users', userId, 'shortlist', productId);
        batch.set(ref, { savedAt: new Date().toISOString() });
      });

      await batch.commit();

      mockSavedItemsService.clearList(oldCustomerId, 'wishlist');
      mockSavedItemsService.clearList(oldCustomerId, 'shortlist');
      
      localStorage.setItem(migrationMarkerKey, 'true');
    } catch (err) {
      console.error('Safe legacy migration failed:', err);
    }
  }

  public getSavedProductIds(userId: string, listType: SavedListType): string[] {
    if (!isFirebaseConfigured || !db) {
      return mockSavedItemsService.getSavedProductIds(userId, listType);
    }
    const cache = listType === 'wishlist' ? this.wishlistCache : this.shortlistCache;
    return cache[userId] || [];
  }

  public getSavedProducts(userId: string, listType: SavedListType): Product[] {
    const ids = this.getSavedProductIds(userId, listType);
    if (ids.length === 0) return [];
    const published = productRepository.getPublishedProducts();
    return published.filter((p) => ids.includes(p.id));
  }

  public addProduct(userId: string, listType: SavedListType, productId: string): boolean {
    if (!isFirebaseConfigured || !db || !userId || !productId) {
      return mockSavedItemsService.addProduct(userId, listType, productId);
    }

    const published = productRepository.getPublishedProducts();
    if (!published.some((p) => p.id === productId)) return false;

    const ref = doc(db!, 'users', userId, listType, productId);
    setDoc(ref, { savedAt: new Date().toISOString() }).catch((err) => {
      console.error(`Failed adding ${listType} item in Firestore:`, err);
    });
    return true;
  }

  public removeProduct(userId: string, listType: SavedListType, productId: string): boolean {
    if (!isFirebaseConfigured || !db || !userId || !productId) {
      return mockSavedItemsService.removeProduct(userId, listType, productId);
    }

    const ref = doc(db!, 'users', userId, listType, productId);
    deleteDoc(ref).catch((err) => {
      console.error(`Failed removing ${listType} item in Firestore:`, err);
    });
    return true;
  }

  public clearList(userId: string, listType: SavedListType): void {
    if (!isFirebaseConfigured || !db || !userId) {
      mockSavedItemsService.clearList(userId, listType);
      return;
    }

    const ids = this.getSavedProductIds(userId, listType);
    const batch = writeBatch(db!);
    ids.forEach((productId) => {
      const ref = doc(db!, 'users', userId, listType, productId);
      batch.delete(ref);
    });
    batch.commit().catch((err) => {
      console.error(`Failed clearing ${listType} in Firestore:`, err);
    });
  }

  public isProductSaved(userId: string, listType: SavedListType, productId: string): boolean {
    const ids = this.getSavedProductIds(userId, listType);
    return ids.includes(productId);
  }
}

export const firestoreSavedItemsService = new FirestoreSavedItemsService();
