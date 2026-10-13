import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PaymentTable } from '../PaymentTable';
import { Payment } from '@/types/payments.types';

const mockPayments: Payment[] = [
  {
    id: 1,
    nonIataId: 10,
    nonIataCode: 'BTD',
    nonIataName: 'Bati Dodola Agency',
    paymentDate: '2026-09-18',
    amount: 250000,
    currency: 'ETB',
    receiptNumber: 'RCPT-001',
    paymentReference: 'BANK-REF-1',
    notes: 'Advance deposit',
    receiptObjectKey: 'receipts/rcpt-1.pdf',
    hasReceipt: true,
    status: 'POSTED',
    createdBy: 'admin',
    createdAt: '2026-09-18T10:00:00',
    updatedAt: '2026-09-18T10:00:00',
  },
  {
    id: 2,
    nonIataId: 11,
    nonIataCode: 'EMH',
    nonIataName: 'Emran Hijra',
    paymentDate: '2026-09-17',
    amount: 100000,
    currency: 'ETB',
    receiptNumber: null,
    paymentReference: 'BANK-REF-2',
    notes: null,
    receiptObjectKey: null,
    hasReceipt: false,
    status: 'POSTED',
    createdBy: 'admin',
    createdAt: '2026-09-17T11:00:00',
    updatedAt: '2026-09-17T11:00:00',
  },
];

describe('PaymentTable', () => {
  it('renders payment rows with agency, amount, references and status', () => {
    render(
      <PaymentTable
        payments={mockPayments}
        isLoading={false}
        page={0}
        totalPages={1}
        totalElements={2}
        pageSize={20}
        userRole="FINANCE"
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
        onViewPayment={vi.fn()}
        onViewReceipt={vi.fn()}
      />
    );

    expect(screen.getByText('Bati Dodola Agency')).toBeInTheDocument();
    expect(screen.getByText('250,000.00 ETB')).toBeInTheDocument();
    expect(screen.getByText('RCPT-001')).toBeInTheDocument();
    expect(screen.getByText('BANK-REF-1')).toBeInTheDocument();
    expect(screen.getAllByText('Posted').length).toBe(2);
  });

  it('renders Cancel button for FINANCE role when payment is POSTED', () => {
    const onCancelPayment = vi.fn();
    render(
      <PaymentTable
        payments={mockPayments}
        isLoading={false}
        page={0}
        totalPages={1}
        totalElements={2}
        pageSize={20}
        userRole="FINANCE"
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
        onViewPayment={vi.fn()}
        onViewReceipt={vi.fn()}
        onCancelPayment={onCancelPayment}
      />
    );

    const cancelButtons = screen.getAllByTitle('Cancel Payment');
    expect(cancelButtons.length).toBe(2);

    fireEvent.click(cancelButtons[0]);
    expect(onCancelPayment).toHaveBeenCalledWith(mockPayments[0]);
  });

  it('does NOT render Cancel button for GENERAL_MANAGER role', () => {
    render(
      <PaymentTable
        payments={mockPayments}
        isLoading={false}
        page={0}
        totalPages={1}
        totalElements={2}
        pageSize={20}
        userRole="GENERAL_MANAGER"
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
        onViewPayment={vi.fn()}
        onViewReceipt={vi.fn()}
      />
    );

    expect(screen.queryByTitle('Cancel Payment')).not.toBeInTheDocument();
  });

  it('renders Attach receipt button for GENERAL_MANAGER when payment has no receipt', () => {
    const onUploadReceipt = vi.fn();
    render(
      <PaymentTable
        payments={mockPayments}
        isLoading={false}
        page={0}
        totalPages={1}
        totalElements={2}
        pageSize={20}
        userRole="GENERAL_MANAGER"
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
        onViewPayment={vi.fn()}
        onViewReceipt={vi.fn()}
        onUploadReceipt={onUploadReceipt}
      />
    );

    const attachButton = screen.getByRole('button', { name: /Attach/i });
    expect(attachButton).toBeInTheDocument();

    fireEvent.click(attachButton);
    expect(onUploadReceipt).toHaveBeenCalledWith(mockPayments[1]);
  });
});
