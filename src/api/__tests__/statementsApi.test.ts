import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as statementsApi from '../statementsApi';
import { apiClient } from '../client';
import { AccountStatement } from '@/types/statements.types';

vi.mock('../client', () => ({
  apiClient: {
    get: vi.fn(),
    getBlob: vi.fn(),
  },
}));

describe('statementsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getStatement queries /non-iatas/{id}/statement with date parameters', async () => {
    const mockStatement: Partial<AccountStatement> = {
      nonIataId: 10,
      nonIataCode: 'BTD',
      closingBalance: 450000,
      transactions: [],
    };
    vi.mocked(apiClient.get).mockResolvedValue(mockStatement);

    const result = await statementsApi.getStatement(10, {
      dateFrom: '2026-09-01',
      dateTo: '2026-09-30',
    });

    expect(apiClient.get).toHaveBeenCalledWith(
      '/non-iatas/10/statement?dateFrom=2026-09-01&dateTo=2026-09-30'
    );
    expect(result).toEqual(mockStatement);
  });

  it('exportStatementExcel fetches binary Excel resource with date parameters', async () => {
    const mockBlob = new Blob(['excel-content']);
    vi.mocked(apiClient.getBlob).mockResolvedValue({
      blob: mockBlob,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      filename: 'statement_BTD_2026-10-02.xlsx',
    });

    const result = await statementsApi.exportStatementExcel(10, {
      dateFrom: '2026-09-01',
      dateTo: '2026-09-30',
    });

    expect(apiClient.getBlob).toHaveBeenCalledWith(
      '/non-iatas/10/statement/export/excel?dateFrom=2026-09-01&dateTo=2026-09-30'
    );
    expect(result.filename).toBe('statement_BTD_2026-10-02.xlsx');
  });

  it('exportStatementPdf fetches binary PDF resource with date parameters', async () => {
    const mockBlob = new Blob(['pdf-content']);
    vi.mocked(apiClient.getBlob).mockResolvedValue({
      blob: mockBlob,
      contentType: 'application/pdf',
      filename: 'statement_BTD_2026-10-02.pdf',
    });

    const result = await statementsApi.exportStatementPdf(10, {
      dateFrom: '2026-09-01',
      dateTo: '2026-09-30',
    });

    expect(apiClient.getBlob).toHaveBeenCalledWith(
      '/non-iatas/10/statement/export/pdf?dateFrom=2026-09-01&dateTo=2026-09-30'
    );
    expect(result.filename).toBe('statement_BTD_2026-10-02.pdf');
  });
});
