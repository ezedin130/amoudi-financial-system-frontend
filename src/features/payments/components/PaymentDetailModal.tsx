import React, { useState, useEffect } from 'react';
import { Payment } from '@/types/payments.types';
import { getPaymentById } from '@/api/paymentsApi';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/formatters';
import { IX, IEye, IUpload, IBan, IFileText, ISpinner, IAlert } from '@/components/ui/Icons';

export interface PaymentDetailModalProps {
  paymentId: number | null;
  isOpen: boolean;
  userRole?: string;
  onClose: () => void;
  onViewReceipt: (payment: Payment) => void;
  onUploadReceipt?: (payment: Payment) => void;
  onCancelPayment?: (payment: Payment) => void;
}

export const PaymentDetailModal: React.FC<PaymentDetailModalProps> = ({
  paymentId,
  isOpen,
  userRole,
  onClose,
  onViewReceipt,
  onUploadReceipt,
  onCancelPayment,
}) => {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFinance = userRole === 'FINANCE';
  const isGeneralManager = userRole === 'GENERAL_MANAGER';

  useEffect(() => {
    if (!isOpen || !paymentId) {
      setPayment(null);
      setError(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    getPaymentById(paymentId)
      .then((res) => {
        if (!isMounted) return;
        setPayment(res);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Unable to load payment details from server.');
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, paymentId]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-detail-title"
        className="bg-white rounded-lg shadow-xl max-w-xl w-full overflow-hidden animate-in fade-in duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <h3 id="payment-detail-title" className="text-base font-semibold text-slate-900 font-jost">
              Payment #{paymentId}
            </h3>
            {payment && <PaymentStatusBadge status={payment.status} />}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded"
            aria-label="Close modal"
          >
            <IX size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center text-slate-500">
              <ISpinner size={28} className="text-emerald-800 mb-3" />
              <p className="text-sm font-medium">Loading authoritative payment details...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm flex items-start gap-2">
              <IAlert size={18} className="mt-0.5 flex-shrink-0" />
              <div>{error}</div>
            </div>
          )}

          {!isLoading && payment && (
            <>
              {/* Agency Banner */}
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/70 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                    Non-IATA Sub-Agent
                  </div>
                  <div className="text-base font-bold text-slate-900 font-jost mt-0.5">
                    {payment.nonIataName || 'Unknown Agency'}
                  </div>
                </div>
                {payment.nonIataCode && (
                  <span className="px-2.5 py-1 rounded bg-slate-200/70 text-slate-800 font-mono text-xs font-semibold">
                    {payment.nonIataCode}
                  </span>
                )}
              </div>

              {/* Payment Details Grid */}
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-white text-sm">
                <div className="px-4 py-3 flex items-center justify-between bg-emerald-50/30">
                  <span className="text-slate-600 font-medium">Payment Amount</span>
                  <span
                    className={`text-lg font-bold font-jost tabular-nums ${
                      payment.status === 'CANCELLED' ? 'line-through text-slate-400' : 'text-emerald-700'
                    }`}
                  >
                    {formatCurrency(payment.amount, payment.currency)}
                  </span>
                </div>

                <div className="px-4 py-3 flex items-center justify-between">
                  <span className="text-slate-500">Payment Date</span>
                  <span className="font-semibold text-slate-800">
                    {formatDate(payment.paymentDate)}
                  </span>
                </div>

                <div className="px-4 py-3 flex items-center justify-between">
                  <span className="text-slate-500">Bank Reference</span>
                  <span className="font-mono text-slate-800">
                    {payment.paymentReference || '—'}
                  </span>
                </div>

                <div className="px-4 py-3 flex items-center justify-between">
                  <span className="text-slate-500">Receipt Number</span>
                  <span className="font-mono text-slate-800">
                    {payment.receiptNumber || '—'}
                  </span>
                </div>

                {payment.notes && (
                  <div className="px-4 py-3">
                    <span className="text-slate-500 block mb-1">Notes / Remarks</span>
                    <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200">
                      {payment.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Receipt Document Section */}
              <div className="p-4 rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2 rounded-full ${
                        payment.hasReceipt
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <IFileText size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-800">
                        {payment.hasReceipt ? 'Receipt Document Attached' : 'No Receipt Attached'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {payment.hasReceipt
                          ? 'Authoritative file stored on server'
                          : 'General Manager can attach receipt anytime'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {payment.hasReceipt && (
                      <button
                        type="button"
                        onClick={() => onViewReceipt(payment)}
                        className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded hover:bg-emerald-100 transition-colors flex items-center gap-1"
                      >
                        <IEye size={13} />
                        View Receipt
                      </button>
                    )}

                    {isGeneralManager && payment.status === 'POSTED' && onUploadReceipt && (
                      <button
                        type="button"
                        onClick={() => onUploadReceipt(payment)}
                        className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors flex items-center gap-1"
                      >
                        <IUpload size={13} />
                        {payment.hasReceipt ? 'Replace' : 'Attach'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Audit Lineage */}
              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-500 space-y-1">
                <div className="flex justify-between">
                  <span>Recorded by:</span>
                  <span className="font-semibold text-slate-700">
                    {payment.createdBy || 'System'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Created at:</span>
                  <span>{formatDateTime(payment.createdAt)}</span>
                </div>
                {payment.updatedAt && (
                  <div className="flex justify-between">
                    <span>Last updated:</span>
                    <span>{formatDateTime(payment.updatedAt)}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            {isFinance && payment?.status === 'POSTED' && onCancelPayment && (
              <button
                type="button"
                onClick={() => onCancelPayment(payment)}
                className="px-3 py-1.5 text-xs font-semibold text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-300 rounded transition-colors flex items-center gap-1"
              >
                <IBan size={13} />
                Cancel Payment
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
