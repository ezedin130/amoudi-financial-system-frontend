import React from 'react';
import { useAuth } from '@/auth/AuthContext';
import { formatDate } from '@/utils/formatters';

export interface DashboardHeaderProps {
  asOfDate?: string;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  asOfDate,
  isRefreshing,
  onRefresh,
}) => {
  const { user } = useAuth();
  const isFinance = user?.role === 'FINANCE';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold text-slate-900 font-jost tracking-tight">
            Dashboard
          </h1>
          <span
            className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border"
            style={{
              backgroundColor: 'rgba(15, 46, 34, 0.08)',
              color: '#0F2E22',
              borderColor: 'rgba(15, 46, 34, 0.2)',
            }}
          >
            {isFinance ? 'Finance Team' : 'General Manager'}
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-0.5">
          Financial overview — all Non-IATA accounts
          {asOfDate && (
            <span className="ml-2 font-medium text-slate-700">
              · As of {formatDate(asOfDate)}
            </span>
          )}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Live status indicator */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-xs text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Financial Data</span>
        </div>

        {/* Refresh button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          title="Refresh all dashboard financial metrics from backend"
        >
          <svg
            className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-800' : 'text-slate-600'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    </div>
  );
};
