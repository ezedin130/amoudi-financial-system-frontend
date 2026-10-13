import React from 'react';
import { AgingReport } from '@/types/aging.types';
import { formatCurrency } from '@/utils/formatters';
import { IFileText } from '@/components/ui/Icons';

export interface AgingTableProps {
  report: AgingReport | null;
  isLoading: boolean;
  onSelectStatement?: (nonIataId: number) => void;
}

export const AgingTable: React.FC<AgingTableProps> = ({
  report,
  isLoading,
  onSelectStatement,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <th className="px-4 py-3 text-left">Non-IATA</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Current (0–30d)</th>
                <th className="px-4 py-3 text-right">31–60d</th>
                <th className="px-4 py-3 text-right">61–90d</th>
                <th className="px-4 py-3 text-right">91–120d</th>
                <th className="px-4 py-3 text-right">120+d</th>
                <th className="px-4 py-3 text-right">Total Outstanding</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-4 py-3.5"><div className="h-4 bg-slate-200 rounded w-32" /></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-slate-200 rounded w-16" /></td>
                  <td className="px-4 py-3.5 text-right"><div className="h-4 bg-slate-200 rounded w-20 ml-auto" /></td>
                  <td className="px-4 py-3.5 text-right"><div className="h-4 bg-slate-200 rounded w-20 ml-auto" /></td>
                  <td className="px-4 py-3.5 text-right"><div className="h-4 bg-slate-200 rounded w-20 ml-auto" /></td>
                  <td className="px-4 py-3.5 text-right"><div className="h-4 bg-slate-200 rounded w-20 ml-auto" /></td>
                  <td className="px-4 py-3.5 text-right"><div className="h-4 bg-slate-200 rounded w-20 ml-auto" /></td>
                  <td className="px-4 py-3.5 text-right"><div className="h-4 bg-slate-200 rounded w-24 ml-auto" /></td>
                  <td className="px-4 py-3.5 text-center"><div className="h-4 bg-slate-200 rounded w-14 mx-auto" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (!report || report.rows.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-12 text-center">
        <h3 className="text-base font-semibold text-slate-800 font-jost">
          No receivables match the selected filters
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Adjust the as-of date or search criteria to view aged receivables.
        </p>
      </div>
    );
  }

  const currency = report.currency || 'ETB';

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <th className="px-4 py-3 text-left">Non-IATA</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Current (0–30d)</th>
              <th className="px-4 py-3 text-right">31–60d</th>
              <th className="px-4 py-3 text-right">61–90d</th>
              <th className="px-4 py-3 text-right">91–120d</th>
              <th className="px-4 py-3 text-right">120+d</th>
              <th className="px-4 py-3 text-right">Total Outstanding</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {report.rows.map((row) => (
              <tr key={row.nonIataId} className="hover:bg-slate-50 transition-colors">
                {/* Agency Name & Code */}
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-900 leading-snug">
                    {row.name}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {row.code}
                  </div>
                </td>

                {/* Status Badge */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                      row.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {row.status}
                  </span>
                </td>

                {/* Current 0-30 */}
                <td className="px-4 py-3 text-right tabular-nums text-slate-700 whitespace-nowrap">
                  {row.current > 0 ? formatCurrency(row.current, currency) : '—'}
                </td>

                {/* 31-60 */}
                <td className="px-4 py-3 text-right tabular-nums text-amber-700 whitespace-nowrap">
                  {row.days31To60 > 0 ? formatCurrency(row.days31To60, currency) : '—'}
                </td>

                {/* 61-90 */}
                <td className="px-4 py-3 text-right tabular-nums text-orange-700 whitespace-nowrap">
                  {row.days61To90 > 0 ? formatCurrency(row.days61To90, currency) : '—'}
                </td>

                {/* 91-120 */}
                <td className="px-4 py-3 text-right tabular-nums text-rose-700 whitespace-nowrap">
                  {row.days91To120 > 0 ? formatCurrency(row.days91To120, currency) : '—'}
                </td>

                {/* 120+ */}
                <td className="px-4 py-3 text-right tabular-nums text-rose-900 font-semibold whitespace-nowrap">
                  {row.days120Plus > 0 ? formatCurrency(row.days120Plus, currency) : '—'}
                </td>

                {/* Total Outstanding */}
                <td className="px-4 py-3 text-right font-bold text-slate-900 font-jost tabular-nums whitespace-nowrap">
                  <span className={row.totalOutstanding > 0 ? 'text-rose-700' : 'text-emerald-700'}>
                    {formatCurrency(row.totalOutstanding, currency)}
                  </span>
                </td>

                {/* Action */}
                <td className="px-4 py-3 text-center whitespace-nowrap">
                  {onSelectStatement && (
                    <button
                      type="button"
                      onClick={() => onSelectStatement(row.nonIataId)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors"
                      title="View account statement for this agency"
                    >
                      <IFileText size={12} />
                      Statement
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>

          {/* Authoritative Totals Footer */}
          <tfoot>
            <tr className="bg-slate-100 border-t-2 border-slate-300 font-semibold text-xs text-slate-800">
              <td colSpan={2} className="px-4 py-3 uppercase tracking-wider">
                Total Receivables ({report.totalAccounts} accounts)
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                {formatCurrency(report.totalCurrent, currency)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-amber-800">
                {formatCurrency(report.totalDays31To60, currency)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-orange-800">
                {formatCurrency(report.totalDays61To90, currency)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-rose-800">
                {formatCurrency(report.totalDays91To120, currency)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-rose-900 font-bold">
                {formatCurrency(report.totalDays120Plus, currency)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums font-bold text-sm text-slate-900 font-jost">
                {formatCurrency(report.totalOutstanding, currency)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
