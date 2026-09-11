import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  sanitizeFileName,
  blobToFile,
  formatProductShareText,
  shareProduct,
  fetchProductImageFile,
} from './shareService';
import { Product } from '@/services/productTypes';

const mockProduct: Product = {
  id: 'p-1',
  name: 'Royal Kanthi Pendant',
  slug: 'royal-kanthi-pendant',
  sku: 'KOH-NK-001',
  category: 'Pendants',
  gender: 'Women',
  purity: '22K',
  approxWeight: 14.5,
  availability: 'available',
  occasion: 'Wedding',
  status: 'published',
  shortDescription: 'Exquisite gold pendant',
  detailedDescription: 'Handcrafted with 22K yellow gold.',
  tags: ['pendant', 'gold'],
  isFeatured: true,
  images: [{ id: 'img-1', url: '/assets/products/p1.jpg', altText: 'Pendant', sortOrder: 0, isPrimary: true }],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('shareService Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. sanitizes filename correctly', () => {
    expect(sanitizeFileName('Royal Kanthi Pendant!', 'image/jpeg')).toBe('khushi-ornament-house-royal-kanthi-pendant.jpg');
    expect(sanitizeFileName('Gold Ring 18K', 'image/png')).toBe('khushi-ornament-house-gold-ring-18k.png');
    expect(sanitizeFileName('', 'image/webp')).toBe('khushi-ornament-house-jewellery.webp');
  });

  it('2. converts Blob to File with correct MIME and filename', () => {
    const blob = new Blob(['fake image data'], { type: 'image/webp' });
    const file = blobToFile(blob, 'Bangles');
    expect(file).toBeInstanceOf(File);
    expect(file.name).toBe('khushi-ornament-house-bangles.webp');
    expect(file.type).toBe('image/webp');
  });

  it('3. formats share text and strictly excludes prices', () => {
    const text = formatProductShareText(mockProduct);
    expect(text).toContain('Khushi Ornament House');
    expect(text).toContain('Product: Royal Kanthi Pendant');
    expect(text).toContain('SKU: KOH-NK-001');
    expect(text).toContain('Purity: 22K Gold');
    expect(text).toContain('Approx. Weight: 14.50g');
    expect(text).not.toContain('Price');
    expect(text).not.toContain('₹');
  });

  it('4. shares image file via Web Share API when supported', async () => {
    const mockFile = new File(['data'], 'khushi-ornament-house-royal-kanthi-pendant.jpg', { type: 'image/jpeg' });

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(new Blob(['fake data'], { type: 'image/jpeg' }), { status: 200 })
    );

    const shareSpy = vi.fn().mockResolvedValue(undefined);
    const canShareSpy = vi.fn().mockReturnValue(true);

    Object.defineProperty(globalThis, 'navigator', {
      value: {
        share: shareSpy,
        canShare: canShareSpy,
      },
      configurable: true,
      writable: true,
    });

    const result = await shareProduct(mockProduct, '/assets/products/p1.jpg');
    expect(result.success).toBe(true);
    expect(result.method).toBe('file');
    expect(shareSpy).toHaveBeenCalledTimes(1);
  });

  it('5. handles AbortError (user cancellation) silently without error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(new Blob(['fake data'], { type: 'image/jpeg' }), { status: 200 })
    );

    const abortError = new Error('Share canceled by user');
    abortError.name = 'AbortError';

    const shareSpy = vi.fn().mockRejectedValue(abortError);
    const canShareSpy = vi.fn().mockReturnValue(true);

    Object.defineProperty(globalThis, 'navigator', {
      value: {
        share: shareSpy,
        canShare: canShareSpy,
      },
      configurable: true,
      writable: true,
    });

    const result = await shareProduct(mockProduct, '/assets/products/p1.jpg');
    expect(result.success).toBe(false);
    expect(result.method).toBe('cancelled');
    expect(result.error).toBeUndefined();
  });

  it('6. falls back to text-only Web Share when file sharing is unsupported', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(new Blob(['fake data'], { type: 'image/jpeg' }), { status: 200 })
    );

    const shareSpy = vi.fn().mockResolvedValue(undefined);
    const canShareSpy = vi.fn().mockReturnValue(false); // File share unsupported

    Object.defineProperty(globalThis, 'navigator', {
      value: {
        share: shareSpy,
        canShare: canShareSpy,
      },
      configurable: true,
      writable: true,
    });

    const result = await shareProduct(mockProduct, '/assets/products/p1.jpg');
    expect(result.success).toBe(true);
    expect(result.method).toBe('text');
  });

  it('7. falls back to clipboard copy when Web Share API is completely unavailable', async () => {
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(globalThis, 'navigator', {
      value: {
        clipboard: { writeText: writeTextSpy },
      },
      configurable: true,
      writable: true,
    });

    const result = await shareProduct(mockProduct);
    expect(result.success).toBe(true);
    expect(result.method).toBe('clipboard');
    expect(writeTextSpy).toHaveBeenCalled();
  });
});
