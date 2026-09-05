'use client';

import React, { useEffect } from 'react';
import {
  Search,
  X,
  RotateCcw,
  SlidersHorizontal,
  Check,
} from 'lucide-react';
import {
  CATEGORIES,
  GENDERS,
  PURITIES,
  WEIGHT_RANGES,
} from '@/lib/constants';

export interface FilterState {
  search: string;
  category: string;
  gender: string;
  purity: string;
  availability: string;
  occasion: string;
  weightIndex: number;
  sortBy: string;
}

interface ProductFilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  availableOccasions: string[];
  totalResults: number;
}

const AVAILABILITY_OPTIONS = [
  { value: 'All', label: 'All Statuses' },
  { value: 'available', label: 'Available' },
  { value: 'made_on_order', label: 'Made on Order' },
];

export const ProductFilterBar: React.FC<ProductFilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  availableOccasions,
  totalResults,
}) => {
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);

  useEffect(() => {
    if (mobileFiltersOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileFiltersOpen]);

  const activeFiltersCount = [
    filters.category !== 'All',
    filters.gender !== 'All',
    filters.purity !== 'All',
    filters.availability !== 'All',
    filters.occasion !== 'All',
    filters.weightIndex !== 0,
    Boolean(filters.search.trim()),
  ].filter(Boolean).length;

  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.category !== 'All' ||
    filters.gender !== 'All' ||
    filters.purity !== 'All' ||
    filters.availability !== 'All' ||
    filters.occasion !== 'All' ||
    filters.weightIndex !== 0 ||
    filters.sortBy !== 'name-asc';

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* 1-Tap Category Quick Chips on Mobile */}
      <div className="md:hidden flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
        <button
          type="button"
          onClick={() => onFilterChange({ category: 'All' })}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all min-h-[36px] ${
            filters.category === 'All'
              ? 'bg-maroon-800 text-cream-50 shadow-xs'
              : 'bg-cream-50 text-charcoal-700 border border-gold-200 hover:bg-gold-50 active:scale-95'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onFilterChange({ category: cat })}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all min-h-[36px] ${
              filters.category === cat
                ? 'bg-maroon-800 text-cream-50 shadow-xs'
                : 'bg-cream-50 text-charcoal-700 border border-gold-200 hover:bg-gold-50 active:scale-95'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Top Bar: Search, Quick Sort & Mobile Filter Toggle */}
      <div className="bg-cream-50 border border-gold-200/90 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-gold-700 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by product name, SKU, or tags..."
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="w-full pl-10 pr-10 py-2 sm:py-2.5 bg-cream-100/70 border border-gold-200 rounded-xl text-xs sm:text-sm text-charcoal-900 placeholder:text-charcoal-500 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-400/20 font-sans min-h-[42px]"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-maroon-700 p-1"
              aria-label="Clear search text"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Controls & Mobile Filter Toggle Button */}
        <div className="flex items-center gap-2 sm:gap-3 justify-between md:justify-end flex-shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 sm:flex-initial">
            <label
              htmlFor="sort-select"
              className="text-xs font-semibold text-charcoal-700 whitespace-nowrap hidden sm:inline"
            >
              Sort by:
            </label>
            <select
              id="sort-select"
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value })}
              className="w-full sm:w-auto py-2 px-2.5 bg-cream-100/80 border border-gold-200 rounded-xl text-xs font-medium text-charcoal-800 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 min-h-[42px]"
            >
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
              <option value="weight-asc">Weight: Low to High</option>
              <option value="weight-desc">Weight: High to Low</option>
            </select>
          </div>

          {/* Mobile Filter Sheet Trigger Button */}
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className={`md:hidden inline-flex items-center justify-center gap-1.5 py-2 px-3.5 border rounded-xl text-xs font-semibold min-h-[42px] min-w-[44px] active:scale-95 transition-all ${
              activeFiltersCount > 0
                ? 'bg-maroon-800 border-maroon-900 text-cream-50 shadow-xs'
                : 'bg-gold-100 border-gold-300 text-maroon-900'
            }`}
            aria-expanded={mobileFiltersOpen}
            aria-label={`Open filters. ${activeFiltersCount} filters currently active.`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 bg-gold-400 text-maroon-950 rounded-full text-[10px] font-bold flex items-center justify-center ml-0.5">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Desktop Filter Options Grid */}
      <div className="hidden md:block bg-cream-50 border border-gold-200/80 rounded-2xl p-5 shadow-card">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* Category Filter */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-maroon-900">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => onFilterChange({ category: e.target.value })}
              className="w-full py-1.5 px-2.5 bg-cream-100 border border-gold-200 rounded-lg text-xs text-charcoal-800 focus:outline-none focus:border-gold-500"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Gender Filter */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-maroon-900">
              Gender
            </label>
            <select
              value={filters.gender}
              onChange={(e) => onFilterChange({ gender: e.target.value })}
              className="w-full py-1.5 px-2.5 bg-cream-100 border border-gold-200 rounded-lg text-xs text-charcoal-800 focus:outline-none focus:border-gold-500"
            >
              <option value="All">All Genders</option>
              {GENDERS.map((gen) => (
                <option key={gen} value={gen}>
                  {gen}
                </option>
              ))}
            </select>
          </div>

          {/* Purity Filter */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-maroon-900">
              Gold Purity
            </label>
            <select
              value={filters.purity}
              onChange={(e) => onFilterChange({ purity: e.target.value })}
              className="w-full py-1.5 px-2.5 bg-cream-100 border border-gold-200 rounded-lg text-xs text-charcoal-800 focus:outline-none focus:border-gold-500"
            >
              <option value="All">All Purities</option>
              {PURITIES.map((pur) => (
                <option key={pur} value={pur}>
                  {pur} Gold
                </option>
              ))}
            </select>
          </div>

          {/* Availability Filter */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-maroon-900">
              Availability
            </label>
            <select
              value={filters.availability}
              onChange={(e) => onFilterChange({ availability: e.target.value })}
              className="w-full py-1.5 px-2.5 bg-cream-100 border border-gold-200 rounded-lg text-xs text-charcoal-800 focus:outline-none focus:border-gold-500"
            >
              {AVAILABILITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Occasion Filter */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-maroon-900">
              Occasion
            </label>
            <select
              value={filters.occasion}
              onChange={(e) => onFilterChange({ occasion: e.target.value })}
              className="w-full py-1.5 px-2.5 bg-cream-100 border border-gold-200 rounded-lg text-xs text-charcoal-800 focus:outline-none focus:border-gold-500"
            >
              <option value="All">All Occasions</option>
              {availableOccasions.map((occ) => (
                <option key={occ} value={occ}>
                  {occ}
                </option>
              ))}
            </select>
          </div>

          {/* Weight Range Filter */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-maroon-900">
              Approx. Weight
            </label>
            <select
              value={filters.weightIndex}
              onChange={(e) =>
                onFilterChange({ weightIndex: Number(e.target.value) })
              }
              className="w-full py-1.5 px-2.5 bg-cream-100 border border-gold-200 rounded-lg text-xs text-charcoal-800 focus:outline-none focus:border-gold-500"
            >
              {WEIGHT_RANGES.map((rng, index) => (
                <option key={rng.label} value={index}>
                  {rng.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Summary & Reset Action */}
        <div className="mt-4 pt-3 border-t border-gold-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-charcoal-600 font-sans">
            Showing <strong className="text-maroon-900">{totalResults}</strong> gold{' '}
            {totalResults === 1 ? 'piece' : 'pieces'}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-maroon-700 hover:text-maroon-900 bg-gold-100 hover:bg-gold-200 px-3 py-1.5 rounded-lg border border-gold-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear all filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Filter Bottom Sheet Modal */}
      {mobileFiltersOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden flex flex-col justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Filter Catalogue"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileFiltersOpen(false)}
            aria-hidden="true"
          />

          {/* Bottom Sheet Modal Container */}
          <div className="relative bg-cream-50 rounded-t-3xl border-t border-gold-300 shadow-2xl max-h-[85vh] flex flex-col z-10 animate-in slide-in-from-bottom duration-200">
            {/* Top Drag Indicator */}
            <div className="w-12 h-1.5 bg-gold-300/80 rounded-full mx-auto mt-2.5 mb-1" />

            {/* Header */}
            <div className="px-4 py-3 border-b border-gold-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-base text-maroon-950">
                  Filter Jewellery
                </h2>
                {activeFiltersCount > 0 && (
                  <span className="bg-gold-100 text-maroon-900 border border-gold-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {activeFiltersCount} active
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={onResetFilters}
                    className="text-xs font-semibold text-maroon-800 hover:text-maroon-950 px-2 py-1 rounded focus:outline-none focus-visible:ring-1 focus-visible:ring-gold-500"
                  >
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center text-charcoal-600 hover:text-maroon-800 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Filter Categories & Pills */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              {/* Category */}
              <div className="space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-maroon-900">
                  Category
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => onFilterChange({ category: 'All' })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      filters.category === 'All'
                        ? 'bg-maroon-800 text-cream-50 font-bold'
                        : 'bg-cream-100 text-charcoal-700 border border-gold-200 hover:bg-gold-100/60'
                    }`}
                  >
                    All Categories
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => onFilterChange({ category: cat })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        filters.category === cat
                          ? 'bg-maroon-800 text-cream-50 font-bold'
                          : 'bg-cream-100 text-charcoal-700 border border-gold-200 hover:bg-gold-100/60'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-maroon-900">
                  Gender
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => onFilterChange({ gender: 'All' })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      filters.gender === 'All'
                        ? 'bg-maroon-800 text-cream-50 font-bold'
                        : 'bg-cream-100 text-charcoal-700 border border-gold-200 hover:bg-gold-100/60'
                    }`}
                  >
                    All Genders
                  </button>
                  {GENDERS.map((gen) => (
                    <button
                      key={gen}
                      type="button"
                      onClick={() => onFilterChange({ gender: gen })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        filters.gender === gen
                          ? 'bg-maroon-800 text-cream-50 font-bold'
                          : 'bg-cream-100 text-charcoal-700 border border-gold-200 hover:bg-gold-100/60'
                      }`}
                    >
                      {gen}
                    </button>
                  ))}
                </div>
              </div>

              {/* Purity */}
              <div className="space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-maroon-900">
                  Gold Purity
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => onFilterChange({ purity: 'All' })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      filters.purity === 'All'
                        ? 'bg-maroon-800 text-cream-50 font-bold'
                        : 'bg-cream-100 text-charcoal-700 border border-gold-200 hover:bg-gold-100/60'
                    }`}
                  >
                    All Purities
                  </button>
                  {PURITIES.map((pur) => (
                    <button
                      key={pur}
                      type="button"
                      onClick={() => onFilterChange({ purity: pur })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        filters.purity === pur
                          ? 'bg-maroon-800 text-cream-50 font-bold'
                          : 'bg-cream-100 text-charcoal-700 border border-gold-200 hover:bg-gold-100/60'
                      }`}
                    >
                      {pur} Gold
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-maroon-900">
                  Availability
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABILITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => onFilterChange({ availability: opt.value })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        filters.availability === opt.value
                          ? 'bg-maroon-800 text-cream-50 font-bold'
                          : 'bg-cream-100 text-charcoal-700 border border-gold-200 hover:bg-gold-100/60'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Occasion */}
              {availableOccasions.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-maroon-900">
                    Occasion
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => onFilterChange({ occasion: 'All' })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        filters.occasion === 'All'
                          ? 'bg-maroon-800 text-cream-50 font-bold'
                          : 'bg-cream-100 text-charcoal-700 border border-gold-200 hover:bg-gold-100/60'
                      }`}
                    >
                      All Occasions
                    </button>
                    {availableOccasions.map((occ) => (
                      <button
                        key={occ}
                        type="button"
                        onClick={() => onFilterChange({ occasion: occ })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          filters.occasion === occ
                            ? 'bg-maroon-800 text-cream-50 font-bold'
                            : 'bg-cream-100 text-charcoal-700 border border-gold-200 hover:bg-gold-100/60'
                        }`}
                      >
                        {occ}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Weight Range */}
              <div className="space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-maroon-900">
                  Approx. Weight
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {WEIGHT_RANGES.map((rng, index) => (
                    <button
                      key={rng.label}
                      type="button"
                      onClick={() => onFilterChange({ weightIndex: index })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        filters.weightIndex === index
                          ? 'bg-maroon-800 text-cream-50 font-bold'
                          : 'bg-cream-100 text-charcoal-700 border border-gold-200 hover:bg-gold-100/60'
                      }`}
                    >
                      {rng.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Sticky Action Bar */}
            <div className="p-3 sm:p-4 border-t border-gold-200/80 bg-cream-100/95 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-maroon-800 hover:bg-maroon-900 active:scale-[0.98] text-cream-50 rounded-xl font-semibold text-xs shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-maroon-700 min-h-[44px]"
              >
                <Check className="w-4 h-4" />
                <span>Show {totalResults} {totalResults === 1 ? 'Product' : 'Products'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
