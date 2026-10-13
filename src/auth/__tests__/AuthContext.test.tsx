import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import * as authApi from '@/api/auth';
import { removeStoredToken, setStoredToken } from '@/api/client';
import { User, ApiError } from '@/types/api.types';

const mockFinanceUser: User = {
  id: 1,
  username: 'finance_user',
  fullName: 'Finance Officer',
  role: 'FINANCE',
  status: 'ACTIVE',
};

const TestConsumer: React.FC = () => {
  const { user, isAuthenticated, isLoading, error, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'ready'}</div>
      <div data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'unauthenticated'}</div>
      <div data-testid="username">{user?.username || 'none'}</div>
      <div data-testid="role">{user?.role || 'none'}</div>
      <div data-testid="error">{error || 'none'}</div>
      <button
        onClick={() => {
          login({ username: 'finance_user', password: 'Admin@12345' }).catch(() => {
            // Handled for test runner
          });
        }}
      >
        Log In
      </button>
      <button onClick={logout}>Log Out</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    removeStoredToken();
    vi.restoreAllMocks();
  });

  it('initializes as unauthenticated when no token is in storage', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('ready');
    expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated');
    expect(screen.getByTestId('username')).toHaveTextContent('none');
  });

  it('restores session when valid token exists in storage', async () => {
    setStoredToken('valid-token');
    vi.spyOn(authApi, 'getCurrentUserApi').mockResolvedValue(mockFinanceUser);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await act(async () => {});

    expect(screen.getByTestId('loading')).toHaveTextContent('ready');
    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    expect(screen.getByTestId('username')).toHaveTextContent('finance_user');
    expect(screen.getByTestId('role')).toHaveTextContent('FINANCE');
  });

  it('clears invalid token on hydration failure', async () => {
    setStoredToken('invalid-token');
    vi.spyOn(authApi, 'getCurrentUserApi').mockRejectedValue(
      new ApiError(401, 'UNAUTHORIZED', 'Invalid token')
    );

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await act(async () => {});

    expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated');
    expect(localStorage.getItem('amoudi_auth_token')).toBeNull();
  });

  it('successfully logs in, stores token, and updates state', async () => {
    vi.spyOn(authApi, 'loginApi').mockResolvedValue({
      accessToken: 'new-jwt-token',
      tokenType: 'Bearer',
      expiresIn: 86400,
      user: mockFinanceUser,
    });
    vi.spyOn(authApi, 'getCurrentUserApi').mockResolvedValue(mockFinanceUser);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText('Log In').click();
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    expect(screen.getByTestId('username')).toHaveTextContent('finance_user');
    expect(localStorage.getItem('amoudi_auth_token')).toBe('new-jwt-token');
  });

  it('handles login failure and sets error message', async () => {
    vi.spyOn(authApi, 'loginApi').mockRejectedValue(
      new ApiError(401, 'UNAUTHORIZED', 'Invalid credentials')
    );

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText('Log In').click();
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated');
    expect(screen.getByTestId('error')).toHaveTextContent('Invalid username or password.');
    expect(localStorage.getItem('amoudi_auth_token')).toBeNull();
  });

  it('logs out and clears authentication state and token', async () => {
    setStoredToken('valid-token');
    vi.spyOn(authApi, 'getCurrentUserApi').mockResolvedValue(mockFinanceUser);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await act(async () => {});
    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');

    await act(async () => {
      screen.getByText('Log Out').click();
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated');
    expect(screen.getByTestId('username')).toHaveTextContent('none');
    expect(localStorage.getItem('amoudi_auth_token')).toBeNull();
  });
});
