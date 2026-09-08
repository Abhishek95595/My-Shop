'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Product, ProductCategory, ProductImage } from '@/services/productTypes';
import { productRepository } from '@/services/products/productRepository';
import { imageStorageService } from '@/services/images/imageStorageService';
import {
  cleanupUploadedImages,
  calculateRemovedCloudImages,
  reconcileImagesAfterRollback,
} from '@/services/images/productImageLifecycle';
import { ImageUploadManager } from './ImageUploadManager';
import {
  CATEGORIES,
  GENDERS,
  PURITIES,
  AVAILABILITIES,
  OCCASIONS,
} from '@/lib/constants';
import { X, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

export interface CleanupNotice {
  failedPaths: string[];
}

export interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product, cleanupNotice?: CleanupNotice) => void;
  productToEdit?: Product | null;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  productToEdit,
}) => {
  const isEditing = !!productToEdit;

  const [allocatedProductId, setAllocatedProductId] = useState<string>('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Rings');
  const [gender, setGender] = useState<'Women' | 'Men'>('Women');
  const [purity, setPurity] = useState<'18K' | '22K' | '24K'>('22K');
  const [approxWeight, setApproxWeight] = useState<string>('10.0');
  const [availability, setAvailability] = useState<'available' | 'made_on_order'>('available');
  const [selectedOccasionOption, setSelectedOccasionOption] = useState<string>('Wedding');
  const [customOccasionText, setCustomOccasionText] = useState<string>('');
  const [tagsInput, setTagsInput] = useState<string>('');
  const [shortDescription, setShortDescription] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [skuPreview, setSkuPreview] = useState('');

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [customOccasionError, setCustomOccasionError] = useState<string | null>(null);
  const [cleanupWarning, setCleanupWarning] = useState<string | null>(null);
  const [cleanupFailureInfo, setCleanupFailureInfo] = useState<{
    paths: string[];
    message: string;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageBusy, setIsImageBusy] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const sessionUploadedPaths = useRef<Set<string>>(new Set());
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const handleCancel = useCallback(async () => {
    if (isSubmitting || isImageBusy || isCleaningUp || isClosing) return;

    // If no cloud uploads were performed in this session, close immediately
    if (sessionUploadedPaths.current.size === 0) {
      // Legacy cleanup if any
      const persistedIds = new Set(
        productToEdit?.images.map((image) => image.id) ?? []
      );
      const unsavedImageIds = images
        .map((image) => image.id)
        .filter((id) => !persistedIds.has(id));
      void Promise.all(
        unsavedImageIds.map((id) => imageStorageService.deleteImage(id))
      ).catch(() => {});

      onClose();
      return;
    }

    setIsCleaningUp(true);
    setCleanupFailureInfo(null);

    const pathsToClean = Array.from(sessionUploadedPaths.current);
    const cleanupResult = await cleanupUploadedImages(pathsToClean, allocatedProductId);

    // Also clean up any legacy unsaved images
    const persistedIds = new Set(
      productToEdit?.images.map((image) => image.id) ?? []
    );
    const unsavedImageIds = images
      .map((image) => image.id)
      .filter((id) => !persistedIds.has(id));
    void Promise.all(
      unsavedImageIds.map((id) => imageStorageService.deleteImage(id))
    ).catch(() => {});

    if (cleanupResult.failed.length > 0) {
      // Keep modal open and report failed cleanup paths to the administrator
      setIsCleaningUp(false);
      const failedList = cleanupResult.failed.map((f) => f.path);
      // Remove successfully deleted paths from tracking
      cleanupResult.deleted.forEach((p) => sessionUploadedPaths.current.delete(p));
      cleanupResult.alreadyMissing.forEach((p) => sessionUploadedPaths.current.delete(p));

      // Reconcile form images so deleted ones do not remain in form state
      const reconciled = reconcileImagesAfterRollback(images, cleanupResult, {
        isEditing,
        persistedImages: productToEdit?.images,
      });
      setImages(reconciled);

      setCleanupFailureInfo({
        paths: failedList,
        message: 'Could not clean up some newly uploaded images from Cloud Storage. You can retry cleanup or close anyway.',
      });
    } else {
      sessionUploadedPaths.current.clear();
      setIsCleaningUp(false);
      onClose();
    }
  }, [allocatedProductId, images, isCleaningUp, isClosing, isEditing, isImageBusy, isSubmitting, onClose, productToEdit]);

  // Initialize or reset form fields
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setValidationErrors([]);
      setCleanupWarning(null);
      setCleanupFailureInfo(null);
      setIsImageBusy(false);
      setIsCleaningUp(false);
      setIsClosing(false);
      sessionUploadedPaths.current.clear();

      if (productToEdit) {
        setAllocatedProductId(productToEdit.id);
        setName(productToEdit.name);
        setSlug(productToEdit.slug);
        setCategory(productToEdit.category);
        setGender(productToEdit.gender);
        setPurity(productToEdit.purity);
        setApproxWeight(productToEdit.approxWeight.toString());
        setAvailability(productToEdit.availability);
        const occ = typeof productToEdit.occasion === 'string' ? productToEdit.occasion.trim() : '';
        setSelectedOccasionOption(occ);
        setCustomOccasionText('');
        setCustomOccasionError(null);
        setTagsInput(productToEdit.tags.join(', '));
        setShortDescription(productToEdit.shortDescription || '');
        setDetailedDescription(productToEdit.detailedDescription || '');
        setIsFeatured(productToEdit.isFeatured);
        setImages(productToEdit.images);
        setSkuPreview(productToEdit.sku);
      } else {
        const stableId = productRepository.generateProductId();
        setAllocatedProductId(stableId);
        setName('');
        setSlug('');
        setCategory('Rings');
        setGender('Women');
        setPurity('22K');
        setApproxWeight('10.0');
        setAvailability('available');
        setSelectedOccasionOption('Wedding');
        setCustomOccasionText('');
        setCustomOccasionError(null);
        setTagsInput('Wedding, 22K Gold');
        setShortDescription('');
        setDetailedDescription('');
        setIsFeatured(false);
        setImages([]);
        setSkuPreview(productRepository.generateUniqueSku('Rings'));
      }

      setTimeout(() => {
        closeBtnRef.current?.focus();
      }, 50);

      return () => {
        document.body.style.overflow = 'unset';
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, productToEdit]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCancel();
        return;
      }

      if (event.key === 'Tab' && modalRef.current) {
        const focusable = Array.from(
          modalRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
          )
        ).filter((element) => element.offsetParent !== null);

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCancel, isOpen]);

  // Update SKU preview on category change for new products
  useEffect(() => {
    if (!isEditing && isOpen) {
      setSkuPreview(productRepository.generateUniqueSku(category));
    }
  }, [category, isEditing, isOpen]);

  // Auto-generate slug when name changes for new products
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing) {
      const generated = productRepository.generateUniqueSlug(val);
      setSlug(generated);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (desiredStatus: 'draft' | 'published') => {
    if (isSubmitting || isImageBusy || isClosing) return;

    setValidationErrors([]);
    const weightNum = parseFloat(approxWeight);

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (selectedOccasionOption === '__other__' && !customOccasionText.trim()) {
      setCustomOccasionError('Please enter a custom occasion name.');
      setValidationErrors(['Please enter a custom occasion name.']);
      return;
    }

    setCustomOccasionError(null);

    const finalOccasion =
      selectedOccasionOption === '__other__'
        ? customOccasionText.trim()
        : selectedOccasionOption.trim();

    const payload: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
      sku: isEditing ? productToEdit.sku : skuPreview,
      name: name.trim(),
      slug: slug.trim(),
      category,
      gender,
      purity,
      approxWeight: isNaN(weightNum) ? 0 : weightNum,
      availability,
      shortDescription: shortDescription.trim(),
      detailedDescription: detailedDescription.trim(),
      occasion: finalOccasion,
      tags: parsedTags,
      isFeatured,
      status: desiredStatus,
      images,
    };

    if (desiredStatus === 'published') {
      const validation = productRepository.validateForPublish(payload);
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        return;
      }
    } else {
      // Basic draft validation
      if (!payload.name) {
        setValidationErrors(['Draft products must at least include a name.']);
        return;
      }
    }

    setIsSubmitting(true);
    setValidationErrors([]);
    setCleanupWarning(null);
    setCleanupFailureInfo(null);

    try {
      if (isEditing && productToEdit) {
        let updated: Product | null = null;
        try {
          updated = await productRepository.updateProduct(productToEdit.id, payload);
        } catch (updateErr: unknown) {
          // Firestore save failed: Roll back ONLY new uploads created in this edit session
          const newUploads = Array.from(sessionUploadedPaths.current);
          const rollbackResult = await cleanupUploadedImages(newUploads, productToEdit.id);
          const baseMsg = updateErr instanceof Error ? updateErr.message : String(updateErr);

          // Reconcile images state: restore to productToEdit.images, plus any uploads whose deletion failed
          const reconciled = reconcileImagesAfterRollback(images, rollbackResult, {
            isEditing: true,
            persistedImages: productToEdit.images,
          });
          setImages(reconciled);

          // Update session tracking: remove deleted and already-missing paths
          rollbackResult.deleted.forEach((p) => sessionUploadedPaths.current.delete(p));
          rollbackResult.alreadyMissing.forEach((p) => sessionUploadedPaths.current.delete(p));

          if (rollbackResult.failed.length > 0) {
            setValidationErrors([
              `${baseMsg}. Also failed rolling back unsaved cloud images: ${rollbackResult.failed.map((f) => f.path).join(', ')}.`,
            ]);
          } else {
            setValidationErrors([baseMsg]);
          }
          return;
        }

        if (updated) {
          // Firestore update succeeded!
          // Perform post-save cleanup of removed cloud images
          const toDelete = calculateRemovedCloudImages(
            productToEdit.images,
            payload.images,
            productToEdit.id
          );
          const postCleanup = await cleanupUploadedImages(toDelete, productToEdit.id);

          // Clean up any removed legacy IndexedDB images
          const nextImageIds = new Set(payload.images.map((image) => image.id));
          const removedLegacyIds = productToEdit.images
            .filter((image) => !image.storagePath)
            .map((image) => image.id)
            .filter((id) => !nextImageIds.has(id));
          void Promise.all(
            removedLegacyIds.map((id) => imageStorageService.deleteImage(id))
          ).catch(() => {});

          sessionUploadedPaths.current.clear();

          const cleanupNotice: CleanupNotice | undefined =
            postCleanup.failed.length > 0
              ? { failedPaths: postCleanup.failed.map((f) => f.path) }
              : undefined;

          onSave?.(updated, cleanupNotice);
          onClose();
        }
      } else {
        // Create mode
        let created: Product | null = null;
        try {
          created = await productRepository.createProduct(payload, allocatedProductId);
        } catch (createErr: unknown) {
          // Firestore create failed: Roll back all session uploads
          const uploadsToRollback = Array.from(sessionUploadedPaths.current);
          const rollbackResult = await cleanupUploadedImages(uploadsToRollback, allocatedProductId);
          const baseMsg = createErr instanceof Error ? createErr.message : String(createErr);

          // Reconcile images state: prune any successfully deleted or already-missing images
          const reconciled = reconcileImagesAfterRollback(images, rollbackResult, {
            isEditing: false,
          });
          setImages(reconciled);

          // Update session tracking: remove deleted and already-missing paths
          rollbackResult.deleted.forEach((p) => sessionUploadedPaths.current.delete(p));
          rollbackResult.alreadyMissing.forEach((p) => sessionUploadedPaths.current.delete(p));

          if (rollbackResult.failed.length > 0) {
            setValidationErrors([
              `${baseMsg}. Also failed rolling back uploaded cloud images: ${rollbackResult.failed.map((f) => f.path).join(', ')}.`,
            ]);
          } else {
            setValidationErrors([baseMsg]);
          }
          return;
        }

        if (created) {
          // Check for any unreferenced session uploads (e.g. if removal failed earlier)
          const savedPaths = new Set(
            payload.images.map((img) => img.storagePath).filter(Boolean) as string[]
          );
          const unreferencedSessionUploads = Array.from(sessionUploadedPaths.current).filter(
            (p) => !savedPaths.has(p)
          );
          let postCleanupNotice: CleanupNotice | undefined;
          if (unreferencedSessionUploads.length > 0) {
            const cleanupRes = await cleanupUploadedImages(
              unreferencedSessionUploads,
              allocatedProductId
            );
            if (cleanupRes.failed.length > 0) {
              postCleanupNotice = { failedPaths: cleanupRes.failed.map((f) => f.path) };
            }
          }

          sessionUploadedPaths.current.clear();
          onSave?.(created, postCleanupNotice);
          onClose();
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setValidationErrors([err.message]);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-form-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-xs transition-opacity"
        onClick={handleCancel}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        ref={modalRef}
        className="relative w-full max-w-3xl bg-cream-50 border border-gold-300 rounded-2xl sm:rounded-3xl shadow-2xl z-10 flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Fixed Header */}
        <div className="flex-shrink-0 flex items-start justify-between gap-3 border-b border-gold-200/80 p-4 sm:p-6 pb-3.5 sm:pb-4 bg-cream-50">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-gold-100 text-maroon-900 text-[10px] sm:text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-gold-200">
              <Sparkles className="w-3 h-3 text-gold-700" />
              <span>{isEditing ? 'Edit Product' : 'Add New Gold Product'}</span>
            </div>
            <h2
              id="product-form-title"
              className="text-lg sm:text-2xl font-serif font-bold text-maroon-950 leading-snug"
            >
              {isEditing ? `Editing: ${productToEdit.name}` : 'Create Catalogue Product'}
            </h2>
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting || isImageBusy || isCleaningUp || isClosing}
            className="p-2 text-charcoal-500 hover:text-maroon-900 hover:bg-gold-100 rounded-full transition-colors disabled:opacity-40 min-h-[38px] min-w-[38px] inline-flex items-center justify-center cursor-pointer"
            aria-label="Close product form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Form wrapping scrollable content and pinned footer */}
        <form
          id="product-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit('published');
          }}
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
        >
          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 overscroll-contain">
            {/* Cleanup Failure Modal Box */}
            {cleanupFailureInfo && (
              <div className="p-3.5 sm:p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-2 text-xs text-amber-950">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0" />
                  <span>Storage Cleanup Notice</span>
                </div>
                <p className="text-amber-800 leading-relaxed">{cleanupFailureInfo.message}</p>
                <div className="font-mono text-[11px] bg-amber-100/70 p-2 rounded-lg space-y-1 text-amber-900">
                  {cleanupFailureInfo.paths.map((p, idx) => (
                    <div key={idx} className="truncate">• {p}</div>
                  ))}
                </div>
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="min-h-[38px] py-1.5 px-3 bg-amber-200 hover:bg-amber-300 text-amber-950 rounded-lg font-bold text-[11px] transition-colors"
                  >
                    Retry Cleanup
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sessionUploadedPaths.current.clear();
                      setCleanupFailureInfo(null);
                      onClose();
                    }}
                    className="min-h-[38px] py-1.5 px-3 bg-maroon-800 hover:bg-maroon-900 text-cream-50 rounded-lg font-bold text-[11px] transition-colors"
                  >
                    Close Anyway
                  </button>
                </div>
              </div>
            )}

            {/* Validation Errors Display */}
            {validationErrors.length > 0 && (
              <div className="p-3.5 sm:p-4 bg-maroon-50 border border-maroon-200 rounded-2xl space-y-1.5 text-xs text-maroon-900">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-4 h-4 text-maroon-700 flex-shrink-0" />
                  <span>Please resolve the following before proceeding:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 pl-2 text-maroon-800">
                  {validationErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* SKU Preview & Basic Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            {/* Auto Immutable SKU */}
            <div className="space-y-1">
              <span className="block text-xs font-bold uppercase tracking-wider text-maroon-900">
                SKU (Immutable)
              </span>
              <div className="p-2.5 bg-cream-200/70 border border-gold-300 rounded-xl font-mono text-xs text-maroon-950 font-bold min-h-[44px] flex items-center">
                {skuPreview || 'Generating SKU...'}
              </div>
              <p className="text-[10px] text-charcoal-500 font-sans">
                Automatically assigned sequential code.
              </p>
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label
                htmlFor="product-category"
                className="block text-xs font-bold uppercase tracking-wider text-maroon-900"
              >
                Category *
              </label>
              <select
                id="product-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full text-xs p-2.5 bg-cream-100 border border-gold-200 rounded-xl text-charcoal-900 focus:outline-none focus:border-gold-500 min-h-[44px]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Name & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div className="space-y-1">
              <label
                htmlFor="product-name"
                className="block text-xs font-bold uppercase tracking-wider text-maroon-900"
              >
                Product Name *
              </label>
              <input
                id="product-name"
                type="text"
                required
                placeholder="e.g. Royal Bridal Gold Necklace"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full text-xs p-2.5 bg-cream-100 border border-gold-200 rounded-xl text-charcoal-900 focus:outline-none focus:border-gold-500 min-h-[44px]"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="product-slug"
                className="block text-xs font-bold uppercase tracking-wider text-maroon-900"
              >
                URL Slug *
              </label>
              <input
                id="product-slug"
                type="text"
                required
                placeholder="e.g. royal-bridal-gold-necklace"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full text-xs p-2.5 bg-cream-100 border border-gold-200 rounded-xl text-charcoal-900 font-mono focus:outline-none focus:border-gold-500 min-h-[44px]"
              />
            </div>
          </div>

          {/* Gender, Purity, Approx Weight, Availability - Stack cleanly on phones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label
                htmlFor="product-gender"
                className="block text-[11px] font-bold uppercase text-maroon-900"
              >
                Gender *
              </label>
              <select
                id="product-gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as 'Women' | 'Men')}
                disabled={isSubmitting || isClosing || isCleaningUp}
                className="w-full text-xs p-2.5 bg-cream-100 border border-gold-200 rounded-xl text-charcoal-900 focus:outline-none min-h-[44px]"
              >
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="product-purity"
                className="block text-[11px] font-bold uppercase text-maroon-900"
              >
                Purity *
              </label>
              <select
                id="product-purity"
                value={purity}
                onChange={(e) => setPurity(e.target.value as '18K' | '22K' | '24K')}
                disabled={isSubmitting || isClosing || isCleaningUp}
                className="w-full text-xs p-2.5 bg-cream-100 border border-gold-200 rounded-xl text-charcoal-900 focus:outline-none min-h-[44px]"
              >
                {PURITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="product-weight"
                className="block text-[11px] font-bold uppercase text-maroon-900"
              >
                Weight (g) *
              </label>
              <input
                id="product-weight"
                type="number"
                step="0.1"
                min="0.1"
                required
                value={approxWeight}
                onChange={(e) => setApproxWeight(e.target.value)}
                disabled={isSubmitting || isClosing || isCleaningUp}
                className="w-full text-xs p-2.5 bg-cream-100 border border-gold-200 rounded-xl text-charcoal-900 focus:outline-none font-mono min-h-[44px]"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="product-availability"
                className="block text-[11px] font-bold uppercase text-maroon-900"
              >
                Availability *
              </label>
              <select
                id="product-availability"
                value={availability}
                onChange={(e) =>
                  setAvailability(
                    e.target.value === 'available' ? 'available' : 'made_on_order'
                  )
                }
                disabled={isSubmitting || isClosing || isCleaningUp}
                className="w-full text-xs p-2.5 bg-cream-100 border border-gold-200 rounded-xl text-charcoal-900 focus:outline-none min-h-[44px]"
              >
                <option value="available">Available</option>
                <option value="made_on_order">Made on Order</option>
              </select>
            </div>
          </div>

          {/* Occasion & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div className="space-y-1">
              <label
                htmlFor="product-occasion"
                className="block text-xs font-bold uppercase tracking-wider text-maroon-900"
              >
                Occasion *
              </label>
              <select
                id="product-occasion"
                value={selectedOccasionOption}
                onChange={(e) => {
                  setSelectedOccasionOption(e.target.value);
                  setCustomOccasionError(null);
                  if (e.target.value !== '__other__') {
                    setCustomOccasionText('');
                  }
                }}
                disabled={isSubmitting || isClosing || isCleaningUp}
                className="w-full text-xs p-2.5 bg-cream-100 border border-gold-200 rounded-xl text-charcoal-900 focus:outline-none focus:border-gold-500 min-h-[44px] cursor-pointer"
              >
                {!OCCASIONS.includes(selectedOccasionOption as any) &&
                  selectedOccasionOption !== '__other__' && (
                    <option value={selectedOccasionOption}>
                      {selectedOccasionOption ? selectedOccasionOption : '-- Select Occasion --'}
                    </option>
                  )}
                {OCCASIONS.map((occ) => (
                  <option key={occ} value={occ}>
                    {occ}
                  </option>
                ))}
                <option value="__other__">Other (Custom Occasion)</option>
              </select>

              {selectedOccasionOption === '__other__' && (
                <div className="pt-2 space-y-1">
                  <input
                    id="product-custom-occasion"
                    type="text"
                    required
                    placeholder="Enter custom occasion (e.g. Anniversary)"
                    value={customOccasionText}
                    onChange={(e) => {
                      setCustomOccasionText(e.target.value);
                      if (e.target.value.trim()) {
                        setCustomOccasionError(null);
                      }
                    }}
                    aria-invalid={!!customOccasionError}
                    aria-describedby={customOccasionError ? 'custom-occasion-error' : undefined}
                    disabled={isSubmitting || isClosing || isCleaningUp}
                    className={`w-full text-xs p-2.5 bg-cream-100 border rounded-xl text-charcoal-900 focus:outline-none focus:border-gold-500 min-h-[44px] ${
                      customOccasionError ? 'border-red-500 bg-red-50/20' : 'border-gold-300'
                    }`}
                  />
                  {customOccasionError && (
                    <p
                      id="custom-occasion-error"
                      role="alert"
                      className="text-[11px] text-red-600 font-medium flex items-center gap-1"
                    >
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{customOccasionError}</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label
                htmlFor="product-tags"
                className="block text-xs font-bold uppercase tracking-wider text-maroon-900"
              >
                Tags (Comma separated)
              </label>
              <input
                id="product-tags"
                type="text"
                placeholder="e.g. Bridal, Handcrafted, 22K Gold"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                disabled={isSubmitting || isClosing || isCleaningUp}
                className="w-full text-xs p-2.5 bg-cream-100 border border-gold-200 rounded-xl text-charcoal-900 focus:outline-none focus:border-gold-500 min-h-[44px]"
              />
            </div>
          </div>

          {/* Short Description */}
          <div className="space-y-1">
            <label
              htmlFor="product-short-description"
              className="block text-xs font-bold uppercase tracking-wider text-maroon-900"
            >
              Short Description <span className="text-charcoal-500 font-normal lowercase">(optional)</span>
            </label>
            <input
              id="product-short-description"
              type="text"
              placeholder="1-2 sentences summarizing the jewellery piece"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              disabled={isSubmitting || isClosing || isCleaningUp}
              className="w-full text-xs p-2.5 bg-cream-100 border border-gold-200 rounded-xl text-charcoal-900 focus:outline-none focus:border-gold-500 min-h-[44px]"
            />
          </div>

          {/* Detailed Craftsmanship Description */}
          <div className="space-y-1">
            <label
              htmlFor="product-detailed-description"
              className="block text-xs font-bold uppercase tracking-wider text-maroon-900"
            >
              Detailed Description <span className="text-charcoal-500 font-normal lowercase">(optional)</span>
            </label>
            <textarea
              id="product-detailed-description"
              rows={3}
              placeholder="Detailed description of craftsmanship, motifs, polish and design highlights."
              value={detailedDescription}
              onChange={(e) => setDetailedDescription(e.target.value)}
              disabled={isSubmitting || isClosing || isCleaningUp}
              className="w-full text-xs p-2.5 bg-cream-100 border border-gold-200 rounded-xl text-charcoal-900 focus:outline-none focus:border-gold-500"
            />
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center gap-3 p-3 bg-cream-100 border border-gold-200 rounded-xl min-h-[44px] cursor-pointer">
            <input
              type="checkbox"
              id="featured-toggle-input"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              disabled={isSubmitting || isClosing || isCleaningUp}
              className="w-4 h-4 text-maroon-800 rounded border-gold-300 focus:ring-gold-500 cursor-pointer"
            />
            <label
              htmlFor="featured-toggle-input"
              className="text-xs font-bold text-maroon-950 cursor-pointer"
            >
              Mark as Featured Product (Highlights on Homepage &amp; Top Catalogue)
            </label>
          </div>

          {/* Secure Firebase Storage Image Upload Manager */}
          <div className="pt-2 border-t border-gold-200/80">
            <ImageUploadManager
              productId={allocatedProductId}
              images={images}
              onChange={setImages}
              persistedImageIds={productToEdit?.images.map((image) => image.id) ?? []}
              persistedStoragePaths={
                productToEdit?.images
                  .map((image) => image.storagePath)
                  .filter((p): p is string => Boolean(p)) ?? []
              }
              onImageUploaded={(img) => {
                if (img.storagePath) {
                  sessionUploadedPaths.current.add(img.storagePath);
                }
              }}
              onSessionUploadSuperseded={(storagePath) => {
                sessionUploadedPaths.current.delete(storagePath);
              }}
              onBusyChange={setIsImageBusy}
              disabled={isSubmitting || isClosing || isCleaningUp}
            />
          </div>
        </div>

        {/* Pinned Action Footer */}
        <div className="flex-shrink-0 bg-cream-50/98 backdrop-blur-xs border-t border-gold-200/80 px-4 py-3 sm:px-6 sm:py-3.5 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sm:pb-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 z-10 shadow-md sm:shadow-none">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting || isImageBusy || isCleaningUp || isClosing}
            className="min-h-[44px] py-2.5 px-4 rounded-xl text-xs font-semibold text-charcoal-700 hover:bg-gold-100 transition-colors disabled:opacity-40 text-center cursor-pointer"
          >
            {isCleaningUp ? 'Cleaning up...' : 'Cancel'}
          </button>

          <button
            type="button"
            disabled={isSubmitting || isImageBusy || isCleaningUp || isClosing}
            onClick={() => handleSubmit('draft')}
            className="min-h-[44px] py-2.5 px-5 bg-gold-100 hover:bg-gold-200 border border-gold-300 text-maroon-950 rounded-xl text-xs font-bold transition-colors shadow-2xs disabled:opacity-40 text-center cursor-pointer"
          >
            Save as Draft
          </button>

          <button
            type="submit"
            disabled={isSubmitting || isImageBusy || isCleaningUp || isClosing}
            onClick={() => handleSubmit('published')}
            className="min-h-[44px] py-2.5 px-6 bg-maroon-800 hover:bg-maroon-900 text-cream-50 rounded-xl text-xs font-bold transition-colors shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 disabled:opacity-40 text-center cursor-pointer"
          >
            {isSubmitting
              ? 'Saving...'
              : isCleaningUp
                ? 'Cleaning Up...'
                : isImageBusy
                  ? 'Finishing Image...'
                  : isClosing
                    ? 'Closing...'
                    : 'Publish Product'}
          </button>
        </div>
        </form>
      </div>
    </div>
  );
};
