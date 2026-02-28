// ─── Tipos relacionados con la API ───────────────────────────────────────────

import type { User, Role } from './models';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  password?: string;
}

export interface UpdateProfileResponse {
  message: string;
  user: User;
}

export interface AdminUpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
}

export interface UsersListResponse {
  users: User[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface RolesListResponse {
  roles?: Role[];
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
