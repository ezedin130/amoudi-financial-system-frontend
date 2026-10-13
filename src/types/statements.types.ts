/**
 * Financial classification of an account statement line item.
 */
export type StatementTransactionType = 'SALE' | 'PAYMENT';

/**
 * Line item in an account statement with running balance.
 */
export interface StatementTransaction {
  transactionDate: string; // ISO date YYYY-MM-DD
  type: StatementTransactionType;
  reference: string;
  description: string;
  debit: number;
  credit: number;
  runningBalance: number;
  sourceTransactionId?: number;
  currency: string;
  baseFare?: number | null;
  tax?: number | null;
  totalSale?: number | null;
  serviceCharge?: number | null;
  grandTotal?: number | null;
}

/**
 * Complete account statement payload representing chronological financial transactions for a Non-IATA.
 */
export interface AccountStatement {
  nonIataId: number;
  nonIataCode: string;
  nonIataName: string;
  currency: string;
  dateFrom: string | null;
  dateTo: string | null;
  openingBalance: number;
  totalSales: number;
  totalPayments: number;
  closingBalance: number;
  transactionCount: number;
  transactions: StatementTransaction[];
}

/**
 * Query parameters for generating a Non-IATA account statement.
 */
export interface StatementFilterParams {
  nonIataId: number;
  dateFrom?: string;
  dateTo?: string;
}
