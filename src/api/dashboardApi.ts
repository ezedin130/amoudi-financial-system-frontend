import { apiClient } from './client';
import { PageResponse } from '@/types/api.types';
import {
  DashboardOverviewMetrics,
  FinancialSummaryListParams,
  NonIataFinancialSummary,
} from '@/types/dashboard.types';
import { getAgingReport } from './agingApi';
import { getSales } from './salesApi';
import { getPayments } from './paymentsApi';
import { getImportBatches } from './importsApi';
import { SalesTransaction } from '@/types/sales.types';
import { Payment } from '@/types/payments.types';
import { ImportBatch } from '@/types/imports.types';

/**
 * Retrieves paginated Non-IATA financial summaries aggregated at database level.
 * Formula: OUTSTANDING BALANCE = TOTAL SALES - TOTAL POSTED PAYMENTS
 */
export async function getFinancialSummaries(
  params: FinancialSummaryListParams = {}
): Promise<PageResponse<NonIataFinancialSummary>> {
  const query = new URLSearchParams();

  if (params.search && params.search.trim()) {
    query.append('search', params.search.trim());
  }

  if (params.status) {
    query.append('status', params.status);
  }

  if (params.page !== undefined) {
    query.append('page', String(params.page));
  }

  if (params.size !== undefined) {
    query.append('size', String(params.size));
  }

  if (params.sort) {
    query.append('sort', params.sort);
  }

  const queryString = query.toString();
  const endpoint = queryString
    ? `/financial-summaries?${queryString}`
    : '/financial-summaries';

  return apiClient.get<PageResponse<NonIataFinancialSummary>>(endpoint);
}

/**
 * Company-wide financial overview payload from backend GET /api/v1/financial-summaries/overview.
 */
export interface CompanyFinancialOverview {
  totalSales: number;
  totalPayments: number;
  outstandingBalance: number;
  activeAccountsCount: number;
  totalAccountsCount: number;
  currency: string;
}

/**
 * Retrieves the backend-authoritative company-wide financial overview.
 * Total Sales = SUM(Grand Total)
 * Total Payments = SUM(POSTED Payments)
 * Outstanding Balance = Total Sales - Total Payments
 */
export async function getCompanyFinancialOverview(): Promise<CompanyFinancialOverview> {
  return apiClient.get<CompanyFinancialOverview>('/financial-summaries/overview');
}

/**
 * Aggregates high-level executive dashboard metrics directly from authoritative backend endpoints.
 * Combines company overview with A/R aging bucket aggregates.
 */
export async function getDashboardOverviewMetrics(): Promise<DashboardOverviewMetrics> {
  const [aging, overviewRes] = await Promise.all([
    getAgingReport(),
    getCompanyFinancialOverview().catch(() => null),
  ]);

  return {
    totalSales: overviewRes?.totalSales ?? aging.totalSales ?? 0,
    totalPayments: overviewRes?.totalPayments ?? aging.totalPayments ?? 0,
    totalOutstanding: overviewRes?.outstandingBalance ?? aging.totalOutstanding,
    totalCurrent: aging.totalCurrent,
    totalDays31To60: aging.totalDays31To60,
    totalDays61To90: aging.totalDays61To90,
    totalDays91To120: aging.totalDays91To120,
    totalDays120Plus: aging.totalDays120Plus,
    currency: overviewRes?.currency || aging.currency || 'ETB',
    asOfDate: aging.asOfDate,
    activeAccountsCount: overviewRes?.activeAccountsCount ?? 0,
    totalAccountsCount: overviewRes?.totalAccountsCount ?? aging.totalAccounts ?? 0,
  };
}

/**
 * Retrieves the most recent sales transactions.
 */
export async function getRecentSales(limit = 5): Promise<SalesTransaction[]> {
  const res = await getSales({
    page: 0,
    size: limit,
    sort: 'saleDate,desc',
  });
  return res.content;
}

/**
 * Retrieves the most recent payment transactions.
 */
export async function getRecentPayments(limit = 5): Promise<Payment[]> {
  const res = await getPayments({
    page: 0,
    size: limit,
    sort: 'paymentDate,desc',
  });
  return res.content;
}

/**
 * Retrieves the most recent Galileo/BSP sales report imports.
 */
export async function getRecentImports(limit = 5): Promise<ImportBatch[]> {
  const res = await getImportBatches({
    page: 0,
    size: limit,
  });
  return res.content;
}
