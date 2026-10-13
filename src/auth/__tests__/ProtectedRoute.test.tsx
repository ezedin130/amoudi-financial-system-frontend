import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';
import * as authContextModule from '../AuthContext';
import { User } from '@/types/api.types';

const mockFinanceUser: User = {
  id: 1,
  username: 'finance_user',
  fullName: 'Finance Officer',
  role: 'FINANCE',
  status: 'ACTIVE',
};

const mockGmUser: User = {
  id: 2,
  username: 'admin',
  fullName: 'General Manager',
  role: 'GENERAL_MANAGER',
  status: 'ACTIVE',
};

describe('ProtectedRoute', () => {
  it('shows loading indicator while authentication state is loading', () => {
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Protected Dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Verifying authentication...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Dashboard')).not.toBeInTheDocument();
  });

  it('redirects to /login when user is unauthenticated', () => {
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Protected Dashboard</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page Screen</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page Screen')).toBeInTheDocument();
    expect(screen.queryByText('Protected Dashboard')).not.toBeInTheDocument();
  });

  it('renders child component when user is authenticated', () => {
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: mockFinanceUser,
      token: 'valid-token',
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Protected Dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Dashboard')).toBeInTheDocument();
  });

  it('blocks unauthorized role and redirects to dashboard when role does not match', () => {
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: mockGmUser,
      token: 'valid-token',
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/sales-reports']}>
        <Routes>
          <Route path="/dashboard" element={<div>Dashboard Landing</div>} />
          <Route element={<ProtectedRoute allowedRoles={['FINANCE']} />}>
            <Route path="/sales-reports" element={<div>Finance Only Sales Reports</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText('Finance Only Sales Reports')).not.toBeInTheDocument();
    expect(screen.getByText('Dashboard Landing')).toBeInTheDocument();
  });
});
