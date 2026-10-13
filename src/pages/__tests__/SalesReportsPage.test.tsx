import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SalesReportsPage } from '../SalesReportsPage';
import * as salesApi from '@/api/salesApi';
import * as importsApi from '@/api/importsApi';
import * as nonIataApi from '@/api/nonIataApi';
import * as authContextModule from '@/auth/AuthContext';
import { User } from '@/types/api.types';

vi.mock('@/api/salesApi', () => ({
  getSales: vi.fn(),
  getSaleById: vi.fn(),
}));

vi.mock('@/api/importsApi', () => ({
  getImportBatches: vi.fn(),
  getImportBatchById: vi.fn(),
  getBatchErrors: vi.fn(),
  uploadReport: vi.fn(),
}));

vi.mock('@/api/nonIataApi', () => ({
  getNonIatas: vi.fn(),
}));

const mockFinanceUser: User = {
  id: 1,
  username: 'finance_user',
  fullName: 'Finance Officer',
  role: 'FINANCE',
  status: 'ACTIVE',
};

const mockGmUser: User = {
  id: 2,
  username: 'admin',
  fullName: 'General Manager',
  role: 'GENERAL_MANAGER',
  status: 'ACTIVE',
};

const mockSalesPage = {
  content: [
    {
      id: 37,
      ticketNumber: '065-5282705400',
      transactionReference: 'REF-001',
      saleDate: '2026-09-17',
      nonIataId: 11,
      nonIataCode: 'BAT01',
      nonIataName: 'Bati Travel',
      passengerName: 'Ahmed Mohammed',
      origin: 'ADD',
      destination: 'DXB',
      route: 'ADD-DXB',
      amount: 143673,
      currency: 'ETB',
      sourceAgencyName: 'INV*BATI TRAVEL',
      sourceRowNumber: 3,
      sourceTransactionKey: 'KEY-001',
      importBatchId: 18,
      createdAt: '2026-09-18T10:00:00',
    },
  ],
  pageNumber: 0,
  pageSize: 20,
  totalElements: 1,
  totalPages: 1,
  isFirst: true,
  isLast: true,
  hasNext: false,
  hasPrevious: false,
};

const mockBatchesPage = {
  content: [
    {
      id: 18,
      fileName: 'SEP- 18.xlsx',
      reportDate: '2026-09-18',
      status: 'IMPORTED' as const,
      totalRows: 18,
      successfulRows: 18,
      duplicateRows: 0,
      unmatchedRows: 0,
      failedRows: 0,
      uploadedById: 1,
      uploadedByUsername: 'finance_user',
      uploadedAt: '2026-10-02T10:00:00',
      createdAt: '2026-10-02T10:00:00',
    },
  ],
  pageNumber: 0,
  pageSize: 20,
  totalElements: 1,
  totalPages: 1,
  isFirst: true,
  isLast: true,
  hasNext: false,
  hasPrevious: false,
};

describe('SalesReportsPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(nonIataApi.getNonIatas).mockResolvedValue({ content: [], totalElements: 0 } as any);
    vi.mocked(salesApi.getSales).mockResolvedValue(mockSalesPage);
    vi.mocked(importsApi.getImportBatches).mockResolvedValue(mockBatchesPage);
  });

  const renderPage = (user: User, initialEntries = ['/sales-reports']) => {
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user,
      token: 'valid-token',
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
    });

    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <SalesReportsPage />
      </MemoryRouter>
    );
  };

  it('renders sales transactions tab and shows Upload Daily Report button for Finance', async () => {
    renderPage(mockFinanceUser);

    expect(screen.getByText('Sales Reports')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Upload Daily Report/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('065-5282705400')).toBeInTheDocument();
      expect(screen.getByText('Bati Travel')).toBeInTheDocument();
    });
  });

  it('hides Upload Daily Report button for General Manager in Sales tab', async () => {
    renderPage(mockGmUser);

    expect(screen.getByText('Sales Reports')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Upload Daily Report/i })).not.toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('065-5282705400')).toBeInTheDocument();
    });
  });

  it('switches to Daily Report Import tab and renders import history', async () => {
    renderPage(mockFinanceUser, ['/sales-reports?tab=import']);

    await waitFor(() => {
      expect(screen.getByText('Upload & Ingestion History')).toBeInTheDocument();
      expect(screen.getByText('SEP- 18.xlsx')).toBeInTheDocument();
    });
  });
});
