import { apiClient } from './client';
import { User } from '@/types/api.types';
import { LoginCredentials, LoginResponseData } from '@/auth/auth.types';

/**
 * Authenticates user credentials via POST /api/v1/auth/login
 */
export async function loginApi(credentials: LoginCredentials): Promise<LoginResponseData> {
  return apiClient.post<LoginResponseData>('/auth/login', credentials);
}

/**
 * Retrieves the current user's profile via GET /api/v1/auth/me
 */
export async function getCurrentUserApi(): Promise<User> {
  return apiClient.get<User>('/auth/me');
}
