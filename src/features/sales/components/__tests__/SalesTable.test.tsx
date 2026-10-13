import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SalesTable } from '../SalesTable';
import { SalesTransaction } from '@/types/sales.types';

const mockSales: SalesTransaction[] = [
  {
    id: 37,
    ticketNumber: '065-5282705400',
    transactionReference: 'REF-001',
    saleDate: '2026-09-17',
    nonIataId: 11,
    nonIataCode: 'BAT01',
    nonIataName: 'Bati Travel',
    passengerName: 'Ahmed Mohammed',
    origin: 'ADD',
    destination: 'DXB',
    route: 'ADD-DXB',
    amount: 143673,
    currency: 'ETB',
    sourceAgencyName: 'INV*BATI TRAVEL',
    sourceRowNumber: 3,
    sourceTransactionKey: 'KEY-001',
    importBatchId: 18,
    createdAt: '2026-09-18T10:00:00',
  },
];

describe('SalesTable', () => {
  it('renders sales transactions with ticket, agency, route, and formatted amount', () => {
    const onSelectSale = vi.fn();
    render(<SalesTable sales={mockSales} isLoading={false} onSelectSale={onSelectSale} />);

    expect(screen.getByText('065-5282705400')).toBeInTheDocument();
    expect(screen.getByText('Ref: REF-001')).toBeInTheDocument();
    expect(screen.getByText('Bati Travel')).toBeInTheDocument();
    expect(screen.getByText('BAT01')).toBeInTheDocument();
    expect(screen.getByText('Ahmed Mohammed')).toBeInTheDocument();
    expect(screen.getByText('ADD-DXB')).toBeInTheDocument();
    expect(screen.getByText('143,673.00')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Details/i }));
    expect(onSelectSale).toHaveBeenCalledWith(mockSales[0]);
  });

  it('renders empty state when no sales transactions are present', () => {
    render(<SalesTable sales={[]} isLoading={false} onSelectSale={vi.fn()} />);

    expect(screen.getByText('No sales transactions found')).toBeInTheDocument();
  });
});
