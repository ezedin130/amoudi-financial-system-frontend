import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Payment } from '@/types/payments.types';
import { getRecentPayments } from '@/api/dashboardApi';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { PaymentStatusBadge } from '@/features/payments/components/PaymentStatusBadge';
import { Alert } from '@/components/ui/Alert';

export interface RecentPaymentsTableProps {
  refreshTrigger?: number;
}

export const RecentPaymentsTable: React.FC<RecentPaymentsTableProps> = ({ refreshTrigger }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getRecentPayments(5);
      setPayments(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to load recent payments';
      setError(msg);
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments, refreshTrigger]);

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 font-jost">
            Recent Payments Activity
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Latest credit recordings and bank transfers
          </p>
        </div>
        <Link
          to="/payments"
          className="text-xs font-semibold hover:underline"
          style={{ color: '#0F2E22' }}
        >
          View all payments →
        </Link>
      </div>

      {error && (
        <div className="p-4 space-y-2">
          <Alert
            variant="danger"
            title="Failed to load payments"
            message={error}
          />
          <div className="flex justify-end">
            <button
              onClick={fetchPayments}
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
              <th className="px-4 py-2.5 text-left">Non-IATA</th>
              <th className="px-4 py-2.5 text-left">Reference</th>
              <th className="px-4 py-2.5 text-right">Amount</th>
              <th className="px-4 py-2.5 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-16" /></td>
                  <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-28" /></td>
                  <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-20" /></td>
                  <td className="px-4 py-3 text-right"><div className="h-4 bg-slate-200 rounded w-16 ml-auto" /></td>
                  <td className="px-4 py-3 text-center"><div className="h-4 bg-slate-200 rounded w-16 mx-auto" /></td>
                </tr>
              ))
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-xs">
                  No payments recorded yet.
                </td>
              </tr>
            ) : (
              payments.map((p) => {
                const isCancelled = p.status === 'CANCELLED';

                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2.5 text-xs text-slate-600 whitespace-nowrap">
                      {formatDate(p.paymentDate)}
                    </td>
                    <td className="px-4 py-2.5 text-xs font-medium text-slate-900 whitespace-nowrap">
                      {p.nonIataName || p.nonIataCode || '—'}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-600 font-mono whitespace-nowrap">
                      {p.paymentReference || p.receiptNumber || '—'}
                    </td>
                    <td
                      className={`px-4 py-2.5 text-right text-xs font-bold tabular-nums font-jost whitespace-nowrap ${
                        isCancelled ? 'line-through text-slate-400' : 'text-emerald-700'
                      }`}
                    >
                      {formatCurrency(p.amount, p.currency || 'ETB')}
                    </td>
                    <td className="px-4 py-2.5 text-center whitespace-nowrap">
                      <PaymentStatusBadge status={p.status} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50/50 text-[11px] text-slate-400">
        Showing 5 most recent records · Cancelled payments excluded from financial balances
      </div>
    </div>
  );
};
