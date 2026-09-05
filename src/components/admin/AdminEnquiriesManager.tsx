'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CustomerEnquiry, EnquiryStatus } from '@/services/enquiries/enquiryTypes';
import { RepositoryStatus } from '@/services/types';
import { enquiryRepository } from '@/services/enquiries/enquiryRepository';
import { useToast } from '@/context/ToastContext';
import {
  MessageSquare,
  Search,
  CheckCircle2,
  Clock,
  Archive,
  Phone,
  Calendar,
  Sparkles,
  Layers,
  AlertTriangle,
} from 'lucide-react';

export const AdminEnquiriesManager: React.FC = () => {
  const { showToast } = useToast();
  const [enquiries, setEnquiries] = useState<CustomerEnquiry[]>([]);
  const [status, setStatus] = useState<RepositoryStatus>('loading');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const loadEnquiries = useCallback(() => {
    setEnquiries(enquiryRepository.getAllEnquiries());
    setStatus(enquiryRepository.getStatus());
  }, []);

  useEffect(() => {
    loadEnquiries();

    const handleUpdate = () => loadEnquiries();
    window.addEventListener('koh_enquiries_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('koh_enquiries_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadEnquiries]);

  const handleStatusChange = async (id: string, newStatus: EnquiryStatus) => {
    try {
      const updated = await enquiryRepository.updateStatus(id, newStatus);
      if (updated) {
        loadEnquiries();
        showToast('Inquiry Status Updated', `Status changed to ${newStatus}.`, 'success');
      }
    } catch (err: unknown) {
      const detail = err instanceof Error ? err.message : 'Failed to update enquiry status.';
      showToast('Update Failed', detail, 'error');
    }
  };

  const totalCount = enquiries.length;
  const newCount = enquiries.filter((e) => e.status === 'new').length;
  const contactedCount = enquiries.filter((e) => e.status === 'contacted').length;
  const closedCount = enquiries.filter((e) => e.status === 'closed').length;

  const filteredEnquiries = enquiries.filter((e) => {
    const matchesStatus =
      selectedStatus === 'all' ? true : e.status === selectedStatus;

    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      e.name.toLowerCase().includes(query) ||
      e.mobile.toLowerCase().includes(query) ||
      e.categoryOrProduct.toLowerCase().includes(query) ||
      (e.message && e.message.toLowerCase().includes(query));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header & Stats Grid - Compact on Mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-cream-50 border border-gold-200/90 rounded-2xl p-3 sm:p-4 shadow-card flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gold-100 text-maroon-800 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-gold-700" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] font-bold uppercase text-charcoal-500 truncate">Total Inquiries</p>
            <p className="text-lg sm:text-xl font-serif font-bold text-maroon-950">{totalCount}</p>
          </div>
        </div>

        <div className="bg-cream-50 border border-gold-200/90 rounded-2xl p-3 sm:p-4 shadow-card flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-maroon-100 text-maroon-800 flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-maroon-700" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] font-bold uppercase text-charcoal-500 truncate">New</p>
            <p className="text-lg sm:text-xl font-serif font-bold text-maroon-950">{newCount}</p>
          </div>
        </div>

        <div className="bg-cream-50 border border-gold-200/90 rounded-2xl p-3 sm:p-4 shadow-card flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gold-100 text-gold-800 flex items-center justify-center flex-shrink-0">
            <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gold-700" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] font-bold uppercase text-charcoal-500 truncate">Contacted</p>
            <p className="text-lg sm:text-xl font-serif font-bold text-gold-900">{contactedCount}</p>
          </div>
        </div>

        <div className="bg-cream-50 border border-gold-200/90 rounded-2xl p-3 sm:p-4 shadow-card flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] font-bold uppercase text-charcoal-500 truncate">Closed</p>
            <p className="text-lg sm:text-xl font-serif font-bold text-emerald-900">{closedCount}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-cream-50 border border-gold-200/90 rounded-2xl p-3 sm:p-4 shadow-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { key: 'all', label: `All (${totalCount})` },
            { key: 'new', label: `New (${newCount})` },
            { key: 'contacted', label: `Contacted (${contactedCount})` },
            { key: 'closed', label: `Closed (${closedCount})` },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedStatus(tab.key)}
              aria-pressed={selectedStatus === tab.key}
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

        {/* Search Field */}
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-gold-700 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            aria-label="Search inquiries by name, mobile, interest, or message"
            placeholder="Search name, mobile, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-xs bg-cream-100 border border-gold-200 rounded-xl text-charcoal-900 focus:outline-none focus:border-gold-500 min-h-[44px]"
          />
        </div>
      </div>

      {/* Enquiries List */}
      {status === 'error' ? (
        <div
          role="alert"
          className="bg-cream-50 border border-maroon-300 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center shadow-card space-y-3"
        >
          <AlertTriangle className="w-12 h-12 text-maroon-700 mx-auto opacity-80" />
          <h3 className="text-lg font-serif font-bold text-maroon-950">
            Inquiries Could Not Be Loaded
          </h3>
          <p className="text-xs text-charcoal-600 font-sans max-w-md mx-auto">
            Cloud Firestore returned an error for the enquiries collection. This is a load failure,
            not an empty inbox — no inquiry has been lost and no local data is being substituted.
          </p>
        </div>
      ) : status === 'loading' ? (
        <div className="bg-cream-50 border border-gold-200/90 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center shadow-card space-y-3">
          <MessageSquare className="w-12 h-12 text-gold-700 mx-auto opacity-70 animate-pulse" />
          <h3 className="text-lg font-serif font-bold text-maroon-950">Loading Inquiries…</h3>
          <p className="text-xs text-charcoal-600 font-sans">
            Fetching customer inquiries from Cloud Firestore.
          </p>
        </div>
      ) : filteredEnquiries.length > 0 ? (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block bg-cream-50 border border-gold-200/90 rounded-2xl sm:rounded-3xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-cream-200/60 border-b border-gold-200 text-maroon-950 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Mobile</th>
                    <th className="py-3.5 px-4">Interested In</th>
                    <th className="py-3.5 px-4">Date &amp; Time</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-200/60 text-charcoal-800">
                  {filteredEnquiries.map((enq) => (
                    <tr key={enq.id} className="hover:bg-gold-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-maroon-800 text-cream-50 font-serif font-bold text-xs flex items-center justify-center flex-shrink-0">
                            {enq.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-serif font-bold text-maroon-950 text-sm">{enq.name}</p>
                            {enq.message && (
                              <p className="text-[11px] text-charcoal-500 italic truncate max-w-xs" title={enq.message}>
                                &quot;{enq.message}&quot;
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <a
                          href={`tel:${enq.mobile}`}
                          className="font-mono text-xs text-maroon-900 hover:underline inline-flex items-center gap-1 font-semibold"
                        >
                          <Phone className="w-3 h-3 text-gold-700" />
                          <span>{enq.mobile}</span>
                        </a>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-block bg-gold-100/80 text-maroon-900 text-xs font-semibold px-2.5 py-1 rounded-lg">
                          {enq.categoryOrProduct}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-charcoal-500 whitespace-nowrap">
                        {new Date(enq.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full capitalize ${
                            enq.status === 'new'
                              ? 'bg-maroon-100 text-maroon-900'
                              : enq.status === 'contacted'
                              ? 'bg-gold-100 text-gold-900'
                              : 'bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              enq.status === 'new'
                                ? 'bg-maroon-600'
                                : enq.status === 'contacted'
                                ? 'bg-gold-600'
                                : 'bg-emerald-600'
                            }`}
                          />
                          <span>{enq.status}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <select
                          value={enq.status}
                          aria-label={`Status for inquiry from ${enq.name}`}
                          onChange={(e) => handleStatusChange(enq.id, e.target.value as EnquiryStatus)}
                          className="text-xs font-bold py-1.5 px-3 rounded-lg border border-gold-300 bg-cream-50 text-maroon-950 focus:outline-none focus:border-gold-500 cursor-pointer"
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards View (>=44px touch targets, no horizontal scroll) */}
          <div className="md:hidden space-y-3 font-sans">
            {filteredEnquiries.map((enq) => (
              <div
                key={enq.id}
                className="bg-cream-50 border border-gold-200/90 rounded-2xl p-3.5 sm:p-4 shadow-card space-y-3"
              >
                {/* Header: Customer Name, Status Badge, Date */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-maroon-800 text-cream-50 font-serif font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-2xs">
                      {enq.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-serif font-bold text-maroon-950 text-base leading-snug break-words">
                        {enq.name}
                      </h3>
                      <a
                        href={`tel:${enq.mobile}`}
                        className="text-xs text-maroon-900 font-mono font-bold flex items-center gap-1 hover:underline pt-0.5"
                      >
                        <Phone className="w-3.5 h-3.5 text-gold-700 flex-shrink-0" />
                        <span>{enq.mobile}</span>
                      </a>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize flex-shrink-0 ${
                      enq.status === 'new'
                        ? 'bg-maroon-100 text-maroon-900'
                        : enq.status === 'contacted'
                        ? 'bg-gold-100 text-gold-900'
                        : 'bg-emerald-100 text-emerald-900'
                    }`}
                  >
                    {enq.status}
                  </span>
                </div>

                {/* Interested in & Message */}
                <div className="bg-cream-100/80 border border-gold-200 rounded-xl p-3 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-gold-950 font-bold">
                    <Layers className="w-3.5 h-3.5 text-gold-700 flex-shrink-0" />
                    <span>Interested in: <strong className="text-maroon-900">{enq.categoryOrProduct}</strong></span>
                  </div>
                  {enq.message && (
                    <p className="text-charcoal-700 italic leading-relaxed pt-1 border-t border-gold-200/60 break-words">
                      &quot;{enq.message}&quot;
                    </p>
                  )}
                </div>

                {/* Footer: Date & Status Update Control (min 44px) */}
                <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-2.5 pt-2 border-t border-gold-200/50">
                  <span className="text-[11px] font-mono text-charcoal-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gold-700 flex-shrink-0" />
                    <span>
                      {new Date(enq.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </span>

                  <div className="flex items-center gap-2">
                    <label htmlFor={`mobile-status-${enq.id}`} className="text-xs font-semibold text-charcoal-600 sr-only">
                      Update status
                    </label>
                    <select
                      id={`mobile-status-${enq.id}`}
                      value={enq.status}
                      aria-label={`Status for inquiry from ${enq.name}`}
                      onChange={(e) => handleStatusChange(enq.id, e.target.value as EnquiryStatus)}
                      className="w-full xs:w-auto min-h-[44px] text-xs font-bold py-2 px-3 rounded-xl border border-gold-300 bg-cream-100 text-maroon-950 focus:outline-none focus:border-gold-500 cursor-pointer shadow-2xs"
                    >
                      <option value="new">Status: New</option>
                      <option value="contacted">Status: Contacted</option>
                      <option value="closed">Status: Closed</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-cream-50 border border-gold-200/90 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center shadow-card space-y-3">
          <MessageSquare className="w-12 h-12 text-gold-700 mx-auto opacity-70" />
          <h3 className="text-lg font-serif font-bold text-maroon-950">No Inquiries Found</h3>
          <p className="text-xs text-charcoal-600 font-sans">
            {searchQuery
              ? `No inquiries match "${searchQuery}".`
              : `No inquiries currently have status "${selectedStatus}".`}
          </p>
        </div>
      )}
    </div>
  );
};
