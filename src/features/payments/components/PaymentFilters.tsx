import React, { useState, useEffect } from 'react';
import { PaymentFilterParams, PaymentStatus } from '@/types/payments.types';
import { NonIata } from '@/types/nonIata.types';
import { getNonIatas } from '@/api/nonIataApi';
import { ISearch, IFilter } from '@/components/ui/Icons';

export interface PaymentFiltersProps {
  filters: PaymentFilterParams;
  onFilterChange: (newFilters: Partial<PaymentFilterParams>) => void;
  onReset: () => void;
}

export const PaymentFilters: React.FC<PaymentFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
}) => {
  const [agencies, setAgencies] = useState<NonIata[]>([]);
  const [searchQuery, setSearchQuery] = useState(filters.paymentReference || filters.receiptNumber || '');

  useEffect(() => {
    let isMounted = true;
    getNonIatas({ size: 100 })
      .then((res) => {
        if (isMounted && res.content) {
          setAgencies(res.content);
        }
      })
      .catch(() => {
        if (isMounted) {
          setAgencies([]);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    onFilterChange({
      paymentReference: query || undefined,
      receiptNumber: query || undefined,
      page: 0,
    });
  };

  const hasActiveFilters = Boolean(
    filters.nonIataId ||
    filters.paymentReference ||
    filters.receiptNumber ||
    filters.status ||
    filters.dateFrom ||
    filters.dateTo
  );

  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3 mb-6">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search by Reference / Receipt Number */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[220px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onBlur={() => {
              const query = searchQuery.trim();
              onFilterChange({
                paymentReference: query || undefined,
                receiptNumber: query || undefined,
                page: 0,
              });
            }}
            placeholder="Search reference or receipt..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-800 focus:border-emerald-800"
          />
          <span className="absolute left-3 top-2.5 text-slate-400">
            <ISearch size={15} />
          </span>
        </form>

        {/* Agency Dropdown */}
        <div className="min-w-[190px]">
          <select
            value={filters.nonIataId || ''}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : undefined;
              onFilterChange({ nonIataId: val, page: 0 });
            }}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-800 focus:border-emerald-800"
          >
            <option value="">All Non-IATAs</option>
            {agencies.map((agency) => (
              <option key={agency.id} value={agency.id}>
                {agency.name} ({agency.code})
              </option>
            ))}
          </select>
        </div>

        {/* Status Dropdown */}
        <div className="min-w-[130px]">
          <select
            value={filters.status || ''}
            onChange={(e) => {
              const val = e.target.value ? (e.target.value as PaymentStatus) : undefined;
              onFilterChange({ status: val, page: 0 });
            }}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-800 focus:border-emerald-800"
          >
            <option value="">All Statuses</option>
            <option value="POSTED">Posted</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Date From */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <span className="font-medium text-slate-500">From:</span>
          <input
            type="date"
            value={filters.dateFrom || ''}
            onChange={(e) => onFilterChange({ dateFrom: e.target.value || undefined, page: 0 })}
            className="px-2 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-800"
          />
        </div>

        {/* Date To */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <span className="font-medium text-slate-500">To:</span>
          <input
            type="date"
            value={filters.dateTo || ''}
            onChange={(e) => onFilterChange({ dateTo: e.target.value || undefined, page: 0 })}
            className="px-2 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-800"
          />
        </div>

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              onReset();
            }}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors flex items-center gap-1"
          >
            <IFilter size={13} />
            Reset
          </button>
        )}
      </div>
    </div>
  );
};
