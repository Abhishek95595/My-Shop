import { RateItem, CreateRateInput } from './ratesTypes';
import { RepositoryStatus } from '../types';
import { db, isFirebaseConfigured } from '@/lib/firebase/client';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';

const RATES_STORAGE_KEY = 'koh_owner_rates';

/**
 * Two independent Firestore streams back this repository, because Firestore
 * security rules are not filters:
 *
 * - The PUBLIC stream is constrained with where('isActive', '==', true) so
 *   it satisfies `allow read: if resource.data.isActive == true` for
 *   unauthenticated visitors. Every public rate surface reads this stream.
 * - The ADMIN stream lists the rates collection unfiltered, which only
 *   satisfies the rules for a caller matching isAdmin(). It is started lazily
 *   so a public visitor never issues a query that is guaranteed to be denied.
 */
class RatesRepository {
  private publicCache: RateItem[] = [];
  private publicStatus: RepositoryStatus = 'ready';
  private publicError: Error | null = null;
  private publicListenerStarted = false;

  private adminCache: RateItem[] = [];
  private adminStatus: RepositoryStatus = 'ready';
  private adminError: Error | null = null;
  private adminListenerStarted = false;

  /** Public rates stream: active rates only, readable by anyone. */
  private ensurePublicListener(): void {
    if (!isFirebaseConfigured || !db || this.publicListenerStarted) return;
    this.publicListenerStarted = true;
    this.publicStatus = 'loading';

    try {
      const activeQuery = query(
        collection(db, 'rates'),
        where('isActive', '==', true)
      );
      onSnapshot(activeQuery, (snapshot) => {
        const list: RateItem[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() } as RateItem);
        });
        this.publicCache = list;
        this.publicStatus = 'ready';
        this.publicError = null;
        this.dispatchStorageUpdate();
      }, (err) => {
        console.error('Firestore public rates sync error:', err);
        this.publicCache = [];
        this.publicStatus = 'error';
        this.publicError = err instanceof Error ? err : new Error(String(err));
        this.dispatchStorageUpdate();
      });
    } catch (err) {
      console.error('Failed setting up Firestore public rates listener:', err);
      this.publicCache = [];
      this.publicStatus = 'error';
      this.publicError = err instanceof Error ? err : new Error(String(err));
      this.dispatchStorageUpdate();
    }
  }

  /** Admin stream: the full rates collection, permitted only for isAdmin(). */
  private ensureAdminListener(): void {
    if (!isFirebaseConfigured || !db || this.adminListenerStarted) return;
    this.adminListenerStarted = true;
    this.adminStatus = 'loading';

    try {
      const ratesRef = collection(db, 'rates');
      onSnapshot(ratesRef, (snapshot) => {
        const list: RateItem[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() } as RateItem);
        });
        this.adminCache = list;
        this.adminStatus = 'ready';
        this.adminError = null;
        this.dispatchStorageUpdate();
      }, (err) => {
        console.error('Firestore admin rates sync error:', err);
        this.adminCache = [];
        this.adminStatus = 'error';
        this.adminError = err instanceof Error ? err : new Error(String(err));
        this.dispatchStorageUpdate();
      });
    } catch (err) {
      console.error('Failed setting up Firestore admin rates listener:', err);
      this.adminCache = [];
      this.adminStatus = 'error';
      this.adminError = err instanceof Error ? err : new Error(String(err));
      this.dispatchStorageUpdate();
    }
  }

  /** Load state of the admin (unfiltered) Firestore rates listener. */
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

  /** Load state of the public active-rates Firestore listener. */
  public getPublicStatus(): RepositoryStatus {
    if (isFirebaseConfigured && db) {
      this.ensurePublicListener();
      return this.publicStatus;
    }
    return 'ready';
  }

  /** The Firestore failure that put the public stream into the 'error' state. */
  public getPublicLoadError(): Error | null {
    return this.publicError;
  }

  private dispatchStorageUpdate() {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      try {
        window.dispatchEvent(new Event('koh_rates_updated'));
      } catch (err) {
        console.warn('Dispatch event warning:', err);
      }
    }
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

  /**
   * ADMIN scope. In Firebase mode this returns only Firestore-backed data from
   * the unfiltered admin listener: empty while 'loading' and cleared on 'error'.
   * Callers must consult getStatus() to tell "zero rates" from "Firestore
   * failed to load". There is no localStorage fallback in Firebase mode.
   */
  public getAllRates(): RateItem[] {
    if (isFirebaseConfigured && db) {
      this.ensureAdminListener();
      return this.adminCache;
    }
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(RATES_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as RateItem[]) : [];
    } catch {
      return [];
    }
  }

  /**
   * PUBLIC scope. In Firebase mode this returns the where(isActive == true)
   * Firestore stream and nothing else: empty while 'loading' and cleared on
   * 'error'. Callers must consult getPublicStatus().
   */
  public getActiveRates(): RateItem[] {
    if (isFirebaseConfigured && db) {
      this.ensurePublicListener();
      return this.publicCache;
    }
    return this.getAllRates().filter((r) => r.isActive && r.rate > 0);
  }

  private saveRates(rates: RateItem[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(RATES_STORAGE_KEY, JSON.stringify(rates));
      this.dispatchStorageUpdate();
    } catch (err) {
      console.warn('Failed saving rates to localStorage:', err);
    }
  }

  /**
   * Resolves only after Firestore has accepted the write. A rejection propagates
   * to the caller so the UI can never report a success that did not happen.
   */
  public async addRate(input: CreateRateInput): Promise<RateItem> {
    const trimmedLabel = input.label.trim();
    if (!trimmedLabel) throw new Error('Rate label is required.');
    if (typeof input.rate !== 'number' || input.rate <= 0) {
      throw new Error('Numeric rate must be greater than zero.');
    }

    const id = `rate-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date().toISOString();

    const newRate: RateItem = {
      ...input,
      id,
      label: trimmedLabel,
      material: input.material.trim() || '22K Gold',
      unit: input.unit.trim() || 'per gram',
      lastUpdated: now,
    };

    if (isFirebaseConfigured && db) {
      const docRef = doc(db, 'rates', id);
      await this.runWrite('Rate creation', setDoc(docRef, newRate));
    } else {
      const current = this.getAllRates();
      this.saveRates([...current, newRate]);
    }

    return newRate;
  }

  /**
   * Resolves only after Firestore has accepted the write. A rejection propagates
   * to the caller so the UI can never report a success that did not happen.
   */
  public async updateRate(id: string, updates: Partial<CreateRateInput>): Promise<RateItem | null> {
    const all = this.getAllRates();
    const target = all.find((r) => r.id === id);
    if (!target) return null;

    const nextLabel = updates.label?.trim() ?? target.label;
    const nextRate = updates.rate ?? target.rate;
    if (!nextLabel) throw new Error('Rate label is required.');
    if (typeof nextRate !== 'number' || nextRate <= 0) {
      throw new Error('Numeric rate must be greater than zero.');
    }

    const now = new Date().toISOString();
    const updated: RateItem = {
      ...target,
      ...updates,
      id: target.id,
      label: nextLabel,
      material: updates.material?.trim() || target.material,
      unit: updates.unit?.trim() || target.unit,
      rate: nextRate,
      lastUpdated: now,
    };

    if (isFirebaseConfigured && db) {
      const docRef = doc(db, 'rates', id);
      await this.runWrite('Rate update', updateDoc(docRef, {
        ...updates,
        label: nextLabel,
        rate: nextRate,
        material: updates.material?.trim() || target.material,
        unit: updates.unit?.trim() || target.unit,
        lastUpdated: now
      }));
    } else {
      const next = all.map((r) => (r.id === id ? updated : r));
      this.saveRates(next);
    }

    return updated;
  }

  /**
   * Resolves only after Firestore has accepted the write. A rejection propagates
   * to the caller so the UI can never report a success that did not happen.
   */
  public async deleteRate(id: string): Promise<void> {
    if (isFirebaseConfigured && db) {
      const docRef = doc(db, 'rates', id);
      await this.runWrite('Rate deletion', deleteDoc(docRef));
    } else {
      const current = this.getAllRates();
      const next = current.filter((r) => r.id !== id);
      this.saveRates(next);
    }
  }

  public async toggleActive(id: string): Promise<RateItem | null> {
    const all = this.getAllRates();
    const target = all.find((r) => r.id === id);
    if (!target) return null;
    return this.updateRate(id, { isActive: !target.isActive });
  }
}

export const ratesRepository = new RatesRepository();
