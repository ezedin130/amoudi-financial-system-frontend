import React, { useState, useEffect } from 'react';
import { AgingFilterParams } from '@/types/aging.types';
import { NonIata, NonIataStatus } from '@/types/nonIata.types';
import { getNonIatas } from '@/api/nonIataApi';
import { ISearch, IFilter } from '@/components/ui/Icons';

export interface AgingFiltersProps {
  filters: AgingFilterParams;
  onFilterChange: (newFilters: Partial<AgingFilterParams>) => void;
  onReset: () => void;
}

export const AgingFilters: React.FC<AgingFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
}) => {
  const [agencies, setAgencies] = useState<NonIata[]>([]);
  const [searchInput, setSearchInput] = useState(filters.search || '');

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
    onFilterChange({ search: searchInput.trim() || undefined });
  };

  const hasActiveFilters = Boolean(
    filters.asOfDate || filters.nonIataId || filters.search || filters.status
  );

  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3 mb-6">
      <div className="flex flex-wrap items-center gap-3">
        {/* As Of Date */}
        <div className="min-w-[150px]">
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            As Of Date
          </label>
          <input
            type="date"
            value={filters.asOfDate || ''}
            onChange={(e) => onFilterChange({ asOfDate: e.target.value || undefined })}
            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-800"
          />
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[200px]">
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Search Agency
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onBlur={() => onFilterChange({ search: searchInput.trim() || undefined })}
              placeholder="Search by name or code..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-800"
            />
            <span className="absolute left-2.5 top-2 text-slate-400">
              <ISearch size={14} />
            </span>
          </div>
        </form>

        {/* Agency Dropdown */}
        <div className="min-w-[200px]">
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Non-IATA Sub-Agent
          </label>
          <select
            value={filters.nonIataId || ''}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : undefined;
              onFilterChange({ nonIataId: val });
            }}
            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-800"
          >
            <option value="">All Accounts</option>
            {agencies.map((agency) => (
              <option key={agency.id} value={agency.id}>
                {agency.name} ({agency.code})
              </option>
            ))}
          </select>
        </div>

        {/* Operational Status */}
        <div className="min-w-[130px]">
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => {
              const val = e.target.value ? (e.target.value as NonIataStatus) : undefined;
              onFilterChange({ status: val });
            }}
            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-800"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        {/* Reset */}
        {hasActiveFilters && (
          <div className="self-end pb-0.5">
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                onReset();
              }}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors flex items-center gap-1"
            >
              <IFilter size={13} />
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
