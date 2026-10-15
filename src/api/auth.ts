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

export interface ForgotPasswordResponse {
  message: string;
}

export interface VerifyResetOtpResponse {
  resetToken: string;
  expiresInSeconds: number;
}

export interface ResetPasswordPayload {
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Initiates password recovery by requesting a 6-digit OTP sent to the shared company inbox.
 */
export async function forgotPasswordApi(username: string): Promise<ForgotPasswordResponse> {
  return apiClient.post<ForgotPasswordResponse>('/auth/forgot-password', { username });
}

/**
 * Verifies the 6-digit OTP and retrieves a short-lived single-use reset token.
 */
export async function verifyResetOtpApi(username: string, otp: string): Promise<VerifyResetOtpResponse> {
  return apiClient.post<VerifyResetOtpResponse>('/auth/verify-reset-otp', { username, otp });
}

/**
 * Sets a new password using a validated single-use reset token.
 */
export async function resetPasswordApi(payload: ResetPasswordPayload): Promise<void> {
  return apiClient.post<void>('/auth/reset-password', payload);
}

