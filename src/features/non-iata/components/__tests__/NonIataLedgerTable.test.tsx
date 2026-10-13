import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NonIataLedgerTable } from '../NonIataLedgerTable';
import { StatementTransaction } from '@/types/nonIata.types';

const mockTransactions: StatementTransaction[] = [
  {
    transactionDate: '2026-09-17',
    type: 'SALE',
    reference: '071-1234567890',
    description: 'Ticket Issue ET/ADD',
    baseFare: 100000,
    tax: 25000,
    totalSale: 125000,
    serviceCharge: 18673,
    debit: 143673,
    credit: 0,
    runningBalance: 143673,
    currency: 'ETB',
  },
  {
    transactionDate: '2026-09-20',
    type: 'PAYMENT',
    reference: 'PAY-001',
    description: 'Bank Transfer CBO',
    debit: 0,
    credit: 50000,
    runningBalance: 93673,
    currency: 'ETB',
  },
];

describe('NonIataLedgerTable', () => {
  it('renders breakdown columns: Base Fare, Tax, Total, S.CHR, and Debit (+ G.TOT)', () => {
    render(
      <NonIataLedgerTable
        transactions={mockTransactions}
        isLoading={false}
        closingBalance={93673}
        currency="ETB"
        dateFrom=""
        dateTo=""
        onDateFromChange={vi.fn()}
        onDateToChange={vi.fn()}
        onFilterSubmit={vi.fn()}
        onFilterReset={vi.fn()}
      />
    );

    // Headers
    expect(screen.getByText('Base Fare')).toBeInTheDocument();
    expect(screen.getByText('Tax')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('S.CHR')).toBeInTheDocument();
    expect(screen.getByText('Debit (+ G.TOT)')).toBeInTheDocument();

    // Row values
    expect(screen.getByText('100,000.00')).toBeInTheDocument();
    expect(screen.getByText('25,000.00')).toBeInTheDocument();
    expect(screen.getByText('125,000.00')).toBeInTheDocument();
    expect(screen.getByText('18,673.00')).toBeInTheDocument();
    expect(screen.getByText('+143,673.00')).toBeInTheDocument();
    expect(screen.getByText('-50,000.00')).toBeInTheDocument();
    expect(screen.getAllByText('93,673.00 ETB')).toHaveLength(2);
  });

  it('renders empty state when no transactions exist', () => {
    render(
      <NonIataLedgerTable
        transactions={[]}
        isLoading={false}
        currency="ETB"
        dateFrom=""
        dateTo=""
        onDateFromChange={vi.fn()}
        onDateToChange={vi.fn()}
        onFilterSubmit={vi.fn()}
        onFilterReset={vi.fn()}
      />
    );

    expect(
      screen.getByText(/No transaction records found for this account/i)
    ).toBeInTheDocument();
  });
});
