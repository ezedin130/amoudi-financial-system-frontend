import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ReportsPage } from '../ReportsPage';
import * as statementsApi from '@/api/statementsApi';
import * as agingApi from '@/api/agingApi';
import * as nonIataApi from '@/api/nonIataApi';
import type { AccountStatement } from '@/types/statements.types';
import type { AgingReport } from '@/types/aging.types';

vi.mock('@/api/statementsApi');
vi.mock('@/api/agingApi');
vi.mock('@/api/nonIataApi');

describe('ReportsPage', () => {
  const mockAgencies = [
    {
      id: 1,
      name: 'Al-Madina Travel',
      code: 'AG-001',
      contactPerson: 'Ali Saleh',
      phone: '+967-771122334',
      status: 'ACTIVE' as const,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    {
      id: 2,
      name: 'Sana\'a Wings',
      code: 'AG-002',
      contactPerson: 'Khaled Omar',
      phone: '+967-772233445',
      status: 'ACTIVE' as const,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
  ];

  const mockStatement: AccountStatement = {
    nonIataId: 1,
    nonIataCode: 'AG-001',
    nonIataName: 'Al-Madina Travel',
    dateFrom: '2026-03-01',
    dateTo: '2026-03-31',
    currency: 'USD',
    openingBalance: 1000.00,
    totalSales: 2500.00,
    totalPayments: 1500.00,
    closingBalance: 2000.00,
    transactionCount: 2,
    transactions: [
      {
        transactionDate: '2026-03-10',
        reference: 'TX-100',
        type: 'SALE',
        description: 'Flight ticket purchase',
        debit: 2500.00,
        credit: 0.00,
        runningBalance: 3500.00,
        currency: 'USD',
      },
      {
        transactionDate: '2026-03-15',
        reference: 'PAY-200',
        type: 'PAYMENT',
        description: 'Bank transfer',
        debit: 0.00,
        credit: 1500.00,
        runningBalance: 2000.00,
        currency: 'USD',
      },
    ],
  };

  const mockAgingReport: AgingReport = {
    asOfDate: '2026-03-31',
    rows: [
      {
        nonIataId: 1,
        name: 'Al-Madina Travel',
        code: 'AG-001',
        status: 'ACTIVE',
        current: 1000.00,
        days31To60: 500.00,
        days61To90: 500.00,
        days91To120: 0.00,
        days120Plus: 0.00,
        totalOutstanding: 2000.00,
      },
    ],
    totalCurrent: 1000.00,
    totalDays31To60: 500.00,
    totalDays61To90: 500.00,
    totalDays91To120: 0.00,
    totalDays120Plus: 0.00,
    totalOutstanding: 2000.00,
    totalAccounts: 1,
    currency: 'USD',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(nonIataApi.getNonIatas).mockResolvedValue({
      content: mockAgencies,
      totalElements: 2,
      totalPages: 1,
      pageSize: 100,
      pageNumber: 0,
      isFirst: true,
      isLast: true,
      hasNext: false,
      hasPrevious: false,
    });
    vi.mocked(statementsApi.getStatement).mockResolvedValue(mockStatement);
    vi.mocked(agingApi.getAgingReport).mockResolvedValue(mockAgingReport);
  });

  it('renders default tab "Account Statements" and auto-selects first agency', async () => {
    render(
      <MemoryRouter initialEntries={['/reports']}>
        <ReportsPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Financial Reports')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Account Statements/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Accounts Receivable Aging/i })).toBeInTheDocument();

    // Verify agency dropdown loads and auto-selects agency 1
    await waitFor(() => {
      expect(statementsApi.getStatement).toHaveBeenCalledWith(1, {
        dateFrom: undefined,
        dateTo: undefined,
      });
    });

    // Verify summary cards and table are displayed with currency formatted values
    await waitFor(() => {
      expect(screen.getByText(/1,000\.00 USD/)).toBeInTheDocument(); // Opening Balance
      expect(screen.getAllByText(/2,500\.00 USD/).length).toBeGreaterThan(0); // Total Sales / Debit
      expect(screen.getAllByText(/1,500\.00 USD/).length).toBeGreaterThan(0); // Total Payments / Credit
      expect(screen.getAllByText(/2,000\.00 USD/).length).toBeGreaterThan(0); // Closing Balance
      expect(screen.getByText('TX-100')).toBeInTheDocument();
      expect(screen.getByText('PAY-200')).toBeInTheDocument();
    });
  });

  it('switches to Accounts Receivable Aging tab and fetches aging report', async () => {
    render(
      <MemoryRouter initialEntries={['/reports']}>
        <ReportsPage />
      </MemoryRouter>
    );

    const agingTabBtn = screen.getByRole('button', { name: /Accounts Receivable Aging/i });
    fireEvent.click(agingTabBtn);

    await waitFor(() => {
      expect(agingApi.getAgingReport).toHaveBeenCalled();
    });

    // Check aging headers and row
    await waitFor(() => {
      const currentBuckets = screen.getAllByText('Current (0–30d)');
      expect(currentBuckets.length).toBeGreaterThan(0);
      expect(screen.getByText(/Total Receivables \(1 accounts\)/i)).toBeInTheDocument();
    });
  });

  it('allows jumping to Statement tab from Aging table action', async () => {
    render(
      <MemoryRouter initialEntries={['/reports?tab=aging']}>
        <ReportsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(agingApi.getAgingReport).toHaveBeenCalled();
    });

    // Click "Statement" row button for agency
    const statementBtn = await screen.findByRole('button', { name: /^Statement$/i });
    fireEvent.click(statementBtn);

    // Verify tab switched back and statement requested
    await waitFor(() => {
      expect(statementsApi.getStatement).toHaveBeenCalledWith(1, {
        dateFrom: undefined,
        dateTo: undefined,
      });
    });
  });
});
