import { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User, LoginCredentials, RegisterData, AuthContextValue} from '../types';
import { authService, userService } from '../services/api';
import { AuthContext } from './auth-context';

// Re-exporta para que los importadores del barrel sigan funcionando
// export { AuthContext };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('token')
  );

  const [isLoading, setIsLoading] = useState<boolean>(!!token && !user);

  // Si hay token pero no hay user en memoria, lo recupera del backend
  useEffect(() => {
    if (token && !user) {
      setIsLoading(true);
      userService
        .getMe()
        .then((fetchedUser) => {
          setUser(fetchedUser);
          localStorage.setItem('user', JSON.stringify(fetchedUser));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setIsLoading(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    const { token: newToken, user: newUser } = await authService.login(credentials);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<void> => {
    await authService.register(data);
  }, []);

  const logout = useCallback((): void => {
    authService.logout();
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async (): Promise<void> => {
    const freshUser = await userService.getMe();
    setUser(freshUser);
    localStorage.setItem('user', JSON.stringify(freshUser));
  }, []);

  const value: AuthContextValue = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


