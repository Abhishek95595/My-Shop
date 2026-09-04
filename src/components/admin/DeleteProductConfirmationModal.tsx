'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Product } from '@/services/productTypes';
import { AlertTriangle, X, AlertCircle } from 'lucide-react';

interface DeleteProductConfirmationModalProps {
  isOpen: boolean;
  product: Product | null;
  isDeleting: boolean;
  errorMessage?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteProductConfirmationModal: React.FC<DeleteProductConfirmationModalProps> = ({
  isOpen,
  product,
  isDeleting,
  errorMessage,
  onConfirm,
  onCancel,
}) => {
  const [confirmationInput, setConfirmationInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset confirmation input whenever modal opens with a product
  useEffect(() => {
    if (isOpen) {
      setConfirmationInput('');
      document.body.style.overflow = 'hidden';

      // Auto-focus the confirmation input
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = 'unset';
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, product]);

  // Keyboard navigation & Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        onCancel();
        return;
      }

      // Tab focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = Array.from(
          modalRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => el.offsetParent !== null);

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (!firstElement || !lastElement) return;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onCancel]);

  if (!isOpen || !product) return null;

  const normalizedInput = confirmationInput.trim();
  const isConfirmed =
    normalizedInput === 'DELETE' ||
    (Boolean(product.name) && normalizedInput === product.name.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isConfirmed && !isDeleting) {
      onConfirm();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-product-dialog-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => {
          if (!isDeleting) onCancel();
        }}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-cream-50 border border-red-200 rounded-2xl p-6 shadow-2xl z-10 space-y-5 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-700 flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="p-1 text-charcoal-400 hover:text-maroon-800 rounded focus:outline-none disabled:opacity-40"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Title & Warning */}
        <div className="space-y-2">
          <h2
            id="delete-product-dialog-title"
            className="font-serif font-bold text-lg sm:text-xl text-maroon-950 leading-snug"
          >
            Permanently delete &quot;{product.name}&quot;?
          </h2>
          <p className="text-xs text-charcoal-700 font-sans leading-relaxed">
            This permanently removes the product and its uploaded media.
            <br />
            <strong className="text-red-700 font-semibold">
              This action cannot be undone.
            </strong>
          </p>
        </div>

        {/* Inline Error Area */}
        {errorMessage && (
          <div
            role="alert"
            className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-900"
          >
            <AlertCircle className="w-4 h-4 text-red-700 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold">Deletion Incomplete</p>
              <p className="text-red-800 text-[11px] leading-relaxed whitespace-pre-line">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Confirmation Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="delete-confirmation-input"
              className="block text-xs font-semibold text-charcoal-800"
            >
              To confirm, type <strong className="font-mono text-red-700 font-bold">DELETE</strong> or the exact product name:
            </label>
            <input
              id="delete-confirmation-input"
              ref={inputRef}
              type="text"
              disabled={isDeleting}
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              placeholder={`DELETE or "${product.name}"`}
              className="w-full text-xs p-2.5 bg-white border border-gold-300 rounded-xl text-charcoal-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 disabled:bg-charcoal-100"
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onCancel}
              disabled={isDeleting}
              className="py-2 px-3.5 rounded-lg text-xs font-semibold text-charcoal-700 hover:bg-gold-100 transition-colors disabled:opacity-40 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isConfirmed || isDeleting}
              className="py-2 px-4 rounded-lg text-xs font-bold bg-red-700 hover:bg-red-800 text-white shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isDeleting ? 'Deleting...' : 'Delete Permanently'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
