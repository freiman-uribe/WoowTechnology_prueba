import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import type { ReactNode } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import AdminRoute from '../../components/AdminRoute';
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

const renderWithRouter = (
  component: ReactNode,
  contextValue: AuthContextValue,
  initialPath = '/',
) =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthContext.Provider value={contextValue}>
        <Routes>
          <Route element={component}>
            <Route path="/" element={<div>Contenido protegido</div>} />
          </Route>
          <Route path="/login" element={<div>Página de Login</div>} />
          <Route path="/profile" element={<div>Página de Perfil</div>} />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>,
  );

const mockAdminUser: User = {
  id: '1',
  name: 'Admin',
  email: 'admin@example.com',
  role: 'admin',
};

const mockUser: User = {
  id: '2',
  name: 'User',
  email: 'user@example.com',
  role: 'user',
};

// ─── ProtectedRoute ───────────────────────────────────────────────────────────
describe('ProtectedRoute', () => {
  it('muestra el spinner mientras isLoading=true', () => {
    const ctx = buildContextValue({ isLoading: true });
    const { container } = renderWithRouter(<ProtectedRoute />, ctx);

    // El spinner tiene la clase animate-spin
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('redirige a /login si el usuario no está autenticado', () => {
    const ctx = buildContextValue({ isAuthenticated: false, isLoading: false });
    renderWithRouter(<ProtectedRoute />, ctx);

    expect(screen.getByText('Página de Login')).toBeInTheDocument();
  });

  it('renderiza el Outlet si el usuario está autenticado', () => {
    const ctx = buildContextValue({
      isAuthenticated: true,
      isLoading: false,
      user: mockUser,
      token: 'token-123',
    });
    renderWithRouter(<ProtectedRoute />, ctx);

    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
  });
});

// ─── AdminRoute ───────────────────────────────────────────────────────────────
describe('AdminRoute', () => {
  it('muestra el spinner mientras isLoading=true', () => {
    const ctx = buildContextValue({ isLoading: true });
    const { container } = renderWithRouter(<AdminRoute />, ctx);

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('redirige a /login si el usuario no está autenticado', () => {
    const ctx = buildContextValue({ isAuthenticated: false, isLoading: false });
    renderWithRouter(<AdminRoute />, ctx);

    expect(screen.getByText('Página de Login')).toBeInTheDocument();
  });

  it('redirige a /profile si el usuario no es admin', () => {
    const ctx = buildContextValue({
      isAuthenticated: true,
      isLoading: false,
      user: mockUser,
      token: 'token-123',
    });
    renderWithRouter(<AdminRoute />, ctx);

    expect(screen.getByText('Página de Perfil')).toBeInTheDocument();
  });

  it('renderiza el Outlet si el usuario es admin', () => {
    const ctx = buildContextValue({
      isAuthenticated: true,
      isLoading: false,
      user: mockAdminUser,
      token: 'token-admin',
    });
    renderWithRouter(<AdminRoute />, ctx);

    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
  });
});
