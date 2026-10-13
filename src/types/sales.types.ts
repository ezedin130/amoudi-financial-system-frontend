/**
 * Read-only representation of an authoritative ticket sales transaction.
 */
export interface SalesTransaction {
  id: number;
  nonIataId: number | null;
  nonIataCode: string | null;
  nonIataName: string | null;
  ticketNumber: string;
  transactionReference: string | null;
  saleDate: string; // ISO date YYYY-MM-DD
  passengerName: string | null;
  origin: string | null;
  destination: string | null;
  route: string | null;
  amount: number;
  currency: string;
  baseFare?: number | null;
  tax?: number | null;
  totalSale?: number | null;
  serviceCharge?: number | null;
  grandTotal?: number | null;
  effectiveGrandTotal?: number;
  sourceAgencyName: string | null;
  sourceRowNumber: number | null;
  sourceTransactionKey: string | null;
  importBatchId: number | null;
  createdAt: string;
}

/**
 * Filter query parameters supported by GET /api/v1/sales.
 */
export interface SalesFilterParams {
  nonIataId?: number;
  saleDate?: string;
  startDate?: string;
  endDate?: string;
  ticketNumber?: string;
  transactionReference?: string;
  importBatchId?: number;
  page?: number;
  size?: number;
  sort?: string;
}
