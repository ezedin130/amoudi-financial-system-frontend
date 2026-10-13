/**
 * Status lifecycle stages of an uploaded Galileo/BSP sales batch.
 */
export type ImportStatus =
  | 'UPLOADED'
  | 'PROCESSING'
  | 'VALIDATION_FAILED'
  | 'READY'
  | 'IMPORTED'
  | 'PARTIALLY_IMPORTED'
  | 'FAILED';

/**
 * Types of row-level errors encountered during Excel ingestion.
 */
export type ImportErrorType =
  | 'UNMATCHED_AGENCY'
  | 'DUPLICATE_TRANSACTION'
  | 'INVALID_AMOUNT'
  | 'INVALID_DATE'
  | 'MISSING_REQUIRED_FIELD'
  | 'PARSING_ERROR'
  | 'VALIDATION_ERROR';

/**
 * Import batch record returned by POST /api/v1/imports and GET /api/v1/imports.
 */
export interface ImportBatch {
  id: number;
  fileName: string;
  objectKey?: string;
  reportDate?: string;
  uploadedById: number;
  uploadedByUsername: string;
  uploadedAt: string;
  totalRows: number;
  successfulRows: number;
  duplicateRows: number;
  unmatchedRows: number;
  failedRows: number;
  status: ImportStatus;
  errorSummary?: string;
  createdAt: string;
}

/**
 * Row-level rejection or unmatched error item from GET /api/v1/imports/{id}/errors.
 */
export interface ImportBatchError {
  id: number;
  importBatchId: number;
  rowNumber: number;
  ticketNumber?: string;
  sourceAgencyName?: string;
  errorType: ImportErrorType;
  message: string;
  createdAt: string;
}

/**
 * Query parameters for paginated import batch lists.
 */
export interface ImportBatchFilterParams {
  page?: number;
  size?: number;
  sort?: string;
}
