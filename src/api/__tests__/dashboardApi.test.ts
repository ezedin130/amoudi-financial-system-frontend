import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getFinancialSummaries,
  getCompanyFinancialOverview,
  getDashboardOverviewMetrics,
  getRecentSales,
  getRecentPayments,
  getRecentImports,
} from '../dashboardApi';
import { apiClient } from '../client';
import * as agingApi from '../agingApi';
import * as salesApi from '../salesApi';
import * as paymentsApi from '../paymentsApi';
import * as importsApi from '../importsApi';
import { ImportBatch } from '@/types/imports.types';

vi.mock('../client');
vi.mock('../agingApi');
vi.mock('../salesApi');
vi.mock('../paymentsApi');
vi.mock('../importsApi');

describe('dashboardApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getFinancialSummaries', () => {
    it('calls GET /financial-summaries with sanitized query parameters', async () => {
      const mockResult = {
        content: [
          {
            nonIataId: 1,
            code: 'BTD',
            name: 'Bati Dodola',
            status: 'ACTIVE' as const,
            totalSales: 1420000,
            totalPayments: 1100000,
            outstandingBalance: 320000,
            currency: 'ETB',
          },
        ],
        pageNumber: 0,
        pageSize: 10,
        totalElements: 1,
        totalPages: 1,
        isFirst: true,
        isLast: true,
        hasNext: false,
        hasPrevious: false,
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockResult);

      const res = await getFinancialSummaries({ search: 'Bati', status: 'ACTIVE', size: 10 });

      expect(apiClient.get).toHaveBeenCalledWith('/financial-summaries?search=Bati&status=ACTIVE&size=10');
      expect(res).toEqual(mockResult);
    });
  });

  describe('getCompanyFinancialOverview', () => {
    it('calls GET /financial-summaries/overview', async () => {
      const mockOverview = {
        totalSales: 2500000,
        totalPayments: 1000000,
        outstandingBalance: 1500000,
        activeAccountsCount: 15,
        totalAccountsCount: 20,
        currency: 'ETB',
      };
      vi.mocked(apiClient.get).mockResolvedValue(mockOverview);

      const res = await getCompanyFinancialOverview();
      expect(apiClient.get).toHaveBeenCalledWith('/financial-summaries/overview');
      expect(res).toEqual(mockOverview);
    });
  });

  describe('getDashboardOverviewMetrics', () => {
    it('aggregates metrics directly from overview and aging endpoints without client math', async () => {
      vi.mocked(agingApi.getAgingReport).mockResolvedValue({
        asOfDate: '2026-10-02',
        totalCurrent: 500000,
        totalDays31To60: 200000,
        totalDays61To90: 100000,
        totalDays91To120: 50000,
        totalDays120Plus: 150000,
        totalOutstanding: 1000000,
        totalSales: 2000000,
        totalPayments: 1000000,
        currency: 'ETB',
        totalAccounts: 20,
        rows: [],
      });

      vi.mocked(apiClient.get).mockImplementation(async (url: string) => {
        if (url === '/financial-summaries/overview') {
          return {
            totalSales: 2000000,
            totalPayments: 1000000,
            outstandingBalance: 1000000,
            activeAccountsCount: 15,
            totalAccountsCount: 20,
            currency: 'ETB',
          };
        }
        return {} as any;
      });

      const metrics = await getDashboardOverviewMetrics();

      expect(metrics.totalSales).toBe(2000000);
      expect(metrics.totalPayments).toBe(1000000);
      expect(metrics.totalOutstanding).toBe(1000000);
      expect(metrics.totalCurrent).toBe(500000);
      expect(metrics.activeAccountsCount).toBe(15);
      expect(metrics.totalAccountsCount).toBe(20);
      expect(metrics.currency).toBe('ETB');
    });
  });

  describe('getRecentSales', () => {
    it('retrieves top recent sales sorted by saleDate desc', async () => {
      const mockSales = [
        {
          id: 101,
          nonIataId: 1,
          nonIataCode: 'BTD',
          nonIataName: 'Bati Dodola',
          ticketNumber: '0715282700001',
          transactionReference: 'REF1',
          saleDate: '2026-10-01',
          passengerName: 'Abebe B',
          origin: 'ADD',
          destination: 'DXB',
          route: 'ADD-DXB',
          amount: 45000,
          currency: 'ETB',
          sourceAgencyName: 'Bati Dodola',
          sourceRowNumber: 2,
          sourceTransactionKey: 'KEY1',
          importBatchId: 1,
          createdAt: '2026-10-01T10:00:00Z',
        },
      ];

      vi.mocked(salesApi.getSales).mockResolvedValue({
        content: mockSales,
        totalElements: 1,
        totalPages: 1,
        pageNumber: 0,
        pageSize: 5,
        isFirst: true,
        isLast: true,
        hasNext: false,
        hasPrevious: false,
      });

      const res = await getRecentSales(5);
      expect(salesApi.getSales).toHaveBeenCalledWith({
        page: 0,
        size: 5,
        sort: 'saleDate,desc',
      });
      expect(res).toEqual(mockSales);
    });
  });

  describe('getRecentPayments', () => {
    it('retrieves top recent payments sorted by paymentDate desc', async () => {
      const mockPayments = [
        {
          id: 201,
          nonIataId: 1,
          nonIataCode: 'BTD',
          nonIataName: 'Bati Dodola',
          paymentDate: '2026-10-01',
          amount: 50000,
          currency: 'ETB',
          receiptNumber: 'RCPT-001',
          paymentReference: 'BANK-123',
          notes: 'Regular payment',
          receiptObjectKey: 'rcpt.pdf',
          hasReceipt: true,
          status: 'POSTED' as const,
          createdBy: 'admin',
          createdAt: '2026-10-01T11:00:00Z',
          updatedAt: '2026-10-01T11:00:00Z',
        },
      ];

      vi.mocked(paymentsApi.getPayments).mockResolvedValue({
        content: mockPayments,
        totalElements: 1,
        totalPages: 1,
        pageNumber: 0,
        pageSize: 5,
        isFirst: true,
        isLast: true,
        hasNext: false,
        hasPrevious: false,
      });

      const res = await getRecentPayments(5);
      expect(paymentsApi.getPayments).toHaveBeenCalledWith({
        page: 0,
        size: 5,
        sort: 'paymentDate,desc',
      });
      expect(res).toEqual(mockPayments);
    });
  });

  describe('getRecentImports', () => {
    it('retrieves top recent import batches', async () => {
      const mockBatches: ImportBatch[] = [
        {
          id: 1,
          fileName: 'sales_2026-10-01.xlsx',
          uploadedById: 1,
          uploadedByUsername: 'finance_user',
          uploadedAt: '2026-10-01T08:00:00Z',
          totalRows: 100,
          successfulRows: 98,
          duplicateRows: 2,
          unmatchedRows: 0,
          failedRows: 0,
          status: 'IMPORTED',
          createdAt: '2026-10-01T08:00:00Z',
        },
      ];

      vi.mocked(importsApi.getImportBatches).mockResolvedValue({
        content: mockBatches,
        totalElements: 1,
        totalPages: 1,
        pageNumber: 0,
        pageSize: 5,
        isFirst: true,
        isLast: true,
        hasNext: false,
        hasPrevious: false,
      });

      const res = await getRecentImports(5);
      expect(importsApi.getImportBatches).toHaveBeenCalledWith({
        page: 0,
        size: 5,
      });
      expect(res).toEqual(mockBatches);
    });
  });
});
