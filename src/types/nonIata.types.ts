export type NonIataStatus = 'ACTIVE' | 'INACTIVE';

export interface NonIata {
  id: number;
  code: string;
  name: string;
  status: NonIataStatus;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NonIataCreateRequest {
  code: string;
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export interface NonIataUpdateRequest {
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export interface NonIataStatusUpdateRequest {
  status: NonIataStatus;
}

export interface NonIataFinancialSummary {
  nonIataId: number;
  nonIataCode?: string;
  nonIataName?: string;
  code?: string;
  name?: string;
  status?: NonIataStatus;
  totalSales: number;
  totalPayments: number;
  outstandingBalance: number;
  currency?: string;
}

export type StatementTransactionType = 'SALE' | 'PAYMENT';

export interface StatementTransaction {
  transactionDate: string;
  type: StatementTransactionType;
  reference: string;
  description: string;
  debit: number;
  credit: number;
  runningBalance: number;
  sourceTransactionId?: number;
  currency?: string;
  baseFare?: number | null;
  tax?: number | null;
  totalSale?: number | null;
  serviceCharge?: number | null;
  grandTotal?: number | null;
}

export interface AccountStatement {
  nonIataId: number;
  nonIataCode: string;
  nonIataName: string;
  currency: string;
  dateFrom?: string;
  dateTo?: string;
  openingBalance: number;
  totalSales: number;
  totalPayments: number;
  closingBalance: number;
  transactionCount: number;
  transactions: StatementTransaction[];
}

export interface NonIataListParams {
  search?: string;
  status?: NonIataStatus | 'ALL';
  page?: number;
  size?: number;
  sort?: string;
}
