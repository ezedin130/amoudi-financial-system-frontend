import React from 'react';
import { AgingReport } from '@/types/aging.types';
import { formatCurrency } from '@/utils/formatters';

export interface AgingSummaryCardsProps {
  report: AgingReport;
}

export const AgingSummaryCards: React.FC<AgingSummaryCardsProps> = ({ report }) => {
  const currency = report.currency || 'ETB';

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* Total Receivables */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-300 shadow-sm bg-gradient-to-br from-white to-slate-50">
        <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
          Total Receivables
        </div>
        <div className="text-lg font-bold text-slate-900 font-jost tabular-nums mt-1">
          {formatCurrency(report.totalOutstanding, currency)}
        </div>
        <div className="text-[10px] text-slate-400 mt-0.5">
          {report.totalAccounts} accounts
        </div>
      </div>

      {/* Current (0–30 Days) */}
      <div className="bg-white p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/20 shadow-sm">
        <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
          Current (0–30d)
        </div>
        <div className="text-lg font-bold text-emerald-700 font-jost tabular-nums mt-1">
          {formatCurrency(report.totalCurrent, currency)}
        </div>
        <div className="text-[10px] text-emerald-600/70 mt-0.5">Not overdue</div>
      </div>

      {/* 31–60 Days */}
      <div className="bg-white p-3.5 rounded-lg border border-amber-200 bg-amber-50/20 shadow-sm">
        <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
          31–60 Days
        </div>
        <div className="text-lg font-bold text-amber-700 font-jost tabular-nums mt-1">
          {formatCurrency(report.totalDays31To60, currency)}
        </div>
        <div className="text-[10px] text-amber-600/70 mt-0.5">1–30d overdue</div>
      </div>

      {/* 61–90 Days */}
      <div className="bg-white p-3.5 rounded-lg border border-orange-200 bg-orange-50/20 shadow-sm">
        <div className="text-[11px] font-semibold text-orange-800 uppercase tracking-wider">
          61–90 Days
        </div>
        <div className="text-lg font-bold text-orange-700 font-jost tabular-nums mt-1">
          {formatCurrency(report.totalDays61To90, currency)}
        </div>
        <div className="text-[10px] text-orange-600/70 mt-0.5">31–60d overdue</div>
      </div>

      {/* 91–120 Days */}
      <div className="bg-white p-3.5 rounded-lg border border-rose-200 bg-rose-50/20 shadow-sm">
        <div className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider">
          91–120 Days
        </div>
        <div className="text-lg font-bold text-rose-700 font-jost tabular-nums mt-1">
          {formatCurrency(report.totalDays91To120, currency)}
        </div>
        <div className="text-[10px] text-rose-600/70 mt-0.5">61–90d overdue</div>
      </div>

      {/* 120+ Days Overdue */}
      <div className="bg-white p-3.5 rounded-lg border border-rose-300 bg-rose-50/40 shadow-sm">
        <div className="text-[11px] font-semibold text-rose-900 uppercase tracking-wider">
          120+ Days
        </div>
        <div className="text-lg font-bold text-rose-900 font-jost tabular-nums mt-1">
          {formatCurrency(report.totalDays120Plus, currency)}
        </div>
        <div className="text-[10px] text-rose-700/70 mt-0.5">Critical overdue</div>
      </div>
    </div>
  );
};
