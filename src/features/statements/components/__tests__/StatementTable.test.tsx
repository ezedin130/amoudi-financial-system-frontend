import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatementTable } from '../StatementTable';
import { AccountStatement } from '@/types/statements.types';

const mockStatement: AccountStatement = {
  nonIataId: 10,
  nonIataCode: 'BTD',
  nonIataName: 'Bati Dodola',
  currency: 'ETB',
  dateFrom: '2026-09-01',
  dateTo: '2026-09-30',
  openingBalance: 100000,
  totalSales: 200000,
  totalPayments: 150000,
  closingBalance: 150000,
  transactionCount: 2,
  transactions: [
    {
      transactionDate: '2026-09-10',
      type: 'SALE',
      reference: 'TK-1001',
      description: 'ADD-DXB Ticket',
      baseFare: 150000,
      tax: 30000,
      totalSale: 180000,
      serviceCharge: 20000,
      debit: 200000,
      credit: 0,
      runningBalance: 300000,
      currency: 'ETB',
    },
    {
      transactionDate: '2026-09-18',
      type: 'PAYMENT',
      reference: 'CBE-TRF-501',
      description: 'Cash deposit confirmed',
      debit: 0,
      credit: 150000,
      runningBalance: 150000,
      currency: 'ETB',
    },
  ],
};

describe('StatementTable', () => {
  it('renders transactions with breakdown columns, debit, credit, and authoritative running balance', () => {
    render(<StatementTable statement={mockStatement} isLoading={false} />);

    // Table headers
    expect(screen.getByText('Base Fare')).toBeInTheDocument();
    expect(screen.getByText('Tax')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('S.CHR')).toBeInTheDocument();
    expect(screen.getByText('Debit (+ G.TOT)')).toBeInTheDocument();

    // Row values
    expect(screen.getByText('Sale')).toBeInTheDocument();
    expect(screen.getByText('Payment')).toBeInTheDocument();
    expect(screen.getByText('TK-1001')).toBeInTheDocument();
    expect(screen.getByText('CBE-TRF-501')).toBeInTheDocument();
    expect(screen.getByText('150,000.00')).toBeInTheDocument();
    expect(screen.getByText('30,000.00')).toBeInTheDocument();
    expect(screen.getByText('180,000.00')).toBeInTheDocument();
    expect(screen.getByText('20,000.00')).toBeInTheDocument();
    expect(screen.getByText('+200,000.00 ETB')).toBeInTheDocument();
    expect(screen.getByText('−150,000.00 ETB')).toBeInTheDocument();
    expect(screen.getByText('300,000.00 ETB')).toBeInTheDocument();
  });

  it('renders empty state when statement has no transactions', () => {
    const emptyStatement: AccountStatement = {
      ...mockStatement,
      transactions: [],
      transactionCount: 0,
    };
    render(<StatementTable statement={emptyStatement} isLoading={false} />);

    expect(
      screen.getByText(/No transactions found for the selected period/i)
    ).toBeInTheDocument();
  });
});
