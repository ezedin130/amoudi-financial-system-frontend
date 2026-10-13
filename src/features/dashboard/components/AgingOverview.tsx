import React from 'react';
import { Link } from 'react-router-dom';
import { DashboardOverviewMetrics } from '@/types/dashboard.types';
import { formatCurrency, formatDate } from '@/utils/formatters';

export interface AgingOverviewProps {
  metrics: DashboardOverviewMetrics | null;
  isLoading: boolean;
}

export const AgingOverview: React.FC<AgingOverviewProps> = ({ metrics, isLoading }) => {
  if (isLoading || !metrics) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-5 mb-6 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-48 mb-4" />
        <div className="h-3 bg-slate-100 rounded w-full mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded border border-slate-100">
              <div className="h-3 bg-slate-200 rounded w-16 mb-2" />
              <div className="h-5 bg-slate-200 rounded w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const currency = metrics.currency || 'ETB';
  const total = metrics.totalOutstanding || 1; // avoid division by zero

  const buckets = [
    {
      label: 'Current (0–30d)',
      amount: metrics.totalCurrent,
      bg: 'bg-emerald-600',
      textColor: 'text-emerald-700',
      cardBg: 'bg-emerald-50/40 border-emerald-100',
      percent: Math.max(0, Math.min(100, (metrics.totalCurrent / total) * 100)),
    },
    {
      label: '31–60d',
      amount: metrics.totalDays31To60,
      bg: 'bg-amber-500',
      textColor: 'text-amber-800',
      cardBg: 'bg-amber-50/40 border-amber-100',
      percent: Math.max(0, Math.min(100, (metrics.totalDays31To60 / total) * 100)),
    },
    {
      label: '61–90d',
      amount: metrics.totalDays61To90,
      bg: 'bg-orange-500',
      textColor: 'text-orange-800',
      cardBg: 'bg-orange-50/40 border-orange-100',
      percent: Math.max(0, Math.min(100, (metrics.totalDays61To90 / total) * 100)),
    },
    {
      label: '91–120d',
      amount: metrics.totalDays91To120,
      bg: 'bg-rose-500',
      textColor: 'text-rose-800',
      cardBg: 'bg-rose-50/40 border-rose-100',
      percent: Math.max(0, Math.min(100, (metrics.totalDays91To120 / total) * 100)),
    },
    {
      label: '120+d',
      amount: metrics.totalDays120Plus,
      bg: 'bg-rose-800',
      textColor: 'text-rose-950',
      cardBg: 'bg-rose-100/50 border-rose-200',
      percent: Math.max(0, Math.min(100, (metrics.totalDays120Plus / total) * 100)),
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 mb-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 font-jost">
            Accounts Receivable Aging Distribution
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            FIFO aging classification of outstanding receivables as of {formatDate(metrics.asOfDate)}
          </p>
        </div>
        <Link
          to="/reports?tab=aging"
          className="text-xs font-semibold hover:underline inline-flex items-center gap-1 shrink-0"
          style={{ color: '#0F2E22' }}
        >
          View Full Aging Report →
        </Link>
      </div>

      {/* Visual Multi-Segment Distribution Bar */}
      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex mb-4 border border-slate-200/60">
        {buckets.map((b, idx) => (
          <div
            key={idx}
            className={`${b.bg} h-full transition-all duration-300`}
            style={{ width: `${b.percent}%` }}
            title={`${b.label}: ${formatCurrency(b.amount, currency)} (${b.percent.toFixed(1)}%)`}
          />
        ))}
      </div>

      {/* 5 Distinct Bucket Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {buckets.map((b, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-md border ${b.cardBg} transition-all`}
          >
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
              <span>{b.label}</span>
              <span className="text-[10px] text-slate-400 font-mono">
                {metrics.totalOutstanding > 0 ? `${b.percent.toFixed(0)}%` : '0%'}
              </span>
            </div>
            <div
              className={`text-sm sm:text-base font-bold tabular-nums font-jost ${b.textColor}`}
            >
              {formatCurrency(b.amount, currency)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
