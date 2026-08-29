import { RateItem, CreateRateInput } from './ratesTypes';
import { db, isFirebaseConfigured } from '@/lib/firebase/client';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc,
  deleteDoc
} from 'firebase/firestore';

const RATES_STORAGE_KEY = 'koh_owner_rates';

class RatesRepository {
  private ratesCache: RateItem[] = [];
  private isLoaded = false;

  constructor() {
    if (isFirebaseConfigured && db) {
      try {
        const ratesRef = collection(db, 'rates');
        onSnapshot(ratesRef, (snapshot) => {
          const list: RateItem[] = [];
          snapshot.forEach((d) => {
            list.push({ id: d.id, ...d.data() } as RateItem);
          });
          this.ratesCache = list;
          this.isLoaded = true;
          this.dispatchStorageUpdate();
        }, (err) => {
          console.error('Firestore rates sync error:', err);
        });
      } catch (err) {
        console.error('Failed setting up Firestore rates onSnapshot:', err);
      }
    }
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

  public getAllRates(): RateItem[] {
    if (isFirebaseConfigured && db && this.isLoaded) {
      return this.ratesCache;
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

  public getActiveRates(): RateItem[] {
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

  public addRate(input: CreateRateInput): RateItem {
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
      setDoc(docRef, newRate).catch((err) => {
        console.error('Failed to add rate to Firestore:', err);
      });
    } else {
      const current = this.getAllRates();
      this.saveRates([...current, newRate]);
    }

    return newRate;
  }

  public updateRate(id: string, updates: Partial<CreateRateInput>): RateItem | null {
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
      updateDoc(docRef, {
        ...updates,
        label: nextLabel,
        rate: nextRate,
        material: updates.material?.trim() || target.material,
        unit: updates.unit?.trim() || target.unit,
        lastUpdated: now
      }).catch((err) => {
        console.error('Failed to update rate in Firestore:', err);
      });
    } else {
      const next = all.map((r) => (r.id === id ? updated : r));
      this.saveRates(next);
    }

    return updated;
  }

  public deleteRate(id: string): void {
    if (isFirebaseConfigured && db) {
      const docRef = doc(db, 'rates', id);
      deleteDoc(docRef).catch((err) => {
        console.error('Failed to delete rate from Firestore:', err);
      });
    } else {
      const current = this.getAllRates();
      const next = current.filter((r) => r.id !== id);
      this.saveRates(next);
    }
  }

  public toggleActive(id: string): RateItem | null {
    const all = this.getAllRates();
    const target = all.find((r) => r.id === id);
    if (!target) return null;
    return this.updateRate(id, { isActive: !target.isActive });
  }
}

export const ratesRepository = new RatesRepository();
