import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AgingOverview } from '../AgingOverview';
import { DashboardOverviewMetrics } from '@/types/dashboard.types';

describe('AgingOverview', () => {
  const mockMetrics: DashboardOverviewMetrics = {
    totalSales: 2000000,
    totalPayments: 1000000,
    totalOutstanding: 1000000,
    totalCurrent: 600000,
    totalDays31To60: 200000,
    totalDays61To90: 100000,
    totalDays91To120: 50000,
    totalDays120Plus: 50000,
    currency: 'ETB',
    asOfDate: '2026-10-02',
    activeAccountsCount: 15,
    totalAccountsCount: 20,
  };

  it('renders all 5 FIFO aging bucket cards and link to full aging report', () => {
    render(
      <MemoryRouter>
        <AgingOverview metrics={mockMetrics} isLoading={false} />
      </MemoryRouter>
    );

    expect(screen.getByText('Accounts Receivable Aging Distribution')).toBeInTheDocument();
    expect(screen.getByText(/FIFO aging classification of outstanding receivables/i)).toBeInTheDocument();

    // Verify 5 buckets
    expect(screen.getByText('Current (0–30d)')).toBeInTheDocument();
    expect(screen.getByText('600,000.00 ETB')).toBeInTheDocument();

    expect(screen.getByText('31–60d')).toBeInTheDocument();
    expect(screen.getByText('200,000.00 ETB')).toBeInTheDocument();

    expect(screen.getByText('61–90d')).toBeInTheDocument();
    expect(screen.getByText('100,000.00 ETB')).toBeInTheDocument();

    expect(screen.getByText('91–120d')).toBeInTheDocument();
    expect(screen.getAllByText('50,000.00 ETB').length).toBe(2); // 91-120d and 120+d

    expect(screen.getByText('120+d')).toBeInTheDocument();

    // Verify link to full report
    const link = screen.getByRole('link', { name: /View Full Aging Report/i });
    expect(link).toHaveAttribute('href', '/reports?tab=aging');
  });

  it('renders skeleton pulse while loading', () => {
    const { container } = render(
      <MemoryRouter>
        <AgingOverview metrics={null} isLoading={true} />
      </MemoryRouter>
    );

    const pulse = container.querySelector('.animate-pulse');
    expect(pulse).toBeInTheDocument();
  });
});
