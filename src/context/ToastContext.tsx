'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'info' | 'error' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextType {
  showToast: (title: string, description?: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (title: string, description?: string, type: ToastType = 'success') => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast: ToastMessage = { id, title, description, type };

      setToasts((prev) => [...prev, newToast]);

      const timeoutMs = type === 'warning' ? 8000 : 4000;
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, timeoutMs);
    },
    []
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Notification Container */}
      <div
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto bg-cream-50 rounded-xl p-3.5 shadow-card-hover flex items-start justify-between gap-3 text-xs font-sans transition-all animate-in fade-in slide-in-from-bottom-2 duration-200 ${
              toast.type === 'warning' ? 'border border-amber-400' : 'border border-gold-300'
            }`}
            role="status"
          >
            <div className="flex items-start gap-2.5">
              {toast.type === 'success' && (
                <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
              )}
              {toast.type === 'error' && (
                <AlertCircle className="w-4 h-4 text-maroon-700 flex-shrink-0 mt-0.5" />
              )}
              {toast.type === 'info' && (
                <Info className="w-4 h-4 text-gold-700 flex-shrink-0 mt-0.5" />
              )}
              {toast.type === 'warning' && (
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <p className="font-semibold text-maroon-950">{toast.title}</p>
                {toast.description && (
                  <p className="text-charcoal-600 whitespace-pre-line">{toast.description}</p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-charcoal-400 hover:text-maroon-800 p-0.5 rounded focus:outline-none focus-visible:ring-1 focus-visible:ring-gold-500"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
