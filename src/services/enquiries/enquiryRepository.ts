import { CustomerEnquiry, CreateEnquiryInput, EnquiryStatus } from './enquiryTypes';
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

class EnquiryRepository {
  private enquiriesCache: CustomerEnquiry[] = [];
  private isLoaded = false;

  constructor() {
    if (isFirebaseConfigured && db) {
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
          this.isLoaded = true;
          this.dispatchStorageUpdate();
        }, (err) => {
          console.error('Firestore enquiries sync error:', err);
        });
      } catch (err) {
        console.error('Failed setting up Firestore enquiries onSnapshot:', err);
      }
    }
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

  public getAllEnquiries(): CustomerEnquiry[] {
    if (isFirebaseConfigured && db && this.isLoaded) {
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

  public createEnquiry(input: CreateEnquiryInput): CustomerEnquiry {
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
      setDoc(docRef, newEnquiry).catch((err) => {
        console.error('Failed to save enquiry in Firestore:', err);
      });
    } else {
      const current = this.getAllEnquiries();
      this.saveEnquiries([newEnquiry, ...current]);
    }

    return newEnquiry;
  }

  public updateStatus(id: string, status: EnquiryStatus): CustomerEnquiry | null {
    const all = this.getAllEnquiries();
    const target = all.find((e) => e.id === id);
    if (!target) return null;

    if (isFirebaseConfigured && db) {
      const docRef = doc(db, 'enquiries', id);
      updateDoc(docRef, { status }).catch((err) => {
        console.error('Failed to update enquiry status in Firestore:', err);
      });
    } else {
      const updated = all.map((e) => (e.id === id ? { ...e, status } : e));
      this.saveEnquiries(updated);
    }

    return { ...target, status };
  }
}

export const enquiryRepository = new EnquiryRepository();
