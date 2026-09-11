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
        return blobToFile(blob, productName);
      }
      return null;
    }

    // 2. Local relative assets or blob URLs
    if (imageUrl.startsWith('blob:') || imageUrl.startsWith('/')) {
      const res = await fetch(imageUrl);
      if (res.ok) {
        const blob = await res.blob();
        return blobToFile(blob, productName);
      }
    }

    // 3. Remote HTTP/HTTPS URLs (Firebase Storage or external)
    // First attempt direct fetch
    try {
      const directRes = await fetch(imageUrl, { mode: 'cors' });
      if (directRes.ok) {
        const blob = await directRes.blob();
        if (blob && blob.size > 0 && blob.type.startsWith('image/')) {
          return blobToFile(blob, productName);
        }
      }
    } catch {
      // Direct CORS fetch failed, fall through to proxy
    }

    // Proxy fallback via safe same-origin API route
    const proxyUrl = `/api/products/share-image?url=${encodeURIComponent(imageUrl)}`;
    const proxyRes = await fetch(proxyUrl);
    if (proxyRes.ok) {
      const blob = await proxyRes.blob();
      if (blob && blob.size > 0) {
        return blobToFile(blob, productName);
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
 * 1. Image File + title/text/url native Web Share (navigator.share)
 * 2. Title/text/url native Web Share (if file sharing unsupported or image fetch fails)
 * 3. Clipboard copy (if Web Share API completely unavailable)
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

  const targetImageUrl = primaryImageUrl || getPrimaryImage(product.images)?.url || '';

  // Order 1: Try Web Share API with Image File
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

    // Order 2: Native Web Share text-only fallback
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

  // Order 3: Clipboard Copy Fallback
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
