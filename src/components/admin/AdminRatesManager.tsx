'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RateItem, CreateRateInput } from '@/services/rates/ratesTypes';
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
} from 'lucide-react';

export const AdminRatesManager: React.FC = () => {
  const { showToast } = useToast();
  const [rates, setRates] = useState<RateItem[]>([]);
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

  const handleSaveRate = (e: React.FormEvent) => {
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
        ratesRepository.updateRate(editingId, payload);
        showToast('Rate Updated', `${label} updated successfully.`, 'success');
      } else {
        ratesRepository.addRate(payload);
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

  const handleToggleActive = (item: RateItem) => {
    const updated = ratesRepository.toggleActive(item.id);
    if (updated) {
      loadRates();
      showToast(
        updated.isActive ? 'Rate Activated' : 'Rate Deactivated',
        `${item.label} is now ${updated.isActive ? 'visible' : 'hidden'} on public /rates.`,
        'info'
      );
    }
  };

  const handleDeletePrompt = (item: RateItem) => {
    setDeleteConfirmConfig({
      isOpen: true,
      rateId: item.id,
      rateLabel: item.label,
    });
  };

  const handleConfirmDelete = () => {
    ratesRepository.deleteRate(deleteConfirmConfig.rateId);
    loadRates();
    setDeleteConfirmConfig({ isOpen: false, rateId: '', rateLabel: '' });
    showToast('Rate Deleted', 'Rate record removed successfully.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-cream-50 border border-gold-200/90 rounded-2xl p-4 shadow-card">
        <div className="space-y-0.5">
          <h2 className="text-base font-serif font-bold text-maroon-950 flex items-center gap-2">
            <Coins className="w-5 h-5 text-gold-700" />
            <span>Owner-Updated Bullion Reference Rates</span>
          </h2>
          <p className="text-xs text-charcoal-600 font-sans">
            Rates are entered manually by store owners and published to the public /rates page.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-maroon-800 hover:bg-maroon-900 text-cream-50 text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 text-gold-300" />
          <span>Add New Rate</span>
        </button>
      </div>

      {/* Rates List */}
      {rates.length > 0 ? (
        <div className="bg-cream-50 border border-gold-200/90 rounded-3xl shadow-card overflow-hidden divide-y divide-gold-200/60 font-sans">
          {rates.map((item) => (
            <div
              key={item.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gold-50/40 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-maroon-950 text-base">{item.label}</h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.isActive
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-charcoal-200 text-charcoal-700'
                    }`}
                  >
                    {item.isActive ? 'Active (Public)' : 'Inactive'}
                  </span>
                </div>
                <p className="text-xs text-charcoal-600">
                  {item.material} • Unit: <strong className="text-charcoal-800">{item.unit}</strong>
                </p>
                <p className="text-[11px] font-mono text-charcoal-500">
                  Last updated:{' '}
                  {new Date(item.lastUpdated).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-left sm:text-right">
                  <p className="text-xl font-serif font-bold text-maroon-950">
                    ₹{item.rate.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[11px] text-charcoal-500 font-sans">per {item.unit}</p>
                </div>

                <div className="flex items-center gap-1.5 border-l border-gold-200 pl-4">
                  {/* Toggle Active Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(item)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      item.isActive
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                        : 'bg-cream-100 text-charcoal-600 border-gold-300 hover:bg-gold-100'
                    }`}
                  >
                    {item.isActive ? 'Deactivate' : 'Activate'}
                  </button>

                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-2 text-charcoal-500 hover:text-maroon-900 hover:bg-gold-100 rounded-lg transition-colors cursor-pointer"
                    aria-label="Edit rate"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDeletePrompt(item)}
                    className="p-2 text-charcoal-400 hover:text-maroon-800 hover:bg-maroon-50 rounded-lg transition-colors cursor-pointer"
                    aria-label="Delete rate"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-cream-50 border border-gold-200/90 rounded-3xl p-12 text-center shadow-card space-y-3">
          <Coins className="w-12 h-12 text-gold-700 mx-auto opacity-70" />
          <h3 className="text-lg font-serif font-bold text-maroon-950">No Rates Entered</h3>
          <p className="text-xs text-charcoal-600 font-sans max-w-md mx-auto">
            When no active rates exist, the public rates section remains hidden and /rates shows &quot;Rates are currently unavailable&quot;.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 bg-maroon-800 hover:bg-maroon-900 text-cream-50 text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition-colors cursor-pointer"
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-cream-50 border border-gold-300 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gold-200/80 pb-3">
              <h3 className="text-lg font-serif font-bold text-maroon-950">
                {editingId ? 'Edit Reference Rate' : 'Add New Reference Rate'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-charcoal-400 hover:text-charcoal-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-maroon-50 border border-maroon-200 rounded-xl text-xs text-maroon-900">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveRate} className="space-y-3 font-sans">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-maroon-900">
                  Rate Label *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 22K Gold (916 Standard)"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full text-xs p-2.5 bg-cream-100 border border-gold-200 rounded-xl text-charcoal-900 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-maroon-900">
                    Material
                  </label>
                  <select
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="w-full text-xs p-2.5 bg-cream-100 border border-gold-200 rounded-xl text-charcoal-900 focus:outline-none focus:border-gold-500"
                  >
                    <option value="22K Gold">22K Gold</option>
                    <option value="24K Gold">24K Gold</option>
                    <option value="18K Gold">18K Gold</option>
                    <option value="Silver">Silver</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-maroon-900">
                    Unit
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full text-xs p-2.5 bg-cream-100 border border-gold-200 rounded-xl text-charcoal-900 focus:outline-none focus:border-gold-500"
                  >
                    <option value="per gram">per gram</option>
                    <option value="per 10 grams">per 10 grams</option>
                    <option value="per kilogram">per kilogram</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-maroon-900">
                  Numeric Rate (₹) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 7250"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="w-full text-xs p-2.5 bg-cream-100 border border-gold-200 rounded-xl text-charcoal-900 font-mono focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveRate"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-maroon-800 border-gold-300 focus:ring-gold-500"
                />
                <label htmlFor="isActiveRate" className="text-xs font-semibold text-charcoal-800">
                  Publish to Public /rates Page Immediately
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gold-200/80">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2 px-4 rounded-xl text-xs font-semibold text-charcoal-700 bg-cream-100 hover:bg-gold-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold text-cream-50 bg-maroon-800 hover:bg-maroon-900 shadow-xs"
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
