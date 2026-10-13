/**
 * Financial status of a recorded Non-IATA payment.
 */
export type PaymentStatus = 'POSTED' | 'CANCELLED';

/**
 * Representation of an authoritative payment transaction.
 */
export interface Payment {
  id: number;
  nonIataId: number | null;
  nonIataCode: string | null;
  nonIataName: string | null;
  paymentDate: string; // ISO format YYYY-MM-DD
  amount: number;
  currency: string;
  receiptNumber: string | null;
  paymentReference: string | null;
  notes: string | null;
  receiptObjectKey: string | null;
  hasReceipt: boolean;
  status: PaymentStatus;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request payload for recording a new payment from a Non-IATA sub-agent.
 * Restricted to GENERAL_MANAGER.
 */
export interface CreatePaymentRequest {
  nonIataId: number;
  paymentDate: string; // YYYY-MM-DD
  amount: number;
  currency?: string;
  receiptNumber?: string;
  paymentReference?: string;
  notes?: string;
}

/**
 * Query filter parameters supported by GET /api/v1/payments.
 */
export interface PaymentFilterParams {
  nonIataId?: number;
  paymentDate?: string;
  dateFrom?: string;
  dateTo?: string;
  receiptNumber?: string;
  paymentReference?: string;
  status?: PaymentStatus;
  page?: number;
  size?: number;
  sort?: string;
}
