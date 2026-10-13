import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { AmoudiMark } from '@/components/branding/AmoudiMark';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError('');

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setValidationError('Username is required.');
      return;
    }
    if (!password) {
      setValidationError('Password is required.');
      return;
    }

    try {
      await login({ username: trimmedUsername, password });
      navigate(from, { replace: true });
    } catch {
      // Error handled by AuthContext state
    }
  };

  const handlePreFill = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setValidationError('');
    clearError();
  };

  const activeError = validationError || error;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Amoudi Brand Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <AmoudiMark size={56} onDark={false} />
          </div>
          <h1 className="font-josefin font-bold text-2xl tracking-widest text-[#0F2E22]">
            AMOUDI TRAVEL SERVICE
          </h1>
          <p className="text-sm text-slate-500 mt-1" style={{ color: '#CBA326' }}>Finance Management System</p>
          <p className="text-xs text-slate-500 mt-0.5">Travel made for every one!</p>
        </div>

        {/* Login Form Card */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <Input
                label="Username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                autoComplete="username"
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={isLoading}
                required
              />
            </div>

            {activeError && (
              <div
                className="text-xs text-red-700 bg-red-50 border border-red-200 px-3.5 py-2.5 rounded-md flex items-start gap-2"
                role="alert"
              >
                <svg className="w-4 h-4 shrink-0 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round" />
                  <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span>{activeError}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          {/* Development Quick Credentials (DEV mode only) */}
          {import.meta.env.DEV && (
            <div className="mt-6 pt-4 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-400 mb-2">Development Credentials:</p>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => handlePreFill('finance_user', 'Admin@12345')}
                  className="w-full text-left px-3 py-2 rounded-md text-xs text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>
                    <span className="font-semibold text-slate-800">Finance:</span> finance_user
                  </span>
                  <span className="text-[10px] text-slate-400">Click to fill</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePreFill('admin', 'Admin@12345')}
                  className="w-full text-left px-3 py-2 rounded-md text-xs text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>
                    <span className="font-semibold text-slate-800">Manager:</span> admin
                  </span>
                  <span className="text-[10px] text-slate-400">Click to fill</span>
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Amoudi Travel Service · Internal Finance System
        </p>
      </div>
    </div>
  );
};
