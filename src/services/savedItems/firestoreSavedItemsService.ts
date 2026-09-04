import { auth, db, isFirebaseConfigured } from '@/lib/firebase/client';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { RepositoryStatus } from '../types';
import { ISavedItemsService, SavedListType } from './savedItemsTypes';

class FirestoreSavedItemsService implements ISavedItemsService {
  private wishlistCache: Record<string, string[]> = {};
  private shortlistCache: Record<string, string[]> = {};
  private statuses = new Map<string, RepositoryStatus>();
  private loadErrors = new Map<string, Error | null>();
  private unsubscribes: Record<string, () => void> = {};
  private mutationsInFlight = new Map<string, Promise<boolean | void>>();

  private getListKey(userId: string, listType: SavedListType): string {
    return `${userId}:${listType}`;
  }

  private getMutationKey(
    operation: 'add' | 'remove' | 'clear',
    userId: string,
    listType: SavedListType,
    productId?: string
  ): string {
    return `${operation}:${this.getListKey(userId, listType)}:${productId || '*'}`;
  }

  private getCache(userId: string, listType: SavedListType): Record<string, string[]> {
    return listType === 'wishlist' ? this.wishlistCache : this.shortlistCache;
  }

  private getFirebaseDb() {
    if (!isFirebaseConfigured || !db) {
      throw new Error('Saved items are unavailable because Firebase is not configured.');
    }
    return db;
  }

  private assertFirebaseCustomer(userId: string): void {
    this.getFirebaseDb();
    if (!auth?.currentUser || auth.currentUser.uid !== userId) {
      throw new Error('Your Google session is no longer active. Please sign in and try again.');
    }
  }

  public startUserSync(userId: string, onUpdate: () => void): void {
    this.stopUserSync(userId);

    const setSetupFailure = (error: unknown) => {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      (['wishlist', 'shortlist'] as SavedListType[]).forEach((listType) => {
        const key = this.getListKey(userId, listType);
        this.statuses.set(key, 'error');
        this.loadErrors.set(key, normalizedError);
      });
      onUpdate();
    };

    try {
      const firestore = this.getFirebaseDb();
      const listenerUnsubscribes: Array<() => void> = [];

      (['wishlist', 'shortlist'] as SavedListType[]).forEach((listType) => {
        const key = this.getListKey(userId, listType);
        this.statuses.set(key, 'loading');
        this.loadErrors.set(key, null);

        const listRef = collection(firestore, 'users', userId, listType);
        const unsubscribe = onSnapshot(
          listRef,
          (snapshot) => {
            // The canonical product ID is the saved-item document ID. The
            // document body contains only savedAt; slugs are never used here.
            const ids = Array.from(new Set(snapshot.docs.map((savedItem) => savedItem.id)));
            this.getCache(userId, listType)[userId] = ids;
            this.statuses.set(key, 'ready');
            this.loadErrors.set(key, null);

            if (process.env.NODE_ENV === 'development') {
              console.debug(`[saved-items] Loaded ${listType} product IDs`, ids);
            }
            onUpdate();
          },
          (error) => {
            const normalizedError = error instanceof Error ? error : new Error(String(error));
            // Keep any previously confirmed IDs, but never present a failed
            // read as a successfully loaded empty list.
            this.statuses.set(key, 'error');
            this.loadErrors.set(key, normalizedError);
            console.error(`Firestore ${listType} sync error:`, normalizedError);
            onUpdate();
          }
        );
        listenerUnsubscribes.push(unsubscribe);
      });

      this.unsubscribes[userId] = () => {
        listenerUnsubscribes.forEach((unsubscribe) => unsubscribe());
      };
      onUpdate();
    } catch (error) {
      setSetupFailure(error);
    }
  }

  public stopUserSync(userId: string): void {
    this.unsubscribes[userId]?.();
    delete this.unsubscribes[userId];
  }

  public getSavedProductIds(userId: string, listType: SavedListType): string[] {
    return [...(this.getCache(userId, listType)[userId] || [])];
  }

  public getStatus(userId: string, listType: SavedListType): RepositoryStatus {
    return this.statuses.get(this.getListKey(userId, listType)) || 'loading';
  }

  public getLoadError(userId: string, listType: SavedListType): Error | null {
    return this.loadErrors.get(this.getListKey(userId, listType)) || null;
  }

  public async addProduct(
    userId: string,
    listType: SavedListType,
    productId: string
  ): Promise<boolean> {
    if (!userId || !productId) {
      throw new Error('A signed-in customer and product ID are required to save an item.');
    }

    this.assertFirebaseCustomer(userId);
    const mutationKey = this.getMutationKey('add', userId, listType, productId);
    if (this.mutationsInFlight.has(mutationKey)) return false;

    const firestore = this.getFirebaseDb();
    const cache = this.getCache(userId, listType);
    if ((cache[userId] || []).includes(productId)) return false;

    const savedItemRef = doc(firestore, 'users', userId, listType, productId);
    const operation = (async (): Promise<boolean> => {
      // Always confirm the canonical document path before writing. This also
      // prevents a duplicate write while the initial snapshot is still loading.
      const existing = await getDoc(savedItemRef);
      if (existing.exists()) {
        cache[userId] = Array.from(new Set([...(cache[userId] || []), productId]));
        return false;
      }

      await setDoc(savedItemRef, { savedAt: new Date().toISOString() });
      cache[userId] = Array.from(new Set([...(cache[userId] || []), productId]));
      return true;
    })();

    this.mutationsInFlight.set(mutationKey, operation);
    try {
      return await operation;
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(`Unable to save this ${listType} item in Cloud Firestore: ${detail}`);
    } finally {
      this.mutationsInFlight.delete(mutationKey);
    }
  }

  public async removeProduct(
    userId: string,
    listType: SavedListType,
    productId: string
  ): Promise<boolean> {
    if (!userId || !productId) return false;

    this.assertFirebaseCustomer(userId);
    const mutationKey = this.getMutationKey('remove', userId, listType, productId);
    if (this.mutationsInFlight.has(mutationKey)) return false;

    const firestore = this.getFirebaseDb();
    const cache = this.getCache(userId, listType);
    const savedItemRef = doc(firestore, 'users', userId, listType, productId);
    const operation = (async (): Promise<boolean> => {
      const existing = await getDoc(savedItemRef);
      if (!existing.exists()) {
        cache[userId] = (cache[userId] || []).filter((id) => id !== productId);
        return false;
      }

      await deleteDoc(savedItemRef);
      cache[userId] = (cache[userId] || []).filter((id) => id !== productId);
      return true;
    })();

    this.mutationsInFlight.set(mutationKey, operation);
    try {
      return await operation;
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(`Unable to remove this ${listType} item from Cloud Firestore: ${detail}`);
    } finally {
      this.mutationsInFlight.delete(mutationKey);
    }
  }

  public async clearList(userId: string, listType: SavedListType): Promise<void> {
    if (!userId) return;

    this.assertFirebaseCustomer(userId);
    const mutationKey = this.getMutationKey('clear', userId, listType);
    const existingOperation = this.mutationsInFlight.get(mutationKey);
    if (existingOperation) {
      await existingOperation;
      return;
    }

    const firestore = this.getFirebaseDb();
    const operation = (async (): Promise<void> => {
      // Read the collection instead of trusting a possibly stale cache, so a
      // clear never leaves unseen saved documents behind.
      const snapshot = await getDocs(collection(firestore, 'users', userId, listType));
      if (snapshot.empty) {
        this.getCache(userId, listType)[userId] = [];
        return;
      }

      const batch = writeBatch(firestore);
      snapshot.docs.forEach((savedItem) => batch.delete(savedItem.ref));
      await batch.commit();
      this.getCache(userId, listType)[userId] = [];
    })();

    this.mutationsInFlight.set(mutationKey, operation);
    try {
      await operation;
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(`Unable to clear the ${listType} in Cloud Firestore: ${detail}`);
    } finally {
      this.mutationsInFlight.delete(mutationKey);
    }
  }
}

export const firestoreSavedItemsService = new FirestoreSavedItemsService();
