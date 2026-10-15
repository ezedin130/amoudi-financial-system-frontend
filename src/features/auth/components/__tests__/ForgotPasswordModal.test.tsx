import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ForgotPasswordModal } from '../ForgotPasswordModal';
import * as authApi from '@/api/auth';
import { ApiError } from '@/types/api.types';

describe('ForgotPasswordModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    mockOnClose.mockReset();
    mockOnSuccess.mockReset();
  });

  const renderModal = (isOpen = true) => {
    return render(
      <ForgotPasswordModal
        isOpen={isOpen}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );
  };

  it('does not render when isOpen is false', () => {
    renderModal(false);
    expect(screen.queryByText(/recover account password/i)).not.toBeInTheDocument();
  });

  it('renders Step 1 (Request OTP) with username input and cancel button', () => {
    renderModal(true);

    expect(screen.getByText('Recover Account Password')).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send recovery code/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('validates empty username on Step 1', async () => {
    renderModal(true);

    fireEvent.click(screen.getByRole('button', { name: /send recovery code/i }));

    expect(screen.getByText('Username is required.')).toBeInTheDocument();
  });

  it('handles Step 1 submission, calls forgotPasswordApi, and advances to Step 2', async () => {
    vi.spyOn(authApi, 'forgotPasswordApi').mockResolvedValue({
      message: 'If an active account exists, a 6-digit code has been sent.',
    });

    renderModal(true);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'finance_user' } });
    fireEvent.click(screen.getByRole('button', { name: /send recovery code/i }));

    await waitFor(() => {
      expect(authApi.forgotPasswordApi).toHaveBeenCalledWith('finance_user');
      expect(screen.getByText('Enter Verification Code')).toBeInTheDocument();
      expect(screen.getByLabelText('Digit 1 of 6')).toBeInTheDocument();
    });
  });

  it('handles Step 1 API failure cleanly', async () => {
    vi.spyOn(authApi, 'forgotPasswordApi').mockRejectedValue(
      new ApiError(400, 'BAD_REQUEST', 'Unable to process request.')
    );

    renderModal(true);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'finance_user' } });
    fireEvent.click(screen.getByRole('button', { name: /send recovery code/i }));

    await waitFor(() => {
      expect(screen.getByText('Unable to process request.')).toBeInTheDocument();
    });
  });

  it('allows pasting 6-digit OTP in Step 2 preserving leading zeroes', async () => {
    vi.spyOn(authApi, 'forgotPasswordApi').mockResolvedValue({
      message: 'Code sent.',
    });

    renderModal(true);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'finance_user' } });
    fireEvent.click(screen.getByRole('button', { name: /send recovery code/i }));

    await waitFor(() => {
      expect(screen.getByText('Enter Verification Code')).toBeInTheDocument();
    });

    // Paste "042918" into the OTP box
    const firstDigitInput = screen.getByLabelText('Digit 1 of 6') as HTMLInputElement;
    fireEvent.paste(firstDigitInput, {
      clipboardData: {
        getData: () => '042918',
      },
    });

    expect((screen.getByLabelText('Digit 1 of 6') as HTMLInputElement).value).toBe('0');
    expect((screen.getByLabelText('Digit 2 of 6') as HTMLInputElement).value).toBe('4');
    expect((screen.getByLabelText('Digit 3 of 6') as HTMLInputElement).value).toBe('2');
    expect((screen.getByLabelText('Digit 4 of 6') as HTMLInputElement).value).toBe('9');
    expect((screen.getByLabelText('Digit 5 of 6') as HTMLInputElement).value).toBe('1');
    expect((screen.getByLabelText('Digit 6 of 6') as HTMLInputElement).value).toBe('8');

    const verifyButton = screen.getByRole('button', { name: /verify code/i });
    expect(verifyButton).not.toBeDisabled();
  });

  it('calls verifyResetOtpApi and advances to Step 3 on valid OTP', async () => {
    vi.spyOn(authApi, 'forgotPasswordApi').mockResolvedValue({ message: 'Code sent.' });
    vi.spyOn(authApi, 'verifyResetOtpApi').mockResolvedValue({
      resetToken: 'valid-secure-reset-token-xyz',
      expiresInSeconds: 600,
    });

    renderModal(true);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'finance_user' } });
    fireEvent.click(screen.getByRole('button', { name: /send recovery code/i }));

    await waitFor(() => {
      expect(screen.getByText('Enter Verification Code')).toBeInTheDocument();
    });

    const firstDigitInput = screen.getByLabelText('Digit 1 of 6');
    fireEvent.paste(firstDigitInput, {
      clipboardData: { getData: () => '042918' },
    });

    fireEvent.click(screen.getByRole('button', { name: /verify code/i }));

    await waitFor(() => {
      expect(authApi.verifyResetOtpApi).toHaveBeenCalledWith('finance_user', '042918');
      expect(screen.getByText('Set New Password')).toBeInTheDocument();
      expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
    });
  });

  it('displays attempt error if OTP is incorrect', async () => {
    vi.spyOn(authApi, 'forgotPasswordApi').mockResolvedValue({ message: 'Code sent.' });
    vi.spyOn(authApi, 'verifyResetOtpApi').mockRejectedValue(
      new ApiError(400, 'INVALID_OTP', 'Invalid verification code. Attempts remaining: 3')
    );

    renderModal(true);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'finance_user' } });
    fireEvent.click(screen.getByRole('button', { name: /send recovery code/i }));

    await waitFor(() => {
      expect(screen.getByText('Enter Verification Code')).toBeInTheDocument();
    });

    const firstDigitInput = screen.getByLabelText('Digit 1 of 6');
    fireEvent.paste(firstDigitInput, {
      clipboardData: { getData: () => '999999' },
    });

    fireEvent.click(screen.getByRole('button', { name: /verify code/i }));

    await waitFor(() => {
      expect(screen.getByText(/Attempts remaining: 3/i)).toBeInTheDocument();
    });
  });

  it('allows navigation back to Step 1 via "Change Username" button', async () => {
    vi.spyOn(authApi, 'forgotPasswordApi').mockResolvedValue({ message: 'Code sent.' });

    renderModal(true);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'finance_user' } });
    fireEvent.click(screen.getByRole('button', { name: /send recovery code/i }));

    await waitFor(() => {
      expect(screen.getByText('Enter Verification Code')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /change username/i }));

    expect(screen.getByText('Recover Account Password')).toBeInTheDocument();
  });

  it('handles full Step 3 password reset with policy validation and reaches Step 4 Success', async () => {
    vi.spyOn(authApi, 'forgotPasswordApi').mockResolvedValue({ message: 'Code sent.' });
    vi.spyOn(authApi, 'verifyResetOtpApi').mockResolvedValue({
      resetToken: 'valid-reset-token-abc',
      expiresInSeconds: 600,
    });
    vi.spyOn(authApi, 'resetPasswordApi').mockResolvedValue(undefined);

    renderModal(true);

    // Step 1
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'finance_user' } });
    fireEvent.click(screen.getByRole('button', { name: /send recovery code/i }));

    // Step 2
    await waitFor(() => screen.getByText('Enter Verification Code'));
    fireEvent.paste(screen.getByLabelText('Digit 1 of 6'), {
      clipboardData: { getData: () => '123456' },
    });
    fireEvent.click(screen.getByRole('button', { name: /verify code/i }));

    // Step 3
    await waitFor(() => screen.getByText('Set New Password'));

    const newPassInput = screen.getByLabelText(/^new password$/i);
    const confirmPassInput = screen.getByLabelText(/confirm new password/i);

    // Enter weak password first -> Reset button should be disabled
    fireEvent.change(newPassInput, { target: { value: 'weak' } });
    fireEvent.change(confirmPassInput, { target: { value: 'weak' } });
    expect(screen.getByRole('button', { name: /reset password/i })).toBeDisabled();

    // Enter strong matching password
    fireEvent.change(newPassInput, { target: { value: 'NewSecurePassword@2026' } });
    fireEvent.change(confirmPassInput, { target: { value: 'NewSecurePassword@2026' } });
    expect(screen.getByRole('button', { name: /reset password/i })).not.toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    await waitFor(() => {
      expect(authApi.resetPasswordApi).toHaveBeenCalledWith({
        resetToken: 'valid-reset-token-abc',
        newPassword: 'NewSecurePassword@2026',
        confirmPassword: 'NewSecurePassword@2026',
      });
      // Step 4 (Success)
      expect(screen.getByText('Password Successfully Updated')).toBeInTheDocument();
    });

    // Clicking finish button triggers onSuccess callback and onClose
    fireEvent.click(screen.getByRole('button', { name: /sign in with new password/i }));
    expect(mockOnSuccess).toHaveBeenCalledWith('finance_user');
    expect(mockOnClose).toHaveBeenCalled();
  });
});
