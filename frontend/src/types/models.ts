// ─── Modelos de dominio ───────────────────────────────────────────────────────

export type UserRole = string;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  role_id?: string;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  created_at?: string;
  updated_at?: string;
}
