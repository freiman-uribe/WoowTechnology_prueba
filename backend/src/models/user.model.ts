// Roles disponibles en el sistema (string para soportar roles dinámicos de la BD)
export type UserRole = string;

// Entidad de usuario — role viene del JOIN con la tabla roles (roles.name AS role)
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role_id: string;   // FK a roles.id
  role: UserRole;    // alias del JOIN: roles.name AS role
  created_at: Date;
  updated_at: Date;
}

// DTO para respuestas públicas (sin exponer el password)
export interface UserPublicDTO {
  id: string;
  name: string;
  email: string;
  role_id: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

// DTO para registro de usuario
export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

// DTO para login
export interface LoginDTO {
  email: string;
  password: string;
}

// DTO para actualizar perfil
export interface UpdateProfileDTO {
  name?: string;
  email?: string;
  password?: string;
}

// DTO para que un admin actualice cualquier usuario (incluye rol)
export interface AdminUpdateUserDTO {
  name?: string;
  email?: string;
  password?: string;
  role?: string; // nombre del rol (e.g. 'admin', 'user', 'moderator')
}

// Payload que se guarda en el JWT
export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

// Extensión de Express Request para incluir el usuario autenticado
import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: JwtPayload;
}
