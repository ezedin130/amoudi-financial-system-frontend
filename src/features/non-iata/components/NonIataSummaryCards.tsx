import React from 'react';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/utils/formatters';
import { NonIataFinancialSummary } from '@/types/nonIata.types';

export interface NonIataSummaryCardsProps {
  summary: NonIataFinancialSummary | null;
  transactionCount?: number;
  isLoading: boolean;
}

export const NonIataSummaryCards: React.FC<NonIataSummaryCardsProps> = ({
  summary,
  transactionCount,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4 mb-6">
        <div className="h-28 bg-slate-100 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-24 bg-slate-100 rounded-lg animate-pulse" />
          <div className="h-24 bg-slate-100 rounded-lg animate-pulse" />
          <div className="h-24 bg-slate-100 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const owed = Number(summary.outstandingBalance || 0);
  const totalSales = Number(summary.totalSales || 0);
  const totalPayments = Number(summary.totalPayments || 0);
  const currency = summary.currency || 'ETB';

  const isOwedPositive = owed > 0;
  const isZero = owed === 0;

  return (
    <div className="space-y-4 mb-6">
      {/* Hero Outstanding Balance Card (matching Figma NonIATADetailScreen) */}
      <Card
        className={`p-6 transition-all ${
          isOwedPositive
            ? 'border-red-200 bg-red-50/30'
            : isZero
            ? 'border-emerald-200 bg-emerald-50/30'
            : 'border-blue-200 bg-blue-50/30'
        }`}
      >
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
          Current Outstanding Balance
        </div>
        <div
          className={`text-3xl sm:text-4xl font-bold tabular-nums font-jost ${
            isOwedPositive ? 'text-red-600' : isZero ? 'text-emerald-600' : 'text-blue-600'
          }`}
        >
          {formatCurrency(owed, currency)}
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {isOwedPositive
            ? 'Agency owes this balance to Amoudi. Derived as Total Sales minus Total Posted Payments.'
            : isZero
            ? 'All imported sales are fully settled. Zero outstanding balance.'
            : 'Account is in a credit position (payments exceed imported sales).'}
        </p>
      </Card>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Sales */}
        <Card className="p-5">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Total Imported Sales
          </div>
          <div className="text-2xl font-bold text-slate-900 font-jost tabular-nums mt-1">
            {formatCurrency(totalSales, currency)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Authoritative Galileo/BSP imports</div>
        </Card>

        {/* Total Payments */}
        <Card className="p-5">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Total Posted Payments
          </div>
          <div className="text-2xl font-bold text-emerald-600 font-jost tabular-nums mt-1">
            {formatCurrency(totalPayments, currency)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Posted bank receipts & deposits</div>
        </Card>

        {/* Total Activity */}
        <Card className="p-5">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Ledger Transactions
          </div>
          <div className="text-2xl font-bold text-slate-900 font-jost tabular-nums mt-1">
            {transactionCount !== undefined ? transactionCount : '—'}
          </div>
          <div className="text-xs text-slate-400 mt-1">Sales tickets & payment receipts</div>
        </Card>
      </div>
    </div>
  );
};
