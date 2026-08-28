'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Product, ProductCategory, ProductImage } from '@/services/productTypes';
import { productRepository } from '@/services/products/productRepository';
import { imageStorageService } from '@/services/images/imageStorageService';
import { ImageUploadManager } from './ImageUploadManager';
import {
  CATEGORIES,
  GENDERS,
  PURITIES,
  AVAILABILITIES,
  OCCASIONS,
} from '@/lib/constants';
import { X, Sparkles, AlertCircle } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  productToEdit?: Product | null;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  productToEdit,
}) => {
  const isEditing = !!productToEdit;

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Rings');
  const [gender, setGender] = useState<'Women' | 'Men'>('Women');
  const [purity, setPurity] = useState<'18K' | '22K' | '24K'>('22K');
  const [approxWeight, setApproxWeight] = useState<string>('10.0');
  const [availability, setAvailability] = useState<'available' | 'made_on_order'>('available');
  const [occasion, setOccasion] = useState<string>('Wedding');
  const [tagsInput, setTagsInput] = useState<string>('');
  const [shortDescription, setShortDescription] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [skuPreview, setSkuPreview] = useState('');

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageBusy, setIsImageBusy] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const handleCancel = useCallback(() => {
    if (isSubmitting || isImageBusy || isClosing) return;

    setIsClosing(true);

    const persistedIds = new Set(
      productToEdit?.images.map((image) => image.id) ?? []
    );
    const unsavedImageIds = images
      .map((image) => image.id)
      .filter((id) => !persistedIds.has(id));

    void Promise.all(
      unsavedImageIds.map((id) => imageStorageService.deleteImage(id))
    )
      .catch((err) => {
        console.warn('Failed cleaning up unsaved product images:', err);
      })
      .finally(() => {
        setIsClosing(false);
        onClose();
      });
  }, [images, isClosing, isImageBusy, isSubmitting, onClose, productToEdit]);

  // Initialize or reset form fields
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setValidationErrors([]);
      setIsImageBusy(false);
      setIsClosing(false);

      if (productToEdit) {
        setName(productToEdit.name);
        setSlug(productToEdit.slug);
        setCategory(productToEdit.category);
        setGender(productToEdit.gender);
        setPurity(productToEdit.purity);
        setApproxWeight(productToEdit.approxWeight.toString());
        setAvailability(productToEdit.availability);
        setOccasion(productToEdit.occasion);
        setTagsInput(productToEdit.tags.join(', '));
        setShortDescription(productToEdit.shortDescription);
        setDetailedDescription(productToEdit.detailedDescription);
        setIsFeatured(productToEdit.isFeatured);
        setImages(productToEdit.images);
        setSkuPreview(productToEdit.sku);
      } else {
        setName('');
        setSlug('');
        setCategory('Rings');
        setGender('Women');
        setPurity('22K');
        setApproxWeight('10.0');
        setAvailability('available');
        setOccasion('Wedding');
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
      occasion: occasion.trim() || 'Wedding',
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
    try {
      if (isEditing && productToEdit) {
        const updated = productRepository.updateProduct(productToEdit.id, payload);
        if (updated) {
          const nextImageIds = new Set(payload.images.map((image) => image.id));
          const removedImageIds = productToEdit.images
            .map((image) => image.id)
            .filter((id) => !nextImageIds.has(id));

          await Promise.all(
            removedImageIds.map((id) => imageStorageService.deleteImage(id))
          );
          onSave(updated);
        }
      } else {
        const created = productRepository.createProduct(payload);
        onSave(created);
      }
      onClose();
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
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
        className="relative w-full max-w-3xl bg-cream-50 border border-gold-300 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-gold-200/80 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-gold-100 text-maroon-900 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-gold-200">
              <Sparkles className="w-3 h-3 text-gold-700" />
              <span>{isEditing ? 'Edit Product' : 'Add New Gold Product'}</span>
            </div>
            <h2
              id="product-form-title"
              className="text-xl sm:text-2xl font-serif font-bold text-maroon-950"
            >
              {isEditing ? `Editing: ${productToEdit.name}` : 'Create Catalogue Product'}
            </h2>
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting || isImageBusy || isClosing}
            className="p-1.5 text-charcoal-500 hover:text-maroon-900 hover:bg-gold-100 rounded-full transition-colors"
            aria-label="Close product form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation Errors Display */}
        {validationErrors.length > 0 && (
          <div className="p-4 bg-maroon-50 border border-maroon-200 rounded-2xl space-y-1.5 text-xs text-maroon-900">
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

        {/* Form Body */}
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          {/* SKU Preview & Basic Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Auto Immutable SKU */}
            <div className="space-y-1">
              <span className="block text-xs font-bold uppercase tracking-wider text-maroon-900">
                SKU (Immutable)
              </span>
              <div className="p-2.5 bg-cream-200/70 border border-gold-300 rounded-xl font-mono text-xs text-maroon-950 font-bold">
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
                className="w-full text-xs p-2.5 bg-cream-100 border border-gold-200 rounded-xl text-charcoal-900 focus:outline-none focus:border-gold-500"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                className="w-full text-xs p-2.5 bg-cream-100 border border-gold-200 rounded-xl text-charcoal-900 focus:outline-none focus:border-gold-500"
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
                className="w-full text-xs p-2.5 bg-cream-100 border border-gold-200 rounded-xl text-charcoal-900 font-mono focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          {/* Gender, Purity, Approx Weight, Availability */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                className="w-full text-xs p-2 bg-cream-100 border border-gold-200 rounded-xl text-charcoal-900 focus:outline-none"
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
                className="w-full text-xs p-2 bg-cream-100 border border-gold-200 rounded-xl text-charcoal-900 focus:outline-none"
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
                className="w-full text-xs p-2 bg-cream-100 border border-gold-200 rounded-xl text-charcoal-900 focus:outline-none font-mono"
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
                className="w-full text-xs p-2 bg-cream-100 border border-gold-200 rounded-xl text-charcoal-900 focus:outline-none"
              >
                <option value="available">Available</option>
                <option value="made_on_order">Made on Order</option>
              </select>
            </div>
          </div>

          {/* Occasion & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label
                htmlFor="product-occasion"
                className="block text-xs font-bold uppercase tracking-wider text-maroon-900"
              >
                Occasion *
              </label>
              <input
                id="product-occasion"
                type="text"
                list="occasions-list"
                required
                placeholder="e.g. Wedding, Daily Wear, Festive"
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full text-xs p-2.5 bg-cream-100 border border-gold-200 rounded-xl text-charcoal-900 focus:outline-none focus:border-gold-500"
              />
              <datalist id="occasions-list">
                {OCCASIONS.map((occ) => (
                  <option key={occ} value={occ} />
                ))}
              </datalist>
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
                className="w-full text-xs p-2.5 bg-cream-100 border border-gold-200 rounded-xl text-charcoal-900 focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          {/* Short Description */}
          <div className="space-y-1">
            <label
              htmlFor="product-short-description"
              className="block text-xs font-bold uppercase tracking-wider text-maroon-900"
            >
              Short Description *
            </label>
            <input
              id="product-short-description"
              type="text"
              required
              placeholder="1-2 sentences summarizing the jewellery piece"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full text-xs p-2.5 bg-cream-100 border border-gold-200 rounded-xl text-charcoal-900 focus:outline-none focus:border-gold-500"
            />
          </div>

          {/* Detailed Craftsmanship Description */}
          <div className="space-y-1">
            <label
              htmlFor="product-detailed-description"
              className="block text-xs font-bold uppercase tracking-wider text-maroon-900"
            >
              Detailed Description *
            </label>
            <textarea
              id="product-detailed-description"
              rows={3}
              required
              placeholder="Detailed description of craftsmanship, motifs, polish and design highlights."
              value={detailedDescription}
              onChange={(e) => setDetailedDescription(e.target.value)}
              className="w-full text-xs p-2.5 bg-cream-100 border border-gold-200 rounded-xl text-charcoal-900 focus:outline-none focus:border-gold-500"
            />
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center gap-3 p-3 bg-cream-100 border border-gold-200 rounded-xl">
            <input
              type="checkbox"
              id="featured-toggle-input"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 text-maroon-800 rounded border-gold-300 focus:ring-gold-500"
            />
            <label
              htmlFor="featured-toggle-input"
              className="text-xs font-bold text-maroon-950 cursor-pointer"
            >
              Mark as Featured Product (Highlights on Homepage &amp; Top Catalogue)
            </label>
          </div>

          {/* Local Image Upload Manager */}
          <div className="pt-2 border-t border-gold-200/80">
            <ImageUploadManager
              images={images}
              onChange={setImages}
              persistedImageIds={productToEdit?.images.map((image) => image.id) ?? []}
              onBusyChange={setIsImageBusy}
              disabled={isSubmitting || isClosing}
            />
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-4 border-t border-gold-200/80 flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting || isImageBusy || isClosing}
              className="py-2.5 px-4 rounded-xl text-xs font-semibold text-charcoal-700 hover:bg-gold-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isSubmitting || isImageBusy || isClosing}
              onClick={() => handleSubmit('draft')}
              className="py-2.5 px-5 bg-gold-100 hover:bg-gold-200 border border-gold-300 text-maroon-950 rounded-xl text-xs font-bold transition-colors shadow-2xs"
            >
              Save as Draft
            </button>

            <button
              type="button"
              disabled={isSubmitting || isImageBusy || isClosing}
              onClick={() => handleSubmit('published')}
              className="py-2.5 px-6 bg-maroon-800 hover:bg-maroon-900 text-cream-50 rounded-xl text-xs font-bold transition-colors shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
            >
              {isSubmitting
                ? 'Saving...'
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
