import { NonIataStatus } from './nonIata.types';

/**
 * Line item in an A/R aging report for a single Non-IATA sub-agent.
 */
export interface AgingRow {
  nonIataId: number;
  code: string;
  name: string;
  status: NonIataStatus;
  current: number; // 0–30 days
  days31To60: number; // 31–60 days
  days61To90: number; // 61–90 days
  days91To120: number; // 91–120 days
  days120Plus: number; // 120+ days
  totalOutstanding: number;
  totalSales?: number;
  totalPayments?: number;
  currency?: string;
}

/**
 * Authoritative accounts receivable aging report payload directly from backend engine.
 */
export interface AgingReport {
  asOfDate: string; // ISO date YYYY-MM-DD
  totalSales?: number;
  totalPayments?: number;
  totalCurrent: number;
  totalDays31To60: number;
  totalDays61To90: number;
  totalDays91To120: number;
  totalDays120Plus: number;
  totalOutstanding: number;
  currency?: string;
  totalAccounts: number;
  rows: AgingRow[];
}

/**
 * Query filter parameters supported by GET /api/v1/aging and export endpoints.
 */
export interface AgingFilterParams {
  asOfDate?: string;
  nonIataId?: number;
  search?: string;
  status?: NonIataStatus;
}
