import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  enquiryRepository,
  buildEnquiryDocument,
  PersistedEnquiryDocument,
} from './enquiryRepository';
import { CreateEnquiryInput } from './enquiryTypes';
import { setDoc, doc } from 'firebase/firestore';

let mockIsFirebaseConfigured = true;
let mockDb: any = { type: 'firestore-mock' };

vi.mock('@/lib/firebase/client', () => {
  return {
    get isFirebaseConfigured() {
      return mockIsFirebaseConfigured;
    },
    get db() {
      return mockDb;
    },
    auth: null,
    storage: null,
  };
});

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual<typeof import('firebase/firestore')>('firebase/firestore');
  return {
    ...actual,
    setDoc: vi.fn().mockResolvedValue(undefined),
    doc: vi.fn((_db, _coll, id) => ({ id, path: `enquiries/${id}` })),
  };
});

let localStore: Record<string, string> = {};

const mockLocalStorage = {
  getItem: vi.fn((key: string) => localStore[key] || null),
  setItem: vi.fn((key: string, val: string) => {
    localStore[key] = String(val);
  }),
  removeItem: vi.fn((key: string) => {
    delete localStore[key];
  }),
  clear: vi.fn(() => {
    localStore = {};
  }),
};

const mockWindow = {
  localStorage: mockLocalStorage,
  dispatchEvent: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

if (typeof globalThis.window === 'undefined') {
  (globalThis as unknown as { window: typeof mockWindow }).window = mockWindow;
}
if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as unknown as { localStorage: typeof mockLocalStorage }).localStorage = mockLocalStorage;
}
if (typeof globalThis.Event === 'undefined') {
  (globalThis as any).Event = class Event {
    constructor(public type: string) {}
  };
}

describe('Enquiry Repository & Document Schema', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStore = {};
    mockIsFirebaseConfigured = true;
    mockDb = { type: 'firestore-mock' };
  });

  describe('1. Document Builder & Schema Contract', () => {
    const validBaseInput: CreateEnquiryInput = {
      name: 'Rohan Sharma',
      mobile: '9876543210',
      categoryOrProduct: 'Bridal Necklace Set',
      message: 'Looking for 22K bridal jewellery options.',
    };

    it('1: valid enquiry constructs allowed Firestore payload', () => {
      const docPayload = buildEnquiryDocument(validBaseInput, '2026-09-05T12:00:00.000Z');
      expect(docPayload).toEqual({
        name: 'Rohan Sharma',
        mobile: '+91 9876543210',
        categoryOrProduct: 'Bridal Necklace Set',
        message: 'Looking for 22K bridal jewellery options.',
        status: 'new',
        createdAt: '2026-09-05T12:00:00.000Z',
      });
    });

    it('2: persisted payload does NOT contain id', () => {
      const docPayload = buildEnquiryDocument(validBaseInput);
      expect('id' in docPayload).toBe(false);
      expect((docPayload as any).id).toBeUndefined();
    });

    it('3: exact Firestore payload keys match the strict rule contract', () => {
      const docPayload = buildEnquiryDocument(validBaseInput);
      const keys = Object.keys(docPayload).sort();
      const expectedKeys = [
        'categoryOrProduct',
        'createdAt',
        'message',
        'mobile',
        'name',
        'status',
      ].sort();

      expect(keys).toEqual(expectedKeys);
    });

    it('4: blank optional message persists as empty string ""', () => {
      const inputWithBlankMessage: CreateEnquiryInput = {
        ...validBaseInput,
        message: '',
      };
      const docPayload = buildEnquiryDocument(inputWithBlankMessage);
      expect(docPayload.message).toBe('');
      expect(typeof docPayload.message).toBe('string');
    });

    it('5: whitespace-only message persists as empty string ""', () => {
      const inputWithWhitespaceMessage: CreateEnquiryInput = {
        ...validBaseInput,
        message: '    \n\t  ',
      };
      const docPayload = buildEnquiryDocument(inputWithWhitespaceMessage);
      expect(docPayload.message).toBe('');
      expect(typeof docPayload.message).toBe('string');
    });

    it('6: omitted optional message persists as empty string ""', () => {
      const inputWithoutMessage: CreateEnquiryInput = {
        name: 'Pooja Verma',
        mobile: '9876543210',
        categoryOrProduct: 'Gold Bangles',
      };
      const docPayload = buildEnquiryDocument(inputWithoutMessage);
      expect(docPayload.message).toBe('');
      expect(typeof docPayload.message).toBe('string');
    });

    it('7: normal message is trimmed and preserved', () => {
      const input: CreateEnquiryInput = {
        ...validBaseInput,
        message: '   Need customization on the pendant.   ',
      };
      const docPayload = buildEnquiryDocument(input);
      expect(docPayload.message).toBe('Need customization on the pendant.');
    });

    it('8: message > 1000 characters is rejected', () => {
      const oversizedMessage = 'A'.repeat(1001);
      expect(() =>
        buildEnquiryDocument({
          ...validBaseInput,
          message: oversizedMessage,
        })
      ).toThrow(/Optional message must be 1000 characters or fewer/);
    });

    it('9: blank name is rejected', () => {
      expect(() =>
        buildEnquiryDocument({
          ...validBaseInput,
          name: '   ',
        })
      ).toThrow(/Name is required/);
    });

    it('10: name > 100 characters is rejected', () => {
      const oversizedName = 'N'.repeat(101);
      expect(() =>
        buildEnquiryDocument({
          ...validBaseInput,
          name: oversizedName,
        })
      ).toThrow(/Name must be 100 characters or fewer/);
    });

    it('11: valid mobile numbers in various formats are normalized', () => {
      const doc1 = buildEnquiryDocument({ ...validBaseInput, mobile: '9876543210' });
      expect(doc1.mobile).toBe('+91 9876543210');

      const doc2 = buildEnquiryDocument({ ...validBaseInput, mobile: '+91 9876543210' });
      expect(doc2.mobile).toBe('+91 9876543210');

      const doc3 = buildEnquiryDocument({ ...validBaseInput, mobile: '09876543210' });
      expect(doc3.mobile).toBe('+91 9876543210');
    });

    it('12: malformed/short mobile numbers are rejected', () => {
      expect(() =>
        buildEnquiryDocument({ ...validBaseInput, mobile: '12345' })
      ).toThrow(/Please enter a valid 10-digit Indian mobile number/);

      expect(() =>
        buildEnquiryDocument({ ...validBaseInput, mobile: 'abcd543210' })
      ).toThrow(/Please enter a valid 10-digit Indian mobile number/);
    });

    it('13: categoryOrProduct is validated and preserved', () => {
      expect(() =>
        buildEnquiryDocument({ ...validBaseInput, categoryOrProduct: '   ' })
      ).toThrow(/Please select or specify your jewellery interest/);

      const oversizedCategory = 'C'.repeat(201);
      expect(() =>
        buildEnquiryDocument({ ...validBaseInput, categoryOrProduct: oversizedCategory })
      ).toThrow(/Jewellery interest must be 200 characters or fewer/);
    });

    it('14: status is strictly "new"', () => {
      const docPayload = buildEnquiryDocument(validBaseInput);
      expect(docPayload.status).toBe('new');
    });

    it('15: createdAt is a valid ISO string', () => {
      const docPayload = buildEnquiryDocument(validBaseInput);
      expect(typeof docPayload.createdAt).toBe('string');
      expect(new Date(docPayload.createdAt).toISOString()).toBe(docPayload.createdAt);
    });
  });

  describe('2. Enquiry Repository Firestore Integration', () => {
    const validBaseInput: CreateEnquiryInput = {
      name: 'Khushi Test User',
      mobile: '9123456789',
      categoryOrProduct: 'Diamond Ring',
      message: 'Testing Firestore submission flow',
    };

    it('16: createEnquiry writes only PersistedEnquiryDocument (without id) to Firestore', async () => {
      const result = await enquiryRepository.createEnquiry(validBaseInput);

      expect(setDoc).toHaveBeenCalledTimes(1);
      const [calledDocRef, calledPayload] = vi.mocked(setDoc).mock.calls[0] as unknown as [any, PersistedEnquiryDocument];

      expect(calledDocRef.path).toMatch(/^enquiries\/enq-/);
      expect('id' in calledPayload).toBe(false);
      expect(Object.keys(calledPayload).sort()).toEqual([
        'categoryOrProduct',
        'createdAt',
        'message',
        'mobile',
        'name',
        'status',
      ]);
      expect(calledPayload.status).toBe('new');

      // Returned domain object DOES contain id
      expect(result.id).toBe(calledDocRef.id);
      expect(result.name).toBe('Khushi Test User');
      expect(result.mobile).toBe('+91 9123456789');
    });

    it('17: createEnquiry surfaces Firestore write errors to caller without masking', async () => {
      vi.mocked(setDoc).mockRejectedValueOnce(new Error('PERMISSION_DENIED: Missing or insufficient permissions.'));

      await expect(enquiryRepository.createEnquiry(validBaseInput)).rejects.toThrow(
        /Enquiry submission failed in Cloud Firestore: PERMISSION_DENIED/
      );
    });

    it('18: createEnquiry does not produce false success on permission denial', async () => {
      vi.mocked(setDoc).mockRejectedValueOnce(new Error('PERMISSION_DENIED'));

      let errorThrown = false;
      try {
        await enquiryRepository.createEnquiry(validBaseInput);
      } catch (err: any) {
        errorThrown = true;
        expect(err.message).toContain('PERMISSION_DENIED');
      }
      expect(errorThrown).toBe(true);
    });

    it('19: local fallback mode preserves id in local storage when Firebase is not configured', async () => {
      mockIsFirebaseConfigured = false;
      mockDb = null;

      const result = await enquiryRepository.createEnquiry({
        name: 'Local Visitor',
        mobile: '9811223344',
        categoryOrProduct: 'Kada',
      });

      expect(setDoc).not.toHaveBeenCalled();
      expect(result.id).toMatch(/^enq-/);
      expect(result.name).toBe('Local Visitor');
      expect(result.message).toBe('');

      const storedRaw = localStore['koh_customer_enquiries'];
      expect(storedRaw).toBeDefined();
      const parsed = JSON.parse(storedRaw);
      expect(parsed[0].id).toBe(result.id);
      expect(parsed[0].message).toBe('');
    });

    it('20: dispatches koh_enquiries_updated event on local submission', async () => {
      mockIsFirebaseConfigured = false;
      mockDb = null;

      await enquiryRepository.createEnquiry(validBaseInput);

      expect(mockWindow.dispatchEvent).toHaveBeenCalled();
      const eventArg = mockWindow.dispatchEvent.mock.calls[0][0];
      expect(eventArg.type).toBe('koh_enquiries_updated');
    });
  });
});
