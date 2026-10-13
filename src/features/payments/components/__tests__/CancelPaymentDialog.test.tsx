import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CancelPaymentDialog } from '../CancelPaymentDialog';
import * as paymentsApi from '@/api/paymentsApi';
import { Payment } from '@/types/payments.types';

vi.mock('@/api/paymentsApi', () => ({
  cancelPayment: vi.fn(),
}));

const mockPayment: Payment = {
  id: 42,
  nonIataId: 10,
  nonIataCode: 'BTD',
  nonIataName: 'Bati Dodola',
  paymentDate: '2026-09-18',
  amount: 250000,
  currency: 'ETB',
  receiptNumber: 'RCPT-001',
  paymentReference: 'BANK-REF-1',
  notes: null,
  receiptObjectKey: null,
  hasReceipt: false,
  status: 'POSTED',
  createdBy: 'admin',
  createdAt: '2026-09-18T10:00:00',
  updatedAt: '2026-09-18T10:00:00',
};

describe('CancelPaymentDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders financial impact warning and handles cancellation confirmation', async () => {
    const onPaymentCancelled = vi.fn();
    const onClose = vi.fn();
    vi.mocked(paymentsApi.cancelPayment).mockResolvedValue({
      ...mockPayment,
      status: 'CANCELLED',
    });

    render(
      <CancelPaymentDialog
        payment={mockPayment}
        isOpen={true}
        onClose={onClose}
        onPaymentCancelled={onPaymentCancelled}
      />
    );

    expect(screen.getByText('Confirm Payment Cancellation')).toBeInTheDocument();
    expect(screen.getByText(/increase the Non-IATA's outstanding balance/i)).toBeInTheDocument();
    expect(screen.getByText('250,000.00 ETB')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Confirm Cancellation/i }));

    await waitFor(() => {
      expect(paymentsApi.cancelPayment).toHaveBeenCalledWith(42);
      expect(onPaymentCancelled).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'CANCELLED' })
      );
      expect(onClose).toHaveBeenCalled();
    });
  });
});
