import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { IEye, IEyeOff, ICheck, IAlert, IArrowLeft, IMail } from '@/components/ui/Icons';
import { forgotPasswordApi, verifyResetOtpApi, resetPasswordApi } from '@/api/auth';
import { ApiError } from '@/types/api.types';

export interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (username: string) => void;
}

type RecoveryStep = 'REQUEST' | 'VERIFY' | 'RESET' | 'SUCCESS';

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<RecoveryStep>('REQUEST');
  const [username, setUsername] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  const [resendCooldown, setResendCooldown] = useState(30);

  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep('REQUEST');
      setUsername('');
      setOtpDigits(['', '', '', '', '', '']);
      setResetToken('');
      setNewPassword('');
      setConfirmPassword('');
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setIsLoading(false);
      setError(null);
      setNotice(null);
      setCountdown(300);
      setResendCooldown(30);
    }
  }, [isOpen]);

  // Countdown timer for OTP expiry and resend cooldown in VERIFY step
  useEffect(() => {
    if (step !== 'VERIFY' || !isOpen) return;

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [step, isOpen]);

  // Format MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Password complexity checks
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial && passwordsMatch;

  // Handle Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) {
      setError('Username is required.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await forgotPasswordApi(trimmed);
      setNotice(response.message);
      setStep('VERIFY');
      setCountdown(300);
      setResendCooldown(30);
      setOtpDigits(['', '', '', '', '', '']);
      setTimeout(() => {
        digitRefs.current[0]?.focus();
      }, 100);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to request recovery code. Please check your connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isLoading) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await forgotPasswordApi(username.trim());
      setNotice(response.message);
      setCountdown(300);
      setResendCooldown(30);
      setOtpDigits(['', '', '', '', '', '']);
      digitRefs.current[0]?.focus();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to resend recovery code. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP digit changes with leading-zero and paste preservation
  const handleDigitChange = (index: number, val: string) => {
    // Only allow numbers
    const cleanVal = val.replace(/\D/g, '');
    if (!cleanVal) {
      const updated = [...otpDigits];
      updated[index] = '';
      setOtpDigits(updated);
      return;
    }

    const updated = [...otpDigits];
    // If user pasted multiple digits into one field
    if (cleanVal.length > 1) {
      const digits = cleanVal.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        updated[i] = digits[i] || '';
      }
      setOtpDigits(updated);
      const nextIndex = Math.min(digits.length, 5);
      digitRefs.current[nextIndex]?.focus();
      return;
    }

    updated[index] = cleanVal.charAt(cleanVal.length - 1);
    setOtpDigits(updated);

    // Auto-advance to next box
    if (index < 5 && cleanVal) {
      digitRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      digitRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const updated = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      updated[i] = pastedData[i] || '';
    }
    setOtpDigits(updated);
    const focusIndex = Math.min(pastedData.length, 5);
    digitRefs.current[focusIndex]?.focus();
  };

  // Handle Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = otpDigits.join('');
    if (otp.length !== 6) {
      setError('Please enter all 6 numeric digits of your verification code.');
      return;
    }

    if (countdown === 0) {
      setError('Verification code has expired. Please request a new code.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await verifyResetOtpApi(username.trim(), otp);
      setResetToken(response.resetToken);
      setStep('RESET');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Verification failed. Please check the code and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    if (!isPasswordValid) {
      setError('Password does not meet the complexity requirements.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await resetPasswordApi({
        resetToken,
        newPassword,
        confirmPassword,
      });
      setStep('SUCCESS');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to reset password. The recovery session may have expired.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    onSuccess(username.trim());
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        step === 'REQUEST'
          ? 'Recover Account Password'
          : step === 'VERIFY'
          ? 'Enter Verification Code'
          : step === 'RESET'
          ? 'Set New Password'
          : 'Password Reset Successful'
      }
      description={
        step === 'REQUEST'
          ? 'Enter your system username. A 6-digit recovery code will be dispatched to the company inbox.'
          : step === 'VERIFY'
          ? `Enter the 6-digit verification code sent for user '${username}'.`
          : step === 'RESET'
          ? 'Create a secure new password for your account.'
          : undefined
      }
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Step Indicator */}
        {step !== 'SUCCESS' && (
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  step === 'REQUEST'
                    ? 'bg-[#0F2E22] text-white'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {step === 'VERIFY' || step === 'RESET' ? '✓' : '1'}
              </span>
              <span className={`text-xs ${step === 'REQUEST' ? 'font-medium text-slate-800' : 'text-slate-400'}`}>
                Account
              </span>
            </div>

            <div className="h-0.5 w-8 bg-slate-200" />

            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  step === 'VERIFY'
                    ? 'bg-[#0F2E22] text-white'
                    : step === 'RESET'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {step === 'RESET' ? '✓' : '2'}
              </span>
              <span className={`text-xs ${step === 'VERIFY' ? 'font-medium text-slate-800' : 'text-slate-400'}`}>
                Verify Code
              </span>
            </div>

            <div className="h-0.5 w-8 bg-slate-200" />

            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  step === 'RESET'
                    ? 'bg-[#0F2E22] text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                3
              </span>
              <span className={`text-xs ${step === 'RESET' ? 'font-medium text-slate-800' : 'text-slate-400'}`}>
                New Password
              </span>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div
            className="text-xs text-red-700 bg-red-50 border border-red-200 p-3 rounded-md flex items-start gap-2.5 animate-in fade-in duration-150"
            role="alert"
          >
            <IAlert size={16} className="text-red-500 shrink-0 mt-0.5" />
            <span className="flex-1 leading-relaxed">{error}</span>
          </div>
        )}

        {/* ================= STEP 1: REQUEST OTP ================= */}
        {step === 'REQUEST' && (
          <form onSubmit={handleRequestOtp} className="space-y-4" noValidate>
            <div>
              <Input
                label="Username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter your system username"
                autoComplete="username"
                disabled={isLoading}
                required
                autoFocus
              />
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-md p-3 text-xs text-slate-600 flex items-start gap-2.5">
              <IMail size={16} className="text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-700">Company Recovery Delivery</p>
                <p className="text-slate-500 mt-0.5">
                  Verification codes are delivered to the centralized company recovery inbox for security auditability.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" size="md" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
                Send Recovery Code
              </Button>
            </div>
          </form>
        )}

        {/* ================= STEP 2: VERIFY OTP ================= */}
        {step === 'VERIFY' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4" noValidate>
            {notice && (
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-md text-xs text-emerald-800 flex items-start gap-2">
                <ICheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>{notice}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 text-center">
                6-Digit Verification Code
              </label>

              {/* 6 Digit Input Boxes */}
              <div className="flex justify-center items-center gap-2" onPaste={handlePaste}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      digitRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                    aria-label={`Digit ${idx + 1} of 6`}
                    className="w-11 h-13 text-center text-xl font-bold font-mono text-slate-800 bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:border-[#0F2E22] focus:ring-2 focus:ring-[#CBA326] focus:outline-none transition-all"
                    disabled={isLoading}
                    autoComplete="one-time-code"
                  />
                ))}
              </div>
            </div>

            {/* Timer and Resend Controls */}
            <div className="flex items-center justify-between text-xs pt-1 px-1">
              <span className={`font-medium ${countdown < 60 ? 'text-red-600' : 'text-slate-500'}`}>
                {countdown > 0 ? (
                  <>Expires in: <strong className="font-mono">{formatTimer(countdown)}</strong></>
                ) : (
                  <span className="text-red-600 font-medium">Code expired</span>
                )}
              </span>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || isLoading}
                className="text-xs font-medium text-[#0F2E22] hover:text-[#CBA326] disabled:text-slate-400 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : 'Resend Code'}
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => {
                  setError(null);
                  setStep('REQUEST');
                }}
                disabled={isLoading}
                className="flex items-center gap-1.5"
              >
                <IArrowLeft size={14} />
                <span>Change Username</span>
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                disabled={otpDigits.join('').length !== 6 || countdown === 0}
              >
                Verify Code
              </Button>
            </div>
          </form>
        )}

        {/* ================= STEP 3: RESET PASSWORD ================= */}
        {step === 'RESET' && (
          <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
            <div>
              <Input
                label="New Password"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter new password"
                autoComplete="new-password"
                disabled={isLoading}
                required
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    className="text-slate-400 hover:text-slate-600 focus:outline-none p-1 cursor-pointer"
                  >
                    {showNewPassword ? <IEyeOff size={16} /> : <IEye size={16} />}
                  </button>
                }
              />
            </div>

            <div>
              <Input
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Confirm your new password"
                autoComplete="new-password"
                disabled={isLoading}
                required
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    className="text-slate-400 hover:text-slate-600 focus:outline-none p-1 cursor-pointer"
                  >
                    {showConfirmPassword ? <IEyeOff size={16} /> : <IEye size={16} />}
                  </button>
                }
              />
            </div>

            {/* Password Policy Checklist */}
            <div className="bg-slate-50 border border-slate-200 rounded-md p-3 space-y-1.5 text-xs text-slate-600">
              <p className="font-semibold text-slate-700 mb-1">Password Requirements:</p>
              <div className="grid grid-cols-2 gap-1.5">
                <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-700' : 'text-slate-400'}`}>
                  <span>{hasMinLength ? '✓' : '•'}</span>
                  <span>At least 8 characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-700' : 'text-slate-400'}`}>
                  <span>{hasUpper ? '✓' : '•'}</span>
                  <span>Uppercase letter (A-Z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasLower ? 'text-emerald-700' : 'text-slate-400'}`}>
                  <span>{hasLower ? '✓' : '•'}</span>
                  <span>Lowercase letter (a-z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-700' : 'text-slate-400'}`}>
                  <span>{hasNumber ? '✓' : '•'}</span>
                  <span>Numeric digit (0-9)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-700' : 'text-slate-400'}`}>
                  <span>{hasSpecial ? '✓' : '•'}</span>
                  <span>Special character</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordsMatch ? 'text-emerald-700' : 'text-slate-400'}`}>
                  <span>{passwordsMatch ? '✓' : '•'}</span>
                  <span>Passwords match</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" size="md" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" isLoading={isLoading} disabled={!isPasswordValid}>
                Reset Password
              </Button>
            </div>
          </form>
        )}

        {/* ================= STEP 4: SUCCESS ================= */}
        {step === 'SUCCESS' && (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <ICheck size={28} />
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-800">Password Successfully Updated</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Your new password has been securely saved. You can now return to the login screen and sign in with your updated credentials.
              </p>
            </div>

            <Button
              type="button"
              variant="primary"
              size="md"
              className="w-full"
              onClick={handleFinish}
            >
              Sign In with New Password
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};
