import { NonIataStatus, NonIataFinancialSummary } from './nonIata.types';

/**
 * Filter parameters for listing Non-IATA financial summaries on the dashboard.
 */
export interface FinancialSummaryListParams {
  search?: string;
  status?: NonIataStatus;
  page?: number;
  size?: number;
  sort?: string;
}

/**
 * High-level aggregated overview metrics for the executive dashboard.
 * All financial fields originate directly from backend aggregation endpoints.
 */
export interface DashboardOverviewMetrics {
  totalSales: number;
  totalPayments: number;
  totalOutstanding: number;
  totalCurrent: number;
  totalDays31To60: number;
  totalDays61To90: number;
  totalDays91To120: number;
  totalDays120Plus: number;
  currency: string;
  asOfDate: string;
  activeAccountsCount: number;
  totalAccountsCount: number;
}

export type { NonIataFinancialSummary };
