import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { useAuth, useIsAdmin, useAuthGuard } from '../../hooks/useAuth';
import { AuthContext } from '../../contexts/auth-context';
import type { AuthContextValue, User } from '../../types';

// ─── Helper: crea un valor de contexto con overrides ─────────────────────────
const buildContextValue = (overrides: Partial<AuthContextValue> = {}): AuthContextValue => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  refreshUser: vi.fn(),
  ...overrides,
});

const buildWrapper = (value: AuthContextValue) =>
  ({ children }: { children: ReactNode }) => (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );

const mockAdminUser: User = {
  id: '1',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin',
};

const mockRegularUser: User = {
  id: '2',
  name: 'Regular User',
  email: 'user@example.com',
  role: 'user',
};

// ─── useAuth ─────────────────────────────────────────────────────────────────
describe('useAuth', () => {
  it('devuelve el contexto cuando se usa dentro del AuthProvider', () => {
    const contextValue = buildContextValue({ isAuthenticated: true, token: 'token-123', user: mockRegularUser });
    const wrapper = buildWrapper(contextValue);

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.token).toBe('token-123');
    expect(result.current.user).toEqual(mockRegularUser);
  });

  it('lanza un error si se usa fuera del AuthProvider', () => {
    // renderHook sin wrapper => contexto undefined
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth debe usarse dentro de <AuthProvider>');
  });

  it('expone las funciones login, logout, register y refreshUser', () => {
    const contextValue = buildContextValue();
    const wrapper = buildWrapper(contextValue);

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.logout).toBe('function');
    expect(typeof result.current.register).toBe('function');
    expect(typeof result.current.refreshUser).toBe('function');
  });
});

// ─── useIsAdmin ───────────────────────────────────────────────────────────────
describe('useIsAdmin', () => {
  it('retorna true cuando el usuario tiene rol admin', () => {
    const contextValue = buildContextValue({ user: mockAdminUser });
    const wrapper = buildWrapper(contextValue);

    const { result } = renderHook(() => useIsAdmin(), { wrapper });

    expect(result.current).toBe(true);
  });

  it('retorna false cuando el usuario no es admin', () => {
    const contextValue = buildContextValue({ user: mockRegularUser });
    const wrapper = buildWrapper(contextValue);

    const { result } = renderHook(() => useIsAdmin(), { wrapper });

    expect(result.current).toBe(false);
  });

  it('retorna false cuando no hay usuario autenticado', () => {
    const contextValue = buildContextValue({ user: null });
    const wrapper = buildWrapper(contextValue);

    const { result } = renderHook(() => useIsAdmin(), { wrapper });

    expect(result.current).toBe(false);
  });
});

// ─── useAuthGuard ─────────────────────────────────────────────────────────────
describe('useAuthGuard', () => {
  it('devuelve isAuthenticated, isLoading y user', () => {
    const contextValue = buildContextValue({
      isAuthenticated: true,
      isLoading: false,
      user: mockAdminUser,
    });
    const wrapper = buildWrapper(contextValue);

    const { result } = renderHook(() => useAuthGuard(), { wrapper });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.user).toEqual(mockAdminUser);
  });

  it('devuelve isLoading=true mientras carga', () => {
    const contextValue = buildContextValue({ isLoading: true });
    const wrapper = buildWrapper(contextValue);

    const { result } = renderHook(() => useAuthGuard(), { wrapper });

    expect(result.current.isLoading).toBe(true);
  });
});
