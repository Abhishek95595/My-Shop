import { storage, isFirebaseConfigured } from '../../lib/firebase/client';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export interface FirebaseStoredImage {
  url: string;
  storagePath: string;
}

export function getFileExtension(fileOrBlob: Blob | File): string {
  if (fileOrBlob instanceof File && fileOrBlob.name) {
    const parts = fileOrBlob.name.split('.');
    if (parts.length > 1) {
      const ext = parts.pop()?.toLowerCase();
      if (ext && ['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
        return ext === 'jpg' ? 'jpeg' : ext;
      }
    }
  }

  const mime = fileOrBlob.type.toLowerCase();
  switch (mime) {
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/jpg':
    case 'image/jpeg':
    default:
      return 'jpeg';
  }
}

export function validateImageFile(fileOrBlob: Blob | File): void {
  if (!fileOrBlob) {
    throw new Error('No image file was provided.');
  }

  if (fileOrBlob.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error(
      `Image size (${(fileOrBlob.size / (1024 * 1024)).toFixed(1)}MB) exceeds the maximum allowed size of 5MB.`
    );
  }

  const type = fileOrBlob.type.toLowerCase();
  if (type && !ALLOWED_IMAGE_TYPES.includes(type)) {
    throw new Error(
      'Invalid image format. Allowed formats are JPG, JPEG, PNG, and WEBP.'
    );
  }
}

export function buildProductStoragePath(productId: string, imageId: string, extension: string): string {
  const sanitizedProductId = productId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const sanitizedImageId = imageId.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `products/${sanitizedProductId}/${sanitizedImageId}.${extension}`;
}

export interface IFirebaseStorageService {
  isAvailable(): boolean;
  uploadProductImage(
    productId: string,
    fileOrBlob: Blob | File,
    customImageId?: string
  ): Promise<FirebaseStoredImage>;
  deleteProductImage(storagePath: string): Promise<void>;
}

class FirebaseStorageService implements IFirebaseStorageService {
  public isAvailable(): boolean {
    return isFirebaseConfigured && !!storage;
  }

  public async uploadProductImage(
    productId: string,
    fileOrBlob: Blob | File,
    customImageId?: string
  ): Promise<FirebaseStoredImage> {
    if (!this.isAvailable() || !storage) {
      throw new Error(
        'Firebase Storage is not available or not configured in this environment.'
      );
    }

    validateImageFile(fileOrBlob);

    if (!productId || !productId.trim()) {
      throw new Error('A valid product ID is required to upload an image.');
    }

    const imageId = customImageId || `img-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const extension = getFileExtension(fileOrBlob);
    const storagePath = buildProductStoragePath(productId, imageId, extension);

    try {
      const storageRef = ref(storage, storagePath);
      const metadata = {
        contentType: fileOrBlob.type || `image/${extension}`,
        customMetadata: {
          productId,
          uploadedAt: new Date().toISOString(),
        },
      };

      await uploadBytes(storageRef, fileOrBlob, metadata);
      const downloadUrl = await getDownloadURL(storageRef);

      return {
        url: downloadUrl,
        storagePath,
      };
    } catch (err: unknown) {
      console.error(`Firebase Storage upload error for ${storagePath}:`, err);
      const detail = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to upload product image to Firebase Storage: ${detail}`);
    }
  }

  public async deleteProductImage(storagePath: string): Promise<void> {
    if (!this.isAvailable() || !storage) {
      throw new Error('Firebase Storage is not available or not configured in this environment.');
    }

    if (!storagePath || !storagePath.startsWith('products/')) {
      // Ignore static or non-storage paths
      return;
    }

    try {
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
    } catch (err: unknown) {
      const errorObj = err as { code?: string; message?: string };
      const isNotFound =
        errorObj?.code === 'storage/object-not-found' ||
        (typeof errorObj?.message === 'string' &&
          errorObj.message.toLowerCase().includes('object-not-found'));

      if (isNotFound) {
        // Idempotent cleanup: file was already removed
        console.warn(`Firebase Storage delete: file already not found for ${storagePath}`);
        return;
      }

      console.error(`Firebase Storage delete error for ${storagePath}:`, err);
      const detail = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed deleting product image from Cloud Storage (${storagePath}): ${detail}`);
    }
  }
}

export const firebaseStorageService: IFirebaseStorageService = new FirebaseStorageService();
