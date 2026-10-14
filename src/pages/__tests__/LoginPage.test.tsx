import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from '../LoginPage';
import * as authContextModule from '@/auth/AuthContext';
import { User } from '@/types/api.types';

const mockFinanceUser: User = {
  id: 1,
  username: 'finance_user',
  fullName: 'Finance Officer',
  role: 'FINANCE',
  status: 'ACTIVE',
};

describe('LoginPage', () => {
  const mockLogin = vi.fn();
  const mockClearError = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    mockLogin.mockReset();
    mockClearError.mockReset();
  });

  const renderLoginPage = (error: string | null = null, isLoading = false) => {
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading,
      error,
      login: mockLogin,
      logout: vi.fn(),
      clearError: mockClearError,
    });

    return render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
  };

  it('renders all Figma login elements correctly', () => {
    renderLoginPage();

    expect(screen.getByRole('img', { name: /amoudi brand mark/i })).toBeInTheDocument();
    expect(screen.getByText('AMOUDI TRAVEL SERVICE')).toBeInTheDocument();
    expect(screen.getByText('Finance Management System')).toBeInTheDocument();
    expect(screen.getByText('Travel made for every one!')).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/development credentials/i)).toBeInTheDocument();
  });

  it('shows client-side validation error when submitting empty fields', async () => {
    renderLoginPage();

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByText('Username is required.')).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('pre-fills credentials when quick fill buttons are clicked', () => {
    renderLoginPage();

    const usernameInput = screen.getByLabelText(/username/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/^password$/i) as HTMLInputElement;

    fireEvent.click(screen.getByText(/finance:/i));
    expect(usernameInput.value).toBe('finance_user');
    expect(passwordInput.value).toBe('Admin@12345');

    fireEvent.click(screen.getByText(/manager:/i));
    expect(usernameInput.value).toBe('admin');
    expect(passwordInput.value).toBe('Admin@12345');
  });

  it('submits credentials to login handler on valid input', async () => {
    mockLogin.mockResolvedValue(mockFinanceUser);
    renderLoginPage();

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'finance_user' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'Admin@12345' } });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'finance_user',
        password: 'Admin@12345',
      });
    });
  });

  it('displays authentication error when returned from auth state', () => {
    renderLoginPage('Invalid username or password.');

    expect(screen.getByText('Invalid username or password.')).toBeInTheDocument();
  });

  describe('Password Visibility Toggle', () => {
    it('has password hidden by default and toggle button with "Show password" accessible label', () => {
      renderLoginPage();

      const passwordInput = screen.getByLabelText(/^password$/i) as HTMLInputElement;
      expect(passwordInput.type).toBe('password');

      const toggleButton = screen.getByRole('button', { name: /show password/i });
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).toHaveAttribute('type', 'button');
    });

    it('toggles password visibility from password to text and back, updating accessible label', () => {
      renderLoginPage();

      const passwordInput = screen.getByLabelText(/^password$/i) as HTMLInputElement;
      const toggleButton = screen.getByRole('button', { name: /show password/i });

      // Click to reveal password
      fireEvent.click(toggleButton);
      expect(passwordInput.type).toBe('text');
      expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument();

      // Click again to hide password
      fireEvent.click(screen.getByRole('button', { name: /hide password/i }));
      expect(passwordInput.type).toBe('password');
      expect(screen.getByRole('button', { name: /show password/i })).toBeInTheDocument();
    });

    it('preserves the entered password value across visibility toggles', () => {
      renderLoginPage();

      const passwordInput = screen.getByLabelText(/^password$/i) as HTMLInputElement;
      const toggleButton = screen.getByRole('button', { name: /show password/i });

      fireEvent.change(passwordInput, { target: { value: 'SecretPassword@2026#' } });
      expect(passwordInput.value).toBe('SecretPassword@2026#');

      // Reveal
      fireEvent.click(toggleButton);
      expect(passwordInput.type).toBe('text');
      expect(passwordInput.value).toBe('SecretPassword@2026#');

      // Hide
      fireEvent.click(screen.getByRole('button', { name: /hide password/i }));
      expect(passwordInput.type).toBe('password');
      expect(passwordInput.value).toBe('SecretPassword@2026#');
    });

    it('does not submit the form when activating the visibility toggle', () => {
      renderLoginPage();

      const toggleButton = screen.getByRole('button', { name: /show password/i });
      fireEvent.click(toggleButton);

      expect(mockLogin).not.toHaveBeenCalled();
      expect(screen.queryByText('Username is required.')).not.toBeInTheDocument();
      expect(screen.queryByText('Password is required.')).not.toBeInTheDocument();
    });

    it('submits correct credentials when password is in revealed (text) state', async () => {
      mockLogin.mockResolvedValue(mockFinanceUser);
      renderLoginPage();

      fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'admin' } });
      fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'SuperSecret123!' } });

      // Reveal password
      fireEvent.click(screen.getByRole('button', { name: /show password/i }));
      const passwordInput = screen.getByLabelText(/^password$/i) as HTMLInputElement;
      expect(passwordInput.type).toBe('text');

      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          username: 'admin',
          password: 'SuperSecret123!',
        });
      });
    });

    it('disables the toggle button when form is loading', () => {
      renderLoginPage(null, true);

      const toggleButton = screen.getByRole('button', { name: /show password/i });
      expect(toggleButton).toBeDisabled();
    });
  });
});
