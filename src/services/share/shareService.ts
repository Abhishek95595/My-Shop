import { Product } from '../productTypes';
import { SITE_URL, STORE_NAME } from '../../lib/constants';
import { formatWeight, getPrimaryImage } from '../mockProducts';

export interface ShareResult {
  success: boolean;
  method: 'file' | 'text' | 'clipboard' | 'cancelled' | 'error';
  error?: string;
}

/**
 * Sanitizes product name into a clean, safe filename.
 * Example: "Kanthi Pendant" -> "khushi-ornament-house-kanthi-pendant.jpg"
 */
export function sanitizeFileName(productName: string, mimeType: string): string {
  const extensionMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  };
  const ext = extensionMap[mimeType] || 'jpg';
  const cleanName = productName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const prefix = STORE_NAME.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `${prefix}-${cleanName || 'jewellery'}.${ext}`;
}

/**
 * Converts a Blob to a File object with proper name and MIME type.
 */
export function blobToFile(blob: Blob, productName: string): File {
  const mimeType = blob.type || 'image/jpeg';
  const fileName = sanitizeFileName(productName, mimeType);
  return new File([blob], fileName, { type: mimeType });
}

/**
 * Safely fetches a product image as a File object.
 * Uses direct fetch first, and falls back to KOH same-origin proxy if CORS/network blocks direct access.
 */
/**
 * Helper to check if a URL or MIME type indicates a raster image (JPEG, PNG, WebP).
 */
export function isRasterImageUrl(url: string): boolean {
  if (!url) return false;
  const cleanUrl = url.toLowerCase().split('?')[0];
  if (
    cleanUrl.endsWith('.jpg') ||
    cleanUrl.endsWith('.jpeg') ||
    cleanUrl.endsWith('.png') ||
    cleanUrl.endsWith('.webp') ||
    cleanUrl.startsWith('indexeddb://')
  ) {
    return true;
  }
  // Firebase Storage URLs often contain tokens or lack extensions in pathname, but are typically raster (JPEG/PNG/WebP).
  if (cleanUrl.includes('firebasestorage.googleapis.com') || cleanUrl.includes('storage.googleapis.com')) {
    if (!cleanUrl.endsWith('.svg')) {
      return true;
    }
  }
  return false;
}

/**
 * Client-side SVG to PNG rasterization preserving aspect ratio and capping max dimension.
 * Always revokes object URLs in try/finally blocks.
 */
export async function convertSvgBlobToPngBlob(svgBlob: Blob): Promise<Blob | null> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return null; // Non-browser environment
  }

  let objectUrl: string | null = null;
  try {
    const svgText = await svgBlob.text();

    // Parse SVG dimensions or viewBox
    let width = 600;
    let height = 600;

    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
    const svgEl = svgDoc.querySelector('svg');

    if (svgEl) {
      const viewBox = svgEl.getAttribute('viewBox');
      const wAttr = svgEl.getAttribute('width');
      const hAttr = svgEl.getAttribute('height');

      let parsedW = parseFloat(wAttr || '');
      let parsedH = parseFloat(hAttr || '');

      if (isNaN(parsedW) || isNaN(parsedH) || parsedW <= 0 || parsedH <= 0) {
        if (viewBox) {
          const parts = viewBox.trim().split(/[\s,]+/).map(Number);
          if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
            parsedW = parts[2];
            parsedH = parts[3];
          }
        }
      }

      if (!isNaN(parsedW) && !isNaN(parsedH) && parsedW > 0 && parsedH > 0) {
        width = parsedW;
        height = parsedH;
      }
    }

    // Cap maximum dimension at 1200px while maintaining aspect ratio
    const MAX_DIM = 1200;
    let targetW = width;
    let targetH = height;

    if (targetW > MAX_DIM || targetH > MAX_DIM) {
      if (targetW >= targetH) {
        targetH = Math.round((targetH * MAX_DIM) / targetW);
        targetW = MAX_DIM;
      } else {
        targetW = Math.round((targetW * MAX_DIM) / targetH);
        targetH = MAX_DIM;
      }
    }

    // Create Image element from Blob
    objectUrl = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.crossOrigin = 'anonymous';

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (e) => reject(e);
      img.src = objectUrl!;
    });

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(img, 0, 0, targetW, targetH);

    const pngBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/png');
    });

    return pngBlob;
  } catch (err) {
    console.warn('[KOH Share] SVG to PNG rasterization failed:', err);
    return null;
  } finally {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
  }
}

/**
 * Safely fetches a product image as a File object.
 * Uses direct fetch first, and falls back to KOH same-origin proxy if CORS/network blocks direct access.
 * Converts SVG to PNG File client-side to ensure compatibility with Web Share API and WhatsApp.
 */
export async function fetchProductImageFile(
  imageUrl: string,
  productName: string
): Promise<File | null> {
  if (!imageUrl) return null;

  try {
    // 1. IndexedDB support for local admin/preview
    if (imageUrl.startsWith('indexeddb://')) {
      const imageId = imageUrl.replace('indexeddb://', '');
      const { imageStorageService } = await import('../images/imageStorageService');
      const blob = await imageStorageService.getImageBlob(imageId);
      if (blob) {
        if (blob.type === 'image/svg+xml' || imageUrl.toLowerCase().endsWith('.svg')) {
          const pngBlob = await convertSvgBlobToPngBlob(blob);
          if (pngBlob) return blobToFile(pngBlob, productName);
        }
        return blobToFile(blob, productName);
      }
      return null;
    }

    // Helper to process fetched blob (rasterizing SVG if needed)
    const processFetchedBlob = async (blob: Blob): Promise<File | null> => {
      if (!blob || blob.size === 0) return null;
      if (blob.type === 'image/svg+xml' || imageUrl.toLowerCase().endsWith('.svg')) {
        const pngBlob = await convertSvgBlobToPngBlob(blob);
        if (pngBlob) {
          return blobToFile(pngBlob, productName);
        }
        return null; // If SVG conversion fails, drop to text fallback
      }
      if (blob.type.startsWith('image/')) {
        return blobToFile(blob, productName);
      }
      return null;
    };

    // 2. Local relative assets or blob URLs
    if (imageUrl.startsWith('blob:') || imageUrl.startsWith('/')) {
      const res = await fetch(imageUrl);
      if (res.ok) {
        const blob = await res.blob();
        return await processFetchedBlob(blob);
      }
    }

    // 3. Remote HTTP/HTTPS URLs (Firebase Storage or external)
    // First attempt direct fetch
    try {
      const directRes = await fetch(imageUrl, { mode: 'cors' });
      if (directRes.ok) {
        const blob = await directRes.blob();
        const file = await processFetchedBlob(blob);
        if (file) return file;
      }
    } catch {
      // Direct CORS fetch failed, fall through to proxy
    }

    // Proxy fallback via safe same-origin API route (JPEG, PNG, WebP only)
    if (!imageUrl.toLowerCase().endsWith('.svg')) {
      const proxyUrl = `/api/products/share-image?url=${encodeURIComponent(imageUrl)}`;
      const proxyRes = await fetch(proxyUrl);
      if (proxyRes.ok) {
        const blob = await proxyRes.blob();
        if (blob && blob.size > 0) {
          return blobToFile(blob, productName);
        }
      }
    }
  } catch (err) {
    console.warn('[KOH Share] Image fetch failed:', err);
  }

  return null;
}

/**
 * Formats supplementary product text payload.
 * Strictly omits prices as public prices are hidden in KOH.
 */
export function formatProductShareText(product: Product): string {
  const parts = [
    STORE_NAME,
    `Product: ${product.name}`,
    `SKU: ${product.sku}`,
  ];

  if (product.purity) {
    parts.push(`Purity: ${product.purity} Gold`);
  }

  if (product.approxWeight != null) {
    parts.push(`Approx. Weight: ${formatWeight(product.approxWeight)}`);
  }

  return parts.join('\n');
}

/**
 * Copies product details and URL to user clipboard.
 */
export async function copyToClipboard(text: string, url: string): Promise<boolean> {
  const fullText = `${text}\n${url}`;
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(fullText);
      return true;
    } catch {
      // Fall through to textarea fallback
    }
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = fullText;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    return successful;
  } catch {
    return false;
  }
}

/**
 * Production-quality product sharing function with progressive fallbacks.
 *
 * Progressive Fallback Order:
 * 1. Primary raster image File + title/text/url native Web Share
 * 2. SVG client-side rasterized to PNG File + title/text/url native Web Share
 * 3. Title/text/url native Web Share (if file sharing unsupported or image conversion fails)
 * 4. Clipboard copy (if Web Share API completely unavailable)
 *
 * Handles AbortError (user share cancellation) silently without error toasts.
 */
export async function shareProduct(
  product: Product,
  primaryImageUrl?: string
): Promise<ShareResult> {
  const productUrl = `${SITE_URL}/catalogue/${product.slug}`;
  const shareTitle = `${product.name} | ${STORE_NAME}`;
  const shareText = formatProductShareText(product);

  // Preference 1: Explicitly selected image or any available raster image in product.images
  let targetImageUrl = primaryImageUrl || getPrimaryImage(product.images)?.url || '';

  // If target image is SVG or empty, search product.images for any real raster image first (Rule A)
  if (!targetImageUrl || !isRasterImageUrl(targetImageUrl)) {
    const rasterImg = product.images.find((img) => isRasterImageUrl(img.url));
    if (rasterImg) {
      targetImageUrl = rasterImg.url;
    }
  }

  // Order 1 & 2: Try Web Share API with Image File (Raster or SVG converted to PNG)
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    if (targetImageUrl) {
      const file = await fetchProductImageFile(targetImageUrl, product.name);

      if (file) {
        const shareData: ShareData = {
          files: [file],
          title: shareTitle,
          text: shareText,
          url: productUrl,
        };

        const canShareFiles =
          typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] });

        if (canShareFiles) {
          try {
            await navigator.share(shareData);
            return { success: true, method: 'file' };
          } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
              return { success: false, method: 'cancelled' };
            }
            // If file sharing fails for another reason, continue to text-only Web Share
          }
        }
      }
    }

    // Order 3: Native Web Share text-only fallback
    try {
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url: productUrl,
      });
      return { success: true, method: 'text' };
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return { success: false, method: 'cancelled' };
      }
      // If native text share fails, fall through to clipboard copy
    }
  }

  // Order 4: Clipboard Copy Fallback
  const copied = await copyToClipboard(shareText, productUrl);
  if (copied) {
    return { success: true, method: 'clipboard' };
  }

  return {
    success: false,
    method: 'error',
    error: 'Sharing and clipboard copy are not supported on this browser device.',
  };
}
