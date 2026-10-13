import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SalesDetailModal } from '../SalesDetailModal';
import * as salesApi from '@/api/salesApi';

vi.mock('@/api/salesApi', () => ({
  getSaleById: vi.fn(),
}));

const mockSale = {
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
  route: 'ADD → DXB',
  amount: 143673,
  currency: 'ETB',
  sourceAgencyName: 'INV*BATI TRAVEL',
  sourceRowNumber: 3,
  sourceTransactionKey: 'KEY-001',
  importBatchId: 18,
  createdAt: '2026-09-18T10:00:00',
};

describe('SalesDetailModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads and displays full immutable transaction details', async () => {
    vi.mocked(salesApi.getSaleById).mockResolvedValueOnce(mockSale);

    render(<SalesDetailModal saleId={37} isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('143,673.00 ETB')).toBeInTheDocument();
      expect(screen.getByText('Bati Travel')).toBeInTheDocument();
      expect(screen.getByText('BAT01')).toBeInTheDocument();
      expect(screen.getByText('INV*BATI TRAVEL')).toBeInTheDocument();
      expect(screen.getByText('Ahmed Mohammed')).toBeInTheDocument();
      expect(screen.getByText('ADD → DXB')).toBeInTheDocument();
      expect(screen.getByText(/Immutable Historical Record/i)).toBeInTheDocument();
    });
  });
});
