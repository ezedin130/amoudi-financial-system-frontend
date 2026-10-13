import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatementSummaryCards } from '../StatementSummaryCards';
import { AccountStatement } from '@/types/statements.types';

describe('StatementSummaryCards', () => {
  it('displays authoritative values directly from backend without client-side calculation', () => {
    const mockStatement: AccountStatement = {
      nonIataId: 10,
      nonIataCode: 'BTD',
      nonIataName: 'Bati Dodola',
      currency: 'ETB',
      dateFrom: '2026-09-01',
      dateTo: '2026-09-30',
      openingBalance: 500000,
      totalSales: 200000,
      totalPayments: 150000,
      closingBalance: 550000,
      transactionCount: 8,
      transactions: [],
    };

    render(<StatementSummaryCards statement={mockStatement} />);

    // Assert that backend-provided values are directly formatted and rendered
    expect(screen.getByText('500,000.00 ETB')).toBeInTheDocument();
    expect(screen.getByText('+200,000.00 ETB')).toBeInTheDocument();
    expect(screen.getByText('−150,000.00 ETB')).toBeInTheDocument();
    expect(screen.getByText('550,000.00 ETB')).toBeInTheDocument();
  });
});
