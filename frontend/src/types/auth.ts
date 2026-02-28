// ─── Tipos del contexto de autenticación ─────────────────────────────────────

import type { User } from './models';
import type { LoginCredentials, RegisterData } from './api';

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}
