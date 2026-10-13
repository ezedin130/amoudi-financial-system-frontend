import { apiClient } from './client';
import { PageResponse } from '@/types/api.types';
import { ImportBatch, ImportBatchError, ImportBatchFilterParams } from '@/types/imports.types';

/**
 * Uploads and processes a Galileo/BSP daily sales Excel report (.xlsx / .xls).
 * Restricted to FINANCE role.
 */
export async function uploadReport(file: File): Promise<ImportBatch> {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient.post<ImportBatch>('/imports', formData);
}

/**
 * Retrieves paginated import batch history.
 */
export async function getImportBatches(params: ImportBatchFilterParams = {}): Promise<PageResponse<ImportBatch>> {
  const query = new URLSearchParams();

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
  const endpoint = queryString ? `/imports?${queryString}` : '/imports';

  return apiClient.get<PageResponse<ImportBatch>>(endpoint);
}

/**
 * Retrieves details for a specific import batch by ID.
 */
export async function getImportBatchById(id: number | string): Promise<ImportBatch> {
  return apiClient.get<ImportBatch>(`/imports/${id}`);
}

/**
 * Retrieves paginated row-level rejection or unmatched agency errors for a specific import batch.
 */
export async function getBatchErrors(
  id: number | string,
  page = 0,
  size = 50
): Promise<PageResponse<ImportBatchError>> {
  return apiClient.get<PageResponse<ImportBatchError>>(`/imports/${id}/errors?page=${page}&size=${size}&sort=rowNumber,asc`);
}
