import { apiClient } from './client';
import { AccountStatement } from '@/types/statements.types';

/**
 * Retrieves the authoritative chronological account statement for a Non-IATA.
 */
export async function getStatement(
  nonIataId: number,
  params?: { dateFrom?: string; dateTo?: string }
): Promise<AccountStatement> {
  const query = new URLSearchParams();
  if (params?.dateFrom) {
    query.append('dateFrom', params.dateFrom);
  }
  if (params?.dateTo) {
    query.append('dateTo', params.dateTo);
  }

  const queryString = query.toString();
  const endpoint = queryString
    ? `/non-iatas/${nonIataId}/statement?${queryString}`
    : `/non-iatas/${nonIataId}/statement`;

  return apiClient.get<AccountStatement>(endpoint);
}

/**
 * Downloads the account statement generated as an Excel spreadsheet by the backend.
 */
export async function exportStatementExcel(
  nonIataId: number,
  params?: { dateFrom?: string; dateTo?: string }
): Promise<{ blob: Blob; filename?: string }> {
  const query = new URLSearchParams();
  if (params?.dateFrom) {
    query.append('dateFrom', params.dateFrom);
  }
  if (params?.dateTo) {
    query.append('dateTo', params.dateTo);
  }

  const queryString = query.toString();
  const endpoint = queryString
    ? `/non-iatas/${nonIataId}/statement/export/excel?${queryString}`
    : `/non-iatas/${nonIataId}/statement/export/excel`;

  return apiClient.getBlob(endpoint);
}

/**
 * Downloads the account statement generated as a formal PDF document by the backend.
 */
export async function exportStatementPdf(
  nonIataId: number,
  params?: { dateFrom?: string; dateTo?: string }
): Promise<{ blob: Blob; filename?: string }> {
  const query = new URLSearchParams();
  if (params?.dateFrom) {
    query.append('dateFrom', params.dateFrom);
  }
  if (params?.dateTo) {
    query.append('dateTo', params.dateTo);
  }

  const queryString = query.toString();
  const endpoint = queryString
    ? `/non-iatas/${nonIataId}/statement/export/pdf?${queryString}`
    : `/non-iatas/${nonIataId}/statement/export/pdf`;

  return apiClient.getBlob(endpoint);
}
