import { describe, it, expect } from 'vitest';
import { ProductImage } from '../productTypes';
import {
  validateImageFile,
  getFileExtension,
  buildProductStoragePath,
  MAX_IMAGE_SIZE_BYTES,
  FirebaseStoredImage,
} from './firebaseStorageService';

describe('Firebase Storage Service Utilities', () => {
  describe('validateImageFile', () => {
    it('accepts valid JPEG, PNG, and WEBP image files under 5MB', () => {
      const validJpeg = new File(['dummy-content'], 'test.jpeg', { type: 'image/jpeg' });
      const validPng = new File(['dummy-content'], 'test.png', { type: 'image/png' });
      const validWebp = new File(['dummy-content'], 'test.webp', { type: 'image/webp' });

      expect(() => validateImageFile(validJpeg)).not.toThrow();
      expect(() => validateImageFile(validPng)).not.toThrow();
      expect(() => validateImageFile(validWebp)).not.toThrow();
    });

    it('rejects image files exceeding 5MB', () => {
      const oversizedBlob = new Blob([new Uint8Array(MAX_IMAGE_SIZE_BYTES + 1024)], {
        type: 'image/jpeg',
      });

      expect(() => validateImageFile(oversizedBlob)).toThrow(
        /exceeds the maximum allowed size of 5MB/
      );
    });

    it('rejects unsupported file mime types', () => {
      const gifFile = new File(['dummy-content'], 'animation.gif', { type: 'image/gif' });
      const pdfFile = new File(['dummy-content'], 'document.pdf', { type: 'application/pdf' });

      expect(() => validateImageFile(gifFile)).toThrow(/Invalid image format/);
      expect(() => validateImageFile(pdfFile)).toThrow(/Invalid image format/);
    });
  });

  describe('getFileExtension', () => {
    it('extracts file extension from filename if valid', () => {
      const pngFile = new File(['content'], 'sample.png', { type: 'image/png' });
      const jpgFile = new File(['content'], 'sample.jpg', { type: 'image/jpg' });

      expect(getFileExtension(pngFile)).toBe('png');
      expect(getFileExtension(jpgFile)).toBe('jpeg');
    });

    it('falls back to mime-type extension when filename has no extension', () => {
      const webpBlob = new Blob(['content'], { type: 'image/webp' });
      const pngBlob = new Blob(['content'], { type: 'image/png' });

      expect(getFileExtension(webpBlob)).toBe('webp');
      expect(getFileExtension(pngBlob)).toBe('png');
    });
  });

  describe('buildProductStoragePath', () => {
    it('constructs correct storage path with product ID isolation', () => {
      const path = buildProductStoragePath('prod-123', 'img-456', 'png');
      expect(path).toBe('products/prod-123/img-456.png');
    });

    it('sanitizes special characters in product and image IDs', () => {
      const path = buildProductStoragePath('prod/123@#$', 'img 456!', 'jpeg');
      expect(path).toBe('products/prod_123___/img_456_.jpeg');
    });
  });

  describe('Storage Metadata & Backward Compatibility', () => {
    it('maps storage result correctly into FirebaseStoredImage metadata', () => {
      const stored: FirebaseStoredImage = {
        url: 'https://firebasestorage.googleapis.com/v0/b/project.appspot.com/o/products%2Fp1%2Fi1.jpg?alt=media',
        storagePath: 'products/p1/i1.jpg',
      };

      expect(stored.url).toContain('firebasestorage.googleapis.com');
      expect(stored.storagePath).toBe('products/p1/i1.jpg');
    });

    it('preserves static and external HTTPS URLs without storagePath', () => {
      const legacyImage: ProductImage = {
        id: 'img-static-1',
        url: '/images/products/necklace.jpg',
        altText: 'Gold Necklace',
        sortOrder: 1,
        isPrimary: true,
      };

      expect(legacyImage.url).toBe('/images/products/necklace.jpg');
      expect(legacyImage.storagePath).toBeUndefined();
    });
  });
});
