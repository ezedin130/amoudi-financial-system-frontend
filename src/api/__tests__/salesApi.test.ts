import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSales, getSaleById } from '../salesApi';
import { apiClient } from '../client';

vi.mock('../client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('salesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSales', () => {
    it('calls /sales without query string when params are empty', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ content: [], totalElements: 0 });

      await getSales({});

      expect(apiClient.get).toHaveBeenCalledWith('/sales');
    });

    it('builds full query string with ticketNumber, nonIataId, dates, and pagination', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ content: [], totalElements: 0 });

      await getSales({
        ticketNumber: '065-5282705400',
        nonIataId: 11,
        startDate: '2026-09-01',
        endDate: '2026-09-30',
        page: 1,
        size: 50,
        sort: 'saleDate,desc',
      });

      expect(apiClient.get).toHaveBeenCalledWith(
        '/sales?nonIataId=11&startDate=2026-09-01&endDate=2026-09-30&ticketNumber=065-5282705400&page=1&size=50&sort=saleDate%2Cdesc'
      );
    });
  });

  describe('getSaleById', () => {
    it('calls GET /sales/{id} and returns single transaction', async () => {
      const mockSale = { id: 37, ticketNumber: 'TK-1234', amount: 50000 };
      vi.mocked(apiClient.get).mockResolvedValueOnce(mockSale);

      const result = await getSaleById(37);

      expect(apiClient.get).toHaveBeenCalledWith('/sales/37');
      expect(result).toEqual(mockSale);
    });
  });
});
