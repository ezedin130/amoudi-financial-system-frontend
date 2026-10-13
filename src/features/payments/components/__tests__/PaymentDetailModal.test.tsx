import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { PaymentDetailModal } from '../PaymentDetailModal';
import * as paymentsApi from '@/api/paymentsApi';
import { Payment } from '@/types/payments.types';

vi.mock('@/api/paymentsApi', () => ({
  getPaymentById: vi.fn(),
}));

const mockPaymentDetail: Payment = {
  id: 42,
  nonIataId: 10,
  nonIataCode: 'BTD',
  nonIataName: 'Bati Dodola Agency',
  paymentDate: '2026-09-18',
  amount: 250000,
  currency: 'ETB',
  receiptNumber: 'RCPT-001',
  paymentReference: 'BANK-REF-1',
  notes: 'Detailed payment note',
  receiptObjectKey: 'receipts/rcpt-1.pdf',
  hasReceipt: true,
  status: 'POSTED',
  createdBy: 'admin',
  createdAt: '2026-09-18T10:00:00',
  updatedAt: '2026-09-18T10:00:00',
};

describe('PaymentDetailModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads authoritative payment details from getPaymentById and displays them', async () => {
    vi.mocked(paymentsApi.getPaymentById).mockResolvedValue(mockPaymentDetail);

    render(
      <PaymentDetailModal
        paymentId={42}
        isOpen={true}
        userRole="FINANCE"
        onClose={vi.fn()}
        onViewReceipt={vi.fn()}
        onCancelPayment={vi.fn()}
      />
    );

    expect(paymentsApi.getPaymentById).toHaveBeenCalledWith(42);

    await waitFor(() => {
      expect(screen.getByText('Bati Dodola Agency')).toBeInTheDocument();
      expect(screen.getByText('250,000.00 ETB')).toBeInTheDocument();
      expect(screen.getByText('BANK-REF-1')).toBeInTheDocument();
      expect(screen.getByText('RCPT-001')).toBeInTheDocument();
      expect(screen.getByText('Detailed payment note')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Cancel Payment/i })).toBeInTheDocument();
    });
  });

  it('hides Cancel Payment button for GENERAL_MANAGER role', async () => {
    vi.mocked(paymentsApi.getPaymentById).mockResolvedValue(mockPaymentDetail);

    render(
      <PaymentDetailModal
        paymentId={42}
        isOpen={true}
        userRole="GENERAL_MANAGER"
        onClose={vi.fn()}
        onViewReceipt={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Bati Dodola Agency')).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: /Cancel Payment/i })).not.toBeInTheDocument();
  });
});
