import axios, { AxiosError } from 'axios';
import type {
  LoginCredentials,
  LoginResponse,
  RegisterData,
  UpdateProfileData,
  UpdateProfileResponse,
  AdminUpdateUserData,
  User,
  UsersListResponse,
  Role,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

if (!BASE_URL) {
  console.warn('[api] VITE_API_BASE_URL no está definida. Asegúrate de tener un archivo .env.');
}

const api = axios.create({
  baseURL: `${BASE_URL ?? ''}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: adjunta el token JWT automáticamente en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: maneja respuestas de error globalmente
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const isAuthRoute = error.config?.url?.startsWith('/auth/');
    // Solo redirige si el 401 NO viene de login/register (sesión expirada o token inválido)
    if (error.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/auth/login', credentials);
    return data;
  },

  async register(registerData: RegisterData): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>('/auth/register', registerData);
    return data;
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const userService = {
  async getMe(): Promise<User> {
    const { data } = await api.get<User>('/users/me');
    return data;
  },

  async updateMe(updateData: UpdateProfileData): Promise<UpdateProfileResponse> {
    const { data } = await api.put<UpdateProfileResponse>('/users/me', updateData);
    return data;
  },

  async getUsers(page = 1, limit = 10): Promise<UsersListResponse> {
    const { data } = await api.get<UsersListResponse>('/users', {
      params: { page, limit },
    });
    return data;
  },

  async adminUpdateUser(userId: string, updateData: AdminUpdateUserData): Promise<UpdateProfileResponse> {
    const { data } = await api.put<UpdateProfileResponse>(`/users/${userId}`, updateData);
    return data;
  },
};

// ─── Roles ────────────────────────────────────────────────────────────────────

export const roleService = {
  async getRoles(): Promise<Role[]> {
    const { data } = await api.get<Role[]>('/roles');
    return Array.isArray(data) ? data : (data as { roles?: Role[] }).roles ?? [];
  },

  async createRole(payload: { name: string; description?: string }): Promise<Role> {
    const { data } = await api.post<Role>('/roles', payload);
    return data;
  },

  async updateRole(id: string, payload: { name?: string; description?: string }): Promise<Role> {
    const { data } = await api.put<Role>(`/roles/${id}`, payload);
    return data;
  },

  async deleteRole(id: string): Promise<void> {
    await api.delete(`/roles/${id}`);
  },
};

export default api;
