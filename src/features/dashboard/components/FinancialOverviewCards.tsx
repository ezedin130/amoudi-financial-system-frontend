import React from 'react';
import { DashboardOverviewMetrics } from '@/types/dashboard.types';
import { formatCurrency } from '@/utils/formatters';
import { Alert } from '@/components/ui/Alert';

export interface FinancialOverviewCardsProps {
  metrics: DashboardOverviewMetrics | null;
  isLoading: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const FinancialOverviewCards: React.FC<FinancialOverviewCardsProps> = ({
  metrics,
  isLoading,
  error,
  onRetry,
}) => {
  if (error) {
    return (
      <div className="space-y-2 mb-6">
        <Alert
          variant="danger"
          title="Unable to load financial overview"
          message={error}
        />
        {onRetry && (
          <div className="flex justify-end">
            <button
              onClick={onRetry}
              className="text-xs font-semibold px-3 py-1.5 rounded bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 transition-colors"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    );
  }

  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200 rounded-lg p-5 animate-pulse"
          >
            <div className="h-3 bg-slate-200 rounded w-20 mb-2" />
            <div className="h-7 bg-slate-200 rounded w-32 mb-1" />
            <div className="h-3 bg-slate-100 rounded w-24" />
          </div>
        ))}
      </div>
    );
  }

  const currency = metrics.currency || 'ETB';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {/* 1. Total Sales (Authoritative backend SUM(grand_total)) */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 transition-shadow hover:shadow-sm">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
          Total Sales
        </div>
        <div className="text-2xl font-semibold text-slate-900 tabular-nums font-jost">
          {formatCurrency(metrics.totalSales, currency)}
        </div>
        <div className="text-xs text-slate-400 mt-1">
          all ticket sales
        </div>
      </div>

      {/* 2. Total Payments (Authoritative backend SUM(posted payments)) */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 transition-shadow hover:shadow-sm">
        <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wide mb-1">
          Total Payments
        </div>
        <div className="text-2xl font-semibold text-slate-900 tabular-nums font-jost">
          {formatCurrency(metrics.totalPayments, currency)}
        </div>
        <div className="text-xs text-slate-400 mt-1">
          posted collections
        </div>
      </div>

      {/* 3. Outstanding Balance (Authoritative backend Total Sales - Total Payments) */}
      <div
        className="bg-white border rounded-lg p-5 transition-shadow hover:shadow-sm"
        style={{
          borderColor: 'rgba(203, 163, 38, 0.6)',
          boxShadow: '0 0 0 1px rgba(203, 163, 38, 0.25)',
        }}
      >
        <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: '#0F2E22' }}>
          Outstanding Balance
        </div>
        <div
          className="text-2xl font-bold tabular-nums font-jost"
          style={{ color: '#0F2E22' }}
        >
          {formatCurrency(metrics.totalOutstanding, currency)}
        </div>
        <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
          <span>Total Outstanding</span>
          <span className="text-[10px] bg-amber-50 text-amber-800 font-semibold px-1.5 py-0.5 rounded border border-amber-200">
            Authoritative
          </span>
        </div>
      </div>

      {/* 4. Active Non-IATA Accounts */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 transition-shadow hover:shadow-sm">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
          Active Non-IATAs
        </div>
        <div className="text-2xl font-semibold text-slate-900 tabular-nums font-jost">
          {metrics.activeAccountsCount}
        </div>
        <div className="text-xs text-slate-400 mt-1">
          operational accounts
        </div>
      </div>

      {/* 5. Total Non-IATA Accounts */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 transition-shadow hover:shadow-sm">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
          Total Accounts
        </div>
        <div className="text-2xl font-semibold text-slate-900 tabular-nums font-jost">
          {metrics.totalAccountsCount}
        </div>
        <div className="text-xs text-slate-400 mt-1">
          registered portfolio
        </div>
      </div>
    </div>
  );
};
