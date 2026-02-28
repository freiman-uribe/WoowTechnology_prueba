import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService, userService, roleService } from '../../services/api';
import type { LoginResponse, User, UsersListResponse, Role } from '../../types';

// ─── Mock de axios usando vi.hoisted para capturar la instancia ───────────────
const mockAxiosInstance = vi.hoisted(() => ({
  post: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  },
}));

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance),
    isAxiosError: vi.fn(),
  },
}));

// ─── authService ─────────────────────────────────────────────────────────────
describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const mockUser: User = {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan@example.com',
    role: 'user',
  };

  const mockLoginResponse: LoginResponse = {
    token: 'fake-token-123',
    user: mockUser,
  };

  it('login() devuelve token y user correctamente', async () => {
    mockAxiosInstance.post.mockResolvedValueOnce({ data: mockLoginResponse });

    const result = await authService.login({ email: 'juan@example.com', password: 'password123' });

    expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/login', {
      email: 'juan@example.com',
      password: 'password123',
    });
    expect(result).toEqual(mockLoginResponse);
  });

  it('register() retorna mensaje de éxito', async () => {
    mockAxiosInstance.post.mockResolvedValueOnce({ data: { message: 'Usuario creado exitosamente' } });

    const result = await authService.register({
      name: 'Juan',
      email: 'juan@example.com',
      password: 'password123',
    });

    expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/register', {
      name: 'Juan',
      email: 'juan@example.com',
      password: 'password123',
    });
    expect(result.message).toBe('Usuario creado exitosamente');
  });

  it('logout() elimina token y user del localStorage', () => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user', JSON.stringify(mockUser));

    authService.logout();

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});

// ─── userService ─────────────────────────────────────────────────────────────
describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUser: User = {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan@example.com',
    role: 'user',
  };

  it('getMe() devuelve el usuario autenticado', async () => {
    mockAxiosInstance.get.mockResolvedValueOnce({ data: mockUser });

    const result = await userService.getMe();

    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users/me');
    expect(result).toEqual(mockUser);
  });

  it('updateMe() actualiza el perfil y retorna user actualizado', async () => {
    const updatedUser: User = { ...mockUser, name: 'Juan Actualizado' };
    mockAxiosInstance.put.mockResolvedValueOnce({ data: { message: 'Perfil actualizado', user: updatedUser } });

    const result = await userService.updateMe({ name: 'Juan Actualizado' });

    expect(mockAxiosInstance.put).toHaveBeenCalledWith('/users/me', { name: 'Juan Actualizado' });
    expect(result.user.name).toBe('Juan Actualizado');
  });

  it('getUsers() retorna lista paginada de usuarios', async () => {
    const mockResponse: UsersListResponse = {
      users: [mockUser],
      total: 1,
      page: 1,
      limit: 10,
    };
    mockAxiosInstance.get.mockResolvedValueOnce({ data: mockResponse });

    const result = await userService.getUsers(1, 10);

    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users', { params: { page: 1, limit: 10 } });
    expect(result.users).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('getUsers() usa valores por defecto page=1, limit=10', async () => {
    mockAxiosInstance.get.mockResolvedValueOnce({ data: { users: [] } });

    await userService.getUsers();

    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users', { params: { page: 1, limit: 10 } });
  });

  it('adminUpdateUser() actualiza un usuario por ID', async () => {
    const updatedUser: User = { ...mockUser, role: 'admin' };
    mockAxiosInstance.put.mockResolvedValueOnce({ data: { message: 'Usuario actualizado', user: updatedUser } });

    const result = await userService.adminUpdateUser('1', { role: 'admin' });

    expect(mockAxiosInstance.put).toHaveBeenCalledWith('/users/1', { role: 'admin' });
    expect(result.user.role).toBe('admin');
  });
});

// ─── roleService ─────────────────────────────────────────────────────────────
describe('roleService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getRoles() devuelve la lista de roles', async () => {
    const mockRoles: Role[] = [
      { id: '1', name: 'admin', description: 'Administrador del sistema' },
      { id: '2', name: 'user', description: 'Usuario estándar' },
    ];
    mockAxiosInstance.get.mockResolvedValueOnce({ data: mockRoles });

    const result = await roleService.getRoles();

    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/roles');
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('admin');
  });
});
