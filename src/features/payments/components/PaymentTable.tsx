import React from 'react';
import { Payment } from '@/types/payments.types';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { IEye, IUpload, IBan, IChevronLeft, IChevronRight } from '@/components/ui/Icons';

export interface PaymentTableProps {
  payments: Payment[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  userRole?: string;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
  onViewPayment: (payment: Payment) => void;
  onViewReceipt: (payment: Payment) => void;
  onUploadReceipt?: (payment: Payment) => void;
  onCancelPayment?: (payment: Payment) => void;
}

export const PaymentTable: React.FC<PaymentTableProps> = ({
  payments,
  isLoading,
  page,
  totalPages,
  totalElements,
  pageSize,
  userRole,
  onPageChange,
  onPageSizeChange,
  onViewPayment,
  onViewReceipt,
  onUploadReceipt,
  onCancelPayment,
}) => {
  const isFinance = userRole === 'FINANCE';
  const isGeneralManager = userRole === 'GENERAL_MANAGER';

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Non-IATA</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-left">Receipt No.</th>
                <th className="px-4 py-3 text-left">Bank Reference</th>
                <th className="px-4 py-3 text-center">Receipt</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Created By</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-4 py-3.5"><div className="h-4 bg-slate-200 rounded w-20" /></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-slate-200 rounded w-32" /></td>
                  <td className="px-4 py-3.5 text-right"><div className="h-4 bg-slate-200 rounded w-24 ml-auto" /></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-slate-200 rounded w-24" /></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-slate-200 rounded w-28" /></td>
                  <td className="px-4 py-3.5 text-center"><div className="h-4 bg-slate-200 rounded w-14 mx-auto" /></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-slate-200 rounded w-16" /></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-slate-200 rounded w-20" /></td>
                  <td className="px-4 py-3.5 text-right"><div className="h-4 bg-slate-200 rounded w-16 ml-auto" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <IEye size={24} />
        </div>
        <h3 className="text-base font-semibold text-slate-800 font-jost">No payments found</h3>
        <p className="text-sm text-slate-500 mt-1">
          No payment records matched the specified search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Non-IATA</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-left">Receipt No.</th>
              <th className="px-4 py-3 text-left">Bank Reference</th>
              <th className="px-4 py-3 text-center">Receipt</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Created By</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments.map((p) => {
              const isCancelled = p.status === 'CANCELLED';

              return (
                <tr
                  key={p.id}
                  onClick={() => onViewPayment(p)}
                  className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                    isCancelled ? 'bg-slate-50/50 opacity-80' : ''
                  }`}
                >
                  {/* Date */}
                  <td className="px-4 py-3.5 text-xs text-slate-600 whitespace-nowrap">
                    {formatDate(p.paymentDate)}
                  </td>

                  {/* Non-IATA */}
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-slate-900 leading-snug">
                      {p.nonIataName || 'Unknown Agency'}
                    </div>
                    {p.nonIataCode && (
                      <div className="text-xs text-slate-400 font-mono">
                        {p.nonIataCode}
                      </div>
                    )}
                  </td>

                  {/* Amount */}
                  <td className="px-4 py-3.5 text-right font-semibold text-slate-900 font-jost tabular-nums whitespace-nowrap">
                    <span className={isCancelled ? 'line-through text-slate-400' : 'text-emerald-700'}>
                      {formatCurrency(p.amount, p.currency)}
                    </span>
                  </td>

                  {/* Receipt Number */}
                  <td className="px-4 py-3.5 text-xs font-mono text-slate-600 whitespace-nowrap">
                    {p.receiptNumber || '—'}
                  </td>

                  {/* Reference */}
                  <td className="px-4 py-3.5 text-xs font-mono text-slate-600 whitespace-nowrap">
                    {p.paymentReference || '—'}
                  </td>

                  {/* Receipt indicator & direct preview */}
                  <td className="px-4 py-3.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    {p.hasReceipt ? (
                      <button
                        type="button"
                        onClick={() => onViewReceipt(p)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                        title="View receipt document"
                      >
                        <IEye size={12} />
                        Receipt
                      </button>
                    ) : isGeneralManager && !isCancelled && onUploadReceipt ? (
                      <button
                        type="button"
                        onClick={() => onUploadReceipt(p)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                        title="Attach receipt file"
                      >
                        <IUpload size={12} />
                        Attach
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">None</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <PaymentStatusBadge status={p.status} />
                  </td>

                  {/* Created By */}
                  <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                    {p.createdBy || 'System'}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onViewPayment(p)}
                        className="p-1 rounded text-slate-500 hover:text-emerald-800 hover:bg-slate-100 transition-colors"
                        title="View Payment Details"
                      >
                        <IEye size={16} />
                      </button>

                      {/* Cancel action: restricted strictly to FINANCE and only for POSTED payments */}
                      {isFinance && !isCancelled && onCancelPayment && (
                        <button
                          type="button"
                          onClick={() => onCancelPayment(p)}
                          className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                          title="Cancel Payment"
                        >
                          <IBan size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-4 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2 py-1 text-xs border border-slate-300 rounded bg-white focus:outline-none"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
          <span className="text-slate-400 ml-2">
            Total {totalElements} payments
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span>
            Page <span className="font-semibold text-slate-800">{page + 1}</span> of{' '}
            <span className="font-semibold text-slate-800">{Math.max(1, totalPages)}</span>
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => onPageChange(page - 1)}
              className="p-1 rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Previous Page"
            >
              <IChevronLeft size={14} />
            </button>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => onPageChange(page + 1)}
              className="p-1 rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Next Page"
            >
              <IChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
