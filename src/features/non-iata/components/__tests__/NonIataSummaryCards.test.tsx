import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NonIataSummaryCards } from '../NonIataSummaryCards';
import { NonIataFinancialSummary } from '@/types/nonIata.types';

describe('NonIataSummaryCards', () => {
  it('renders positive outstanding balance in red style', () => {
    const summary: NonIataFinancialSummary = {
      nonIataId: 11,
      code: 'BAT01',
      name: 'Bati Travel',
      totalSales: 143673,
      totalPayments: 43673,
      outstandingBalance: 100000,
      currency: 'ETB',
    };

    render(
      <NonIataSummaryCards
        summary={summary}
        transactionCount={5}
        isLoading={false}
      />
    );

    expect(screen.getByText('Current Outstanding Balance')).toBeInTheDocument();
    expect(screen.getByText('100,000.00 ETB')).toHaveClass('text-red-600');
    expect(screen.getByText('143,673.00 ETB')).toBeInTheDocument();
    expect(screen.getByText('43,673.00 ETB')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders zero outstanding balance in emerald style', () => {
    const summary: NonIataFinancialSummary = {
      nonIataId: 11,
      totalSales: 50000,
      totalPayments: 50000,
      outstandingBalance: 0,
      currency: 'ETB',
    };

    render(
      <NonIataSummaryCards
        summary={summary}
        transactionCount={2}
        isLoading={false}
      />
    );

    expect(screen.getByText('0.00 ETB')).toHaveClass('text-emerald-600');
    expect(screen.getByText(/All imported sales are fully settled/i)).toBeInTheDocument();
  });
});
