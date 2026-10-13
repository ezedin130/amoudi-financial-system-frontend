import React, { useState, useEffect } from 'react';
import { NonIata } from '@/types/nonIata.types';
import { getNonIatas } from '@/api/nonIataApi';
import { ISearch } from '@/components/ui/Icons';

export interface StatementFiltersProps {
  selectedAgencyId: number | '';
  dateFrom: string;
  dateTo: string;
  onAgencyChange: (agencyId: number) => void;
  onDateFromChange: (val: string) => void;
  onDateToChange: (val: string) => void;
  onGenerate: () => void;
  isLoading?: boolean;
}

export const StatementFilters: React.FC<StatementFiltersProps> = ({
  selectedAgencyId,
  dateFrom,
  dateTo,
  onAgencyChange,
  onDateFromChange,
  onDateToChange,
  onGenerate,
  isLoading = false,
}) => {
  const [agencies, setAgencies] = useState<NonIata[]>([]);
  const [loadingAgencies, setLoadingAgencies] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoadingAgencies(true);

    getNonIatas({ size: 100 })
      .then((res) => {
        if (isMounted && res.content) {
          setAgencies(res.content);
          // If no agency is currently selected and agencies exist, select the first one
          if (!selectedAgencyId && res.content.length > 0) {
            onAgencyChange(res.content[0].id);
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          setAgencies([]);
        }
      })
      .finally(() => {
        if (isMounted) setLoadingAgencies(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAgencyId) {
      onGenerate();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3 mb-6"
    >
      <div className="flex flex-wrap items-end gap-3">
        {/* Non-IATA Agency Selector */}
        <div className="flex-1 min-w-[240px]">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Non-IATA Sub-Agent <span className="text-rose-500">*</span>
          </label>
          <select
            value={selectedAgencyId}
            onChange={(e) => onAgencyChange(Number(e.target.value))}
            disabled={loadingAgencies}
            required
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-800 focus:border-emerald-800 disabled:bg-slate-50"
          >
            <option value="">
              {loadingAgencies ? 'Loading agencies...' : 'Select Non-IATA Account...'}
            </option>
            {agencies.map((agency) => (
              <option key={agency.id} value={agency.id}>
                {agency.name} ({agency.code})
              </option>
            ))}
          </select>
        </div>

        {/* Date From */}
        <div className="min-w-[150px]">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Date From
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-800"
          />
        </div>

        {/* Date To */}
        <div className="min-w-[150px]">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Date To
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-800"
          />
        </div>

        {/* Generate / Apply button */}
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={!selectedAgencyId || isLoading}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm"
          >
            <ISearch size={14} />
            Generate Statement
          </button>
        </div>
      </div>
    </form>
  );
};
