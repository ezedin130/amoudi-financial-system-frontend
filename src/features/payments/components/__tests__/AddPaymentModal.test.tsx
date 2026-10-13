import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AddPaymentModal } from '../AddPaymentModal';
import * as nonIataApi from '@/api/nonIataApi';
import * as paymentsApi from '@/api/paymentsApi';
import { Payment } from '@/types/payments.types';

vi.mock('@/api/nonIataApi', () => ({
  getNonIatas: vi.fn(),
  getNonIataFinancialSummary: vi.fn(),
}));

vi.mock('@/api/paymentsApi', () => ({
  createPayment: vi.fn(),
  uploadReceipt: vi.fn(),
}));

describe('AddPaymentModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(nonIataApi.getNonIatas).mockResolvedValue({
      content: [
        {
          id: 10,
          name: 'Bati Dodola',
          code: 'BTD',
          status: 'ACTIVE',
          contactName: 'Bati Manager',
          phone: '+251911223344',
          email: 'bati@example.com',
          notes: null,
          createdAt: '2026-09-01T00:00:00',
          updatedAt: '2026-09-01T00:00:00',
        },
      ],
      pageNumber: 0,
      pageSize: 100,
      totalElements: 1,
      totalPages: 1,
      isFirst: true,
      isLast: true,
      hasNext: false,
      hasPrevious: false,
    });
    vi.mocked(nonIataApi.getNonIataFinancialSummary).mockResolvedValue({
      nonIataId: 10,
      nonIataCode: 'BTD',
      nonIataName: 'Bati Dodola',
      totalSales: 500000,
      totalPayments: 200000,
      outstandingBalance: 300000,
      currency: 'ETB',
    });
  });

  it('renders form inputs and loads agencies', async () => {
    render(
      <MemoryRouter>
        <AddPaymentModal isOpen={true} onClose={vi.fn()} onPaymentCreated={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText('Record New Payment')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Bati Dodola (BTD)')).toBeInTheDocument();
    });
  });

  it('creates payment successfully and displays success screen', async () => {
    const mockCreatedPayment: Payment = {
      id: 99,
      nonIataId: 10,
      nonIataCode: 'BTD',
      nonIataName: 'Bati Dodola',
      paymentDate: '2026-09-18',
      amount: 150000,
      currency: 'ETB',
      receiptNumber: 'RCPT-100',
      paymentReference: 'BANK-TRF-55',
      notes: 'Test note',
      receiptObjectKey: null,
      hasReceipt: false,
      status: 'POSTED',
      createdBy: 'admin',
      createdAt: '2026-09-18T10:00:00',
      updatedAt: '2026-09-18T10:00:00',
    };
    vi.mocked(paymentsApi.createPayment).mockResolvedValue(mockCreatedPayment);

    render(
      <MemoryRouter>
        <AddPaymentModal isOpen={true} onClose={vi.fn()} onPaymentCreated={vi.fn()} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Bati Dodola (BTD)')).toBeInTheDocument();
    });

    // Select agency
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '10' } });

    // Fill amount and reference
    fireEvent.change(screen.getByPlaceholderText('e.g. 250000'), { target: { value: '150000' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. CBE-TX-998821'), {
      target: { value: 'BANK-TRF-55' },
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Record Payment/i }));

    await waitFor(() => {
      expect(paymentsApi.createPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          nonIataId: 10,
          amount: 150000,
          paymentReference: 'BANK-TRF-55',
        })
      );
      expect(screen.getByText('Payment Recorded Successfully')).toBeInTheDocument();
      expect(screen.getByText('150,000.00 ETB')).toBeInTheDocument();
    });
  });
});
