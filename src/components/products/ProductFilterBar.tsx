'use client';

import React from 'react';
import { Search, X, RotateCcw, SlidersHorizontal } from 'lucide-react';
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
    <div className="space-y-4">
      {/* Top Bar: Search, Quick Sort & Mobile Filter Toggle */}
      <div className="bg-cream-50 border border-gold-200/90 rounded-2xl p-4 sm:p-5 shadow-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gold-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by product name, SKU, or tags..."
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="w-full pl-10 pr-10 py-2.5 bg-cream-100/70 border border-gold-200 rounded-xl text-sm text-charcoal-900 placeholder:text-charcoal-500 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-400/20 font-sans"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-maroon-700"
              aria-label="Clear search text"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Controls & Mobile Filter Toggle */}
        <div className="flex items-center gap-3 justify-between md:justify-end flex-shrink-0">
          <div className="flex items-center gap-2">
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
              className="py-2 px-3 bg-cream-100/80 border border-gold-200 rounded-xl text-xs font-medium text-charcoal-800 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
            >
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
              <option value="weight-asc">Weight: Low to High</option>
              <option value="weight-desc">Weight: High to Low</option>
            </select>
          </div>

          {/* Mobile Filter Expand Button */}
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="md:hidden inline-flex items-center gap-1.5 py-2 px-3 bg-gold-100 border border-gold-300 text-maroon-900 rounded-xl text-xs font-semibold"
            aria-expanded={mobileFiltersOpen}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Filter Options Grid */}
      <div
        className={`bg-cream-50 border border-gold-200/80 rounded-2xl p-4 sm:p-5 shadow-card ${
          mobileFiltersOpen ? 'block' : 'hidden md:block'
        }`}
      >
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
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-maroon-700 hover:text-maroon-900 bg-gold-100 hover:bg-gold-200 px-3 py-1.5 rounded-lg border border-gold-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear all filters</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
