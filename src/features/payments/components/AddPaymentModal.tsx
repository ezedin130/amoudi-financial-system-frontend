import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreatePaymentRequest, Payment } from '@/types/payments.types';
import { NonIata, NonIataFinancialSummary } from '@/types/nonIata.types';
import { getNonIatas, getNonIataFinancialSummary } from '@/api/nonIataApi';
import { createPayment, uploadReceipt } from '@/api/paymentsApi';
import { formatCurrency } from '@/utils/formatters';
import { IX, IUpload, ICheck, IFileText, ISpinner, IAlert } from '@/components/ui/Icons';

export interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentCreated: (payment: Payment) => void;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

export const AddPaymentModal: React.FC<AddPaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentCreated,
}) => {
  const navigate = useNavigate();

  // Form states
  const [agencies, setAgencies] = useState<NonIata[]>([]);
  const [selectedAgencyId, setSelectedAgencyId] = useState<number | ''>('');
  const [financialSummary, setFinancialSummary] = useState<NonIataFinancialSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const [paymentDate, setPaymentDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [amount, setAmount] = useState<string>('');
  const [bankReference, setBankReference] = useState<string>('');
  const [receiptNumber, setReceiptNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Receipt file state
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status & error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successPayment, setSuccessPayment] = useState<Payment | null>(null);
  const [receiptUploadWarning, setReceiptUploadWarning] = useState<string | null>(null);

  // Load active agencies
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    getNonIatas({ status: 'ACTIVE', size: 100 })
      .then((res) => {
        if (isMounted && res.content) {
          setAgencies(res.content);
        }
      })
      .catch(() => {
        if (isMounted) {
          setAgencies([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Load financial summary when agency changes
  useEffect(() => {
    if (!selectedAgencyId) {
      setFinancialSummary(null);
      return;
    }

    let isMounted = true;
    setLoadingSummary(true);

    getNonIataFinancialSummary(selectedAgencyId)
      .then((res) => {
        if (isMounted) {
          setFinancialSummary(res);
          setLoadingSummary(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setFinancialSummary(null);
          setLoadingSummary(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedAgencyId]);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        if (successPayment) {
          handleFinish();
        } else {
          handleClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isSubmitting, successPayment]);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        setError(`Unsupported file format (${ext}). Allowed formats: PDF, JPG, PNG.`);
        setReceiptFile(null);
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError(`File size exceeds 10 MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB).`);
        setReceiptFile(null);
        return;
      }
      setError(null);
      setReceiptFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgencyId) {
      setError('Please select a Non-IATA account.');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Payment amount must be greater than zero.');
      return;
    }
    if (!paymentDate) {
      setError('Payment date is required.');
      return;
    }
    if (!bankReference.trim()) {
      setError('Bank reference / transfer number is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setReceiptUploadWarning(null);

    const payload: CreatePaymentRequest = {
      nonIataId: Number(selectedAgencyId),
      paymentDate,
      amount: numAmount,
      currency: 'ETB',
      paymentReference: bankReference.trim(),
      receiptNumber: receiptNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    let created: Payment;
    try {
      created = await createPayment(payload);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to record payment.';
      setError(msg);
      setIsSubmitting(false);
      return;
    }

    // Step 2: Upload receipt if file was attached
    if (receiptFile) {
      try {
        const withReceipt = await uploadReceipt(created.id, receiptFile);
        created = withReceipt;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Receipt upload failed.';
        setReceiptUploadWarning(
          `Payment recorded successfully. Receipt upload failed: ${msg}. You can attach the receipt from Payment Details.`
        );
      }
    }

    setIsSubmitting(false);
    setSuccessPayment(created);
  };

  const handleFinish = () => {
    if (successPayment) {
      onPaymentCreated(successPayment);
    }
    handleClose();
  };

  const handleClose = () => {
    setSelectedAgencyId('');
    setFinancialSummary(null);
    setAmount('');
    setBankReference('');
    setReceiptNumber('');
    setNotes('');
    setReceiptFile(null);
    setError(null);
    setSuccessPayment(null);
    setReceiptUploadWarning(null);
    onClose();
  };

  // SUCCESS SCREEN VIEW (Figma PaymentSuccessScreen)
  if (successPayment) {
    return (
      <div
        className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4"
        onClick={() => !isSubmitting && handleFinish()}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-success-title"
          className="bg-white rounded-lg shadow-xl max-w-lg w-full overflow-hidden p-8 text-center animate-in fade-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
            <ICheck size={28} />
          </div>

          <h2 id="payment-success-title" className="text-xl font-bold text-slate-900 font-jost mb-1">
            Payment Recorded Successfully
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Payment <span className="font-semibold text-slate-700">#{successPayment.id}</span> has
            been created with status <span className="font-bold text-emerald-700">POSTED</span>.
          </p>

          {/* Receipt warning if partial failure occurred */}
          {receiptUploadWarning && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 text-left mb-5">
              {receiptUploadWarning}
            </div>
          )}

          {/* Payment Summary Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 text-left space-y-2.5 mb-6 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs">Non-IATA Sub-Agent</span>
              <span className="font-semibold text-slate-900">{successPayment.nonIataName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs">Amount Received</span>
              <span className="font-bold text-emerald-700 tabular-nums font-jost text-base">
                {formatCurrency(successPayment.amount, successPayment.currency)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs">Bank Reference</span>
              <span className="font-mono text-xs text-slate-800">
                {successPayment.paymentReference}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs">Receipt Status</span>
              <span className="font-medium text-xs text-slate-800">
                {successPayment.hasReceipt ? 'Attached' : 'No document attached'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center">
            {successPayment.nonIataId && (
              <button
                type="button"
                onClick={() => {
                  const id = successPayment.nonIataId;
                  handleFinish();
                  navigate(`/non-iatas/${id}`);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
              >
                View Agency Account
              </button>
            )}
            <button
              type="button"
              onClick={handleFinish}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded transition-colors shadow-sm"
            >
              Back to Payments
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Selected agency details for preview
  const selectedAgency = agencies.find((a) => a.id === selectedAgencyId);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4"
      onClick={() => !isSubmitting && handleClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-payment-title"
        className="bg-white rounded-lg shadow-xl max-w-xl w-full overflow-hidden animate-in fade-in duration-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 id="add-payment-title" className="text-base font-semibold text-slate-900 font-jost">Record New Payment</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter payment received from a Non-IATA sub-agent
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded"
            aria-label="Close modal"
          >
            <IX size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Agency Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Non-IATA Account <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedAgencyId}
              onChange={(e) => setSelectedAgencyId(e.target.value ? Number(e.target.value) : '')}
              required
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-800 focus:border-emerald-800"
            >
              <option value="">Select Non-IATA sub-agent...</option>
              {agencies.map((agency) => (
                <option key={agency.id} value={agency.id}>
                  {agency.name} ({agency.code})
                </option>
              ))}
            </select>
          </div>

          {/* Authoritative Live Balance Context */}
          {selectedAgency && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Current Outstanding Balance:</span>
                {loadingSummary ? (
                  <span className="text-slate-400">Loading...</span>
                ) : financialSummary ? (
                  <span
                    className={`font-bold tabular-nums ${
                      financialSummary.outstandingBalance > 0 ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {formatCurrency(financialSummary.outstandingBalance, financialSummary.currency)}
                  </span>
                ) : (
                  <span className="text-slate-500">Available upon recording</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Authoritative balance from backend: Total Imported Sales − Total Posted Payments.
              </p>
            </div>
          )}

          {/* Date & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={paymentDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Amount (ETB) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 250000"
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-800"
              />
            </div>
          </div>

          {/* Bank Reference & Receipt Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bank Reference / Transfer No. <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={bankReference}
                onChange={(e) => setBankReference(e.target.value)}
                placeholder="e.g. CBE-TX-998821"
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Receipt Number <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                placeholder="e.g. RCPT-2026-042"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-800"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notes / Remarks <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Cash deposit confirmed via CBE mobile banking"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-800"
            />
          </div>

          {/* Optional Receipt Upload Dropzone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Attach Receipt Document <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-slate-300 hover:border-emerald-800 rounded-md p-4 text-center cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
              />
              {receiptFile ? (
                <div className="flex items-center justify-center gap-2 text-xs text-emerald-800 font-medium">
                  <IFileText size={16} />
                  <span>{receiptFile.name}</span>
                  <span className="text-slate-400">
                    ({(receiptFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                  <IUpload size={16} className="text-slate-400" />
                  <span>Click to attach PDF or image receipt (max 10 MB)</span>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-700 flex items-start gap-2">
              <IAlert size={14} className="mt-0.5 flex-shrink-0 text-rose-500" />
              <div>{error}</div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedAgencyId || !amount || !bankReference}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm"
            >
              {isSubmitting && <ISpinner size={14} />}
              {isSubmitting ? 'Recording Payment...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
