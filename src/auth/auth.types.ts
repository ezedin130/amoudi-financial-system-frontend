import { User } from '@/types/api.types';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponseData {
  accessToken: string;
  tokenType: string;
  expiresIn?: number;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<User>;
  logout: () => void;
  clearError: () => void;
}
