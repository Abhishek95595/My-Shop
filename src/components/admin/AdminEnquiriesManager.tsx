'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CustomerEnquiry, EnquiryStatus } from '@/services/enquiries/enquiryTypes';
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
} from 'lucide-react';

export const AdminEnquiriesManager: React.FC = () => {
  const { showToast } = useToast();
  const [enquiries, setEnquiries] = useState<CustomerEnquiry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const loadEnquiries = useCallback(() => {
    setEnquiries(enquiryRepository.getAllEnquiries());
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

  const handleStatusChange = (id: string, newStatus: EnquiryStatus) => {
    const updated = enquiryRepository.updateStatus(id, newStatus);
    if (updated) {
      loadEnquiries();
      showToast('Inquiry Status Updated', `Status changed to ${newStatus}.`, 'success');
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
    <div className="space-y-6">
      {/* Header & Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-cream-50 border border-gold-200/90 rounded-2xl p-4 shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold-100 text-maroon-800 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-5 h-5 text-gold-700" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase text-charcoal-500">Total Inquiries</p>
            <p className="text-xl font-serif font-bold text-maroon-950">{totalCount}</p>
          </div>
        </div>

        <div className="bg-cream-50 border border-gold-200/90 rounded-2xl p-4 shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-maroon-100 text-maroon-800 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-maroon-700" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase text-charcoal-500">New</p>
            <p className="text-xl font-serif font-bold text-maroon-950">{newCount}</p>
          </div>
        </div>

        <div className="bg-cream-50 border border-gold-200/90 rounded-2xl p-4 shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold-100 text-gold-800 flex items-center justify-center flex-shrink-0">
            <Phone className="w-5 h-5 text-gold-700" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase text-charcoal-500">Contacted</p>
            <p className="text-xl font-serif font-bold text-gold-900">{contactedCount}</p>
          </div>
        </div>

        <div className="bg-cream-50 border border-gold-200/90 rounded-2xl p-4 shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase text-charcoal-500">Closed</p>
            <p className="text-xl font-serif font-bold text-emerald-900">{closedCount}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-cream-50 border border-gold-200/90 rounded-2xl p-4 shadow-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
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

        {/* Search Field */}
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-gold-700 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            aria-label="Search inquiries by name, mobile, interest, or message"
            placeholder="Search by name, mobile, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-cream-100 border border-gold-200 rounded-xl text-charcoal-900 focus:outline-none focus:border-gold-500"
          />
        </div>
      </div>

      {/* Enquiries List */}
      {filteredEnquiries.length > 0 ? (
        <div className="bg-cream-50 border border-gold-200/90 rounded-3xl shadow-card overflow-hidden divide-y divide-gold-200/60 font-sans">
          {filteredEnquiries.map((enq) => (
            <div key={enq.id} className="p-5 space-y-3 hover:bg-gold-50/40 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-maroon-800 text-cream-50 font-serif font-bold text-sm flex items-center justify-center flex-shrink-0">
                    {enq.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-maroon-950 text-base">{enq.name}</h3>
                    <p className="text-xs text-charcoal-600 font-mono">{enq.mobile}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-charcoal-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gold-700" />
                    {new Date(enq.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>

                  <select
                    value={enq.status}
                    aria-label={`Status for inquiry from ${enq.name}`}
                    onChange={(e) => handleStatusChange(enq.id, e.target.value as EnquiryStatus)}
                    className={`text-xs font-bold py-1.5 px-3 rounded-xl border focus:outline-none cursor-pointer ${
                      enq.status === 'new'
                        ? 'bg-maroon-100 text-maroon-900 border-maroon-300'
                        : enq.status === 'contacted'
                        ? 'bg-gold-100 text-gold-900 border-gold-300'
                        : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    }`}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* Inquiry Details */}
              <div className="bg-cream-100/70 border border-gold-200 rounded-2xl p-3.5 space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-gold-900 font-bold">
                  <Layers className="w-3.5 h-3.5 text-gold-700" />
                  <span>Interested in: {enq.categoryOrProduct}</span>
                </div>
                {enq.message && (
                  <p className="text-charcoal-700 italic leading-relaxed pt-1 border-t border-gold-200/50">
                    &quot;{enq.message}&quot;
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-cream-50 border border-gold-200/90 rounded-3xl p-12 text-center shadow-card space-y-3">
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
