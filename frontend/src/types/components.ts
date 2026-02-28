// ─── Props de componentes ─────────────────────────────────────────────────────

import type { User, Role } from './models';

export interface EditUserModalProps {
  user: User;
  roles: Role[];
  onClose: () => void;
  onSaved: (updated: User) => void;
}

export interface RoleModalProps {
  role: Role | null; // null = crear nuevo
  onClose: () => void;
  onSaved: (role: Role) => void;
}
