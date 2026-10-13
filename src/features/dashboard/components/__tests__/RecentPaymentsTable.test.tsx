import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RecentPaymentsTable } from '../RecentPaymentsTable';
import * as dashboardApi from '@/api/dashboardApi';
import { Payment } from '@/types/payments.types';

vi.mock('@/api/dashboardApi');

describe('RecentPaymentsTable', () => {
  const mockPayments: Payment[] = [
    {
      id: 201,
      nonIataId: 10,
      nonIataCode: 'BTD',
      nonIataName: 'Bati Dodola',
      paymentDate: '2026-10-01',
      amount: 220000,
      currency: 'ETB',
      receiptNumber: 'RCPT-001',
      paymentReference: 'BANK-12345',
      notes: null,
      receiptObjectKey: null,
      hasReceipt: false,
      status: 'POSTED',
      createdBy: 'admin',
      createdAt: '2026-10-01T12:00:00Z',
      updatedAt: '2026-10-01T12:00:00Z',
    },
    {
      id: 202,
      nonIataId: 11,
      nonIataCode: 'EMH',
      nonIataName: 'Emran Hijra',
      paymentDate: '2026-10-01',
      amount: 100000,
      currency: 'ETB',
      receiptNumber: 'RCPT-002',
      paymentReference: 'BANK-12346',
      notes: 'Duplicate payment mistake',
      receiptObjectKey: null,
      hasReceipt: false,
      status: 'CANCELLED',
      createdBy: 'admin',
      createdAt: '2026-10-01T13:00:00Z',
      updatedAt: '2026-10-01T13:30:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders posted payments as active and cancelled payments with line-through style', async () => {
    vi.mocked(dashboardApi.getRecentPayments).mockResolvedValue(mockPayments);

    render(
      <MemoryRouter>
        <RecentPaymentsTable />
      </MemoryRouter>
    );

    expect(screen.getByText('Recent Payments Activity')).toBeInTheDocument();

    await waitFor(() => {
      expect(dashboardApi.getRecentPayments).toHaveBeenCalledWith(5);
    });

    // Row 1 (POSTED)
    await waitFor(() => {
      expect(screen.getByText('Bati Dodola')).toBeInTheDocument();
      expect(screen.getByText('BANK-12345')).toBeInTheDocument();
      expect(screen.getByText('220,000.00 ETB')).toBeInTheDocument();
      expect(screen.getByText('Posted')).toBeInTheDocument();
    });

    // Row 2 (CANCELLED)
    expect(screen.getByText('Emran Hijra')).toBeInTheDocument();
    expect(screen.getByText('BANK-12346')).toBeInTheDocument();
    const cancelledAmount = screen.getByText('100,000.00 ETB');
    expect(cancelledAmount).toHaveClass('line-through');
    expect(screen.getByText('Cancelled')).toBeInTheDocument();

    const link = screen.getByRole('link', { name: /View all payments/i });
    expect(link).toHaveAttribute('href', '/payments');
  });
});
