import React from 'react';
import { ISearch, IX, IFilter } from '@/components/ui/Icons';
import { NonIata } from '@/types/nonIata.types';

export interface SalesFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedNonIataId: number | undefined;
  onNonIataChange: (id: number | undefined) => void;
  agencies: NonIata[];
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  totalElements?: number;
}

export const SalesFilters: React.FC<SalesFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedNonIataId,
  onNonIataChange,
  agencies,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  pageSize,
  onPageSizeChange,
  onReset,
  hasActiveFilters,
  totalElements,
}) => {
  return (
    <div className="p-4 border-b border-slate-200 bg-white space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search input: Ticket number or Transaction reference */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <ISearch size={15} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by ticket number or reference..."
            className="block w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-md placeholder-slate-400 text-slate-900 focus:outline-none focus:border-[#CBA326] focus:ring-1 focus:ring-[#CBA326]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
            >
              <IX size={14} />
            </button>
          )}
        </div>

        {/* Agency Selector and Date Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Non-IATA Agency Selector */}
          <div className="min-w-[180px]">
            <select
              value={selectedNonIataId || ''}
              onChange={(e) => onNonIataChange(e.target.value ? Number(e.target.value) : undefined)}
              className="block w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-700 focus:outline-none focus:border-[#CBA326]"
            >
              <option value="">All Non-IATA Agencies</option>
              {agencies.map((agency) => (
                <option key={agency.id} value={agency.id}>
                  {agency.name} ({agency.code})
                </option>
              ))}
            </select>
          </div>

          {/* Date Range: From */}
          <div className="flex items-center gap-1 text-xs text-slate-600">
            <span className="text-slate-400">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-700 focus:outline-none focus:border-[#CBA326]"
            />
          </div>

          {/* Date Range: To */}
          <div className="flex items-center gap-1 text-xs text-slate-600">
            <span className="text-slate-400">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-700 focus:outline-none focus:border-[#CBA326]"
            />
          </div>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              <IFilter size={12} />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Counter & Page Size row */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <div>
          {totalElements !== undefined && (
            <span>
              Found <strong className="text-slate-800 font-semibold">{totalElements}</strong> sales{' '}
              {totalElements === 1 ? 'transaction' : 'transactions'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="sales-page-size" className="text-slate-400">
            Rows per page:
          </label>
          <select
            id="sales-page-size"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="text-xs bg-white border border-slate-300 rounded px-2 py-0.5 text-slate-700 focus:outline-none focus:border-[#CBA326]"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>
    </div>
  );
};
