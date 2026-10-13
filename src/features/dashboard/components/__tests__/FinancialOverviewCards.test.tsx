import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FinancialOverviewCards } from '../FinancialOverviewCards';
import { DashboardOverviewMetrics } from '@/types/dashboard.types';

describe('FinancialOverviewCards', () => {
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

  it('renders all 5 financial overview cards with authoritative backend figures', () => {
    render(
      <FinancialOverviewCards
        metrics={mockMetrics}
        isLoading={false}
        error={null}
      />
    );

    // Total Sales card
    expect(screen.getByText('Total Sales')).toBeInTheDocument();
    expect(screen.getByText('6,356,793.00 ETB')).toBeInTheDocument();

    // Total Payments card
    expect(screen.getByText('Total Payments')).toBeInTheDocument();
    expect(screen.getByText('1,500,000.00 ETB')).toBeInTheDocument();

    // Outstanding Balance card (highlighted)
    expect(screen.getByText('Outstanding Balance')).toBeInTheDocument();
    expect(screen.getByText('4,856,793.00 ETB')).toBeInTheDocument();
    expect(screen.getByText('Total Outstanding')).toBeInTheDocument();

    // Active Non-IATAs count
    expect(screen.getByText('Active Non-IATAs')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();

    // Total Accounts count
    expect(screen.getByText('Total Accounts')).toBeInTheDocument();
    expect(screen.getByText('26')).toBeInTheDocument();
  });

  it('renders skeleton cards while loading', () => {
    const { container } = render(
      <FinancialOverviewCards metrics={null} isLoading={true} />
    );
    const pulses = container.querySelectorAll('.animate-pulse');
    expect(pulses.length).toBe(5);
  });

  it('renders error notice and calls onRetry when retry button is clicked', () => {
    const handleRetry = vi.fn();
    render(
      <FinancialOverviewCards
        metrics={null}
        isLoading={false}
        error="Network connection failure"
        onRetry={handleRetry}
      />
    );

    expect(screen.getByText('Unable to load financial overview')).toBeInTheDocument();
    expect(screen.getByText('Network connection failure')).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /Retry/i });
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});
