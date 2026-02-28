import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import LoginPage from '../../pages/LoginPage';
import { AuthContext } from '../../contexts/auth-context';
import type { AuthContextValue, User } from '../../types';

// ─── Helper ───────────────────────────────────────────────────────────────────
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

const renderLoginPage = (ctxOverrides: Partial<AuthContextValue> = {}) => {
  const contextValue = buildContextValue(ctxOverrides);
  const utils = render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthContext.Provider value={contextValue}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<div>Página de Perfil</div>} />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>,
  );
  return { ...utils, contextValue };
};

const mockUser: User = {
  id: '1',
  name: 'Juan',
  email: 'juan@example.com',
  role: 'user',
};

// ─── LoginPage ────────────────────────────────────────────────────────────────
describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza el formulario de login correctamente', () => {
    renderLoginPage();

    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    // El botón submit de tipo button (no el tab que tiene role=tab)
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('redirige a /profile si el usuario ya está autenticado', () => {
    renderLoginPage({ isAuthenticated: true, user: mockUser, token: 'token-123' });

    expect(screen.getByText('Página de Perfil')).toBeInTheDocument();
  });

  it('muestra error de validación si el email está vacío', async () => {
    renderLoginPage();

    // El botón submit (role="button"), no el tab que tiene role="tab"
    const submitBtn = screen.getByRole('button', { name: /iniciar sesión/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/el email es requerido/i)).toBeInTheDocument();
    });
  });

  it('muestra error si el email no tiene formato válido', async () => {
    renderLoginPage();

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    await userEvent.type(emailInput, 'correo-invalido');

    const submitBtn = screen.getByRole('button', { name: /iniciar sesión/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/ingresa un email válido/i)).toBeInTheDocument();
    });
  });

  it('muestra error si la contraseña está vacía', async () => {
    renderLoginPage();

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    await userEvent.type(emailInput, 'juan@example.com');

    const submitBtn = screen.getByRole('button', { name: /iniciar sesión/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/la contraseña es requerida/i)).toBeInTheDocument();
    });
  });

  it('muestra error si la contraseña tiene menos de 8 caracteres', async () => {
    renderLoginPage();

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);

    await userEvent.type(emailInput, 'juan@example.com');
    await userEvent.type(passwordInput, 'abc');

    const submitBtn = screen.getByRole('button', { name: /iniciar sesión/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/al menos 8 caracteres/i)).toBeInTheDocument();
    });
  });

  it('llama a login() con las credenciales correctas al enviar', async () => {
    const loginMock = vi.fn().mockResolvedValue(undefined);
    renderLoginPage({ login: loginMock });

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);

    await userEvent.type(emailInput, 'juan@example.com');
    await userEvent.type(passwordInput, 'password123');

    const submitBtn = screen.getByRole('button', { name: /iniciar sesión/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        email: 'juan@example.com',
        password: 'password123',
      });
    });
  });

  it('muestra error general cuando login() falla', async () => {
    const axiosError = {
      response: { data: { message: 'Credenciales incorrectas' } },
      isAxiosError: true,
    };
    const loginMock = vi.fn().mockRejectedValue(axiosError);
    renderLoginPage({ login: loginMock });

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);

    await userEvent.type(emailInput, 'juan@example.com');
    await userEvent.type(passwordInput, 'wrongpassword');

    const submitBtn = screen.getByRole('button', { name: /iniciar sesión/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/credenciales incorrectas/i)).toBeInTheDocument();
    });
  });
});
