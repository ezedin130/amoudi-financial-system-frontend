import { describe, it, expect, beforeEach, vi } from 'vitest';
import { request, setStoredToken, removeStoredToken, setUnauthorizedHandler } from '../client';
import { ApiError } from '@/types/api.types';

describe('API Client', () => {
  beforeEach(() => {
    removeStoredToken();
    vi.restoreAllMocks();
  });

  it('attaches Authorization header when token is stored', async () => {
    setStoredToken('test-jwt-token');

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: { status: 'UP' } }),
    });
    global.fetch = fetchMock;

    const result = await request<{ status: string }>('/health');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain('/api/v1/health');
    expect(options.headers['Authorization']).toBe('Bearer test-jwt-token');
    expect(result).toEqual({ status: 'UP' });
  });

  it('handles 401 Unauthorized by clearing token and invoking callback', async () => {
    setStoredToken('expired-jwt');
    const unauthorizedHandler = vi.fn();
    setUnauthorizedHandler(unauthorizedHandler);

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({
        timestamp: new Date().toISOString(),
        status: 401,
        error: 'UNAUTHORIZED',
        message: 'JWT expired',
      }),
    });

    await expect(request('/auth/me')).rejects.toThrow(ApiError);
    expect(unauthorizedHandler).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('amoudi_auth_token')).toBeNull();
  });

  it('throws ApiError with server details on 400 Bad Request', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        timestamp: new Date().toISOString(),
        status: 400,
        error: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: ['Username is required'],
      }),
    });

    try {
      await request('/auth/login', { method: 'POST', body: JSON.stringify({}) });
      expect.fail('Should have thrown ApiError');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.status).toBe(400);
      expect(apiErr.error).toBe('VALIDATION_ERROR');
      expect(apiErr.details).toContain('Username is required');
    }
  });

  it('throws network ApiError on connection failure', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Failed to fetch'));

    try {
      await request('/health');
      expect.fail('Should have thrown network ApiError');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.status).toBe(0);
      expect(apiErr.error).toBe('NETWORK_ERROR');
    }
  });
});
