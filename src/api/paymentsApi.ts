import { apiClient } from './client';
import { PageResponse } from '@/types/api.types';
import { CreatePaymentRequest, Payment, PaymentFilterParams } from '@/types/payments.types';

/**
 * Retrieves paginated payment transactions with dynamic server-side filters.
 * Accessible by both FINANCE and GENERAL_MANAGER.
 */
export async function getPayments(params?: PaymentFilterParams): Promise<PageResponse<Payment>> {
  const query = new URLSearchParams();

  if (params?.nonIataId !== undefined && params.nonIataId !== null) {
    query.append('nonIataId', params.nonIataId.toString());
  }
  if (params?.paymentDate) {
    query.append('paymentDate', params.paymentDate);
  }
  if (params?.dateFrom) {
    query.append('dateFrom', params.dateFrom);
  }
  if (params?.dateTo) {
    query.append('dateTo', params.dateTo);
  }
  if (params?.receiptNumber) {
    query.append('receiptNumber', params.receiptNumber.trim());
  }
  if (params?.paymentReference) {
    query.append('paymentReference', params.paymentReference.trim());
  }
  if (params?.status) {
    query.append('status', params.status);
  }

  query.append('page', (params?.page ?? 0).toString());
  query.append('size', (params?.size ?? 20).toString());
  if (params?.sort) {
    query.append('sort', params.sort);
  } else {
    query.append('sort', 'paymentDate,desc');
  }

  return apiClient.get<PageResponse<Payment>>(`/payments?${query.toString()}`);
}

/**
 * Retrieves a single authoritative payment record by ID.
 * Accessible by both FINANCE and GENERAL_MANAGER.
 */
export async function getPaymentById(id: number): Promise<Payment> {
  return apiClient.get<Payment>(`/payments/${id}`);
}

/**
 * Records a new payment transaction for a Non-IATA account.
 * Restricted to GENERAL_MANAGER.
 */
export async function createPayment(request: CreatePaymentRequest): Promise<Payment> {
  return apiClient.post<Payment>('/payments', request);
}

/**
 * Attaches or replaces a receipt document (PDF, JPG, PNG) on an existing payment.
 * Restricted to GENERAL_MANAGER.
 */
export async function uploadReceipt(paymentId: number, file: File): Promise<Payment> {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post<Payment>(`/payments/${paymentId}/receipt`, formData);
}

/**
 * Downloads/fetches the binary receipt file resource.
 * Accessible by both FINANCE and GENERAL_MANAGER.
 */
export async function getReceiptBlob(paymentId: number): Promise<{ blob: Blob; contentType: string }> {
  return apiClient.getBlob(`/payments/${paymentId}/receipt`);
}

/**
 * Cancels a POSTED payment transaction.
 * Restricted to FINANCE.
 */
export async function cancelPayment(paymentId: number): Promise<Payment> {
  return apiClient.post<Payment>(`/payments/${paymentId}/cancel`);
}
