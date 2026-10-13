import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { NonIataDetailPage } from '../NonIataDetailPage';
import * as nonIataApi from '@/api/nonIataApi';
import { AuthContext } from '@/auth/AuthContext';
import { AuthContextType } from '@/auth/auth.types';

vi.mock('@/api/nonIataApi', () => ({
  getNonIataById: vi.fn(),
  getNonIataFinancialSummary: vi.fn(),
  getNonIataStatement: vi.fn(),
  updateNonIata: vi.fn(),
  updateNonIataStatus: vi.fn(),
}));

const mockFinanceContext: AuthContextType = {
  user: {
    id: 1,
    username: 'finance_user',
    fullName: 'Finance Officer',
    role: 'FINANCE',
    status: 'ACTIVE',
  },
  token: 'mock-token',
  isAuthenticated: true,
  isLoading: false,
  error: null,
  login: vi.fn(),
  logout: vi.fn(),
  clearError: vi.fn(),
};

const mockGmContext: AuthContextType = {
  user: {
    id: 2,
    username: 'admin',
    fullName: 'System Administrator',
    role: 'GENERAL_MANAGER',
    status: 'ACTIVE',
  },
  token: 'mock-token',
  isAuthenticated: true,
  isLoading: false,
  error: null,
  login: vi.fn(),
  logout: vi.fn(),
  clearError: vi.fn(),
};

const mockAccount = {
  id: 11,
  code: 'BAT01',
  name: 'Bati Travel',
  status: 'ACTIVE' as const,
  contactName: 'Abebe Bikila',
  phone: '+251911223344',
  email: 'bati@test.com',
  notes: 'Main headquarters in Addis Ababa',
  createdAt: '2026-09-01T10:00:00',
  updatedAt: '2026-09-10T12:00:00',
};

const mockSummary = {
  nonIataId: 11,
  code: 'BAT01',
  name: 'Bati Travel',
  totalSales: 143673,
  totalPayments: 0,
  outstandingBalance: 143673,
  currency: 'ETB',
};

const mockStatement = {
  nonIataId: 11,
  nonIataCode: 'BAT01',
  nonIataName: 'Bati Travel',
  currency: 'ETB',
  openingBalance: 0,
  totalSales: 143673,
  totalPayments: 0,
  closingBalance: 143673,
  transactionCount: 1,
  transactions: [
    {
      transactionDate: '2026-09-17',
      type: 'SALE' as const,
      reference: '071-1234567890',
      description: 'Ticket Issue ET/ADD',
      debit: 143673,
      credit: 0,
      runningBalance: 143673,
      currency: 'ETB',
    },
  ],
};

describe('NonIataDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders account details, live summary card, and transaction ledger', async () => {
    vi.mocked(nonIataApi.getNonIataById).mockResolvedValueOnce(mockAccount);
    vi.mocked(nonIataApi.getNonIataFinancialSummary).mockResolvedValueOnce(mockSummary);
    vi.mocked(nonIataApi.getNonIataStatement).mockResolvedValueOnce(mockStatement);

    render(
      <MemoryRouter initialEntries={['/non-iatas/11']}>
        <AuthContext.Provider value={mockFinanceContext}>
          <Routes>
            <Route path="/non-iatas/:id" element={<NonIataDetailPage />} />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Bati Travel' })).toBeInTheDocument();
      expect(screen.getAllByText('BAT01').length).toBeGreaterThan(0);
      expect(screen.getByText('Current Outstanding Balance')).toBeInTheDocument();
      expect(screen.getAllByText('143,673.00 ETB').length).toBeGreaterThan(0);
      expect(screen.getByText('Abebe Bikila')).toBeInTheDocument();
      expect(screen.getByText('071-1234567890')).toBeInTheDocument();
      expect(screen.getByText('Ticket Issue ET/ADD')).toBeInTheDocument();
    });

  });

  it('shows Edit Details and Deactivate buttons for FINANCE role', async () => {
    vi.mocked(nonIataApi.getNonIataById).mockResolvedValueOnce(mockAccount);
    vi.mocked(nonIataApi.getNonIataFinancialSummary).mockResolvedValueOnce(mockSummary);
    vi.mocked(nonIataApi.getNonIataStatement).mockResolvedValueOnce(mockStatement);

    render(
      <MemoryRouter initialEntries={['/non-iatas/11']}>
        <AuthContext.Provider value={mockFinanceContext}>
          <Routes>
            <Route path="/non-iatas/:id" element={<NonIataDetailPage />} />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Edit Details/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Deactivate Agency/i })).toBeInTheDocument();
    });
  });

  it('hides Edit and Deactivate buttons for GENERAL_MANAGER role', async () => {
    vi.mocked(nonIataApi.getNonIataById).mockResolvedValueOnce(mockAccount);
    vi.mocked(nonIataApi.getNonIataFinancialSummary).mockResolvedValueOnce(mockSummary);
    vi.mocked(nonIataApi.getNonIataStatement).mockResolvedValueOnce(mockStatement);

    render(
      <MemoryRouter initialEntries={['/non-iatas/11']}>
        <AuthContext.Provider value={mockGmContext}>
          <Routes>
            <Route path="/non-iatas/:id" element={<NonIataDetailPage />} />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Edit Details/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Deactivate Agency/i })).not.toBeInTheDocument();
    });
  });
});
