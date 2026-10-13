export type UserRole = 'FINANCE' | 'GENERAL_MANAGER';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'LOCKED';

export interface User {
  id: number;
  username: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
}

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path?: string;
  correlationId?: string;
  details?: string[];
}

export class ApiError extends Error {
  status: number;
  error: string;
  details: string[];
  correlationId?: string;

  constructor(status: number, error: string, message: string, details: string[] = [], correlationId?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.error = error;
    this.details = details;
    this.correlationId = correlationId;
  }
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

