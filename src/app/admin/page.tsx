'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { isMockAdmin } from '@/services/admin/adminAuthGuard';
import { AdminAccessDenied } from '@/components/admin/AdminAccessDenied';
import { ProductFormModal } from '@/components/admin/ProductFormModal';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';
import { AdminEnquiriesManager } from '@/components/admin/AdminEnquiriesManager';
import { AdminRatesManager } from '@/components/admin/AdminRatesManager';
import { Product } from '@/services/productTypes';
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
} from 'lucide-react';

type AdminTab = 'products' | 'enquiries' | 'rates';

export default function AdminDashboardPage() {
  const { user, isLoading } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [enquiriesCount, setEnquiriesCount] = useState<number>(0);
  const [ratesCount, setRatesCount] = useState<number>(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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
    setEnquiriesCount(enquiryRepository.getAllEnquiries().length);
    setRatesCount(ratesRepository.getAllRates().length);
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
  if (!isMockAdmin(user)) {
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

  const handlePublish = (product: Product) => {
    try {
      productRepository.setStatus(product.id, 'published');
      loadData();
      showToast('Product Published', `${product.name} is now live in the Catalogue.`, 'success');
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast('Publish Failed', err.message, 'error');
      }
    }
  };

  const handleSetDraft = (product: Product) => {
    productRepository.setStatus(product.id, 'draft');
    loadData();
    showToast('Moved to Drafts', `${product.name} is now hidden from public view.`, 'info');
  };

  const handleArchivePrompt = (product: Product) => {
    setConfirmModalConfig({
      isOpen: true,
      title: `Archive "${product.name}"?`,
      message:
        'Archiving will remove this product from the public catalogue. You can restore it to Drafts at any time.',
      confirmLabel: 'Archive Product',
      onConfirm: () => {
        productRepository.setStatus(product.id, 'archived');
        loadData();
        setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }));
        showToast('Product Archived', `${product.name} has been archived.`, 'info');
      },
    });
  };

  const handleRestorePrompt = (product: Product) => {
    setConfirmModalConfig({
      isOpen: true,
      title: `Restore "${product.name}"?`,
      message: 'This product will be restored as a Draft. You can edit and publish it when ready.',
      confirmLabel: 'Restore to Drafts',
      onConfirm: () => {
        productRepository.setStatus(product.id, 'draft');
        loadData();
        setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }));
        showToast('Product Restored', `${product.name} restored to Draft status.`, 'success');
      },
    });
  };

  const handleToggleFeatured = (product: Product) => {
    const updated = productRepository.toggleFeatured(product.id);
    loadData();
    if (updated) {
      showToast(
        updated.isFeatured ? 'Marked as Featured' : 'Unmarked as Featured',
        `${product.name} featured state updated.`,
        'info'
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Top Banner Notice */}
      <div className="bg-gold-100/90 border border-gold-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-maroon-950 font-sans shadow-xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-gold-700 flex-shrink-0" />
          <div>
            <p className="font-bold">Development Admin Mode • Local Demonstration Only</p>
            <p className="text-charcoal-600 text-[11px]">
              Logged in as authorized store owner: <strong className="text-maroon-900">{user?.email}</strong>.
            </p>
          </div>
        </div>
        <span className="bg-cream-50 border border-gold-300 text-maroon-900 text-[11px] font-bold px-3 py-1 rounded-full">
          Local Storage &amp; IndexedDB Mode
        </span>
      </div>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gold-200/80 pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-800 uppercase tracking-widest bg-gold-100/90 border border-gold-300 px-3 py-0.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-gold-700" />
            <span>Store Operations</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-maroon-950">
            Admin Management
          </h1>
          <p className="text-sm text-charcoal-600 font-sans">
            Manage catalogue products, customer enquiries, and owner bullion reference rates.
          </p>
        </div>

        {activeTab === 'products' && (
          <button
            type="button"
            onClick={handleCreateNew}
            className="inline-flex items-center gap-2 bg-maroon-800 hover:bg-maroon-900 text-cream-50 font-bold px-5 py-3 rounded-xl shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4 text-gold-300" />
            <span>Add Product</span>
          </button>
        )}
      </div>

      {/* Admin Module Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gold-200/80 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`inline-flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'products'
              ? 'bg-maroon-800 text-cream-50 shadow-xs'
              : 'bg-cream-50 text-charcoal-700 hover:bg-gold-100 border border-gold-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Catalogue Products ({totalCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('enquiries')}
          className={`inline-flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'enquiries'
              ? 'bg-maroon-800 text-cream-50 shadow-xs'
              : 'bg-cream-50 text-charcoal-700 hover:bg-gold-100 border border-gold-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Customer Enquiries ({enquiriesCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rates')}
          className={`inline-flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'rates'
              ? 'bg-maroon-800 text-cream-50 shadow-xs'
              : 'bg-cream-50 text-charcoal-700 hover:bg-gold-100 border border-gold-200'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>Owner Rates ({ratesCount})</span>
        </button>
      </div>

      {/* TAB 1: PRODUCT MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-8">
          {/* Metric Summary Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-cream-50 border border-gold-200/90 rounded-2xl p-4 shadow-card flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold-100 text-maroon-800 flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-gold-700" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase text-charcoal-500">Total Products</p>
                <p className="text-xl font-serif font-bold text-maroon-950">{totalCount}</p>
              </div>
            </div>

            <div className="bg-cream-50 border border-gold-200/90 rounded-2xl p-4 shadow-card flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase text-charcoal-500">Published</p>
                <p className="text-xl font-serif font-bold text-emerald-900">{publishedCount}</p>
              </div>
            </div>

            <div className="bg-cream-50 border border-gold-200/90 rounded-2xl p-4 shadow-card flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold-100 text-gold-800 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-gold-700" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase text-charcoal-500">Drafts</p>
                <p className="text-xl font-serif font-bold text-gold-900">{draftCount}</p>
              </div>
            </div>

            <div className="bg-cream-50 border border-gold-200/90 rounded-2xl p-4 shadow-card flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-charcoal-100 text-charcoal-800 flex items-center justify-center flex-shrink-0">
                <Archive className="w-5 h-5 text-charcoal-600" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase text-charcoal-500">Archived</p>
                <p className="text-xl font-serif font-bold text-charcoal-900">{archivedCount}</p>
              </div>
            </div>

            <div className="bg-cream-50 border border-gold-200/90 rounded-2xl p-4 shadow-card flex items-center gap-3 col-span-2 sm:col-span-1">
              <div className="w-10 h-10 rounded-xl bg-maroon-100 text-maroon-800 flex items-center justify-center flex-shrink-0">
                <Star className="w-5 h-5 fill-current text-maroon-700" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase text-charcoal-500">Featured</p>
                <p className="text-xl font-serif font-bold text-maroon-950">{featuredCount}</p>
              </div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-cream-50 border border-gold-200/90 rounded-2xl p-4 shadow-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
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
                  className={`py-2 px-3.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
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
                placeholder="Search by name, SKU, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-cream-100 border border-gold-200 rounded-xl text-charcoal-900 focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          {/* Products Table (Desktop) & Cards (Mobile) */}
          {filteredProducts.length > 0 ? (
            <div className="bg-cream-50 border border-gold-200/90 rounded-3xl shadow-card overflow-hidden">
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
                              >
                                <Archive className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleRestorePrompt(p)}
                                className="inline-flex items-center gap-1 py-1.5 px-2.5 bg-gold-100 hover:bg-gold-200 text-maroon-900 border border-gold-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Restore</span>
                              </button>
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

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-gold-200/60">
                {filteredProducts.map((p) => {
                  const primaryImg = getPrimaryImage(p.images);
                  return (
                    <div key={p.id} className="p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-cream-200 border border-gold-200 flex-shrink-0">
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

                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] text-charcoal-500">{p.sku}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
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
                          <h3 className="font-serif font-bold text-maroon-950 text-sm leading-snug">
                            {p.name}
                          </h3>
                          <p className="text-xs text-charcoal-600">
                            {p.category} • {p.purity} • {formatWeight(p.approxWeight)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gold-200/40">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(p)}
                          className={`text-xs font-semibold flex items-center gap-1 ${
                            p.isFeatured ? 'text-gold-600' : 'text-charcoal-400'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${p.isFeatured ? 'fill-current' : ''}`} />
                          <span>{p.isFeatured ? 'Featured' : 'Not Featured'}</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(p)}
                            className="py-1.5 px-3 bg-cream-100 border border-gold-300 rounded-lg text-xs font-bold text-maroon-900"
                          >
                            Edit
                          </button>

                          {p.status === 'draft' && (
                            <button
                              type="button"
                              onClick={() => handlePublish(p)}
                              className="py-1.5 px-3 bg-emerald-700 text-white rounded-lg text-xs font-bold"
                            >
                              Publish
                            </button>
                          )}

                          {p.status === 'published' && (
                            <button
                              type="button"
                              onClick={() => handleSetDraft(p)}
                              className="py-1.5 px-3 bg-gold-100 border border-gold-300 text-maroon-900 rounded-lg text-xs font-bold"
                            >
                              Draft
                            </button>
                          )}

                          {p.status !== 'archived' ? (
                            <button
                              type="button"
                              onClick={() => handleArchivePrompt(p)}
                              className="p-1.5 text-charcoal-400 hover:text-maroon-800 rounded"
                              aria-label="Archive"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleRestorePrompt(p)}
                              className="py-1.5 px-3 bg-gold-100 border border-gold-300 text-maroon-900 rounded-lg text-xs font-bold"
                            >
                              Restore
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-cream-50 border border-gold-200/90 rounded-3xl p-12 text-center shadow-card space-y-3">
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
      {activeTab === 'enquiries' && <AdminEnquiriesManager />}

      {/* TAB 3: OWNER RATES MANAGEMENT */}
      {activeTab === 'rates' && <AdminRatesManager />}

      {/* Add / Edit Product Modal */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        productToEdit={editingProduct}
        onSave={() => {
          loadData();
          showToast(
            editingProduct ? 'Product Updated' : 'Product Created',
            'Catalogue updated successfully.',
            'success'
          );
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
    </div>
  );
}
