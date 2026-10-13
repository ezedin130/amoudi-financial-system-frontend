import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PaymentsPage } from '../PaymentsPage';
import * as paymentsApi from '@/api/paymentsApi';
import * as authContextModule from '@/auth/AuthContext';
import { User } from '@/types/api.types';
import { Payment } from '@/types/payments.types';

vi.mock('@/api/paymentsApi', () => ({
  getPayments: vi.fn(),
  getPaymentById: vi.fn(),
  createPayment: vi.fn(),
  uploadReceipt: vi.fn(),
  getReceiptBlob: vi.fn(),
  cancelPayment: vi.fn(),
}));

const mockPaymentList: Payment[] = [
  {
    id: 1,
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
  },
];

describe('PaymentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(paymentsApi.getPayments).mockResolvedValue({
      content: mockPaymentList,
      pageNumber: 0,
      pageSize: 20,
      totalElements: 1,
      totalPages: 1,
      isFirst: true,
      isLast: true,
      hasNext: false,
      hasPrevious: false,
    });
  });

  it('renders Add Payment button for GENERAL_MANAGER role and loads payments', async () => {
    const gmUser: User = {
      id: 1,
      username: 'admin',
      fullName: 'General Manager',
      role: 'GENERAL_MANAGER',
      status: 'ACTIVE',
    };

    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: gmUser,
      token: 'mock-token',
      error: null,
      clearError: vi.fn(),
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <PaymentsPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: /Add Payment/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Bati Dodola')).toBeInTheDocument();
      expect(screen.getByText('250,000.00 ETB')).toBeInTheDocument();
      expect(screen.getByText('BANK-REF-1')).toBeInTheDocument();
    });
  });

  it('hides Add Payment button for FINANCE role and shows Finance role badge', async () => {
    const finUser: User = {
      id: 2,
      username: 'finance_user',
      fullName: 'Finance Officer',
      role: 'FINANCE',
      status: 'ACTIVE',
    };

    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: finUser,
      token: 'mock-token',
      error: null,
      clearError: vi.fn(),
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <PaymentsPage />
      </MemoryRouter>
    );

    expect(screen.queryByRole('button', { name: /Add Payment/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Finance/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Bati Dodola')).toBeInTheDocument();
    });
  });
});
