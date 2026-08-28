const DB_NAME = 'KOH_ImageDB';
const DB_VERSION = 1;
const STORE_NAME = 'product_images';

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export interface StoredImageData {
  id: string;
  blob: Blob;
  mimeType: string;
  name: string;
  size: number;
  createdAt: number;
}

export interface IImageStorageService {
  isAvailable(): Promise<boolean>;
  saveImage(id: string, fileOrBlob: Blob | File): Promise<string>;
  getImageBlob(id: string): Promise<Blob | null>;
  getImageUrl(id: string): Promise<string | null>;
  deleteImage(id: string): Promise<void>;
  revokeImageUrl(url: string): void;
}

class IndexedDBImageStorageService implements IImageStorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private objectUrlMap = new Map<string, string>(); // imageId -> objectUrl

  private async openDB(): Promise<IDBDatabase> {
    if (typeof window === 'undefined' || !window.indexedDB) {
      throw new Error('IndexedDB is not available in this browser environment.');
    }

    if (!this.dbPromise) {
      this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          }
        };

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          reject(new Error(`Failed to open IndexedDB database: ${request.error?.message}`));
        };
      });
    }

    return this.dbPromise;
  }

  public async isAvailable(): Promise<boolean> {
    if (typeof window === 'undefined' || !window.indexedDB) return false;
    try {
      await this.openDB();
      return true;
    } catch {
      return false;
    }
  }

  public async saveImage(id: string, fileOrBlob: Blob | File): Promise<string> {
    if (fileOrBlob.size > MAX_IMAGE_SIZE_BYTES) {
      throw new Error('Image exceeds the maximum allowed size of 5MB.');
    }

    const type = fileOrBlob.type.toLowerCase();
    if (!ALLOWED_IMAGE_TYPES.includes(type)) {
      throw new Error('Invalid image format. Allowed formats are JPG, JPEG, PNG, and WEBP.');
    }

    const db = await this.openDB();

    const record: StoredImageData = {
      id,
      blob: fileOrBlob,
      mimeType: type,
      name: fileOrBlob instanceof File ? fileOrBlob.name : `img-${id}`,
      size: fileOrBlob.size,
      createdAt: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(record);

      req.onsuccess = () => {
        // Return custom internal reference scheme
        const virtualUrl = `indexeddb://${DB_NAME}/${STORE_NAME}/${id}`;
        resolve(virtualUrl);
      };

      req.onerror = () => {
        reject(new Error(`Failed storing image in IndexedDB: ${req.error?.message}`));
      };
    });
  }

  public async getImageBlob(id: string): Promise<Blob | null> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(id);

        req.onsuccess = () => {
          const result = req.result as StoredImageData | undefined;
          if (result && result.blob) {
            resolve(result.blob);
          } else {
            resolve(null);
          }
        };

        req.onerror = () => {
          reject(new Error(`Failed reading image from IndexedDB: ${req.error?.message}`));
        };
      });
    } catch (err) {
      console.warn(`Failed getting blob for image ${id}:`, err);
      return null;
    }
  }

  public async getImageUrl(id: string): Promise<string | null> {
    // Check if we already created an active Object URL in memory
    if (this.objectUrlMap.has(id)) {
      return this.objectUrlMap.get(id)!;
    }

    const blob = await this.getImageBlob(id);
    if (!blob) return null;

    const objectUrl = URL.createObjectURL(blob);
    this.objectUrlMap.set(id, objectUrl);
    return objectUrl;
  }

  public async deleteImage(id: string): Promise<void> {
    // Revoke any active object URL
    if (this.objectUrlMap.has(id)) {
      const url = this.objectUrlMap.get(id)!;
      URL.revokeObjectURL(url);
      this.objectUrlMap.delete(id);
    }

    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(id);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(new Error(`Failed deleting image from IndexedDB: ${req.error?.message}`));
      });
    } catch (err) {
      console.warn(`Failed deleting image ${id}:`, err);
    }
  }

  public revokeImageUrl(url: string): void {
    if (typeof window === 'undefined' || !url) return;
    for (const [id, activeUrl] of this.objectUrlMap.entries()) {
      if (activeUrl === url) {
        URL.revokeObjectURL(url);
        this.objectUrlMap.delete(id);
        break;
      }
    }
  }
}

export const imageStorageService: IImageStorageService = new IndexedDBImageStorageService();
