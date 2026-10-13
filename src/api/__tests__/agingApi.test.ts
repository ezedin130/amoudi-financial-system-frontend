import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as agingApi from '../agingApi';
import { apiClient } from '../client';
import { AgingReport } from '@/types/aging.types';

vi.mock('../client', () => ({
  apiClient: {
    get: vi.fn(),
    getBlob: vi.fn(),
  },
}));

describe('agingApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAgingReport queries /aging with asOfDate, nonIataId, search, status', async () => {
    const mockReport: Partial<AgingReport> = {
      asOfDate: '2026-10-02',
      totalOutstanding: 600000,
      rows: [],
    };
    vi.mocked(apiClient.get).mockResolvedValue(mockReport);

    const result = await agingApi.getAgingReport({
      asOfDate: '2026-10-02',
      nonIataId: 10,
      search: 'Bati',
      status: 'ACTIVE',
    });

    expect(apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining('/aging?')
    );
    const calledUrl = vi.mocked(apiClient.get).mock.calls[0][0];
    expect(calledUrl).toContain('asOfDate=2026-10-02');
    expect(calledUrl).toContain('nonIataId=10');
    expect(calledUrl).toContain('search=Bati');
    expect(calledUrl).toContain('status=ACTIVE');
    expect(result).toEqual(mockReport);
  });

  it('exportAgingExcel fetches binary Excel resource with query parameters', async () => {
    const mockBlob = new Blob(['excel-content']);
    vi.mocked(apiClient.getBlob).mockResolvedValue({
      blob: mockBlob,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      filename: 'aging_report_2026-10-02.xlsx',
    });

    const result = await agingApi.exportAgingExcel({
      asOfDate: '2026-10-02',
    });

    expect(apiClient.getBlob).toHaveBeenCalledWith('/aging/export/excel?asOfDate=2026-10-02');
    expect(result.filename).toBe('aging_report_2026-10-02.xlsx');
  });

  it('exportAgingPdf fetches binary PDF resource with query parameters', async () => {
    const mockBlob = new Blob(['pdf-content']);
    vi.mocked(apiClient.getBlob).mockResolvedValue({
      blob: mockBlob,
      contentType: 'application/pdf',
      filename: 'aging_report_2026-10-02.pdf',
    });

    const result = await agingApi.exportAgingPdf({
      asOfDate: '2026-10-02',
    });

    expect(apiClient.getBlob).toHaveBeenCalledWith('/aging/export/pdf?asOfDate=2026-10-02');
    expect(result.filename).toBe('aging_report_2026-10-02.pdf');
  });
});
