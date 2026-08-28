'use client';

import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm Clear',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        confirmBtnRef.current?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onCancel();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-dialog-title"
    >
      <div
        className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-xs"
        onClick={onCancel}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-sm bg-cream-50 border border-gold-300 rounded-2xl p-6 shadow-2xl z-10 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between gap-3">
          <div className="w-10 h-10 rounded-full bg-maroon-100 flex items-center justify-center text-maroon-800 flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 text-charcoal-400 hover:text-maroon-800 rounded focus:outline-none"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1.5">
          <h3
            id="confirmation-dialog-title"
            className="font-serif font-bold text-lg text-maroon-950"
          >
            {title}
          </h3>
          <p className="text-xs text-charcoal-600 font-sans leading-relaxed">
            {message}
          </p>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="py-2 px-3.5 rounded-lg text-xs font-semibold text-charcoal-700 hover:bg-gold-100 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={onConfirm}
            className="py-2 px-4 rounded-lg text-xs font-bold bg-maroon-700 hover:bg-maroon-800 text-cream-50 shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
