import React from 'react';
import { AccountStatement } from '@/types/statements.types';
import { formatCurrency, formatDate } from '@/utils/formatters';

export interface StatementTableProps {
  statement: AccountStatement | null;
  isLoading: boolean;
}

export const StatementTable: React.FC<StatementTableProps> = ({ statement, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <th className="px-3 py-3 text-left">Date</th>
                <th className="px-3 py-3 text-left">Type</th>
                <th className="px-3 py-3 text-left">Reference</th>
                <th className="px-3 py-3 text-left">Description</th>
                <th className="px-3 py-3 text-right">Base Fare</th>
                <th className="px-3 py-3 text-right">Tax</th>
                <th className="px-3 py-3 text-right">Total</th>
                <th className="px-3 py-3 text-right">S.CHR</th>
                <th className="px-3 py-3 text-right bg-amber-50/50">Debit (+ G.TOT)</th>
                <th className="px-3 py-3 text-right">Credit (−)</th>
                <th className="px-3 py-3 text-right">Running Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Array.from({ length: 6 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-3 py-3.5"><div className="h-4 bg-slate-200 rounded w-16" /></td>
                  <td className="px-3 py-3.5"><div className="h-4 bg-slate-200 rounded w-12" /></td>
                  <td className="px-3 py-3.5"><div className="h-4 bg-slate-200 rounded w-20" /></td>
                  <td className="px-3 py-3.5"><div className="h-4 bg-slate-200 rounded w-28" /></td>
                  <td className="px-3 py-3.5 text-right"><div className="h-4 bg-slate-200 rounded w-14 ml-auto" /></td>
                  <td className="px-3 py-3.5 text-right"><div className="h-4 bg-slate-200 rounded w-12 ml-auto" /></td>
                  <td className="px-3 py-3.5 text-right"><div className="h-4 bg-slate-200 rounded w-14 ml-auto" /></td>
                  <td className="px-3 py-3.5 text-right"><div className="h-4 bg-slate-200 rounded w-12 ml-auto" /></td>
                  <td className="px-3 py-3.5 text-right"><div className="h-4 bg-slate-200 rounded w-16 ml-auto" /></td>
                  <td className="px-3 py-3.5 text-right"><div className="h-4 bg-slate-200 rounded w-16 ml-auto" /></td>
                  <td className="px-3 py-3.5 text-right"><div className="h-4 bg-slate-200 rounded w-20 ml-auto" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (!statement || statement.transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-12 text-center">
        <h3 className="text-base font-semibold text-slate-800 font-jost">
          No transactions found for the selected period
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          {statement
            ? `Account ${statement.nonIataName} has no recorded sales or posted payments within this date range.`
            : 'Select a Non-IATA sub-agent and click Generate Statement.'}
        </p>
      </div>
    );
  }

  const currency = statement.currency || 'ETB';

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <th className="px-3 py-3 text-left">Date</th>
              <th className="px-3 py-3 text-left">Type</th>
              <th className="px-3 py-3 text-left">Reference</th>
              <th className="px-3 py-3 text-left">Description</th>
              <th className="px-3 py-3 text-right">Base Fare</th>
              <th className="px-3 py-3 text-right">Tax</th>
              <th className="px-3 py-3 text-right">Total</th>
              <th className="px-3 py-3 text-right">S.CHR</th>
              <th className="px-3 py-3 text-right font-bold text-slate-800 uppercase bg-amber-50/60 border-l border-r border-amber-200">
                Debit (+ G.TOT)
              </th>
              <th className="px-3 py-3 text-right">Credit (−)</th>
              <th className="px-3 py-3 text-right">Running Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {statement.transactions.map((t, idx) => {
              const isSale = t.type === 'SALE';

              return (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  {/* Date */}
                  <td className="px-3 py-3 text-xs text-slate-600 whitespace-nowrap">
                    {formatDate(t.transactionDate)}
                  </td>

                  {/* Type Badge */}
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                        isSale
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {isSale ? 'Sale' : 'Payment'}
                    </span>
                  </td>

                  {/* Reference */}
                  <td className="px-3 py-3 text-xs font-mono text-slate-800 whitespace-nowrap font-medium">
                    {t.reference || '—'}
                  </td>

                  {/* Description */}
                  <td className="px-3 py-3 text-xs text-slate-600 max-w-xs truncate">
                    {t.description || '—'}
                  </td>

                  {/* Base Fare */}
                  <td className="px-3 py-3 text-right tabular-nums text-xs text-slate-600">
                    {isSale && t.baseFare != null ? formatCurrency(t.baseFare, '') : '—'}
                  </td>

                  {/* Tax */}
                  <td className="px-3 py-3 text-right tabular-nums text-xs text-slate-600">
                    {isSale && t.tax != null ? formatCurrency(t.tax, '') : '—'}
                  </td>

                  {/* Total */}
                  <td className="px-3 py-3 text-right tabular-nums text-xs text-slate-600">
                    {isSale && t.totalSale != null ? formatCurrency(t.totalSale, '') : '—'}
                  </td>

                  {/* Service Charge (S.CHR) */}
                  <td className="px-3 py-3 text-right tabular-nums text-xs text-slate-600">
                    {isSale && t.serviceCharge != null ? formatCurrency(t.serviceCharge, '') : '—'}
                  </td>

                  {/* Debit (+ G.TOT) - Authoritative Accounting Grand Total */}
                  <td className="px-3 py-3 text-right font-bold text-slate-900 font-jost tabular-nums whitespace-nowrap bg-amber-50/40 border-l border-r border-amber-100">
                    {t.debit > 0 ? `+${formatCurrency(t.debit, currency)}` : '—'}
                  </td>

                  {/* Credit (−) */}
                  <td className="px-3 py-3 text-right font-medium text-emerald-700 font-jost tabular-nums whitespace-nowrap">
                    {t.credit > 0 ? `−${formatCurrency(t.credit, currency)}` : '—'}
                  </td>

                  {/* Running Balance */}
                  <td className="px-3 py-3 text-right font-bold text-slate-900 font-jost tabular-nums whitespace-nowrap">
                    {formatCurrency(t.runningBalance, currency)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Statement Footer */}
      <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between text-xs text-slate-600">
        <div>
          Total transactions in period:{' '}
          <span className="font-semibold text-slate-800">{statement.transactionCount}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>
            Closing Balance:{' '}
            <span
              className={`font-bold tabular-nums ${
                statement.closingBalance > 0 ? 'text-rose-700' : 'text-emerald-700'
              }`}
            >
              {formatCurrency(statement.closingBalance, currency)}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};
