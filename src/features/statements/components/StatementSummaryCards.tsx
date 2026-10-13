import React from 'react';
import { AccountStatement } from '@/types/statements.types';
import { formatCurrency } from '@/utils/formatters';

export interface StatementSummaryCardsProps {
  statement: AccountStatement;
}

export const StatementSummaryCards: React.FC<StatementSummaryCardsProps> = ({ statement }) => {
  const currency = statement.currency || 'ETB';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Opening Balance */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Opening Balance
        </div>
        <div className="text-xl font-bold text-slate-800 font-jost tabular-nums mt-1">
          {formatCurrency(statement.openingBalance, currency)}
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          Prior to {statement.dateFrom || 'start of period'}
        </div>
      </div>

      {/* Period Sales (Total Debits) */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Period Sales (Debits)
        </div>
        <div className="text-xl font-bold text-slate-900 font-jost tabular-nums mt-1">
          +{formatCurrency(statement.totalSales, currency)}
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          Authoritative ticket sales in period
        </div>
      </div>

      {/* Period Payments (Total Credits) */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
          Period Payments (Credits)
        </div>
        <div className="text-xl font-bold text-emerald-700 font-jost tabular-nums mt-1">
          −{formatCurrency(statement.totalPayments, currency)}
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          Posted Non-IATA credits received
        </div>
      </div>

      {/* Closing Balance */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm bg-gradient-to-br from-white to-slate-50">
        <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Closing Balance
        </div>
        <div
          className={`text-xl font-bold font-jost tabular-nums mt-1 ${
            statement.closingBalance > 0 ? 'text-rose-700' : 'text-emerald-700'
          }`}
        >
          {formatCurrency(statement.closingBalance, currency)}
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          Net outstanding balance as of {statement.dateTo || 'current date'}
        </div>
      </div>
    </div>
  );
};
