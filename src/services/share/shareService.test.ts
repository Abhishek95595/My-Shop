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
  it('8. handles Firebase JPEG and WebP images correctly', async () => {
    const firebaseJpegProduct: Product = {
      ...mockProduct,
      images: [{ id: 'img-fb-1', url: 'https://firebasestorage.googleapis.com/v0/b/khushi-ornament-house.firebasestorage.app/o/products%2Fitem.jpg?alt=media', altText: 'FB Jpeg', sortOrder: 1, isPrimary: true }],
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(new Blob(['jpeg data'], { type: 'image/jpeg' }), { status: 200 })
    );

    const shareSpy = vi.fn().mockResolvedValue(undefined);
    const canShareSpy = vi.fn().mockReturnValue(true);

    Object.defineProperty(globalThis, 'navigator', {
      value: { share: shareSpy, canShare: canShareSpy },
      configurable: true,
      writable: true,
    });

    const result = await shareProduct(firebaseJpegProduct);
    expect(result.success).toBe(true);
    expect(result.method).toBe('file');
    expect(shareSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        files: [expect.objectContaining({ name: 'khushi-ornament-house-royal-kanthi-pendant.jpg', type: 'image/jpeg' })],
      })
    );
  });

  it('9. converts local SVG to PNG and attaches .png File preserving aspect ratio and revoking Object URL', async () => {
    const bridalProduct: Product = {
      id: 'prod-bridal-necklace-01',
      sku: 'KOH-GLD-NCK-001',
      name: 'Bridal Gold Necklace Set',
      slug: 'bridal-gold-necklace-set',
      category: 'Necklaces/Sets',
      gender: 'Women',
      purity: '22K',
      approxWeight: 48.5,
      availability: 'made_on_order',
      images: [
        {
          id: 'img-nck-01-primary',
          url: '/assets/products/bridal-necklace-main.svg',
          altText: 'Bridal Gold Necklace Set - Main View',
          sortOrder: 1,
          isPrimary: true,
        },
      ],
      shortDescription: 'Bridal necklace set',
      detailedDescription: 'Handcrafted',
      occasion: 'Wedding',
      tags: ['Bridal'],
      isFeatured: true,
      status: 'published',
      createdAt: '2026-01-10T09:00:00.000Z',
      updatedAt: '2026-02-15T11:30:00.000Z',
    };

    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 800" width="1600" height="800"></svg>`;
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(svgBlob, { status: 200 })
    );

    const createObjectUrlSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-svg-url');
    const revokeObjectUrlSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue({ drawImage: vi.fn() }),
      toBlob: (cb: BlobCallback, type?: string) => {
        cb(new Blob(['png data'], { type: type || 'image/png' }));
      },
    };

    const mockDocument = {
      createElement: (tag: string) => {
        if (tag === 'canvas') return mockCanvas;
        return {};
      },
    };

    const mockDomParser = class {
      parseFromString() {
        return {
          querySelector: () => ({
            getAttribute: (attr: string) => {
              if (attr === 'viewBox') return '0 0 1600 800';
              if (attr === 'width') return '1600';
              if (attr === 'height') return '800';
              return null;
            },
          }),
        };
      }
    };

    vi.stubGlobal('document', mockDocument);
    vi.stubGlobal('window', globalThis);
    vi.stubGlobal('DOMParser', mockDomParser);

    // Mock Image loading
    class MockImage {
      onload: (() => void) | null = null;
      onerror: ((e: Event | string) => void) | null = null;
      src = '';
      width = 1600;
      height = 800;
      set crossOrigin(_v: string) {}
      constructor() {
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 0);
      }
    }
    vi.stubGlobal('Image', MockImage);

    const shareSpy = vi.fn().mockResolvedValue(undefined);
    const canShareSpy = vi.fn().mockReturnValue(true);

    Object.defineProperty(globalThis, 'navigator', {
      value: { share: shareSpy, canShare: canShareSpy },
      configurable: true,
      writable: true,
    });

    const result = await shareProduct(bridalProduct);
    expect(result.success).toBe(true);
    expect(result.method).toBe('file');
    expect(revokeObjectUrlSpy).toHaveBeenCalledWith('blob:mock-svg-url');
    expect(mockCanvas.width).toBe(1200);
    expect(mockCanvas.height).toBe(600); // 1600x800 aspect ratio preserved -> capped to 1200x600
    expect(shareSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        files: [
          expect.objectContaining({
            name: 'khushi-ornament-house-bridal-gold-necklace-set.png',
            type: 'image/png',
          }),
        ],
      })
    );

    vi.unstubAllGlobals();
  });

  it('10. falls back to text-only share when SVG conversion fails', async () => {
    const svgBlob = new Blob(['invalid svg content'], { type: 'image/svg+xml' });

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(svgBlob, { status: 200 })
    );

    // Force SVG conversion to fail via Image onerror
    class FailingImage {
      onload: (() => void) | null = null;
      onerror: ((e: Event | string) => void) | null = null;
      src = '';
      constructor() {
        setTimeout(() => {
          if (this.onerror) this.onerror('Failed to load SVG');
        }, 0);
      }
    }
    vi.stubGlobal('Image', FailingImage);

    const shareSpy = vi.fn().mockResolvedValue(undefined);
    const canShareSpy = vi.fn().mockReturnValue(true);

    Object.defineProperty(globalThis, 'navigator', {
      value: { share: shareSpy, canShare: canShareSpy },
      configurable: true,
      writable: true,
    });

    const result = await shareProduct(mockProduct, '/assets/products/bridal-necklace-main.svg');
    expect(result.success).toBe(true);
    expect(result.method).toBe('text');

    vi.unstubAllGlobals();
  });
});
