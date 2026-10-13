import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { NonIataFinancialSummary } from '@/types/dashboard.types';
import { NonIataStatus } from '@/types/nonIata.types';
import { getFinancialSummaries } from '@/api/dashboardApi';
import { formatCurrency } from '@/utils/formatters';
import { ISearch, IFileText } from '@/components/ui/Icons';
import { Alert } from '@/components/ui/Alert';

export const OutstandingBalancesTable: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<NonIataFinancialSummary[]>([]);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const fetchBalances = useCallback(async (searchTerm: string, status: 'ALL' | 'ACTIVE' | 'INACTIVE') => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getFinancialSummaries({
        search: searchTerm || undefined,
        status: status === 'ALL' ? undefined : (status as NonIataStatus),
        size: 8,
      });
      setItems(res.content || []);
      setTotalElements(res.totalElements || 0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to load Non-IATA balance summaries';
      setError(msg);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBalances(search, statusFilter);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter, fetchBalances]);

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden mb-6">
      {/* Header with Search and Status Filter */}
      <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 font-jost">
            Non-IATA Balance Overview
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Database-aggregated sales, posted payments, and net outstanding balances
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status filter pills */}
          <div className="flex rounded-md border border-slate-200 overflow-hidden bg-white shadow-xs">
            {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((filter) => {
              const active = statusFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                    active
                      ? 'text-white'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                  style={active ? { backgroundColor: '#0F2E22' } : {}}
                >
                  {filter.toLowerCase()}
                </button>
              );
            })}
          </div>

          {/* Search input */}
          <div className="relative min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
              <ISearch size={14} />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Non-IATA..."
              className="block w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-800 focus:border-emerald-800"
            />
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 space-y-2">
          <Alert
            variant="danger"
            title="Failed to load balances"
            message={error}
          />
          <div className="flex justify-end">
            <button
              onClick={() => fetchBalances(search, statusFilter)}
              className="text-xs font-semibold px-3 py-1 rounded bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <th className="px-5 py-3 text-left">Non-IATA</th>
              <th className="px-4 py-3 text-left">Code</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Total Sales</th>
              <th className="px-4 py-3 text-right">Total Paid</th>
              <th className="px-4 py-3 text-right">Outstanding</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-5 py-3.5"><div className="h-4 bg-slate-200 rounded w-36" /></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-slate-200 rounded w-16" /></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-slate-200 rounded w-16" /></td>
                  <td className="px-4 py-3.5 text-right"><div className="h-4 bg-slate-200 rounded w-20 ml-auto" /></td>
                  <td className="px-4 py-3.5 text-right"><div className="h-4 bg-slate-200 rounded w-20 ml-auto" /></td>
                  <td className="px-4 py-3.5 text-right"><div className="h-4 bg-slate-200 rounded w-24 ml-auto" /></td>
                  <td className="px-5 py-3.5 text-right"><div className="h-4 bg-slate-200 rounded w-16 ml-auto" /></td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-slate-400 text-sm">
                  {search ? `No accounts matching "${search}"` : 'No Non-IATA balance records found.'}
                </td>
              </tr>
            ) : (
              items.map((row) => {
                const currency = row.currency || 'ETB';
                const hasBalance = row.outstandingBalance > 0;
                const agencyName = row.name || row.nonIataName || '—';
                const agencyCode = row.code || row.nonIataCode || '—';

                return (
                  <tr key={row.nonIataId} className="hover:bg-slate-50 transition-colors">
                    {/* Non-IATA Name */}
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      <Link
                        to={`/non-iatas/${row.nonIataId}`}
                        className="hover:underline text-slate-900 font-semibold"
                        style={{ color: '#0F2E22' }}
                      >
                        {agencyName}
                      </Link>
                    </td>

                    {/* Code */}
                    <td className="px-4 py-3.5 text-xs text-slate-500 font-mono">
                      {agencyCode}
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                          row.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>

                    {/* Total Sales */}
                    <td className="px-4 py-3.5 text-right tabular-nums text-slate-700 font-medium">
                      {formatCurrency(row.totalSales, currency)}
                    </td>

                    {/* Total Paid */}
                    <td className="px-4 py-3.5 text-right tabular-nums text-slate-700 font-medium">
                      {formatCurrency(row.totalPayments, currency)}
                    </td>

                    {/* Outstanding Balance */}
                    <td
                      className={`px-4 py-3.5 text-right font-bold tabular-nums font-jost ${
                        hasBalance ? 'text-rose-700' : 'text-emerald-700'
                      }`}
                    >
                      {formatCurrency(row.outstandingBalance, currency)}
                    </td>

                    {/* Action buttons */}
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/reports?tab=statement&nonIataId=${row.nonIataId}`)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
                          title="Generate account statement"
                        >
                          <IFileText size={12} />
                          Statement
                        </button>
                        <Link
                          to={`/non-iatas/${row.nonIataId}`}
                          className="text-xs font-semibold hover:underline"
                          style={{ color: '#0F2E22' }}
                        >
                          View →
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing {items.length} of {totalElements} accounts · All amounts in ETB
        </div>
        <Link
          to="/non-iatas"
          className="font-semibold hover:underline"
          style={{ color: '#0F2E22' }}
        >
          View all Non-IATAs →
        </Link>
      </div>
    </div>
  );
};
