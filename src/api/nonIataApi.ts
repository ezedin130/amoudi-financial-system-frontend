import { apiClient } from './client';
import { PageResponse } from '@/types/api.types';
import {
  AccountStatement,
  NonIata,
  NonIataCreateRequest,
  NonIataFinancialSummary,
  NonIataListParams,
  NonIataStatus,
  NonIataStatusUpdateRequest,
  NonIataUpdateRequest,
} from '@/types/nonIata.types';

/**
 * Retrieves a paginated list of Non-IATA accounts with optional keyword search and status filter.
 */
export async function getNonIatas(params: NonIataListParams = {}): Promise<PageResponse<NonIata>> {
  const query = new URLSearchParams();

  if (params.search && params.search.trim()) {
    query.append('search', params.search.trim());
  }

  if (params.status && params.status !== 'ALL') {
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
  const endpoint = queryString ? `/non-iatas?${queryString}` : '/non-iatas';

  return apiClient.get<PageResponse<NonIata>>(endpoint);
}

/**
 * Retrieves a single Non-IATA account details by ID.
 */
export async function getNonIataById(id: number | string): Promise<NonIata> {
  return apiClient.get<NonIata>(`/non-iatas/${id}`);
}

/**
 * Creates a new Non-IATA account. Restricted to FINANCE role.
 */
export async function createNonIata(data: NonIataCreateRequest): Promise<NonIata> {
  return apiClient.post<NonIata>('/non-iatas', data);
}

/**
 * Updates an existing Non-IATA account. Code is immutable and not included. Restricted to FINANCE role.
 */
export async function updateNonIata(id: number | string, data: NonIataUpdateRequest): Promise<NonIata> {
  return apiClient.put<NonIata>(`/non-iatas/${id}`, data);
}

/**
 * Updates operational status (ACTIVE / INACTIVE) of a Non-IATA account. Restricted to FINANCE role.
 */
export async function updateNonIataStatus(id: number | string, status: NonIataStatus): Promise<NonIata> {
  const payload: NonIataStatusUpdateRequest = { status };
  return apiClient.patch<NonIata>(`/non-iatas/${id}/status`, payload);
}

/**
 * Retrieves the dynamic financial summary (totalSales, totalPayments, outstandingBalance) for a Non-IATA account.
 */
export async function getNonIataFinancialSummary(id: number | string): Promise<NonIataFinancialSummary> {
  return apiClient.get<NonIataFinancialSummary>(`/non-iatas/${id}/financial-summary`);
}

/**
 * Retrieves the chronological account statement / ledger for a Non-IATA account.
 */
export async function getNonIataStatement(
  id: number | string,
  dateFrom?: string,
  dateTo?: string
): Promise<AccountStatement> {
  const query = new URLSearchParams();
  if (dateFrom) query.append('dateFrom', dateFrom);
  if (dateTo) query.append('dateTo', dateTo);

  const queryString = query.toString();
  const endpoint = queryString ? `/non-iatas/${id}/statement?${queryString}` : `/non-iatas/${id}/statement`;

  return apiClient.get<AccountStatement>(endpoint);
}
