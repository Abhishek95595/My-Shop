import { CustomerEnquiry, CreateEnquiryInput, EnquiryStatus } from './enquiryTypes';

const ENQUIRIES_STORAGE_KEY = 'koh_customer_enquiries';

export function normalizeIndianMobile(raw: string): string | null {
  if (!raw) return null;
  // Remove all non-digits
  let digits = raw.replace(/\D/g, '');
  // Strip leading 91 if 12 digits
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.substring(2);
  }
  // Strip leading 0 if 11 digits
  if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.substring(1);
  }
  // Valid Indian mobile: 10 digits starting with 6, 7, 8, or 9
  if (/^[6-9]\d{9}$/.test(digits)) {
    return digits;
  }
  return null;
}

class MockEnquiryRepository {
  public getAllEnquiries(): CustomerEnquiry[] {
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
      if (typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new Event('koh_enquiries_updated'));
      }
    } catch (err) {
      console.warn('Failed saving enquiries to localStorage:', err);
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

    const newEnquiry: CustomerEnquiry = {
      id: `enq-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      name: trimmedName,
      mobile: `+91 ${normalizedMobile}`,
      categoryOrProduct,
      message: trimmedMessage,
      status: 'new', // Customer never selects status
      createdAt: new Date().toISOString(),
    };

    const current = this.getAllEnquiries();
    this.saveEnquiries([newEnquiry, ...current]);
    return newEnquiry;
  }

  public updateStatus(id: string, status: EnquiryStatus): CustomerEnquiry | null {
    const current = this.getAllEnquiries();
    const target = current.find((e) => e.id === id);
    if (!target) return null;

    const updated = current.map((e) => (e.id === id ? { ...e, status } : e));
    this.saveEnquiries(updated);
    return { ...target, status };
  }
}

export const enquiryRepository = new MockEnquiryRepository();
