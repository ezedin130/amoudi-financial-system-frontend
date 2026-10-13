import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from '../DashboardPage';
import * as dashboardApi from '@/api/dashboardApi';
import { DashboardOverviewMetrics } from '@/types/dashboard.types';

vi.mock('@/api/dashboardApi');

// Mock AuthContext so useAuth returns a Finance user
vi.mock('@/auth/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 1,
      username: 'finance_user',
      fullName: 'Finance Officer',
      role: 'FINANCE',
      status: 'ACTIVE',
    },
    logout: vi.fn(),
  }),
}));

describe('DashboardPage', () => {
  const mockMetrics: DashboardOverviewMetrics = {
    totalSales: 6356793,
    totalPayments: 1500000,
    totalOutstanding: 4856793,
    totalCurrent: 4356793,
    totalDays31To60: 400000,
    totalDays61To90: 0,
    totalDays91To120: 0,
    totalDays120Plus: 100000,
    currency: 'ETB',
    asOfDate: '2026-10-02',
    activeAccountsCount: 18,
    totalAccountsCount: 26,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(dashboardApi.getDashboardOverviewMetrics).mockResolvedValue(mockMetrics);
    vi.mocked(dashboardApi.getFinancialSummaries).mockResolvedValue({
      content: [
        {
          nonIataId: 1,
          code: 'BTD',
          name: 'Bati Dodola',
          status: 'ACTIVE',
          totalSales: 1420000,
          totalPayments: 1100000,
          outstandingBalance: 320000,
          currency: 'ETB',
        },
      ],
      totalElements: 1,
      totalPages: 1,
      pageNumber: 0,
      pageSize: 8,
      isFirst: true,
      isLast: true,
      hasNext: false,
      hasPrevious: false,
    });
    vi.mocked(dashboardApi.getRecentSales).mockResolvedValue([]);
    vi.mocked(dashboardApi.getRecentPayments).mockResolvedValue([]);
    vi.mocked(dashboardApi.getRecentImports).mockResolvedValue([]);
  });

  it('renders all dashboard sections and coordinates global refresh', async () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Finance Team')).toBeInTheDocument();

    await waitFor(() => {
      expect(dashboardApi.getDashboardOverviewMetrics).toHaveBeenCalledTimes(1);
    });

    // Check financial overview cards
    await waitFor(() => {
      expect(screen.getByText('Total Outstanding')).toBeInTheDocument();
      expect(screen.getByText('4,856,793.00 ETB')).toBeInTheDocument();
      expect(screen.getAllByText('Current (0–30d)').length).toBeGreaterThan(0);
      expect(screen.getByText('Active Non-IATAs')).toBeInTheDocument();
    });

    // Check aging distribution
    expect(screen.getByText('Accounts Receivable Aging Distribution')).toBeInTheDocument();

    // Check non-iata table
    expect(screen.getByText('Non-IATA Balance Overview')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Bati Dodola')).toBeInTheDocument();
      expect(screen.getByText('320,000.00 ETB')).toBeInTheDocument();
    });

    // Check recent activity cards
    expect(screen.getByText('Recent Sales Activity')).toBeInTheDocument();
    expect(screen.getByText('Recent Payments Activity')).toBeInTheDocument();
    expect(screen.getByText('Recent Sales Report Ingestions')).toBeInTheDocument();

    // Test refresh button
    const refreshBtn = screen.getByRole('button', { name: /Refresh/i });
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(dashboardApi.getDashboardOverviewMetrics).toHaveBeenCalledTimes(2);
    });
  });
});
