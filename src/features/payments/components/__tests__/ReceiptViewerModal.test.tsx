import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ReceiptViewerModal } from '../ReceiptViewerModal';
import * as paymentsApi from '@/api/paymentsApi';
import { Payment } from '@/types/payments.types';

vi.mock('@/api/paymentsApi', () => ({
  getReceiptBlob: vi.fn(),
}));

const mockPayment: Payment = {
  id: 1,
  nonIataId: 10,
  nonIataCode: 'BTD',
  nonIataName: 'Bati Dodola',
  paymentDate: '2026-09-18',
  amount: 250000,
  currency: 'ETB',
  receiptNumber: 'RCPT-001',
  paymentReference: 'BANK-REF-1',
  notes: null,
  receiptObjectKey: 'receipts/rcpt.pdf',
  hasReceipt: true,
  status: 'POSTED',
  createdBy: 'admin',
  createdAt: '2026-09-18T10:00:00',
  updatedAt: '2026-09-18T10:00:00',
};

describe('ReceiptViewerModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/mock-blob-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  it('fetches binary receipt and renders preview controls', async () => {
    const mockBlob = new Blob(['pdf-data'], { type: 'application/pdf' });
    vi.mocked(paymentsApi.getReceiptBlob).mockResolvedValue({
      blob: mockBlob,
      contentType: 'application/pdf',
    });

    render(<ReceiptViewerModal payment={mockPayment} isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText(/Fetching authoritative receipt document/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(paymentsApi.getReceiptBlob).toHaveBeenCalledWith(1);
      expect(screen.getByTitle('Download receipt file')).toBeInTheDocument();
    });
  });

  it('displays error notice when receipt fails to load', async () => {
    vi.mocked(paymentsApi.getReceiptBlob).mockRejectedValue(new Error('Receipt file not found'));

    render(<ReceiptViewerModal payment={mockPayment} isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/Receipt Document Unavailable/i)).toBeInTheDocument();
      expect(screen.getByText(/Receipt file not found/i)).toBeInTheDocument();
    });
  });
});
