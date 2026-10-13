import { apiClient } from './client';
import { PageResponse } from '@/types/api.types';
import { SalesFilterParams, SalesTransaction } from '@/types/sales.types';

/**
 * Retrieves a paginated list of ticket sales transactions with server-side filters.
 */
export async function getSales(params: SalesFilterParams = {}): Promise<PageResponse<SalesTransaction>> {
  const query = new URLSearchParams();

  if (params.nonIataId !== undefined && params.nonIataId !== null) {
    query.append('nonIataId', String(params.nonIataId));
  }

  if (params.saleDate) {
    query.append('saleDate', params.saleDate);
  }

  if (params.startDate) {
    query.append('startDate', params.startDate);
  }

  if (params.endDate) {
    query.append('endDate', params.endDate);
  }

  if (params.ticketNumber && params.ticketNumber.trim()) {
    query.append('ticketNumber', params.ticketNumber.trim());
  }

  if (params.transactionReference && params.transactionReference.trim()) {
    query.append('transactionReference', params.transactionReference.trim());
  }

  if (params.importBatchId !== undefined && params.importBatchId !== null) {
    query.append('importBatchId', String(params.importBatchId));
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
  const endpoint = queryString ? `/sales?${queryString}` : '/sales';

  return apiClient.get<PageResponse<SalesTransaction>>(endpoint);
}

/**
 * Retrieves a single sales transaction by its database ID.
 */
export async function getSaleById(id: number | string): Promise<SalesTransaction> {
  return apiClient.get<SalesTransaction>(`/sales/${id}`);
}
