'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ProductImage } from '@/services/productTypes';
import {
  firebaseStorageService,
  MAX_IMAGE_SIZE_BYTES,
  ALLOWED_IMAGE_TYPES,
} from '@/services/images/firebaseStorageService';
import { cleanupUploadedImages } from '@/services/images/productImageLifecycle';
import { imageStorageService } from '@/services/images/imageStorageService';
import {
  Upload,
  Image as ImageIcon,
  Star,
  Trash2,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface ImageUploadManagerProps {
  productId: string;
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  persistedImageIds?: string[];
  persistedStoragePaths?: string[];
  onImageUploaded?: (image: ProductImage) => void;
  onSessionUploadSuperseded?: (storagePath: string) => void;
  onBusyChange?: (busy: boolean) => void;
  disabled?: boolean;
}

export const ImageUploadManager: React.FC<ImageUploadManagerProps> = ({
  productId,
  images,
  onChange,
  persistedImageIds = [],
  persistedStoragePaths = [],
  onImageUploaded,
  onSessionUploadSuperseded,
  onBusyChange,
  disabled = false,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const replaceTargetIdRef = useRef<string | null>(null);

  const setUploadBusy = (busy: boolean) => {
    setIsUploading(busy);
    onBusyChange?.(busy);
  };

  // Load / resolve object URLs for indexeddb images or static URLs
  useEffect(() => {
    let isMounted = true;
    const acquiredObjectUrls: string[] = [];

    async function loadPreviews() {
      const urls: Record<string, string> = {};
      for (const img of images) {
        if (img.url.startsWith('indexeddb://')) {
          const resolvedUrl = await imageStorageService.getImageUrl(img.id);
          if (resolvedUrl) {
            acquiredObjectUrls.push(resolvedUrl);
            urls[img.id] = resolvedUrl;
          }
        } else {
          urls[img.id] = img.url;
        }
      }
      if (isMounted) {
        setPreviewUrls(urls);
      } else {
        acquiredObjectUrls.forEach((url) => imageStorageService.revokeImageUrl(url));
        acquiredObjectUrls.length = 0;
      }
    }

    loadPreviews();

    return () => {
      isMounted = false;
      acquiredObjectUrls.forEach((url) => imageStorageService.revokeImageUrl(url));
      acquiredObjectUrls.length = 0;
    };
  }, [images]);

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return `"${file.name}" exceeds the maximum allowed size of 5MB.`;
    }
    const type = file.type.toLowerCase();
    if (!ALLOWED_IMAGE_TYPES.includes(type)) {
      return `"${file.name}" has an unsupported format. Allowed: JPG, JPEG, PNG, WEBP.`;
    }
    return null;
  };

  const handleFiles = async (files: FileList | File[]) => {
    if (disabled || isUploading) return;

    setErrorMsg(null);
    const fileArray = Array.from(files);

    if (images.length + fileArray.length > 5) {
      setErrorMsg('A maximum of 5 images can be added per product.');
      return;
    }

    const uploadedPathsInBatch: string[] = [];
    setUploadBusy(true);
    try {
      const newImages: ProductImage[] = [...images];

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const validationError = validateFile(file);
        if (validationError) {
          setErrorMsg(validationError);
          continue;
        }

        const imageId = `img-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        const stored = await firebaseStorageService.uploadProductImage(productId, file, imageId);
        uploadedPathsInBatch.push(stored.storagePath);

        // First image added is primary if no primary exists
        const hasPrimary = newImages.some((img) => img.isPrimary);

        const newImage: ProductImage = {
          id: imageId,
          url: stored.url,
          storagePath: stored.storagePath,
          altText: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' '),
          sortOrder: newImages.length + 1,
          isPrimary: !hasPrimary && newImages.length === 0,
        };

        newImages.push(newImage);
        onImageUploaded?.(newImage);
      }

      onChange(newImages);
    } catch (err: unknown) {
      // Roll back any successful uploads from this batch
      if (uploadedPathsInBatch.length > 0) {
        await cleanupUploadedImages(uploadedPathsInBatch, productId);
        uploadedPathsInBatch.forEach((path) => onSessionUploadSuperseded?.(path));
      }
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Failed to process image file.');
      }
    } finally {
      setUploadBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const setPrimaryImage = (id: string) => {
    const updated = images.map((img) => ({
      ...img,
      isPrimary: img.id === id,
    }));
    onChange(updated);
  };

  const updateAltText = (id: string, altText: string) => {
    const updated = images.map((img) =>
      img.id === id ? { ...img, altText } : img
    );
    onChange(updated);
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= images.length) return;

    const list = [...images];
    const [moved] = list.splice(index, 1);
    list.splice(newIdx, 0, moved);

    // Reassign sortOrder
    const updated = list.map((img, i) => ({
      ...img,
      sortOrder: i + 1,
    }));
    onChange(updated);
  };

  const removeImage = async (id: string) => {
    if (disabled || isUploading) return;

    const targetImg = images.find((img) => img.id === id);
    if (!targetImg) return;

    setUploadBusy(true);
    try {
      if (targetImg.storagePath) {
        const wasPersisted = persistedStoragePaths.includes(targetImg.storagePath);
        if (!wasPersisted) {
          // Newly uploaded in this session: clean immediately from cloud storage
          const cleanup = await cleanupUploadedImages([targetImg.storagePath], productId);
          if (cleanup.failed.length > 0) {
            setErrorMsg(`Warning: Failed to clean up removed image from storage: ${cleanup.failed[0].error}`);
          }
          onSessionUploadSuperseded?.(targetImg.storagePath);
        }
        // If wasPersisted: do NOT delete now; only remove from state. Post-save cleanup handles it.
      } else if (!persistedImageIds.includes(id)) {
        // Legacy IndexedDB cleanup
        await imageStorageService.deleteImage(id);
      }

      const filtered = images.filter((img) => img.id !== id);

      // If removed image was primary, make the first remaining image primary
      const updated = filtered.map((img, idx) => ({ ...img, sortOrder: idx + 1 }));
      if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
        updated[0].isPrimary = true;
      }

      onChange(updated);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to remove the image.'
      );
    } finally {
      setUploadBusy(false);
    }
  };

  const triggerReplace = (id: string) => {
    replaceTargetIdRef.current = id;
    replaceInputRef.current?.click();
  };

  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetId = replaceTargetIdRef.current;
    if (
      disabled ||
      isUploading ||
      !targetId ||
      !e.target.files ||
      e.target.files.length === 0
    ) return;

    const file = e.target.files[0];
    const validationError = validateFile(file);
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    const targetImg = images.find((img) => img.id === targetId);

    setUploadBusy(true);
    try {
      const replacementId = `img-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const stored = await firebaseStorageService.uploadProductImage(productId, file, replacementId);

      const replacementImage: ProductImage = {
        id: replacementId,
        url: stored.url,
        storagePath: stored.storagePath,
        altText: targetImg?.altText || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' '),
        sortOrder: targetImg?.sortOrder || 1,
        isPrimary: targetImg?.isPrimary || false,
      };

      const updated = images.map((img) =>
        img.id === targetId ? replacementImage : img
      );
      onChange(updated);
      onImageUploaded?.(replacementImage);

      // Handle superseded image:
      if (targetImg?.storagePath) {
        const wasPersisted = persistedStoragePaths.includes(targetImg.storagePath);
        if (!wasPersisted) {
          // Superseded image was uploaded during this session -> clean immediately
          await cleanupUploadedImages([targetImg.storagePath], productId);
          onSessionUploadSuperseded?.(targetImg.storagePath);
        }
        // If it was persisted, we leave it intact until Firestore save succeeds
      } else if (!persistedImageIds.includes(targetId)) {
        // Legacy IndexedDB cleanup
        await imageStorageService.deleteImage(targetId);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Failed to replace image.');
      }
    } finally {
      setUploadBusy(false);
      if (replaceInputRef.current) replaceInputRef.current.value = '';
    }
  };

  const primaryCount = images.filter((img) => img.isPrimary).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="block text-xs font-bold uppercase tracking-wider text-maroon-900">
            Product Images ({images.length}/5 slots)
          </span>
          <p className="text-[11px] text-charcoal-500 font-sans">
            JPG, JPEG, PNG, or WEBP up to 5MB. Exactly one primary image is required to publish.
          </p>
        </div>

        {images.length > 0 && (
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${
              primaryCount === 1
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-maroon-100 text-maroon-800'
            }`}
          >
            {primaryCount === 1 ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5" />
            )}
            <span>{primaryCount === 1 ? 'Primary Selected' : 'Select Primary Cover'}</span>
          </span>
        )}
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div
          className="p-3 bg-maroon-50 border border-maroon-200 rounded-xl text-xs text-maroon-900 flex items-start gap-2"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 text-maroon-700 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Drag & Drop Upload Zone (if under 5 slots) */}
      {images.length < 5 && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-maroon-700 bg-gold-100/50'
              : 'border-gold-300 bg-cream-50/70 hover:bg-gold-50/60'
          }`}
          onClick={() => {
            if (!disabled && !isUploading) fileInputRef.current?.click();
          }}
          onKeyDown={(event) => {
            if (
              !disabled &&
              !isUploading &&
              (event.key === 'Enter' || event.key === ' ')
            ) {
              event.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          role="button"
          tabIndex={disabled || isUploading ? -1 : 0}
          aria-disabled={disabled || isUploading}
          aria-label="Add product images"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="hidden"
            disabled={disabled || isUploading}
          />
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gold-100 text-maroon-800 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-maroon-950">
                {isUploading
                  ? 'Uploading image to secure storage...'
                  : 'Drag & drop image files here, or browse'}
              </p>
              <p className="text-[11px] text-charcoal-500">
                Supports up to 5 images • Max 5MB each (JPG, PNG, WebP)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hidden input for image replacement */}
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleReplaceFile}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* Image Slots List */}
      {images.length > 0 && (
        <div className="space-y-3">
          {images.map((img, idx) => {
            const previewUrl =
              previewUrls[img.id] ||
              (img.url.startsWith('indexeddb://') ? '' : img.url);
            return (
              <div
                key={img.id}
                className={`p-3.5 bg-cream-50 border rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                  img.isPrimary
                    ? 'border-gold-500 ring-2 ring-gold-400/40 shadow-xs'
                    : 'border-gold-200'
                }`}
              >
                {/* Thumbnail Preview */}
                <div className="flex items-center gap-3.5 w-full sm:w-auto">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-cream-200/60 border border-gold-200 flex-shrink-0">
                    {previewUrl ? (
                      <Image
                        src={previewUrl}
                        alt={img.altText || 'Preview'}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-charcoal-400">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}

                    {img.isPrimary && (
                      <span className="absolute bottom-0 inset-x-0 bg-maroon-900/90 text-cream-50 text-[9px] font-bold text-center py-0.5">
                        PRIMARY
                      </span>
                    )}
                  </div>

                  {/* Alt Text Input */}
                  <div className="flex-1 space-y-1">
                    <label
                      htmlFor={`image-alt-${img.id}`}
                      className="block text-[10px] font-bold text-charcoal-700 uppercase"
                    >
                      Alt Text / Description (Slot {idx + 1})
                    </label>
                    <input
                      id={`image-alt-${img.id}`}
                      type="text"
                      required
                      placeholder="e.g. Bridal Gold Necklace - Front view"
                      value={img.altText}
                      onChange={(e) => updateAltText(img.id, e.target.value)}
                      disabled={disabled || isUploading}
                      className="w-full text-xs px-2.5 py-1.5 bg-cream-100 border border-gold-200 rounded-lg text-charcoal-900 focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                {/* Controls Action Row */}
                <div className="flex items-center justify-between sm:justify-end gap-1.5 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-gold-200/60">
                  {/* Primary Selector Toggle */}
                  <button
                    type="button"
                    disabled={disabled || isUploading}
                    onClick={() => setPrimaryImage(img.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                      img.isPrimary
                        ? 'bg-gold-500 text-maroon-950 shadow-xs'
                        : 'bg-gold-100/70 hover:bg-gold-200 text-maroon-900 border border-gold-300'
                    }`}
                    aria-label={`Set slot ${idx + 1} as primary cover`}
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${img.isPrimary ? 'fill-current' : ''}`}
                    />
                    <span>{img.isPrimary ? 'Primary' : 'Make Cover'}</span>
                  </button>

                  {/* Reorder Up */}
                  <button
                    type="button"
                    disabled={disabled || isUploading || idx === 0}
                    onClick={() => moveImage(idx, 'up')}
                    className="p-1.5 text-charcoal-600 hover:text-maroon-800 disabled:opacity-30 disabled:cursor-not-allowed rounded"
                    aria-label={`Move image ${idx + 1} up`}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  {/* Reorder Down */}
                  <button
                    type="button"
                    disabled={disabled || isUploading || idx === images.length - 1}
                    onClick={() => moveImage(idx, 'down')}
                    className="p-1.5 text-charcoal-600 hover:text-maroon-800 disabled:opacity-30 disabled:cursor-not-allowed rounded"
                    aria-label={`Move image ${idx + 1} down`}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  {/* Replace Button */}
                  <button
                    type="button"
                    disabled={disabled || isUploading}
                    onClick={() => triggerReplace(img.id)}
                    className="p-1.5 text-charcoal-600 hover:text-maroon-800 rounded"
                    aria-label={`Replace image ${idx + 1}`}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>

                  {/* Remove Button */}
                  <button
                    type="button"
                    disabled={disabled || isUploading}
                    onClick={() => removeImage(img.id)}
                    className="p-1.5 text-maroon-700 hover:text-maroon-950 hover:bg-maroon-50 rounded"
                    aria-label={`Remove image ${idx + 1}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
