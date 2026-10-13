import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { AuthContextType, AuthState, LoginCredentials } from './auth.types';
import { User, ApiError } from '@/types/api.types';
import { loginApi, getCurrentUserApi } from '@/api/auth';
import { getStoredToken, setStoredToken, removeStoredToken, setUnauthorizedHandler } from '@/api/client';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(() => {
    const token = getStoredToken();
    return {
      user: null,
      token,
      isAuthenticated: false,
      isLoading: true,
      error: null,
    };
  });

  const logout = useCallback(() => {
    removeStoredToken();
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, []);

  // Register the global 401 callback
  useEffect(() => {
    setUnauthorizedHandler(logout);
  }, [logout]);

  // Initial session hydration
  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      const token = getStoredToken();
      if (!token) {
        if (isMounted) {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
        return;
      }

      try {
        const user = await getCurrentUserApi();
        if (isMounted) {
          setState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        }
      } catch {
        if (isMounted) {
          removeStoredToken();
          setState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<User> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const loginData = await loginApi(credentials);
      setStoredToken(loginData.accessToken);

      // Verify and fetch authoritative profile via /api/v1/auth/me
      const user = await getCurrentUserApi();

      setState({
        user,
        token: loginData.accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return user;
    } catch (err) {
      removeStoredToken();
      let errorMessage = 'Authentication failed. Please check your credentials.';
      if (err instanceof ApiError) {
        if (err.status === 401) {
          errorMessage = 'Invalid username or password.';
        } else if (err.message) {
          errorMessage = err.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });

      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const contextValue = useMemo<AuthContextType>(
    () => ({
      ...state,
      login,
      logout,
      clearError,
    }),
    [state, login, logout, clearError]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
