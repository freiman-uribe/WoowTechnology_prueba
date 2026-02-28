// ─── Entidad de rol tal como se almacena en la BD ────────────────────────────
export interface Role {
  id: string;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

// ─── DTO para crear un rol ────────────────────────────────────────────────────
export interface CreateRoleDTO {
  name: string;
  description?: string;
}

// ─── DTO para actualizar un rol ───────────────────────────────────────────────
export interface UpdateRoleDTO {
  name?: string;
  description?: string;
}
