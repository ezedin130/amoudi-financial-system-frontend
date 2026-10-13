import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar } from '../Sidebar';
import * as authContextModule from '@/auth/AuthContext';
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

describe('Sidebar', () => {
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    mockLogout.mockReset();
  });

  const renderSidebar = (user: User, collapsed = false) => {
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user,
      token: 'valid-token',
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login: vi.fn(),
      logout: mockLogout,
      clearError: vi.fn(),
    });

    return render(
      <MemoryRouter>
        <Sidebar collapsed={collapsed} />
      </MemoryRouter>
    );
  };

  it('renders brand identity and user information', () => {
    renderSidebar(mockFinanceUser);

    expect(screen.getByRole('img', { name: /amoudi brand mark/i })).toBeInTheDocument();
    expect(screen.getByText('AMOUDI')).toBeInTheDocument();
    expect(screen.getByText('Finance Management')).toBeInTheDocument();
    expect(screen.getByText('Finance Officer')).toBeInTheDocument();
    expect(screen.getByText('Finance Team')).toBeInTheDocument();
  });

  it('renders collapsed state showing brand logo mark while hiding expanded text', () => {
    renderSidebar(mockFinanceUser, true);

    expect(screen.getByRole('img', { name: /amoudi brand mark/i })).toBeInTheDocument();
    expect(screen.queryByText('Finance Management')).not.toBeInTheDocument();
  });

  it('shows Sales Reports navigation link to Finance role', () => {
    renderSidebar(mockFinanceUser);

    expect(screen.getByRole('link', { name: /^dashboard$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^non-iatas$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^sales reports$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^payments$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^reports$/i })).toBeInTheDocument();
  });

  it('shows Sales Reports navigation link to General Manager role for read-only viewing', () => {
    renderSidebar(mockGmUser);

    expect(screen.getByRole('link', { name: /^dashboard$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^non-iatas$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^sales reports$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^payments$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^reports$/i })).toBeInTheDocument();
  });


  it('triggers logout when Sign Out is clicked', () => {
    renderSidebar(mockFinanceUser);

    fireEvent.click(screen.getByRole('button', { name: /sign out/i }));

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
