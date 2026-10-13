import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { SalesTransaction } from '@/types/sales.types';
import { getRecentSales } from '@/api/dashboardApi';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Alert } from '@/components/ui/Alert';

export interface RecentSalesTableProps {
  refreshTrigger?: number;
}

export const RecentSalesTable: React.FC<RecentSalesTableProps> = ({ refreshTrigger }) => {
  const [sales, setSales] = useState<SalesTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getRecentSales(5);
      setSales(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to load recent sales';
      setError(msg);
      setSales([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSales();
  }, [fetchSales, refreshTrigger]);

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 font-jost">
            Recent Sales Activity
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Latest ticket issuance transactions
          </p>
        </div>
        <Link
          to="/sales-reports"
          className="text-xs font-semibold hover:underline"
          style={{ color: '#0F2E22' }}
        >
          View all sales →
        </Link>
      </div>

      {error && (
        <div className="p-4 space-y-2">
          <Alert
            variant="danger"
            title="Failed to load sales"
            message={error}
          />
          <div className="flex justify-end">
            <button
              onClick={fetchSales}
              className="text-xs font-semibold px-3 py-1 rounded bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <th className="px-4 py-2.5 text-left">Date</th>
              <th className="px-4 py-2.5 text-left">Ticket</th>
              <th className="px-4 py-2.5 text-left">Non-IATA</th>
              <th className="px-4 py-2.5 text-left">Passenger</th>
              <th className="px-4 py-2.5 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-16" /></td>
                  <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-24" /></td>
                  <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-28" /></td>
                  <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-24" /></td>
                  <td className="px-4 py-3 text-right"><div className="h-4 bg-slate-200 rounded w-16 ml-auto" /></td>
                </tr>
              ))
            ) : sales.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-xs">
                  No sales recorded yet.
                </td>
              </tr>
            ) : (
              sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-2.5 text-xs text-slate-600 whitespace-nowrap">
                    {formatDate(sale.saleDate)}
                  </td>
                  <td className="px-4 py-2.5 text-xs font-mono text-slate-800 font-medium whitespace-nowrap">
                    {sale.ticketNumber}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-slate-800 font-medium whitespace-nowrap">
                    {sale.nonIataName || sale.nonIataCode || 'Unassigned'}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-slate-600 truncate max-w-[140px]">
                    {sale.passengerName || sale.route || '—'}
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs font-bold text-slate-900 font-jost tabular-nums whitespace-nowrap">
                    {formatCurrency(sale.grandTotal ?? sale.effectiveGrandTotal ?? sale.amount, sale.currency || 'ETB')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50/50 text-[11px] text-slate-400">
        Showing 5 most recent transactions · All amounts in ETB
      </div>
    </div>
  );
};
