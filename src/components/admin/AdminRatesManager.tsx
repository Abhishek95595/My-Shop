'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RateItem, CreateRateInput } from '@/services/rates/ratesTypes';
import { RepositoryStatus } from '@/services/types';
import { ratesRepository } from '@/services/rates/ratesRepository';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';
import { useToast } from '@/context/ToastContext';
import {
  Coins,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  X,
  Save,
  AlertTriangle,
} from 'lucide-react';

export const AdminRatesManager: React.FC = () => {
  const { showToast } = useToast();
  const [rates, setRates] = useState<RateItem[]>([]);
  const [loadStatus, setLoadStatus] = useState<RepositoryStatus>('loading');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [label, setLabel] = useState('');
  const [material, setMaterial] = useState('22K Gold');
  const [rate, setRate] = useState('');
  const [unit, setUnit] = useState('per gram');
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete Confirmation Modal State
  const [deleteConfirmConfig, setDeleteConfirmConfig] = useState<{
    isOpen: boolean;
    rateId: string;
    rateLabel: string;
  }>({
    isOpen: false,
    rateId: '',
    rateLabel: '',
  });

  const loadRates = useCallback(() => {
    setRates(ratesRepository.getAllRates());
    setLoadStatus(ratesRepository.getStatus());
  }, []);

  useEffect(() => {
    loadRates();

    const handleUpdate = () => loadRates();
    window.addEventListener('koh_rates_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('koh_rates_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadRates]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setLabel('22K Gold (916 Standard)');
    setMaterial('22K Gold');
    setRate('');
    setUnit('per gram');
    setIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: RateItem) => {
    setEditingId(item.id);
    setLabel(item.label);
    setMaterial(item.material);
    setRate(item.rate.toString());
    setUnit(item.unit);
    setIsActive(item.isActive);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveRate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const numRate = parseFloat(rate);
    if (isNaN(numRate) || numRate <= 0) {
      setFormError('Please enter a valid numeric rate greater than zero.');
      return;
    }

    try {
      const payload: CreateRateInput = {
        label,
        material,
        rate: numRate,
        unit,
        isActive,
      };

      if (editingId) {
        await ratesRepository.updateRate(editingId, payload);
        showToast('Rate Updated', `${label} updated successfully.`, 'success');
      } else {
        await ratesRepository.addRate(payload);
        showToast('Rate Added', `${label} created successfully.`, 'success');
      }

      setIsModalOpen(false);
      loadRates();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('Failed to save rate.');
      }
    }
  };

  const handleToggleActive = async (item: RateItem) => {
    try {
      const updated = await ratesRepository.toggleActive(item.id);
      if (updated) {
        loadRates();
        showToast(
          updated.isActive ? 'Rate Activated' : 'Rate Deactivated',
          `${item.label} is now ${updated.isActive ? 'visible' : 'hidden'} on public /rates.`,
          'info'
        );
      }
    } catch (err: unknown) {
      const detail = err instanceof Error ? err.message : 'Failed to toggle rate status.';
      showToast('Operation Failed', detail, 'error');
    }
  };

  const handleDeletePrompt = (item: RateItem) => {
    setDeleteConfirmConfig({
      isOpen: true,
      rateId: item.id,
      rateLabel: item.label,
    });
  };

  const handleConfirmDelete = async () => {
    try {
      await ratesRepository.deleteRate(deleteConfirmConfig.rateId);
      loadRates();
      setDeleteConfirmConfig({ isOpen: false, rateId: '', rateLabel: '' });
      showToast('Rate Deleted', 'Rate record removed successfully.', 'info');
    } catch (err: unknown) {
      setDeleteConfirmConfig({ isOpen: false, rateId: '', rateLabel: '' });
      const detail = err instanceof Error ? err.message : 'Failed to delete rate.';
      showToast('Delete Failed', detail, 'error');
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Header & Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-cream-50 border border-gold-200/90 rounded-2xl p-3.5 sm:p-4 shadow-card">
        <div className="space-y-0.5">
          <h2 className="text-sm sm:text-base font-serif font-bold text-maroon-950 flex items-center gap-2">
            <Coins className="w-5 h-5 text-gold-700 flex-shrink-0" />
            <span>Owner-Updated Bullion Reference Rates</span>
          </h2>
          <p className="text-xs text-charcoal-600 font-sans">
            Rates are entered manually by authorized administrators on the owner&apos;s behalf and published to the public /rates page.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 bg-maroon-800 hover:bg-maroon-900 text-cream-50 text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition-colors w-full sm:w-auto min-h-[44px] cursor-pointer flex-shrink-0"
        >
          <Plus className="w-4 h-4 text-gold-300" />
          <span>Add New Rate</span>
        </button>
      </div>

      {/* Rates List */}
      {loadStatus === 'error' ? (
        <div
          role="alert"
          className="bg-cream-50 border border-maroon-300 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center shadow-card space-y-3"
        >
          <AlertTriangle className="w-12 h-12 text-maroon-700 mx-auto opacity-80" />
          <h3 className="text-lg font-serif font-bold text-maroon-950">
            Rates Could Not Be Loaded
          </h3>
          <p className="text-xs text-charcoal-600 font-sans max-w-md mx-auto">
            Cloud Firestore returned an error for the rates collection. This is a load failure, not
            an empty rates list — do not re-enter rates until the connection is restored, or you may
            create duplicates.
          </p>
        </div>
      ) : loadStatus === 'loading' ? (
        <div className="bg-cream-50 border border-gold-200/90 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center shadow-card space-y-3">
          <Coins className="w-12 h-12 text-gold-700 mx-auto opacity-70 animate-pulse" />
          <h3 className="text-lg font-serif font-bold text-maroon-950">Loading Rates…</h3>
          <p className="text-xs text-charcoal-600 font-sans">
            Fetching owner reference rates from Cloud Firestore.
          </p>
        </div>
      ) : rates.length > 0 ? (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block bg-cream-50 border border-gold-200/90 rounded-2xl sm:rounded-3xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-cream-200/60 border-b border-gold-200 text-maroon-950 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Rate Label &amp; Material</th>
                    <th className="py-3.5 px-4">Unit</th>
                    <th className="py-3.5 px-4">Numeric Rate</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Last Updated</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-200/60 text-charcoal-800">
                  {rates.map((item) => (
                    <tr key={item.id} className="hover:bg-gold-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-serif font-bold text-maroon-950 text-sm">{item.label}</p>
                        <p className="text-[11px] text-charcoal-500 font-sans">{item.material}</p>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-charcoal-800">
                        {item.unit}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-serif font-bold text-maroon-950 text-base">
                          ₹{item.rate.toLocaleString('en-IN')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                            item.isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-charcoal-200 text-charcoal-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.isActive ? 'bg-emerald-600' : 'bg-charcoal-500'
                            }`}
                          />
                          <span>{item.isActive ? 'Active (Public)' : 'Inactive'}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-charcoal-500 whitespace-nowrap">
                        {new Date(item.lastUpdated).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(item)}
                          aria-pressed={item.isActive}
                          className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                            item.isActive
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-cream-100 text-charcoal-600 border-gold-300 hover:bg-gold-100'
                          }`}
                        >
                          {item.isActive ? 'Deactivate' : 'Activate'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-charcoal-500 hover:text-maroon-900 hover:bg-gold-100 rounded-lg transition-colors cursor-pointer"
                          aria-label={`Edit ${item.label}`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeletePrompt(item)}
                          className="p-1.5 text-charcoal-400 hover:text-maroon-800 hover:bg-maroon-50 rounded-lg transition-colors cursor-pointer"
                          aria-label={`Delete ${item.label}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards View (>=44px touch targets, clear wrap, no horizontal scroll) */}
          <div className="md:hidden space-y-3 font-sans">
            {rates.map((item) => (
              <div
                key={item.id}
                className="bg-cream-50 border border-gold-200/90 rounded-2xl p-3.5 sm:p-4 shadow-card space-y-3"
              >
                {/* Header: Label, Material, Status Badge */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="space-y-0.5 min-w-0">
                    <h3 className="font-serif font-bold text-maroon-950 text-base leading-snug break-words">
                      {item.label}
                    </h3>
                    <p className="text-xs text-charcoal-600">
                      {item.material} • Unit: <strong className="text-charcoal-800">{item.unit}</strong>
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${
                      item.isActive
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-charcoal-200 text-charcoal-700'
                    }`}
                  >
                    {item.isActive ? 'Active (Public)' : 'Inactive'}
                  </span>
                </div>

                {/* Price Display and Last Updated */}
                <div className="flex items-baseline justify-between pt-1 border-t border-gold-200/50">
                  <div>
                    <span className="text-2xl font-serif font-bold text-maroon-950">
                      ₹{item.rate.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-charcoal-500 font-sans ml-1.5">
                      {item.unit}
                    </span>
                  </div>

                  <p className="text-[10px] font-mono text-charcoal-500">
                    Updated: {new Date(item.lastUpdated).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                </div>

                {/* Action Controls Row (>=44px touch targets) */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gold-200/50">
                  {/* Active/Inactive Toggle Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(item)}
                    aria-pressed={item.isActive}
                    aria-label={`${item.isActive ? 'Deactivate' : 'Activate'} ${item.label}`}
                    className={`flex-1 min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors inline-flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer ${
                      item.isActive
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                        : 'bg-cream-100 text-charcoal-700 border-gold-300 hover:bg-gold-100'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${item.isActive ? 'text-emerald-700' : 'text-charcoal-400'}`} />
                    <span>{item.isActive ? 'Publicly Active' : 'Set Active'}</span>
                  </button>

                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="min-h-[44px] px-3.5 py-2 bg-cream-100 hover:bg-gold-100 text-maroon-900 border border-gold-300 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                    aria-label={`Edit ${item.label}`}
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDeletePrompt(item)}
                    className="min-h-[44px] px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                    aria-label={`Delete ${item.label}`}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-cream-50 border border-gold-200/90 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center shadow-card space-y-3">
          <Coins className="w-12 h-12 text-gold-700 mx-auto opacity-70" />
          <h3 className="text-lg font-serif font-bold text-maroon-950">No Rates Entered</h3>
          <p className="text-xs text-charcoal-600 font-sans max-w-md mx-auto">
            When no active rates exist, the public rates section remains hidden and /rates shows &quot;Rates are currently unavailable&quot;.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 bg-maroon-800 hover:bg-maroon-900 text-cream-50 text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition-colors cursor-pointer min-h-[44px]"
            >
              <Plus className="w-4 h-4 text-gold-300" />
              <span>Add First Rate</span>
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Rate Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-charcoal-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rate-form-title"
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setIsModalOpen(false);
              return;
            }

            if (event.key === 'Tab') {
              const focusable = Array.from(
                event.currentTarget.querySelectorAll<HTMLElement>(
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
          }}
        >
          <div className="bg-cream-50 border border-gold-300 rounded-2xl sm:rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gold-200/80 pb-3">
              <h3
                id="rate-form-title"
                className="text-base sm:text-lg font-serif font-bold text-maroon-950"
              >
                {editingId ? 'Edit Reference Rate' : 'Add New Reference Rate'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-charcoal-400 hover:text-charcoal-700 rounded-lg min-h-[36px] min-w-[36px] inline-flex items-center justify-center"
                aria-label="Close rate form"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div
                className="p-3 bg-maroon-50 border border-maroon-200 rounded-xl text-xs text-maroon-900"
                role="alert"
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveRate} className="space-y-3 font-sans">
              <div className="space-y-1">
                <label
                  htmlFor="rate-label"
                  className="block text-xs font-bold uppercase tracking-wider text-maroon-900"
                >
                  Rate Label *
                </label>
                <input
                  id="rate-label"
                  autoFocus
                  type="text"
                  required
                  placeholder="e.g. 22K Gold (916 Standard)"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full text-xs p-2.5 bg-cream-100 border border-gold-200 rounded-xl text-charcoal-900 focus:outline-none focus:border-gold-500 min-h-[44px]"
                />
              </div>

              {/* Material and Unit stacked vertically on phones */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label
                    htmlFor="rate-material"
                    className="block text-xs font-bold uppercase tracking-wider text-maroon-900"
                  >
                    Material / Description
                  </label>
                  <input
                    id="rate-material"
                    type="text"
                    required
                    list="rate-material-options"
                    placeholder="e.g. 22K Gold"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="w-full text-xs p-2.5 bg-cream-100 border border-gold-200 rounded-xl text-charcoal-900 focus:outline-none focus:border-gold-500 min-h-[44px]"
                  />
                  <datalist id="rate-material-options">
                    <option value="18K Gold" />
                    <option value="22K Gold" />
                    <option value="24K Gold" />
                    <option value="Silver" />
                  </datalist>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="rate-unit"
                    className="block text-xs font-bold uppercase tracking-wider text-maroon-900"
                  >
                    Unit
                  </label>
                  <input
                    id="rate-unit"
                    type="text"
                    required
                    list="rate-unit-options"
                    placeholder="e.g. per gram"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full text-xs p-2.5 bg-cream-100 border border-gold-200 rounded-xl text-charcoal-900 focus:outline-none focus:border-gold-500 min-h-[44px]"
                  />
                  <datalist id="rate-unit-options">
                    <option value="per gram" />
                    <option value="per 10 grams" />
                    <option value="per kilogram" />
                  </datalist>
                </div>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="rate-value"
                  className="block text-xs font-bold uppercase tracking-wider text-maroon-900"
                >
                  Numeric Rate (₹) *
                </label>
                <input
                  id="rate-value"
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 7250"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="w-full text-xs p-2.5 bg-cream-100 border border-gold-200 rounded-xl text-charcoal-900 font-mono focus:outline-none focus:border-gold-500 min-h-[44px]"
                />
              </div>

              <div className="flex items-center gap-2.5 p-3 bg-cream-100 border border-gold-200 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  id="isActiveRate"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-maroon-800 border-gold-300 focus:ring-gold-500"
                />
                <label htmlFor="isActiveRate" className="text-xs font-semibold text-charcoal-800 cursor-pointer">
                  Publish to Public /rates Page Immediately
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gold-200/80">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="min-h-[44px] py-2.5 px-4 rounded-xl text-xs font-semibold text-charcoal-700 bg-cream-100 hover:bg-gold-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] inline-flex items-center justify-center gap-1.5 py-2.5 px-5 rounded-xl text-xs font-bold text-cream-50 bg-maroon-800 hover:bg-maroon-900 shadow-xs transition-colors"
                >
                  <Save className="w-3.5 h-3.5 text-gold-300" />
                  <span>{editingId ? 'Save Changes' : 'Create Rate'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmConfig.isOpen}
        title={`Delete Rate "${deleteConfirmConfig.rateLabel}"?`}
        message="Are you sure you want to permanently remove this rate entry?"
        confirmLabel="Delete Rate"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmConfig({ isOpen: false, rateId: '', rateLabel: '' })}
      />
    </div>
  );
};
