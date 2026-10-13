import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NonIataListPage } from '../NonIataListPage';
import * as nonIataApi from '@/api/nonIataApi';
import { AuthContext } from '@/auth/AuthContext';
import { AuthContextType } from '@/auth/auth.types';

vi.mock('@/api/nonIataApi', () => ({
  getNonIatas: vi.fn(),
  createNonIata: vi.fn(),
  updateNonIata: vi.fn(),
  updateNonIataStatus: vi.fn(),
}));

const mockFinanceContext: AuthContextType = {
  user: {
    id: 1,
    username: 'finance_user',
    fullName: 'Finance Officer',
    role: 'FINANCE',
    status: 'ACTIVE',
  },
  token: 'mock-token',
  isAuthenticated: true,
  isLoading: false,
  error: null,
  login: vi.fn(),
  logout: vi.fn(),
  clearError: vi.fn(),
};

const mockGmContext: AuthContextType = {
  user: {
    id: 2,
    username: 'admin',
    fullName: 'System Administrator',
    role: 'GENERAL_MANAGER',
    status: 'ACTIVE',
  },
  token: 'mock-token',
  isAuthenticated: true,
  isLoading: false,
  error: null,
  login: vi.fn(),
  logout: vi.fn(),
  clearError: vi.fn(),
};

const mockPageResponse = {
  content: [
    {
      id: 11,
      code: 'BAT01',
      name: 'Bati Travel',
      status: 'ACTIVE' as const,
      contactName: 'Abebe Bikila',
      phone: '+251911223344',
      email: 'bati@test.com',
      createdAt: '2026-09-01T10:00:00',
      updatedAt: '2026-09-01T10:00:00',
    },
  ],
  pageNumber: 0,
  pageSize: 20,
  totalElements: 1,
  totalPages: 1,
  isFirst: true,
  isLast: true,
  hasNext: false,
  hasPrevious: false,
};

describe('NonIataListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Non-IATAs list and shows Add Non-IATA button for FINANCE role', async () => {
    vi.mocked(nonIataApi.getNonIatas).mockResolvedValueOnce(mockPageResponse);

    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockFinanceContext}>
          <NonIataListPage />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText('Non-IATAs')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Non-IATA/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Bati Travel')).toBeInTheDocument();
      expect(screen.getByText('BAT01')).toBeInTheDocument();
    });
  });

  it('hides Add Non-IATA button for GENERAL_MANAGER role', async () => {
    vi.mocked(nonIataApi.getNonIatas).mockResolvedValueOnce(mockPageResponse);

    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockGmContext}>
          <NonIataListPage />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText('Non-IATAs')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Add Non-IATA/i })).not.toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Bati Travel')).toBeInTheDocument();
    });
  });

  it('handles search input and queries API', async () => {
    vi.mocked(nonIataApi.getNonIatas).mockResolvedValue(mockPageResponse);

    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockFinanceContext}>
          <NonIataListPage />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText(/Search by code or agency name/i);
    fireEvent.change(searchInput, { target: { value: 'BAT' } });

    await waitFor(() => {
      expect(nonIataApi.getNonIatas).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'BAT' })
      );
    });
  });
});
