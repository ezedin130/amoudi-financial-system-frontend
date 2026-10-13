import React from 'react';
import { ISearch, IX } from '@/components/ui/Icons';
import { NonIataStatus } from '@/types/nonIata.types';

export interface NonIataFiltersProps {
  search: string;
  onSearchChange: (search: string) => void;
  status: NonIataStatus | 'ALL';
  onStatusChange: (status: NonIataStatus | 'ALL') => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  totalElements?: number;
}

export const NonIataFilters: React.FC<NonIataFiltersProps> = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  pageSize,
  onPageSizeChange,
  totalElements,
}) => {
  return (
    <div className="px-4 py-3 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white">
      <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <ISearch size={15} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by code or agency name..."
            className="block w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-md placeholder-slate-400 text-slate-900 focus:outline-none focus:border-[#CBA326] focus:ring-1 focus:ring-[#CBA326]"
          />
          {search && (
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

        {/* Status Filter Tabs (Figma matching) */}
        <div className="flex rounded-md border border-slate-200 overflow-hidden self-start sm:self-auto">
          {(
            [
              { id: 'ALL', label: 'All Accounts' },
              { id: 'ACTIVE', label: 'Active' },
              { id: 'INACTIVE', label: 'Inactive' },
            ] as const
          ).map((tab) => {
            const isSelected = status === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onStatusChange(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-[#0F2E22] text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Page Size & Count */}
      <div className="flex items-center gap-2 text-xs text-slate-500 self-end md:self-auto">
        {totalElements !== undefined && (
          <span className="hidden lg:inline text-slate-400">
            {totalElements} {totalElements === 1 ? 'account' : 'accounts'}
          </span>
        )}
        <label htmlFor="page-size-select" className="text-slate-500">
          Show:
        </label>
        <select
          id="page-size-select"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="text-xs bg-white border border-slate-300 rounded px-2 py-1 text-slate-700 focus:outline-none focus:border-[#CBA326]"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
    </div>
  );
};
