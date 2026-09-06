'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/context/ToastContext';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { isFirebaseConfigured } from '@/lib/firebase/client';
import { AdminAccessDenied } from '@/components/admin/AdminAccessDenied';
import { ProductFormModal } from '@/components/admin/ProductFormModal';
import { DeleteProductConfirmationModal } from '@/components/admin/DeleteProductConfirmationModal';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';
import { AdminEnquiriesManager } from '@/components/admin/AdminEnquiriesManager';
import { AdminRatesManager } from '@/components/admin/AdminRatesManager';
import { Product } from '@/services/productTypes';
import { RepositoryStatus } from '@/services/types';
import { productRepository } from '@/services/products/productRepository';
import { enquiryRepository } from '@/services/enquiries/enquiryRepository';
import { ratesRepository } from '@/services/rates/ratesRepository';
import { getPrimaryImage, formatWeight } from '@/services/mockProducts';
import {
  Package,
  CheckCircle2,
  FileText,
  Archive,
  Star,
  Plus,
  Search,
  ExternalLink,
  Edit,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Layers,
  MessageSquare,
  Coins,
  LogOut,
  AlertTriangle,
  Trash2,
} from 'lucide-react';

type AdminTab = 'products' | 'enquiries' | 'rates';

export default function AdminDashboardPage() {
  const { adminUser, isAdminAuthenticated, isLoading, adminLogout } = useAdminAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [productsStatus, setProductsStatus] = useState<RepositoryStatus>('loading');
  const [failedCollections, setFailedCollections] = useState<string[]>([]);
  const [enquiriesCount, setEnquiriesCount] = useState<number>(0);
  const [ratesCount, setRatesCount] = useState<number>(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Deletion state for permanently deleting archived products
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

  // Confirmation Modal state for Archive / Restore
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: '',
    onConfirm: () => {},
  });

  const loadData = useCallback(() => {
    setProducts(productRepository.getAllProducts());
    setProductsStatus(productRepository.getStatus());
    setEnquiriesCount(enquiryRepository.getAllEnquiries().length);
    setRatesCount(ratesRepository.getAllRates().length);

    // A Firestore load failure must never be presented as an empty collection.
    setFailedCollections(
      [
        productRepository.getStatus() === 'error' ? 'Products' : null,
        enquiryRepository.getStatus() === 'error' ? 'Customer Enquiries' : null,
        ratesRepository.getStatus() === 'error' ? 'Owner Rates' : null,
      ].filter((name): name is string => name !== null)
    );
  }, []);

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('koh_products_updated', handleUpdate);
    window.addEventListener('koh_enquiries_updated', handleUpdate);
    window.addEventListener('koh_rates_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('koh_products_updated', handleUpdate);
      window.removeEventListener('koh_enquiries_updated', handleUpdate);
      window.removeEventListener('koh_rates_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-charcoal-600 font-sans">
        Loading Admin Dashboard...
      </div>
    );
  }

  // Admin Access Guard
  if (!isAdminAuthenticated) {
    return <AdminAccessDenied />;
  }

  // Summary Metrics
  const totalCount = products.length;
  const publishedCount = products.filter((p) => p.status === 'published').length;
  const draftCount = products.filter((p) => p.status === 'draft').length;
  const archivedCount = products.filter((p) => p.status === 'archived').length;
  const featuredCount = products.filter((p) => p.isFeatured).length;

  // Filtered Products List
  const filteredProducts = products.filter((p) => {
    const matchesStatus =
      selectedStatus === 'all' ? true : p.status === selectedStatus;

    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.purity.toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });

  const handleCreateNew = () => {
    setEditingProduct(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormModalOpen(true);
  };

  const handlePublish = async (product: Product) => {
    try {
      await productRepository.setStatus(product.id, 'published');
      loadData();
      showToast('Product Published', `${product.name} is now live in the Catalogue.`, 'success');
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast('Publish Failed', err.message, 'error');
      }
    }
  };

  const handleSetDraft = async (product: Product) => {
    try {
      await productRepository.setStatus(product.id, 'draft');
      loadData();
      showToast('Moved to Drafts', `${product.name} is now hidden from public view.`, 'info');
    } catch (err: unknown) {
      const detail = err instanceof Error ? err.message : 'Failed to set draft status.';
      showToast('Operation Failed', detail, 'error');
    }
  };

  const handleArchivePrompt = (product: Product) => {
    setConfirmModalConfig({
      isOpen: true,
      title: `Archive "${product.name}"?`,
      message:
        'Archiving will remove this product from the public catalogue. You can restore it to Drafts at any time.',
      confirmLabel: 'Archive Product',
      onConfirm: async () => {
        try {
          await productRepository.setStatus(product.id, 'archived');
          loadData();
          setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }));
          showToast('Product Archived', `${product.name} has been archived.`, 'info');
        } catch (err: unknown) {
          setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }));
          const detail = err instanceof Error ? err.message : 'Failed to archive product.';
          showToast('Archive Failed', detail, 'error');
        }
      },
    });
  };

  const handleRestorePrompt = (product: Product) => {
    setConfirmModalConfig({
      isOpen: true,
      title: `Restore "${product.name}"?`,
      message: 'This product will be restored as a Draft. You can edit and publish it when ready.',
      confirmLabel: 'Restore to Drafts',
      onConfirm: async () => {
        try {
          await productRepository.setStatus(product.id, 'draft');
          loadData();
          setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }));
          showToast('Product Restored', `${product.name} restored to Draft status.`, 'success');
        } catch (err: unknown) {
          setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }));
          const detail = err instanceof Error ? err.message : 'Failed to restore product.';
          showToast('Restore Failed', detail, 'error');
        }
      },
    });
  };

  const handleDeletePrompt = (product: Product) => {
    setDeleteErrorMessage(null);
    setDeletingProduct(product);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct || isDeleting) return;

    setIsDeleting(true);
    setDeleteErrorMessage(null);

    try {
      await productRepository.deleteProductPermanently(deletingProduct);
      const deletedName = deletingProduct.name;
      setDeletingProduct(null);
      setIsDeleting(false);
      loadData();
      showToast(
        'Product Deleted',
        `"${deletedName}" and its uploaded media were permanently deleted.`,
        'success'
      );
    } catch (err: unknown) {
      setIsDeleting(false);
      const detail =
        err instanceof Error ? err.message : 'Failed to permanently delete product.';
      setDeleteErrorMessage(detail);
      showToast('Delete Failed', detail, 'error');
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    try {
      const updated = await productRepository.toggleFeatured(product.id);
      loadData();
      if (updated) {
        showToast(
          updated.isFeatured ? 'Marked as Featured' : 'Unmarked as Featured',
          `${product.name} featured state updated.`,
          'info'
        );
      }
    } catch (err: unknown) {
      const detail = err instanceof Error ? err.message : 'Failed to toggle featured status.';
      showToast('Operation Failed', detail, 'error');
    }
  };

  return (
    <div data-testid="admin-dashboard" className="max-w-7xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8 md:py-12 space-y-6 sm:space-y-8">
      {/* Firestore Load Failure Notice */}
      {failedCollections.length > 0 && (
        <div
          role="alert"
          className="bg-maroon-50 border border-maroon-300 rounded-2xl p-3.5 sm:p-4 flex items-start gap-3 text-xs text-maroon-950 font-sans shadow-xs"
        >
          <AlertTriangle className="w-5 h-5 text-maroon-700 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Store database could not be loaded</p>
            <p className="text-charcoal-700 text-[11px] leading-relaxed">
              {failedCollections.join(', ')} failed to load from Cloud Firestore (permission or
              network failure). The counts and lists below are <strong>not</strong> a record of an
              empty store and no local data is being substituted. Check your connection and
              administrator permissions, then reload.
            </p>
          </div>
        </div>
      )}

      {/* Top Banner Notice */}
      <div className="bg-gold-100/90 border border-gold-300 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-maroon-950 font-sans shadow-xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-gold-700 flex-shrink-0" />
          <div>
            <p className="font-bold text-[11px] sm:text-xs">
              {isFirebaseConfigured ? 'Firebase Admin Mode' : 'Development Admin Mode • Local Demonstration'}
            </p>
            <p className="text-charcoal-600 text-[10px] sm:text-[11px] truncate max-w-[280px] sm:max-w-none">
              Authorized admin: <strong className="text-maroon-900">{adminUser?.email}</strong>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-gold-300/60">
          <span className="bg-cream-50 border border-gold-300 text-maroon-900 text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full">
            {isFirebaseConfigured ? 'Cloud Firestore' : 'IndexedDB Mode'}
          </span>
          <button
            type="button"
            onClick={() => adminLogout()}
            className="flex items-center gap-1.5 py-1.5 px-3 bg-maroon-800 hover:bg-maroon-900 text-cream-50 rounded-lg font-bold text-xs min-h-[38px] transition-colors shadow-sm cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gold-200/80 pb-5 sm:pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gold-800 uppercase tracking-widest bg-gold-100/90 border border-gold-300 px-3 py-0.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-gold-700" />
            <span>Store Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-maroon-950">
            Admin Management
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-600 font-sans">
            Manage catalogue products, customer enquiries, and owner bullion reference rates.
          </p>
        </div>

        {activeTab === 'products' && (
          <button
            type="button"
            onClick={handleCreateNew}
            className="inline-flex items-center justify-center gap-2 bg-maroon-800 hover:bg-maroon-900 text-cream-50 font-bold px-5 py-3 rounded-xl shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 w-full sm:w-auto min-h-[44px] cursor-pointer"
          >
            <Plus className="w-4 h-4 text-gold-300" />
            <span>Add Product</span>
          </button>
        )}
      </div>

      {/* Admin Module Navigation Tabs - Horizontally scrollable on mobile without overflow */}
      <div className="overflow-x-auto pb-1 -mx-3.5 px-3.5 sm:mx-0 sm:px-0 border-b border-gold-200/80">
        <div className="flex items-center gap-2 min-w-max">
          <button
            data-testid="admin-tab-products"
            type="button"
            onClick={() => setActiveTab('products')}
            className={`inline-flex items-center gap-2 py-2.5 px-3.5 sm:px-4 rounded-xl text-xs font-bold transition-all min-h-[44px] cursor-pointer ${
              activeTab === 'products'
                ? 'bg-maroon-800 text-cream-50 shadow-xs'
                : 'bg-cream-50 text-charcoal-700 hover:bg-gold-100 border border-gold-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Catalogue Products ({totalCount})</span>
          </button>

          <button
            data-testid="admin-tab-enquiries"
            type="button"
            onClick={() => setActiveTab('enquiries')}
            className={`inline-flex items-center gap-2 py-2.5 px-3.5 sm:px-4 rounded-xl text-xs font-bold transition-all min-h-[44px] cursor-pointer ${
              activeTab === 'enquiries'
                ? 'bg-maroon-800 text-cream-50 shadow-xs'
                : 'bg-cream-50 text-charcoal-700 hover:bg-gold-100 border border-gold-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Customer Enquiries ({enquiriesCount})</span>
          </button>

          <button
            data-testid="admin-tab-rates"
            type="button"
            onClick={() => setActiveTab('rates')}
            className={`inline-flex items-center gap-2 py-2.5 px-3.5 sm:px-4 rounded-xl text-xs font-bold transition-all min-h-[44px] cursor-pointer ${
              activeTab === 'rates'
                ? 'bg-maroon-800 text-cream-50 shadow-xs'
                : 'bg-cream-50 text-charcoal-700 hover:bg-gold-100 border border-gold-200'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Owner Rates ({ratesCount})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PRODUCT MANAGEMENT */}
      {activeTab === 'products' && (
        <div data-testid="admin-products-section" className="space-y-6 sm:space-y-8">
          {/* Metric Summary Cards Grid - 2 columns on mobile */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
            <div className="bg-cream-50 border border-gold-200/90 rounded-2xl p-3 sm:p-4 shadow-card flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gold-100 text-maroon-800 flex items-center justify-center flex-shrink-0">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-gold-700" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-[11px] font-bold uppercase text-charcoal-500 truncate">Total Products</p>
                <p className="text-lg sm:text-xl font-serif font-bold text-maroon-950">{totalCount}</p>
              </div>
            </div>

            <div className="bg-cream-50 border border-gold-200/90 rounded-2xl p-3 sm:p-4 shadow-card flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-[11px] font-bold uppercase text-charcoal-500 truncate">Published</p>
                <p className="text-lg sm:text-xl font-serif font-bold text-emerald-900">{publishedCount}</p>
              </div>
            </div>

            <div className="bg-cream-50 border border-gold-200/90 rounded-2xl p-3 sm:p-4 shadow-card flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gold-100 text-gold-800 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gold-700" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-[11px] font-bold uppercase text-charcoal-500 truncate">Drafts</p>
                <p className="text-lg sm:text-xl font-serif font-bold text-gold-900">{draftCount}</p>
              </div>
            </div>

            <div className="bg-cream-50 border border-gold-200/90 rounded-2xl p-3 sm:p-4 shadow-card flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-charcoal-100 text-charcoal-800 flex items-center justify-center flex-shrink-0">
                <Archive className="w-4 h-4 sm:w-5 sm:h-5 text-charcoal-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-[11px] font-bold uppercase text-charcoal-500 truncate">Archived</p>
                <p className="text-lg sm:text-xl font-serif font-bold text-charcoal-900">{archivedCount}</p>
              </div>
            </div>

            <div className="bg-cream-50 border border-gold-200/90 rounded-2xl p-3 sm:p-4 shadow-card flex items-center gap-2.5 sm:gap-3 col-span-2 sm:col-span-1">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-maroon-100 text-maroon-800 flex items-center justify-center flex-shrink-0">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-current text-maroon-700" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-[11px] font-bold uppercase text-charcoal-500 truncate">Featured</p>
                <p className="text-lg sm:text-xl font-serif font-bold text-maroon-950">{featuredCount}</p>
              </div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-cream-50 border border-gold-200/90 rounded-2xl p-3 sm:p-4 shadow-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { key: 'all', label: `All (${totalCount})` },
                { key: 'published', label: `Published (${publishedCount})` },
                { key: 'draft', label: `Drafts (${draftCount})` },
                { key: 'archived', label: `Archived (${archivedCount})` },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSelectedStatus(tab.key)}
                  className={`py-2 px-3 sm:px-3.5 rounded-xl text-xs font-semibold min-h-[40px] transition-all cursor-pointer ${
                    selectedStatus === tab.key
                      ? 'bg-maroon-800 text-cream-50 shadow-xs'
                      : 'bg-cream-100 text-charcoal-700 hover:bg-gold-100/70 hover:text-maroon-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-gold-700 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, SKU, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-cream-100 border border-gold-200 rounded-xl text-charcoal-900 focus:outline-none focus:border-gold-500 min-h-[44px]"
              />
            </div>
          </div>

          {/* Products Table (Desktop) & Cards (Mobile) */}
          {productsStatus === 'error' ? (
            <div
              role="alert"
              className="bg-cream-50 border border-maroon-300 rounded-3xl p-8 sm:p-12 text-center shadow-card space-y-3"
            >
              <AlertTriangle className="w-12 h-12 text-maroon-700 mx-auto opacity-80" />
              <h2 className="text-lg font-serif font-bold text-maroon-950">
                Products Could Not Be Loaded
              </h2>
              <p className="text-xs text-charcoal-600 font-sans max-w-md mx-auto">
                Cloud Firestore returned an error for the products collection. This is a load
                failure, not an empty catalogue. Reload once connectivity and administrator
                permissions are confirmed.
              </p>
            </div>
          ) : productsStatus === 'loading' ? (
            <div className="bg-cream-50 border border-gold-200/90 rounded-3xl p-8 sm:p-12 text-center shadow-card space-y-3">
              <Package className="w-12 h-12 text-gold-700 mx-auto opacity-70 animate-pulse" />
              <h2 className="text-lg font-serif font-bold text-maroon-950">Loading Products…</h2>
              <p className="text-xs text-charcoal-600 font-sans">
                Fetching the catalogue from Cloud Firestore.
              </p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="bg-cream-50 border border-gold-200/90 rounded-2xl sm:rounded-3xl shadow-card overflow-hidden">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-cream-200/60 border-b border-gold-200 text-maroon-950 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3.5 px-4">Image</th>
                      <th className="py-3.5 px-4">Product Name &amp; SKU</th>
                      <th className="py-3.5 px-4">Category / Purity</th>
                      <th className="py-3.5 px-4">Weight</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-center">Featured</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold-200/60 text-charcoal-800">
                    {filteredProducts.map((p) => {
                      const primaryImg = getPrimaryImage(p.images);
                      return (
                        <tr key={p.id} className="hover:bg-gold-50/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-cream-200 border border-gold-200">
                              {primaryImg ? (
                                <Image
                                  src={primaryImg.url}
                                  alt={primaryImg.altText || p.name}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-charcoal-400">
                                  <Layers className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-4 space-y-0.5">
                            <p className="font-serif font-bold text-maroon-950 text-sm">{p.name}</p>
                            <p className="font-mono text-[11px] text-charcoal-500">{p.sku}</p>
                          </td>

                          <td className="py-3 px-4 space-y-0.5">
                            <p className="font-semibold text-charcoal-900">{p.category}</p>
                            <span className="inline-block bg-gold-100/80 text-maroon-900 text-[10px] font-bold px-2 py-0.5 rounded">
                              {p.purity} Gold • {p.gender}
                            </span>
                          </td>

                          <td className="py-3 px-4 font-serif font-bold text-maroon-900 text-sm">
                            {formatWeight(p.approxWeight)}
                          </td>

                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                                p.status === 'published'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : p.status === 'draft'
                                  ? 'bg-gold-100 text-gold-900'
                                  : 'bg-charcoal-200 text-charcoal-800'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  p.status === 'published'
                                    ? 'bg-emerald-600'
                                    : p.status === 'draft'
                                    ? 'bg-gold-600'
                                    : 'bg-charcoal-500'
                                }`}
                              />
                              <span className="capitalize">{p.status}</span>
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleFeatured(p)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                p.isFeatured
                                  ? 'text-gold-600 hover:bg-gold-100'
                                  : 'text-charcoal-300 hover:text-charcoal-500 hover:bg-cream-100'
                              }`}
                              aria-label={p.isFeatured ? 'Unmark featured' : 'Mark featured'}
                            >
                              <Star className={`w-4 h-4 ${p.isFeatured ? 'fill-current' : ''}`} />
                            </button>
                          </td>

                          <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleEdit(p)}
                              className="inline-flex items-center gap-1 py-1.5 px-2.5 bg-cream-100 hover:bg-gold-100 text-maroon-900 border border-gold-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                              aria-label={`Edit ${p.name}`}
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            {p.status === 'draft' && (
                              <button
                                type="button"
                                onClick={() => handlePublish(p)}
                                className="py-1.5 px-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
                              >
                                Publish
                              </button>
                            )}

                            {p.status === 'published' && (
                              <button
                                type="button"
                                onClick={() => handleSetDraft(p)}
                                className="py-1.5 px-2.5 bg-gold-100 hover:bg-gold-200 text-maroon-950 border border-gold-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                              >
                                Set Draft
                              </button>
                            )}

                            {p.status !== 'archived' ? (
                              <button
                                type="button"
                                onClick={() => handleArchivePrompt(p)}
                                className="p-1.5 text-charcoal-400 hover:text-maroon-800 hover:bg-maroon-50 rounded-lg transition-colors cursor-pointer"
                                aria-label={`Archive ${p.name}`}
                                title="Archive product"
                              >
                                <Archive className="w-4 h-4" />
                              </button>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleRestorePrompt(p)}
                                  className="inline-flex items-center gap-1 py-1.5 px-2.5 bg-gold-100 hover:bg-gold-200 text-maroon-900 border border-gold-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Restore</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeletePrompt(p)}
                                  className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  aria-label={`Delete ${p.name} permanently`}
                                  title="Delete permanently"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}

                            {p.status === 'published' && (
                              <Link
                                href={`/catalogue/${p.slug}`}
                                target="_blank"
                                className="p-1.5 text-charcoal-400 hover:text-maroon-900 hover:bg-gold-100 rounded-lg transition-colors inline-flex"
                                aria-label={`View ${p.name} on live catalogue`}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View (>=44px touch targets, clear wrap, no horizontal scroll) */}
              <div className="md:hidden divide-y divide-gold-200/60">
                {filteredProducts.map((p) => {
                  const primaryImg = getPrimaryImage(p.images);
                  return (
                    <div key={p.id} className="p-3.5 sm:p-4 space-y-3 font-sans">
                      {/* Top section: Thumbnail + Info */}
                      <div className="flex items-start gap-3">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-cream-200 border border-gold-200 flex-shrink-0 shadow-2xs">
                          {primaryImg ? (
                            <Image
                              src={primaryImg.url}
                              alt={primaryImg.altText || p.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-charcoal-400">
                              <Layers className="w-5 h-5" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="font-mono text-[10px] text-charcoal-500 truncate">{p.sku}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize flex-shrink-0 ${
                                p.status === 'published'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : p.status === 'draft'
                                  ? 'bg-gold-100 text-gold-900'
                                  : 'bg-charcoal-200 text-charcoal-800'
                              }`}
                            >
                              {p.status}
                            </span>
                          </div>

                          <h3 className="font-serif font-bold text-maroon-950 text-sm leading-snug break-words">
                            {p.name}
                          </h3>

                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-charcoal-600">
                            <span>{p.category}</span>
                            <span>•</span>
                            <span className="font-semibold text-maroon-900">{p.purity}</span>
                            <span>•</span>
                            <span className="font-serif font-bold text-maroon-900">
                              {formatWeight(p.approxWeight)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Featured & Live Link Bar */}
                      <div className="flex items-center justify-between pt-2 border-t border-gold-200/40 text-xs">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(p)}
                          className={`min-h-[40px] px-2.5 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                            p.isFeatured
                              ? 'bg-gold-100 text-maroon-900 border-gold-300'
                              : 'bg-cream-100 text-charcoal-500 border-gold-200 hover:bg-gold-50'
                          }`}
                          aria-label={p.isFeatured ? 'Unmark featured' : 'Mark featured'}
                        >
                          <Star className={`w-3.5 h-3.5 ${p.isFeatured ? 'fill-current text-gold-600' : 'text-charcoal-400'}`} />
                          <span>{p.isFeatured ? 'Featured Star' : 'Not Featured'}</span>
                        </button>

                        {p.status === 'published' && (
                          <Link
                            href={`/catalogue/${p.slug}`}
                            target="_blank"
                            className="min-h-[40px] px-2.5 py-1.5 text-xs text-maroon-900 bg-cream-100 hover:bg-gold-100 border border-gold-200 rounded-lg transition-colors inline-flex items-center gap-1"
                          >
                            <span>Live View</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>

                      {/* Main Action Buttons Grid (min 44px touch targets) */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleEdit(p)}
                          className="flex-1 min-h-[44px] px-3.5 py-2.5 bg-cream-100 hover:bg-gold-100 border border-gold-300 rounded-xl text-xs font-bold text-maroon-900 inline-flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        {/* Status Switcher Button */}
                        {p.status === 'draft' && (
                          <button
                            type="button"
                            onClick={() => handlePublish(p)}
                            className="flex-1 min-h-[44px] px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Publish</span>
                          </button>
                        )}

                        {p.status === 'published' && (
                          <button
                            type="button"
                            onClick={() => handleSetDraft(p)}
                            className="flex-1 min-h-[44px] px-3.5 py-2.5 bg-gold-100 hover:bg-gold-200 border border-gold-300 text-maroon-950 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>To Draft</span>
                          </button>
                        )}

                        {/* Archive or Restore/Delete actions */}
                        {p.status !== 'archived' ? (
                          <button
                            type="button"
                            onClick={() => handleArchivePrompt(p)}
                            className="min-h-[44px] px-3.5 py-2.5 bg-cream-100 hover:bg-maroon-50 text-charcoal-600 hover:text-maroon-900 border border-gold-200 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            aria-label={`Archive ${p.name}`}
                          >
                            <Archive className="w-4 h-4 text-charcoal-500" />
                            <span className="hidden xs:inline">Archive</span>
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleRestorePrompt(p)}
                              className="flex-1 min-h-[44px] px-3.5 py-2.5 bg-gold-100 hover:bg-gold-200 border border-gold-300 text-maroon-900 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Restore</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeletePrompt(p)}
                              className="min-h-[44px] px-3.5 py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                              aria-label={`Delete ${p.name} permanently`}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                              <span className="hidden xs:inline">Delete</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-cream-50 border border-gold-200/90 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center shadow-card space-y-3">
              <Package className="w-12 h-12 text-gold-700 mx-auto opacity-70" />
              <h2 className="text-lg font-serif font-bold text-maroon-950">No Products Found</h2>
              <p className="text-xs text-charcoal-600 font-sans">
                {searchQuery
                  ? `No products matched the search term "${searchQuery}".`
                  : `No products currently match status "${selectedStatus}".`}
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ENQUIRIES MANAGEMENT */}
      {activeTab === 'enquiries' && (
        <div data-testid="admin-enquiries-section">
          <AdminEnquiriesManager />
        </div>
      )}

      {/* TAB 3: OWNER RATES MANAGEMENT */}
      {activeTab === 'rates' && (
        <div data-testid="admin-rates-section">
          <AdminRatesManager />
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        productToEdit={editingProduct}
        onSave={(savedProduct, cleanupNotice) => {
          loadData();
          if (cleanupNotice && cleanupNotice.failedPaths.length > 0) {
            const count = cleanupNotice.failedPaths.length;
            const noun = count === 1 ? 'image' : 'images';
            showToast(
              'Product saved successfully.',
              `${count} unused ${noun} could not be removed from cloud storage.\nThe catalogue is unaffected.\n\nFailed cleanup:\n${cleanupNotice.failedPaths.join('\n')}`,
              'warning'
            );
          } else {
            showToast(
              editingProduct ? 'Product Updated' : 'Product Created',
              'Catalogue updated successfully.',
              'success'
            );
          }
        }}
      />

      {/* Confirmation Modal for Archive / Restore */}
      <ConfirmationModal
        isOpen={confirmModalConfig.isOpen}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        confirmLabel={confirmModalConfig.confirmLabel}
        onConfirm={confirmModalConfig.onConfirm}
        onCancel={() => setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Dedicated Destructive Confirmation Modal for Permanent Delete */}
      <DeleteProductConfirmationModal
        isOpen={!!deletingProduct}
        product={deletingProduct}
        isDeleting={isDeleting}
        errorMessage={deleteErrorMessage}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!isDeleting) {
            setDeletingProduct(null);
            setDeleteErrorMessage(null);
          }
        }}
      />
    </div>
  );
}
