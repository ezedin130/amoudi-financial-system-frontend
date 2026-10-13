import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NonIataTable } from '../NonIataTable';
import { NonIata } from '@/types/nonIata.types';
import { AuthContext } from '@/auth/AuthContext';
import { AuthContextType } from '@/auth/auth.types';

const mockFinanceContext: AuthContextType = {
  user: {
    id: 1,
    username: 'finance_officer',
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
    username: 'gm_user',
    fullName: 'General Manager',
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

const mockAgencies: NonIata[] = [
  {
    id: 11,
    code: 'BAT01',
    name: 'Bati Travel Agency',
    status: 'ACTIVE',
    contactName: 'Abebe Bikila',
    phone: '+251911223344',
    email: 'contact@bati.com',
    createdAt: '2026-09-01T10:00:00',
    updatedAt: '2026-09-10T12:00:00',
  },
  {
    id: 12,
    code: 'EMR01',
    name: 'Emran Travel',
    status: 'INACTIVE',
    contactName: null,
    phone: null,
    email: null,
    createdAt: '2026-09-02T10:00:00',
    updatedAt: '2026-09-02T10:00:00',
  },
];

describe('NonIataTable', () => {
  it('renders table headers and agency rows correctly', () => {
    render(
      <AuthContext.Provider value={mockFinanceContext}>
        <NonIataTable
          items={mockAgencies}
          isLoading={false}
          onViewAccount={vi.fn()}
        />
      </AuthContext.Provider>
    );

    expect(screen.getByText('Bati Travel Agency')).toBeInTheDocument();
    expect(screen.getByText('BAT01')).toBeInTheDocument();
    expect(screen.getByText('Abebe Bikila')).toBeInTheDocument();
    expect(screen.getByText('+251911223344')).toBeInTheDocument();
    expect(screen.getByText('contact@bati.com')).toBeInTheDocument();
    expect(screen.getByText('Emran Travel')).toBeInTheDocument();
    expect(screen.getByText('EMR01')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('renders Edit and Status buttons for FINANCE role', () => {
    const onEdit = vi.fn();
    const onToggle = vi.fn();

    render(
      <AuthContext.Provider value={mockFinanceContext}>
        <NonIataTable
          items={mockAgencies}
          isLoading={false}
          onViewAccount={vi.fn()}
          onEditAccount={onEdit}
          onToggleStatus={onToggle}
        />
      </AuthContext.Provider>
    );

    expect(screen.getByRole('button', { name: 'Edit Bati Travel Agency' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Deactivate' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Activate' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Edit Bati Travel Agency' }));
    expect(onEdit).toHaveBeenCalledWith(mockAgencies[0]);

    fireEvent.click(screen.getByRole('button', { name: 'Deactivate' }));
    expect(onToggle).toHaveBeenCalledWith(mockAgencies[0]);
  });

  it('hides Edit and Status buttons for GENERAL_MANAGER role (read-only)', () => {
    render(
      <AuthContext.Provider value={mockGmContext}>
        <NonIataTable
          items={mockAgencies}
          isLoading={false}
          onViewAccount={vi.fn()}
          onEditAccount={vi.fn()}
          onToggleStatus={vi.fn()}
        />
      </AuthContext.Provider>
    );

    expect(screen.queryByRole('button', { name: 'Edit Bati Travel Agency' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Deactivate' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Activate' })).not.toBeInTheDocument();

    // But View Account is still present
    const viewButtons = screen.getAllByRole('button', { name: /View Account/i });
    expect(viewButtons.length).toBe(2);
  });

  it('renders empty state when no agencies are present', () => {
    render(
      <AuthContext.Provider value={mockFinanceContext}>
        <NonIataTable
          items={[]}
          isLoading={false}
          onViewAccount={vi.fn()}
        />
      </AuthContext.Provider>
    );

    expect(screen.getByText('No Non-IATA accounts found')).toBeInTheDocument();
  });
});
