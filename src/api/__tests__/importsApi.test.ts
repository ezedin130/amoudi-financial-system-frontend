import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadReport, getImportBatches, getImportBatchById, getBatchErrors } from '../importsApi';
import { apiClient } from '../client';

vi.mock('../client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('importsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadReport', () => {
    it('sends file using FormData to POST /imports', async () => {
      const mockFile = new File(['content'], 'SEP- 17.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const mockResponse = { id: 18, fileName: 'SEP- 17.xlsx', status: 'IMPORTED' };
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

      const result = await uploadReport(mockFile);

      expect(apiClient.post).toHaveBeenCalledWith('/imports', expect.any(FormData));
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getImportBatches', () => {
    it('calls GET /imports with query parameters', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ content: [], totalElements: 0 });

      await getImportBatches({ page: 2, size: 10, sort: 'createdAt,desc' });

      expect(apiClient.get).toHaveBeenCalledWith('/imports?page=2&size=10&sort=createdAt%2Cdesc');
    });
  });

  describe('getImportBatchById', () => {
    it('calls GET /imports/{id}', async () => {
      const mockBatch = { id: 18, fileName: 'SEP- 17.xlsx', status: 'IMPORTED' };
      vi.mocked(apiClient.get).mockResolvedValueOnce(mockBatch);

      const result = await getImportBatchById(18);

      expect(apiClient.get).toHaveBeenCalledWith('/imports/18');
      expect(result).toEqual(mockBatch);
    });
  });

  describe('getBatchErrors', () => {
    it('calls GET /imports/{id}/errors with pagination', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ content: [], totalElements: 0 });

      await getBatchErrors(18, 1, 25);

      expect(apiClient.get).toHaveBeenCalledWith('/imports/18/errors?page=1&size=25&sort=rowNumber,asc');
    });
  });
});
