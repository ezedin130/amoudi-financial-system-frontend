import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as paymentsApi from '../paymentsApi';
import { apiClient } from '../client';
import { Payment } from '@/types/payments.types';

vi.mock('../client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    getBlob: vi.fn(),
  },
}));

describe('paymentsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getPayments builds query string with filters and pagination', async () => {
    const mockResponse = {
      content: [],
      totalElements: 0,
      totalPages: 0,
      pageNumber: 0,
      pageSize: 10,
    };
    vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

    await paymentsApi.getPayments({
      nonIataId: 5,
      status: 'POSTED',
      paymentReference: 'REF123',
      dateFrom: '2026-09-01',
      dateTo: '2026-09-30',
      page: 1,
      size: 10,
    });

    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining('/payments?')
    );
    const calledUrl = vi.mocked(apiClient.get).mock.calls[0][0];
    expect(calledUrl).toContain('nonIataId=5');
    expect(calledUrl).toContain('status=POSTED');
    expect(calledUrl).toContain('paymentReference=REF123');
    expect(calledUrl).toContain('dateFrom=2026-09-01');
    expect(calledUrl).toContain('dateTo=2026-09-30');
    expect(calledUrl).toContain('page=1');
    expect(calledUrl).toContain('size=10');
  });

  it('getPaymentById queries specific payment record by ID', async () => {
    const mockPayment: Partial<Payment> = { id: 42, amount: 200000 };
    vi.mocked(apiClient.get).mockResolvedValue(mockPayment);

    const result = await paymentsApi.getPaymentById(42);
    expect(apiClient.get).toHaveBeenCalledWith('/payments/42');
    expect(result).toEqual(mockPayment);
  });

  it('createPayment sends payment creation payload to /payments', async () => {
    const payload = {
      nonIataId: 3,
      paymentDate: '2026-09-18',
      amount: 150000,
      currency: 'ETB',
      paymentReference: 'BANK-99',
    };
    const mockCreated = { id: 101, ...payload, status: 'POSTED' };
    vi.mocked(apiClient.post).mockResolvedValue(mockCreated);

    const result = await paymentsApi.createPayment(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/payments', payload);
    expect(result.id).toBe(101);
  });

  it('uploadReceipt sends multipart file to /payments/{id}/receipt', async () => {
    const file = new File(['content'], 'receipt.pdf', { type: 'application/pdf' });
    const mockUpdated = { id: 101, hasReceipt: true };
    vi.mocked(apiClient.post).mockResolvedValue(mockUpdated);

    const result = await paymentsApi.uploadReceipt(101, file);
    expect(apiClient.post).toHaveBeenCalledWith(
      '/payments/101/receipt',
      expect.any(FormData)
    );
    expect(result.hasReceipt).toBe(true);
  });

  it('getReceiptBlob fetches binary receipt resource', async () => {
    const mockBlob = new Blob(['pdf-data'], { type: 'application/pdf' });
    vi.mocked(apiClient.getBlob).mockResolvedValue({ blob: mockBlob, contentType: 'application/pdf' });

    const result = await paymentsApi.getReceiptBlob(101);
    expect(apiClient.getBlob).toHaveBeenCalledWith('/payments/101/receipt');
    expect(result.contentType).toBe('application/pdf');
  });

  it('cancelPayment calls cancel endpoint', async () => {
    const mockCancelled = { id: 101, status: 'CANCELLED' };
    vi.mocked(apiClient.post).mockResolvedValue(mockCancelled);

    const result = await paymentsApi.cancelPayment(101);
    expect(apiClient.post).toHaveBeenCalledWith('/payments/101/cancel');
    expect(result.status).toBe('CANCELLED');
  });
});
