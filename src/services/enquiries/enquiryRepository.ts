import { CustomerEnquiry, CreateEnquiryInput, EnquiryStatus } from './enquiryTypes';
import { RepositoryStatus } from '../types';
import { db, isFirebaseConfigured } from '@/lib/firebase/client';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc
} from 'firebase/firestore';

const ENQUIRIES_STORAGE_KEY = 'koh_customer_enquiries';

export function normalizeIndianMobile(raw: string): string | null {
  if (!raw) return null;
  let digits = raw.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.substring(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.substring(1);
  }
  if (/^[6-9]\d{9}$/.test(digits)) {
    return digits;
  }
  return null;
}

/**
 * Enquiry repository with admin-lazy Firestore listener.
 *
 * The unfiltered enquiries collection read is only permitted for isAdmin()
 * according to deployed Firestore rules. The listener is therefore NOT started
 * in the constructor — it is started lazily when an authenticated admin
 * consumer first requests enquiry data via getAllEnquiries() or getStatus().
 *
 * Public visitors only ever call createEnquiry(), which uses a direct
 * setDoc() that satisfies the `allow create` rule — no collection listener
 * is opened.
 */
class EnquiryRepository {
  private enquiriesCache: CustomerEnquiry[] = [];
  private status: RepositoryStatus = 'ready';
  private loadError: Error | null = null;
  private adminListenerStarted = false;

  /** Admin stream: the full enquiries collection, permitted only for isAdmin(). */
  private ensureAdminListener(): void {
    if (!isFirebaseConfigured || !db || this.adminListenerStarted) return;
    this.adminListenerStarted = true;
    this.status = 'loading';

    try {
      const enquiriesRef = collection(db, 'enquiries');
      onSnapshot(enquiriesRef, (snapshot) => {
        const list: CustomerEnquiry[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() } as CustomerEnquiry);
        });
        // Sort descending by createdAt
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.enquiriesCache = list;
        this.status = 'ready';
        this.loadError = null;
        this.dispatchStorageUpdate();
      }, (err) => {
        console.error('Firestore enquiries sync error:', err);
        this.setLoadFailure(err);
      });
    } catch (err) {
      console.error('Failed setting up Firestore enquiries onSnapshot:', err);
      this.setLoadFailure(err);
    }
  }

  /**
   * Records a Firestore load failure. The cache is cleared so callers can never
   * mistake a failed load for an empty collection, and no localStorage data is
   * substituted in Firebase mode.
   */
  private setLoadFailure(err: unknown): void {
    this.enquiriesCache = [];
    this.status = 'error';
    this.loadError = err instanceof Error ? err : new Error(String(err));
    this.dispatchStorageUpdate();
  }

  /**
   * Load state of the Firestore enquiries listener.
   * Starts the admin listener lazily — only admin consumers call this.
   */
  public getStatus(): RepositoryStatus {
    if (isFirebaseConfigured && db) {
      this.ensureAdminListener();
      return this.status;
    }
    return 'ready';
  }

  /** The Firestore failure that put this repository into the 'error' state. */
  public getLoadError(): Error | null {
    return this.loadError;
  }

  private dispatchStorageUpdate() {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      try {
        window.dispatchEvent(new Event('koh_enquiries_updated'));
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
   * In Firebase mode this returns only Firestore-backed data: the live snapshot
   * cache, which is empty while 'loading' and cleared on 'error'. Callers must
   * consult getStatus() to tell "zero enquiries" from "Firestore failed to load".
   * There is no localStorage fallback in Firebase mode.
   *
   * Starts the admin listener lazily — only admin consumers call this.
   */
  public getAllEnquiries(): CustomerEnquiry[] {
    if (isFirebaseConfigured && db) {
      this.ensureAdminListener();
      return this.enquiriesCache;
    }
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(ENQUIRIES_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as CustomerEnquiry[]) : [];
    } catch {
      return [];
    }
  }

  private saveEnquiries(list: CustomerEnquiry[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(ENQUIRIES_STORAGE_KEY, JSON.stringify(list));
      this.dispatchStorageUpdate();
    } catch (err) {
      console.warn('Failed saving enquiries to localStorage:', err);
      throw new Error(
        'Unable to save your inquiry in browser storage. Please check your browser storage settings and try again.'
      );
    }
  }

  /**
   * Resolves only after Firestore has accepted the write. A rejection propagates
   * to the caller so the UI can never report a success that did not happen.
   */
  public async createEnquiry(input: CreateEnquiryInput): Promise<CustomerEnquiry> {
    const trimmedName = input.name.trim();
    if (!trimmedName) {
      throw new Error('Name is required.');
    }

    const normalizedMobile = normalizeIndianMobile(input.mobile);
    if (!normalizedMobile) {
      throw new Error('Please enter a valid 10-digit Indian mobile number.');
    }

    const categoryOrProduct = input.categoryOrProduct.trim();
    if (!categoryOrProduct) {
      throw new Error('Please select or specify your jewellery interest.');
    }

    const trimmedMessage = input.message ? input.message.trim() : undefined;
    if (trimmedMessage && trimmedMessage.length > 1000) {
      throw new Error('Optional message must be 1000 characters or fewer.');
    }

    const id = `enq-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date().toISOString();

    const newEnquiry: CustomerEnquiry = {
      id,
      name: trimmedName,
      mobile: `+91 ${normalizedMobile}`,
      categoryOrProduct,
      message: trimmedMessage,
      status: 'new',
      createdAt: now,
    };

    if (isFirebaseConfigured && db) {
      const docRef = doc(db, 'enquiries', id);
      await this.runWrite('Enquiry submission', setDoc(docRef, newEnquiry));
    } else {
      const current = this.getAllEnquiries();
      this.saveEnquiries([newEnquiry, ...current]);
    }

    return newEnquiry;
  }

  /**
   * Resolves only after Firestore has accepted the write. A rejection propagates
   * to the caller so the UI can never report a success that did not happen.
   */
  public async updateStatus(id: string, status: EnquiryStatus): Promise<CustomerEnquiry | null> {
    const all = this.getAllEnquiries();
    const target = all.find((e) => e.id === id);
    if (!target) return null;

    if (isFirebaseConfigured && db) {
      const docRef = doc(db, 'enquiries', id);
      await this.runWrite('Enquiry status update', updateDoc(docRef, { status }));
    } else {
      const updated = all.map((e) => (e.id === id ? { ...e, status } : e));
      this.saveEnquiries(updated);
    }

    return { ...target, status };
  }
}

export const enquiryRepository = new EnquiryRepository();
