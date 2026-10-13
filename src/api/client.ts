import { ApiError, ApiErrorResponse, ApiResponse } from '@/types/api.types';

const TOKEN_KEY = 'amoudi_auth_token';

let onUnauthorizedCallback: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorizedCallback = handler;
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function getBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string') {
    return envUrl.replace(/\/+$/, '');
  }
  return 'https://amoudi-financial-system-backend.onrender.com';
}

function buildUrl(endpoint: string): string {
  const base = getBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  if (cleanEndpoint.startsWith('/api/v1')) {
    return `${base}${cleanEndpoint}`;
  }
  return `${base}/api/v1${cleanEndpoint}`;
}

function generateCorrelationId(): string {
  return 'web-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now().toString(36);
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = buildUrl(endpoint);
  const token = getStoredToken();

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'X-Correlation-ID': generateCorrelationId(),
    ...(options.headers as Record<string, string> || {}),
  };

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network error. Please check your connection.';
    throw new ApiError(0, 'NETWORK_ERROR', message, [message]);
  }

  // Handle 401 Unauthorized globally
  if (response.status === 401) {
    removeStoredToken();
    if (onUnauthorizedCallback) {
      onUnauthorizedCallback();
    }
    let errorData: ApiErrorResponse;
    try {
      errorData = await response.json();
    } catch {
      errorData = {
        timestamp: new Date().toISOString(),
        status: 401,
        error: 'UNAUTHORIZED',
        message: 'Your session has expired or authentication is invalid. Please sign in again.',
      };
    }
    throw new ApiError(
      response.status,
      errorData.error || 'UNAUTHORIZED',
      errorData.message || 'Session expired or invalid',
      errorData.details || [],
      errorData.correlationId
    );
  }

  // Handle errors
  if (!response.ok) {
    let errorData: ApiErrorResponse;
    try {
      errorData = await response.json();
    } catch {
      errorData = {
        timestamp: new Date().toISOString(),
        status: response.status,
        error: response.statusText || 'HTTP_ERROR',
        message: `HTTP Error ${response.status}`,
      };
    }

    throw new ApiError(
      response.status,
      errorData.error || 'API_ERROR',
      errorData.message || 'An unexpected error occurred',
      errorData.details || [],
      errorData.correlationId
    );
  }

  // If 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  // Parse JSON response wrapped in ApiResponse<T>
  const json: ApiResponse<T> = await response.json();
  return json.data !== undefined ? json.data : (json as unknown as T);
}

export async function requestBlob(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ blob: Blob; contentType: string; filename?: string }> {
  const url = buildUrl(endpoint);
  const token = getStoredToken();

  const headers: Record<string, string> = {
    'X-Correlation-ID': generateCorrelationId(),
    ...(options.headers as Record<string, string> || {}),
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network error. Please check your connection.';
    throw new ApiError(0, 'NETWORK_ERROR', message, [message]);
  }

  if (response.status === 401) {
    removeStoredToken();
    if (onUnauthorizedCallback) onUnauthorizedCallback();
    throw new ApiError(401, 'UNAUTHORIZED', 'Session expired or invalid', []);
  }

  if (!response.ok) {
    let errorData: ApiErrorResponse;
    try {
      errorData = await response.json();
    } catch {
      errorData = {
        timestamp: new Date().toISOString(),
        status: response.status,
        error: response.statusText || 'HTTP_ERROR',
        message: `HTTP Error ${response.status}`,
      };
    }
    throw new ApiError(
      response.status,
      errorData.error || 'API_ERROR',
      errorData.message || 'An unexpected error occurred',
      errorData.details || [],
      errorData.correlationId
    );
  }

  const contentType = response.headers.get('content-type') || 'application/octet-stream';
  const contentDisposition = response.headers.get('content-disposition');
  let filename: string | undefined;
  if (contentDisposition) {
    const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (match && match[1]) {
      filename = match[1].replace(/['"]/g, '').trim();
    }
  }
  const blob = await response.blob();
  return { blob, contentType, filename };
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  getBlob: (endpoint: string, options?: RequestInit) =>
    requestBlob(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
