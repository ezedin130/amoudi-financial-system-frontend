import React, { useState } from 'react';
import { Payment } from '@/types/payments.types';
import { cancelPayment } from '@/api/paymentsApi';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { IAlert, ISpinner, IBan } from '@/components/ui/Icons';

export interface CancelPaymentDialogProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentCancelled: (payment: Payment) => void;
}

export const CancelPaymentDialog: React.FC<CancelPaymentDialogProps> = ({
  payment,
  isOpen,
  onClose,
  onPaymentCancelled,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !payment) return null;

  const handleConfirmCancel = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const updated = await cancelPayment(payment.id);
      onPaymentCancelled(updated);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to cancel payment.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4"
      onClick={() => !isSubmitting && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-payment-title"
        className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden animate-in fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
              <IAlert size={22} />
            </div>
            <div>
              <h3 id="cancel-payment-title" className="text-base font-semibold text-slate-900 font-jost">
                Confirm Payment Cancellation
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                This action will immediately change the payment status from <strong>POSTED</strong> to{' '}
                <strong>CANCELLED</strong>.
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Non-IATA Account:</span>
              <span className="font-semibold text-slate-800">{payment.nonIataName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Amount:</span>
              <span className="font-bold text-rose-700 tabular-nums">
                {formatCurrency(payment.amount, payment.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Date:</span>
              <span className="font-mono text-slate-700">{formatDate(payment.paymentDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Bank Reference:</span>
              <span className="font-mono text-slate-700">{payment.paymentReference || '—'}</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800">
            <strong>Financial Impact:</strong> Cancelling this payment excludes it from posted payment
            totals, which will immediately <strong>increase the Non-IATA's outstanding balance</strong>.
            The record remains visible for audit compliance.
          </div>

          {error && (
            <div className="mt-3 p-3 bg-rose-100 border border-rose-300 rounded text-xs text-rose-900">
              {error}
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
            >
              Keep Payment
            </button>
            <button
              type="button"
              onClick={handleConfirmCancel}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <ISpinner size={14} />
                  Cancelling...
                </>
              ) : (
                <>
                  <IBan size={14} />
                  Confirm Cancellation
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
