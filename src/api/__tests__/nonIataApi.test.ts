import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getNonIatas,
  getNonIataById,
  createNonIata,
  updateNonIata,
  updateNonIataStatus,
  getNonIataFinancialSummary,
  getNonIataStatement,
} from '../nonIataApi';
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

describe('nonIataApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getNonIatas', () => {
    it('calls /non-iatas with no query params when empty', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ content: [], totalElements: 0 });

      await getNonIatas({});

      expect(apiClient.get).toHaveBeenCalledWith('/non-iatas');
    });

    it('builds query string correctly with search, status, and pagination', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ content: [], totalElements: 0 });

      await getNonIatas({
        search: 'Bati',
        status: 'ACTIVE',
        page: 2,
        size: 10,
        sort: 'createdAt,desc',
      });

      expect(apiClient.get).toHaveBeenCalledWith(
        '/non-iatas?search=Bati&status=ACTIVE&page=2&size=10&sort=createdAt%2Cdesc'
      );
    });

    it('omits status if set to ALL', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ content: [], totalElements: 0 });

      await getNonIatas({ status: 'ALL', page: 0 });

      expect(apiClient.get).toHaveBeenCalledWith('/non-iatas?page=0');
    });
  });

  describe('getNonIataById', () => {
    it('calls GET /non-iatas/{id}', async () => {
      const mockAgency = { id: 11, code: 'BAT01', name: 'Bati Travel', status: 'ACTIVE' };
      vi.mocked(apiClient.get).mockResolvedValueOnce(mockAgency);

      const result = await getNonIataById(11);

      expect(apiClient.get).toHaveBeenCalledWith('/non-iatas/11');
      expect(result).toEqual(mockAgency);
    });
  });

  describe('createNonIata', () => {
    it('calls POST /non-iatas with payload', async () => {
      const payload = { code: 'NEW01', name: 'New Agency' };
      const created = { id: 50, ...payload, status: 'ACTIVE' };
      vi.mocked(apiClient.post).mockResolvedValueOnce(created);

      const result = await createNonIata(payload);

      expect(apiClient.post).toHaveBeenCalledWith('/non-iatas', payload);
      expect(result).toEqual(created);
    });
  });

  describe('updateNonIata', () => {
    it('calls PUT /non-iatas/{id} with payload', async () => {
      const payload = { name: 'Updated Agency Name' };
      const updated = { id: 11, code: 'BAT01', name: 'Updated Agency Name', status: 'ACTIVE' };
      vi.mocked(apiClient.put).mockResolvedValueOnce(updated);

      const result = await updateNonIata(11, payload);

      expect(apiClient.put).toHaveBeenCalledWith('/non-iatas/11', payload);
      expect(result).toEqual(updated);
    });
  });

  describe('updateNonIataStatus', () => {
    it('calls PATCH /non-iatas/{id}/status with status update', async () => {
      const updated = { id: 11, code: 'BAT01', name: 'Bati Travel', status: 'INACTIVE' };
      vi.mocked(apiClient.patch).mockResolvedValueOnce(updated);

      const result = await updateNonIataStatus(11, 'INACTIVE');

      expect(apiClient.patch).toHaveBeenCalledWith('/non-iatas/11/status', { status: 'INACTIVE' });
      expect(result).toEqual(updated);
    });
  });

  describe('getNonIataFinancialSummary', () => {
    it('calls GET /non-iatas/{id}/financial-summary', async () => {
      const summary = {
        nonIataId: 11,
        totalSales: 143673,
        totalPayments: 0,
        outstandingBalance: 143673,
      };
      vi.mocked(apiClient.get).mockResolvedValueOnce(summary);

      const result = await getNonIataFinancialSummary(11);

      expect(apiClient.get).toHaveBeenCalledWith('/non-iatas/11/financial-summary');
      expect(result).toEqual(summary);
    });
  });

  describe('getNonIataStatement', () => {
    it('calls GET /non-iatas/{id}/statement with date filters', async () => {
      const stmt = { nonIataId: 11, closingBalance: 143673, transactions: [] };
      vi.mocked(apiClient.get).mockResolvedValueOnce(stmt);

      const result = await getNonIataStatement(11, '2026-09-01', '2026-09-30');

      expect(apiClient.get).toHaveBeenCalledWith(
        '/non-iatas/11/statement?dateFrom=2026-09-01&dateTo=2026-09-30'
      );
      expect(result).toEqual(stmt);
    });
  });
});
