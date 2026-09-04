'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Product } from '@/services/productTypes';
import { productRepository } from '@/services/products/productRepository';
import { RepositoryStatus } from '@/services/types';
import { ProductCard } from '@/components/products/ProductCard';
import {
  ProductFilterBar,
  FilterState,
} from '@/components/products/ProductFilterBar';
import { WEIGHT_RANGES, STORE_NAME } from '@/lib/constants';
import { Sparkles, PackageSearch, RotateCcw, ShieldAlert } from 'lucide-react';

function CatalogueContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialCategory = searchParams.get('category') || 'All';
  const initialGender = searchParams.get('gender') || 'All';
  const initialPurity = searchParams.get('purity') || 'All';
  const initialAvailability = searchParams.get('availability') || 'All';
  const initialOccasion = searchParams.get('occasion') || 'All';
  const initialSearch = searchParams.get('q') || '';

  const [filters, setFilters] = useState<FilterState>({
    search: initialSearch,
    category: initialCategory,
    gender: initialGender,
    purity: initialPurity,
    availability: initialAvailability,
    occasion: initialOccasion,
    weightIndex: 0,
    sortBy: 'name-asc',
  });

  // Initialize both server and client to the exact same deterministic loading state
  // to avoid React hydration mismatches between SSR and browser initial render.
  const [publishedProducts, setPublishedProducts] = useState<Product[]>([]);
  const [loadStatus, setLoadStatus] = useState<RepositoryStatus>('loading');

  useEffect(() => {
    const syncCatalogue = () => {
      setPublishedProducts(productRepository.getPublishedProducts());
      setLoadStatus(productRepository.getPublishedStatus());
    };

    // Load initial products on client mount
    syncCatalogue();

    window.addEventListener('koh_products_updated', syncCatalogue);
    window.addEventListener('storage', syncCatalogue);

    return () => {
      window.removeEventListener('koh_products_updated', syncCatalogue);
      window.removeEventListener('storage', syncCatalogue);
    };
  }, []);

  // Extract unique occasions dynamically
  const availableOccasions = useMemo(() => {
    const set = new Set<string>();
    publishedProducts.forEach((p) => {
      if (p.occasion) set.add(p.occasion);
    });
    return Array.from(set);
  }, [publishedProducts]);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => {
      const updated = { ...prev, ...newFilters };
      const params = new URLSearchParams();
      if (updated.category !== 'All') params.set('category', updated.category);
      if (updated.gender !== 'All') params.set('gender', updated.gender);
      if (updated.purity !== 'All') params.set('purity', updated.purity);
      if (updated.availability !== 'All')
        params.set('availability', updated.availability);
      if (updated.occasion !== 'All') params.set('occasion', updated.occasion);
      if (updated.search.trim()) params.set('q', updated.search.trim());

      const queryStr = params.toString();
      router.replace(queryStr ? `/catalogue?${queryStr}` : '/catalogue', {
        scroll: false,
      });
      return updated;
    });
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: 'All',
      gender: 'All',
      purity: 'All',
      availability: 'All',
      occasion: 'All',
      weightIndex: 0,
      sortBy: 'name-asc',
    });
    router.replace('/catalogue', { scroll: false });
  };

  // Filter and sort product records
  const filteredProducts = useMemo(() => {
    return publishedProducts
      .filter((product) => {
        // 1. Search Query
        if (filters.search.trim()) {
          const query = filters.search.toLowerCase().trim();
          const matchesName = product.name.toLowerCase().includes(query);
          const matchesSku = product.sku.toLowerCase().includes(query);
          const matchesTag = product.tags.some((t: string) =>
            t.toLowerCase().includes(query)
          );
          const matchesDesc = product.shortDescription
            .toLowerCase()
            .includes(query);
          if (!matchesName && !matchesSku && !matchesTag && !matchesDesc) {
            return false;
          }
        }

        // 2. Category
        if (filters.category !== 'All' && product.category !== filters.category) {
          return false;
        }

        // 3. Gender
        if (filters.gender !== 'All' && product.gender !== filters.gender) {
          return false;
        }

        // 4. Purity
        if (filters.purity !== 'All' && product.purity !== filters.purity) {
          return false;
        }

        // 5. Availability
        if (
          filters.availability !== 'All' &&
          product.availability !== filters.availability
        ) {
          return false;
        }

        // 6. Occasion
        if (
          filters.occasion !== 'All' &&
          product.occasion.toLowerCase() !== filters.occasion.toLowerCase()
        ) {
          return false;
        }

        // 7. Weight Range
        const currentWeightRange = WEIGHT_RANGES[filters.weightIndex];
        if (currentWeightRange) {
          if (
            product.approxWeight < currentWeightRange.min ||
            product.approxWeight >= currentWeightRange.max
          ) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'name-asc') {
          return a.name.localeCompare(b.name);
        }
        if (filters.sortBy === 'name-desc') {
          return b.name.localeCompare(a.name);
        }
        if (filters.sortBy === 'weight-asc') {
          return a.approxWeight - b.approxWeight;
        }
        if (filters.sortBy === 'weight-desc') {
          return b.approxWeight - a.approxWeight;
        }
        return 0;
      });
  }, [publishedProducts, filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Page Header */}
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-2 bg-gold-100/90 border border-gold-300 text-maroon-900 text-xs font-semibold px-3 py-1 rounded-full shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-gold-700" />
          <span>18K, 22K and 24K Gold Jewellery</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-maroon-950">
          Gold Jewellery Catalogue
        </h1>
        <p className="text-sm sm:text-base text-charcoal-700 font-sans leading-relaxed">
          Browse our bridal sets, classic rings, mangalsutras, chains, and bangles. Each piece is crafted with quality and care at {STORE_NAME} in Gorakhpur.
        </p>
      </div>

      {/* Firestore Load Error State */}
      {loadStatus === 'error' ? (
        <div
          role="alert"
          className="bg-cream-50 border border-maroon-300 rounded-2xl p-10 sm:p-14 text-center shadow-card space-y-4 max-w-xl mx-auto"
        >
          <div className="w-16 h-16 rounded-full bg-maroon-100 text-maroon-800 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8 text-maroon-700" />
          </div>
          <h2 className="text-xl font-serif font-bold text-maroon-950">
            Catalogue could not be loaded right now.
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-600 font-sans leading-relaxed">
            We could not reach the product database. This is a temporary technical issue.
            Please try again later or visit our Gorakhpur showroom directly.
          </p>
        </div>
      ) : loadStatus === 'loading' ? (
        <div className="bg-cream-50 border border-gold-200/90 rounded-2xl p-12 text-center shadow-card space-y-3 max-w-xl mx-auto">
          <PackageSearch className="w-12 h-12 text-gold-700 mx-auto opacity-70 animate-pulse" />
          <h2 className="text-lg font-serif font-bold text-maroon-950">Loading Catalogue…</h2>
          <p className="text-xs text-charcoal-600 font-sans">
            Fetching gold jewellery from Cloud Firestore.
          </p>
        </div>
      ) : (
        <>
          {/* Filter and Search Controls */}
          <ProductFilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            availableOccasions={availableOccasions}
            totalResults={filteredProducts.length}
          />

          {/* Product Results Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  eagerImage={index < 5}
                />
              ))}
            </div>
          ) : (
            /* Empty Results State */
            <div className="bg-cream-50 border border-gold-200/90 rounded-2xl p-10 sm:p-14 text-center shadow-card space-y-4 max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-gold-100 text-maroon-700 flex items-center justify-center mx-auto">
                <PackageSearch className="w-8 h-8 text-gold-700" />
              </div>
              <h2 className="text-xl font-serif font-bold text-maroon-950">
                No Jewellery Matches Your Selection
              </h2>
              <p className="text-sm text-charcoal-600 font-sans leading-relaxed">
                We couldn't find any gold jewellery matching all your current filters. Try loosening your search criteria or resetting filters.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 bg-maroon-700 hover:bg-maroon-800 text-cream-50 font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                >
                  <RotateCcw className="w-4 h-4 text-gold-300" />
                  <span>Clear All Filters</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function CataloguePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-center text-charcoal-600">
          Loading gold jewellery catalogue...
        </div>
      }
    >
      <CatalogueContent />
    </Suspense>
  );
}
