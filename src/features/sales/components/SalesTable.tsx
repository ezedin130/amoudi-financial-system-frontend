import React from 'react';
import { SalesTransaction } from '@/types/sales.types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { IEye, IPlane } from '@/components/ui/Icons';

export interface SalesTableProps {
  sales: SalesTransaction[];
  isLoading: boolean;
  onSelectSale: (sale: SalesTransaction) => void;
}

export const SalesTable: React.FC<SalesTableProps> = ({ sales, isLoading, onSelectSale }) => {
  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-left">
                Ticket Number
              </th>
              <th className="px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-left">
                Date
              </th>
              <th className="px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-left">
                Non-IATA Agency
              </th>
              <th className="px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-left">
                Passenger Name
              </th>
              <th className="px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-left">
                Route
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
              <th className="px-3 py-2.5 text-xs font-semibold text-slate-700 uppercase tracking-wide text-right bg-amber-50/50">
                Grand Total (G.TOT)
              </th>
              <th className="px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Array.from({ length: 6 }).map((_, idx) => (
              <tr key={idx} className="animate-pulse">
                <td className="px-3 py-3"><div className="h-4 bg-slate-200 rounded w-24" /></td>
                <td className="px-3 py-3"><div className="h-4 bg-slate-200 rounded w-16" /></td>
                <td className="px-3 py-3"><div className="h-4 bg-slate-200 rounded w-28" /></td>
                <td className="px-3 py-3"><div className="h-4 bg-slate-200 rounded w-20" /></td>
                <td className="px-3 py-3"><div className="h-4 bg-slate-200 rounded w-14" /></td>
                <td className="px-3 py-3 text-right"><div className="h-4 bg-slate-200 rounded w-16 ml-auto" /></td>
                <td className="px-3 py-3 text-right"><div className="h-4 bg-slate-200 rounded w-14 ml-auto" /></td>
                <td className="px-3 py-3 text-right"><div className="h-4 bg-slate-200 rounded w-16 ml-auto" /></td>
                <td className="px-3 py-3 text-right"><div className="h-4 bg-slate-200 rounded w-12 ml-auto" /></td>
                <td className="px-3 py-3 text-right"><div className="h-4 bg-slate-200 rounded w-20 ml-auto" /></td>
                <td className="px-3 py-3 text-right"><div className="h-4 bg-slate-200 rounded w-12 ml-auto" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-400 mb-3">
          <IPlane size={24} />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">No sales transactions found</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          No imported ticket records matched the specified search and filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-left">
              Ticket Number
            </th>
            <th className="px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-left">
              Date
            </th>
            <th className="px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-left">
              Non-IATA Agency
            </th>
            <th className="px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-left">
              Passenger Name
            </th>
            <th className="px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-left">
              Route
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
              Grand Total (ETB)
            </th>
            <th className="px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sales.map((sale) => {
            const authoritativeGrandTotal = sale.grandTotal ?? sale.effectiveGrandTotal ?? sale.amount;

            return (
              <tr
                key={sale.id}
                onClick={() => onSelectSale(sale)}
                className="hover:bg-slate-50 cursor-pointer transition-colors"
              >
                {/* Ticket Number */}
                <td className="px-3 py-3 font-mono text-xs font-semibold text-slate-900 whitespace-nowrap">
                  {sale.ticketNumber}
                  {sale.transactionReference && (
                    <span className="block text-[11px] font-normal text-slate-400">
                      Ref: {sale.transactionReference}
                    </span>
                  )}
                </td>

                {/* Sale Date */}
                <td className="px-3 py-3 text-xs text-slate-600 whitespace-nowrap">
                  {formatDate(sale.saleDate)}
                </td>

                {/* Non-IATA Agency */}
                <td className="px-3 py-3 text-xs">
                  {sale.nonIataName ? (
                    <div>
                      <span className="font-medium text-slate-800">{sale.nonIataName}</span>
                      {sale.nonIataCode && (
                        <span className="ml-1.5 font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          {sale.nonIataCode}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">Unassigned</span>
                  )}
                </td>

                {/* Passenger Name */}
                <td className="px-3 py-3 text-xs text-slate-700">
                  {sale.passengerName || <span className="text-slate-400">—</span>}
                </td>

                {/* Route */}
                <td className="px-3 py-3 text-xs font-mono text-slate-600">
                  {sale.route || (sale.origin && sale.destination ? `${sale.origin}-${sale.destination}` : '—')}
                </td>

                {/* Base Fare */}
                <td className="px-3 py-3 text-right tabular-nums text-xs text-slate-600">
                  {sale.baseFare != null ? formatCurrency(sale.baseFare, '') : '—'}
                </td>

                {/* Tax */}
                <td className="px-3 py-3 text-right tabular-nums text-xs text-slate-600">
                  {sale.tax != null ? formatCurrency(sale.tax, '') : '—'}
                </td>

                {/* Total */}
                <td className="px-3 py-3 text-right tabular-nums text-xs text-slate-600">
                  {sale.totalSale != null ? formatCurrency(sale.totalSale, '') : '—'}
                </td>

                {/* Service Charge */}
                <td className="px-3 py-3 text-right tabular-nums text-xs text-slate-600">
                  {sale.serviceCharge != null ? formatCurrency(sale.serviceCharge, '') : '—'}
                </td>

                {/* Grand Total (G.TOT) - Authoritative Accounting Amount */}
                <td className="px-3 py-3 text-right tabular-nums text-xs font-bold text-slate-900 bg-amber-50/40 border-l border-r border-amber-100">
                  {formatCurrency(authoritativeGrandTotal, '')}
                </td>

                {/* Action */}
                <td className="px-3 py-3 text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectSale(sale);
                    }}
                    className="text-xs font-medium text-[#0F2E22] hover:text-[#CBA326] px-2 py-1 rounded hover:bg-slate-100 transition-colors inline-flex items-center gap-1"
                  >
                    <IEye size={13} />
                    Details
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
