import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { IPlus, ICheck } from '@/components/ui/Icons';
import { useAuth } from '@/auth/AuthContext';
import { getPayments } from '@/api/paymentsApi';
import { Payment, PaymentFilterParams } from '@/types/payments.types';
import { PageResponse } from '@/types/api.types';
import { PaymentFilters } from '@/features/payments/components/PaymentFilters';
import { PaymentTable } from '@/features/payments/components/PaymentTable';
import { AddPaymentModal } from '@/features/payments/components/AddPaymentModal';
import { PaymentDetailModal } from '@/features/payments/components/PaymentDetailModal';
import { ReceiptViewerModal } from '@/features/payments/components/ReceiptViewerModal';
import { ReceiptUploadModal } from '@/features/payments/components/ReceiptUploadModal';
import { CancelPaymentDialog } from '@/features/payments/components/CancelPaymentDialog';

export const PaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const isFinance = user?.role === 'FINANCE';
  const isGeneralManager = user?.role === 'GENERAL_MANAGER';

  // Payment list data
  const [paymentsData, setPaymentsData] = useState<PageResponse<Payment>>({
    content: [],
    pageNumber: 0,
    pageSize: 20,
    totalElements: 0,
    totalPages: 0,
    isFirst: true,
    isLast: true,
    hasNext: false,
    hasPrevious: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters state
  const [filters, setFilters] = useState<PaymentFilterParams>({
    page: 0,
    size: 20,
  });

  // Modals state
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [selectedPaymentDetailId, setSelectedPaymentDetailId] = useState<number | null>(null);
  const [receiptViewerPayment, setReceiptViewerPayment] = useState<Payment | null>(null);
  const [receiptUploadPayment, setReceiptUploadPayment] = useState<Payment | null>(null);
  const [cancelTargetPayment, setCancelTargetPayment] = useState<Payment | null>(null);

  // Load payments from server
  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getPayments(filters);
      setPaymentsData(response);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to load payment records.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleFilterChange = (newFilters: Partial<PaymentFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      page: 0,
      size: filters.size || 20,
    });
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newSize: number) => {
    setFilters((prev) => ({ ...prev, size: newSize, page: 0 }));
  };

  // Actions
  const handlePaymentCreated = (newPayment: Payment) => {
    setSuccessMessage(`Payment #${newPayment.id} recorded successfully.`);
    fetchPayments();
  };

  const handlePaymentCancelled = (cancelled: Payment) => {
    setSuccessMessage(`Payment #${cancelled.id} was cancelled successfully. Authoritative balance updated.`);
    fetchPayments();
    if (selectedPaymentDetailId === cancelled.id) {
      setSelectedPaymentDetailId(null);
    }
  };

  const handleReceiptUploaded = (updated: Payment) => {
    setSuccessMessage(`Receipt attached successfully to Payment #${updated.id}.`);
    fetchPayments();
  };

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <PageHeader
        title="Payments"
        subtitle="Authoritative log of received payments, receipt attachments, and cancellation audit trail"
        actions={
          isGeneralManager ? (
            <Button
              onClick={() => setIsAddPaymentOpen(true)}
              className="flex items-center gap-1.5 shadow-sm"
            >
              <IPlus size={16} />
              Add Payment
            </Button>
          ) : (
            <div className="text-xs text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded">
              Role: <strong>Finance</strong> (Review &amp; Cancellation)
            </div>
          )
        }
      />

      {/* Global Alerts */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-lg flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <ICheck size={16} className="text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-4"
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <Alert variant="danger" title="Unable to retrieve payments" message={error} />
      )}

      {/* Filters Card */}
      <PaymentFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Payments Table */}
      <Card>
        <PaymentTable
          payments={paymentsData.content || []}
          isLoading={isLoading}
          page={paymentsData.pageNumber ?? 0}
          totalPages={paymentsData.totalPages ?? 0}
          totalElements={paymentsData.totalElements ?? 0}
          pageSize={paymentsData.pageSize ?? 20}
          userRole={user?.role}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onViewPayment={(payment) => setSelectedPaymentDetailId(payment.id)}
          onViewReceipt={(payment) => setReceiptViewerPayment(payment)}
          onUploadReceipt={
            isGeneralManager ? (payment) => setReceiptUploadPayment(payment) : undefined
          }
          onCancelPayment={
            isFinance ? (payment) => setCancelTargetPayment(payment) : undefined
          }
        />
      </Card>

      {/* MODALS */}

      {/* Add Payment Modal (GM Only) */}
      {isGeneralManager && (
        <AddPaymentModal
          isOpen={isAddPaymentOpen}
          onClose={() => setIsAddPaymentOpen(false)}
          onPaymentCreated={handlePaymentCreated}
        />
      )}

      {/* Payment Detail Modal (Both Roles) */}
      <PaymentDetailModal
        paymentId={selectedPaymentDetailId}
        isOpen={Boolean(selectedPaymentDetailId)}
        userRole={user?.role}
        onClose={() => setSelectedPaymentDetailId(null)}
        onViewReceipt={(p) => setReceiptViewerPayment(p)}
        onUploadReceipt={
          isGeneralManager
            ? (p) => {
                setSelectedPaymentDetailId(null);
                setReceiptUploadPayment(p);
              }
            : undefined
        }
        onCancelPayment={
          isFinance
            ? (p) => {
                setSelectedPaymentDetailId(null);
                setCancelTargetPayment(p);
              }
            : undefined
        }
      />

      {/* Receipt Viewer Modal (Both Roles) */}
      <ReceiptViewerModal
        payment={receiptViewerPayment}
        isOpen={Boolean(receiptViewerPayment)}
        onClose={() => setReceiptViewerPayment(null)}
      />

      {/* Receipt Upload Modal (GM Only) */}
      {isGeneralManager && (
        <ReceiptUploadModal
          payment={receiptUploadPayment}
          isOpen={Boolean(receiptUploadPayment)}
          onClose={() => setReceiptUploadPayment(null)}
          onReceiptUploaded={handleReceiptUploaded}
        />
      )}

      {/* Cancel Payment Confirmation Dialog (Finance Only) */}
      {isFinance && (
        <CancelPaymentDialog
          payment={cancelTargetPayment}
          isOpen={Boolean(cancelTargetPayment)}
          onClose={() => setCancelTargetPayment(null)}
          onPaymentCancelled={handlePaymentCancelled}
        />
      )}
    </div>
  );
};
