import React from 'react';
import { Card } from '@/components/ui/Card';
import { formatDate, formatCurrency } from '@/utils/formatters';
import { StatementTransaction } from '@/types/nonIata.types';

export interface NonIataLedgerTableProps {
  transactions: StatementTransaction[];
  isLoading: boolean;
  closingBalance?: number;
  currency?: string;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (val: string) => void;
  onDateToChange: (val: string) => void;
  onFilterSubmit: () => void;
  onFilterReset: () => void;
}

export const NonIataLedgerTable: React.FC<NonIataLedgerTableProps> = ({
  transactions,
  isLoading,
  closingBalance,
  currency = 'ETB',
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onFilterSubmit,
  onFilterReset,
}) => {
  return (
    <Card>
      {/* Header & Date Range Filters */}
      <div className="px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 font-jost">Transaction Ledger</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Chronological audit trail of sales ticket debits and payment credits with Galileo/BSP financial breakdown
          </p>
        </div>

        {/* Date Filter Inputs */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span>From:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
              className="text-xs border border-slate-300 rounded px-2 py-1 bg-white text-slate-700 focus:outline-none focus:border-[#CBA326]"
            />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span>To:</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
              className="text-xs border border-slate-300 rounded px-2 py-1 bg-white text-slate-700 focus:outline-none focus:border-[#CBA326]"
            />
          </div>
          <button
            type="button"
            onClick={onFilterSubmit}
            className="px-2.5 py-1 text-xs font-medium text-white rounded bg-[#0F2E22] hover:bg-[#0F2E22]/90 transition-colors"
          >
            Apply
          </button>
          {(dateFrom || dateTo) && (
            <button
              type="button"
              onClick={onFilterReset}
              className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700 hover:underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-left">
                Date
              </th>
              <th className="px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-left">
                Type
              </th>
              <th className="px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-left">
                Reference
              </th>
              <th className="px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-left">
                Description
              </th>
              <th className="px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">
                Base Fare
              </th>
              <th className="px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">
                Tax
              </th>
              <th className="px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">
                Total
              </th>
              <th className="px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">
                S.CHR
              </th>
              <th className="px-3 py-2.5 text-xs font-bold text-slate-800 uppercase tracking-wide text-right bg-amber-50/60 border-l border-r border-amber-200">
                Debit (+ G.TOT)
              </th>
              <th className="px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">
                Credit (-Payment)
              </th>
              <th className="px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">
                Running Balance
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-3 py-3"><div className="h-4 bg-slate-200 rounded w-16" /></td>
                  <td className="px-3 py-3"><div className="h-4 bg-slate-200 rounded w-12" /></td>
                  <td className="px-3 py-3"><div className="h-4 bg-slate-200 rounded w-20" /></td>
                  <td className="px-3 py-3"><div className="h-4 bg-slate-200 rounded w-28" /></td>
                  <td className="px-3 py-3 text-right"><div className="h-4 bg-slate-200 rounded w-14 ml-auto" /></td>
                  <td className="px-3 py-3 text-right"><div className="h-4 bg-slate-200 rounded w-12 ml-auto" /></td>
                  <td className="px-3 py-3 text-right"><div className="h-4 bg-slate-200 rounded w-14 ml-auto" /></td>
                  <td className="px-3 py-3 text-right"><div className="h-4 bg-slate-200 rounded w-12 ml-auto" /></td>
                  <td className="px-3 py-3 text-right"><div className="h-4 bg-slate-200 rounded w-16 ml-auto" /></td>
                  <td className="px-3 py-3 text-right"><div className="h-4 bg-slate-200 rounded w-16 ml-auto" /></td>
                  <td className="px-3 py-3 text-right"><div className="h-4 bg-slate-200 rounded w-20 ml-auto" /></td>
                </tr>
              ))
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-xs text-slate-400">
                  No transaction records found for this account in the selected period.
                </td>
              </tr>
            ) : (
              transactions.map((tx, idx) => {
                const isSale = tx.type === 'SALE';
                const isPayment = tx.type === 'PAYMENT';
                const debit = Number(tx.debit || 0);
                const credit = Number(tx.credit || 0);
                const runningBal = Number(tx.runningBalance || 0);

                return (
                  <tr
                    key={idx}
                    className={`hover:bg-slate-50 transition-colors ${
                      isPayment ? 'bg-emerald-50/20' : ''
                    }`}
                  >
                    {/* Date */}
                    <td className="px-3 py-2.5 text-xs text-slate-500 whitespace-nowrap">
                      {formatDate(tx.transactionDate)}
                    </td>

                    {/* Type Badge */}
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                          isSale
                            ? 'bg-[#0F2E22]/10 text-[#0F2E22] border-[#0F2E22]/20'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {isSale ? 'Sale' : 'Payment'}
                      </span>
                    </td>

                    {/* Reference */}
                    <td className="px-3 py-2.5 text-xs font-mono text-slate-700 whitespace-nowrap">
                      {tx.reference || '—'}
                    </td>

                    {/* Description */}
                    <td className="px-3 py-2.5 text-xs text-slate-700 max-w-xs truncate">
                      {tx.description || '—'}
                    </td>

                    {/* Base Fare */}
                    <td className="px-3 py-2.5 text-right tabular-nums text-xs text-slate-600">
                      {isSale && tx.baseFare != null ? formatCurrency(tx.baseFare, '') : '—'}
                    </td>

                    {/* Tax */}
                    <td className="px-3 py-2.5 text-right tabular-nums text-xs text-slate-600">
                      {isSale && tx.tax != null ? formatCurrency(tx.tax, '') : '—'}
                    </td>

                    {/* Total */}
                    <td className="px-3 py-2.5 text-right tabular-nums text-xs text-slate-600">
                      {isSale && tx.totalSale != null ? formatCurrency(tx.totalSale, '') : '—'}
                    </td>

                    {/* Service Charge (S.CHR) */}
                    <td className="px-3 py-2.5 text-right tabular-nums text-xs text-slate-600">
                      {isSale && tx.serviceCharge != null ? formatCurrency(tx.serviceCharge, '') : '—'}
                    </td>

                    {/* Debit (+ G.TOT) - Authoritative Accounting Grand Total */}
                    <td className="px-3 py-2.5 text-right tabular-nums text-xs font-bold text-slate-900 bg-amber-50/40 border-l border-r border-amber-100 whitespace-nowrap">
                      {debit > 0 ? `+${formatCurrency(debit, '')}` : '—'}
                    </td>

                    {/* Credit (-Payment) */}
                    <td className="px-3 py-2.5 text-right tabular-nums text-xs font-medium text-emerald-600 whitespace-nowrap">
                      {credit > 0 ? `-${formatCurrency(credit, '')}` : '—'}
                    </td>

                    {/* Running Balance */}
                    <td
                      className={`px-3 py-2.5 text-right tabular-nums text-xs font-semibold whitespace-nowrap ${
                        runningBal > 0
                          ? 'text-red-600'
                          : runningBal === 0
                          ? 'text-emerald-600'
                          : 'text-blue-600'
                      }`}
                    >
                      {formatCurrency(runningBal, currency)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Footer with Closing Balance */}
          {closingBalance !== undefined && transactions.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50">
                <td
                  colSpan={9}
                  className="px-4 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wide"
                >
                  Closing Outstanding Balance
                </td>
                <td
                  colSpan={2}
                  className={`px-4 py-3 text-right tabular-nums text-sm font-bold ${
                    closingBalance > 0
                      ? 'text-red-600'
                      : closingBalance === 0
                      ? 'text-emerald-600'
                      : 'text-blue-600'
                  }`}
                >
                  {formatCurrency(closingBalance, currency)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </Card>
  );
};
