import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { OutstandingBalancesTable } from '../OutstandingBalancesTable';
import * as dashboardApi from '@/api/dashboardApi';
import { NonIataFinancialSummary } from '@/types/dashboard.types';

vi.mock('@/api/dashboardApi');

describe('OutstandingBalancesTable', () => {
  const mockRows: NonIataFinancialSummary[] = [
    {
      nonIataId: 101,
      code: 'BTD',
      name: 'Bati Dodola Travel',
      status: 'ACTIVE',
      totalSales: 1420000,
      totalPayments: 1100000,
      outstandingBalance: 320000,
      currency: 'ETB',
    },
    {
      nonIataId: 102,
      code: 'EMH',
      name: 'Emran Hijra Tour',
      status: 'ACTIVE',
      totalSales: 920000,
      totalPayments: 920000,
      outstandingBalance: 0,
      currency: 'ETB',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(dashboardApi.getFinancialSummaries).mockResolvedValue({
      content: mockRows,
      totalElements: 2,
      totalPages: 1,
      pageSize: 8,
      pageNumber: 0,
      isFirst: true,
      isLast: true,
      hasNext: false,
      hasPrevious: false,
    });
  });

  it('renders table headers and agency financial rows with backend values', async () => {
    render(
      <MemoryRouter>
        <OutstandingBalancesTable />
      </MemoryRouter>
    );

    expect(screen.getByText('Non-IATA Balance Overview')).toBeInTheDocument();

    await waitFor(() => {
      expect(dashboardApi.getFinancialSummaries).toHaveBeenCalledWith({
        search: undefined,
        status: undefined,
        size: 8,
      });
    });

    // Row 1
    await waitFor(() => {
      expect(screen.getByText('Bati Dodola Travel')).toBeInTheDocument();
      expect(screen.getByText('BTD')).toBeInTheDocument();
      expect(screen.getByText('1,420,000.00 ETB')).toBeInTheDocument();
      expect(screen.getByText('1,100,000.00 ETB')).toBeInTheDocument();
      expect(screen.getByText('320,000.00 ETB')).toBeInTheDocument();
    });

    // Row 2 (0 balance)
    expect(screen.getByText('Emran Hijra Tour')).toBeInTheDocument();
    expect(screen.getByText('EMH')).toBeInTheDocument();
    expect(screen.getByText('0.00 ETB')).toBeInTheDocument();

    // Footer
    expect(screen.getByText(/Showing 2 of 2 accounts/i)).toBeInTheDocument();
  });

  it('filters by status when clicking status pill', async () => {
    render(
      <MemoryRouter>
        <OutstandingBalancesTable />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(dashboardApi.getFinancialSummaries).toHaveBeenCalledTimes(1);
    });

    const activeFilterBtn = screen.getByRole('button', { name: /^active$/i });
    fireEvent.click(activeFilterBtn);

    await waitFor(() => {
      expect(dashboardApi.getFinancialSummaries).toHaveBeenCalledWith({
        search: undefined,
        status: 'ACTIVE',
        size: 8,
      });
    });
  });

  it('triggers search with query term after typing in search box', async () => {
    render(
      <MemoryRouter>
        <OutstandingBalancesTable />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText('Search Non-IATA...');
    fireEvent.change(searchInput, { target: { value: 'Bati' } });

    await waitFor(() => {
      expect(dashboardApi.getFinancialSummaries).toHaveBeenCalledWith({
        search: 'Bati',
        status: undefined,
        size: 8,
      });
    });
  });
});
