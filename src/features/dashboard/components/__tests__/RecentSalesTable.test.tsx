import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RecentSalesTable } from '../RecentSalesTable';
import * as dashboardApi from '@/api/dashboardApi';
import { SalesTransaction } from '@/types/sales.types';

vi.mock('@/api/dashboardApi');

describe('RecentSalesTable', () => {
  const mockSales: SalesTransaction[] = [
    {
      id: 1,
      nonIataId: 10,
      nonIataCode: 'BTD',
      nonIataName: 'Bati Dodola',
      ticketNumber: '0715282700001',
      transactionReference: 'REF-1',
      saleDate: '2026-10-01',
      passengerName: 'Abebe Bikila',
      origin: 'ADD',
      destination: 'DXB',
      route: 'ADD-DXB',
      amount: 45000,
      currency: 'ETB',
      sourceAgencyName: 'Bati Dodola',
      sourceRowNumber: 1,
      sourceTransactionKey: 'KEY-1',
      importBatchId: 1,
      createdAt: '2026-10-01T10:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders top 5 sales with ticket number, passenger, and formatted amount', async () => {
    vi.mocked(dashboardApi.getRecentSales).mockResolvedValue(mockSales);

    render(
      <MemoryRouter>
        <RecentSalesTable />
      </MemoryRouter>
    );

    expect(screen.getByText('Recent Sales Activity')).toBeInTheDocument();

    await waitFor(() => {
      expect(dashboardApi.getRecentSales).toHaveBeenCalledWith(5);
    });

    await waitFor(() => {
      expect(screen.getByText('0715282700001')).toBeInTheDocument();
      expect(screen.getByText('Bati Dodola')).toBeInTheDocument();
      expect(screen.getByText('Abebe Bikila')).toBeInTheDocument();
      expect(screen.getByText('45,000.00 ETB')).toBeInTheDocument();
    });

    const link = screen.getByRole('link', { name: /View all sales/i });
    expect(link).toHaveAttribute('href', '/sales-reports');
  });

  it('renders empty message when no sales exist', async () => {
    vi.mocked(dashboardApi.getRecentSales).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <RecentSalesTable />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No sales recorded yet.')).toBeInTheDocument();
    });
  });
});
