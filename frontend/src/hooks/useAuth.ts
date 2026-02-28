import { useContext } from 'react';
import { AuthContext } from '../contexts/auth-context';
import type { AuthContextValue } from '../types';

/**
 * Hook principal de autenticación.
 * Accede al AuthContext y lanza un error descriptivo si se usa fuera de <AuthProvider>.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return context;
}

/**
 * Devuelve true si el usuario autenticado tiene rol 'admin'.
 * Útil para renderizado condicional sin tener que desestructurar el contexto completo.
 */
export function useIsAdmin(): boolean {
  const { user } = useAuth();
  return user?.role === 'admin';
}

/**
 * Devuelve solo los campos de estado necesarios para guards de ruta.
 * Evita suscripciones innecesarias a cambios de user o token.
 */
export function useAuthGuard() {
  const { isAuthenticated, isLoading, user } = useAuth();
  return { isAuthenticated, isLoading, user };
}
