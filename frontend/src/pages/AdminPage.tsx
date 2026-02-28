import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { userService, roleService } from '../services/api';
import type { User, Role, AdminUpdateUserData, ApiError, AdminTab, ActionStatus, EditUserModalProps, RoleModalProps } from '../types';
import type { AxiosError } from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

const PAGE_SIZE = 10;

// ─── Modal de edición de usuario ─────────────────────────────────────────────

function EditUserModal({ user, roles, onClose, onSaved }: EditUserModalProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<ActionStatus>('idle');
  const [serverError, setServerError] = useState('');

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'El nombre es obligatorio';
    else if (name.trim().length < 2) newErrors.name = 'Mínimo 2 caracteres';
    if (!email.trim()) newErrors.email = 'El email es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Email no válido';
    if (password && password.length < 8) newErrors.password = 'Mínimo 8 caracteres';
    if (password && password !== confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('loading');
    setServerError('');
    const payload: AdminUpdateUserData = {};
    if (name.trim() !== user.name) payload.name = name.trim();
    if (email.trim() !== user.email) payload.email = email.trim();
    if (role !== user.role) payload.role = role;
    if (password) payload.password = password;

    if (Object.keys(payload).length === 0) {
      onClose();
      return;
    }

    try {
      const result = await userService.adminUpdateUser(user.id, payload);
      setStatus('success');
      onSaved(result.user);
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;
      setServerError(axiosErr.response?.data?.message ?? 'Error al actualizar el usuario');
      setStatus('error');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold" style={{ color: 'var(--card-foreground)' }}>Editar usuario</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--muted-foreground)', fontSize: '18px', lineHeight: 1, cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-3 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="avatar-placeholder avatar-placeholder-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <p className="text-xs font-mono" style={{ color: 'var(--muted-foreground)' }}>{user.name}</p>
        </div>

        {serverError && (
          <div className="alert-error">{serverError}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="label-field">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
            />
            {errors.name && <p className="error-message mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="label-field">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
            {errors.email && <p className="error-message mt-1">{errors.email}</p>}
          </div>

          {/* Rol */}
          <div>
            <label className="label-field">Rol</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input-field"
            >
              {roles.length === 0 ? (
                <option value={user.role}>{user.role}</option>
              ) : (
                roles.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Nueva contraseña */}
          <div>
            <label className="label-field">
              Nueva contraseña <span style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}>(opcional)</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Dejar vacío para no cambiar"
              className="input-field"
              autoComplete="new-password"
            />
            {errors.password && <p className="error-message mt-1">{errors.password}</p>}
          </div>

          {/* Confirmar contraseña */}
          <div>
            <label className="label-field">Confirmar contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repetir la contraseña nueva"
              className="input-field"
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <p className="error-message mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Acciones */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={status === 'loading'}
              className="btn-primary w-auto flex-1"
            >
              {status === 'loading' ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal de rol (crear / editar) ───────────────────────────────────────────

function RoleModal({ role, onClose, onSaved }: RoleModalProps) {
  const [name, setName] = useState(role?.name ?? '');
  const [description, setDescription] = useState(role?.description ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<ActionStatus>('idle');
  const [serverError, setServerError] = useState('');
  const isEditing = role !== null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'El nombre es obligatorio';
    else if (name.trim().length < 2) newErrors.name = 'Mínimo 2 caracteres';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('loading');
    setServerError('');
    try {
      let saved: Role;
      if (isEditing) {
        saved = await roleService.updateRole(role.id, {
          name: name.trim(),
          description: description.trim() || undefined,
        });
      } else {
        saved = await roleService.createRole({
          name: name.trim(),
          description: description.trim() || undefined,
        });
      }
      setStatus('success');
      onSaved(saved);
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;
      setServerError(axiosErr.response?.data?.message ?? 'Error al guardar el rol');
      setStatus('error');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold" style={{ color: 'var(--card-foreground)' }}>
            {isEditing ? 'Editar rol' : 'Crear rol'}
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--muted-foreground)', fontSize: '18px', lineHeight: 1, cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {serverError && (
          <div className="alert-error">{serverError}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field">Nombre del rol</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              autoFocus
            />
            {errors.name && <p className="error-message mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="label-field">
              Descripción <span style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}>(opcional)</span>
            </label>
            <textarea
              value={description ?? ''}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe las capacidades de este rol..."
              className="input-field resize-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={status === 'loading'}
              className="btn-primary w-auto flex-1"
            >
              {status === 'loading' ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear rol'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('usuarios');

  // ── Estado: Usuarios
  const [users, setUsers] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userSavedMsg, setUserSavedMsg] = useState('');

  // ── Estado: Roles
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState('');
  const [roleModal, setRoleModal] = useState<{ open: boolean; role: Role | null }>({
    open: false,
    role: null,
  });
  const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null);
  const [rolesActionError, setRolesActionError] = useState('');

  // ── Carga de usuarios
  const fetchUsers = useCallback(async (currentPage: number) => {
    setUsersLoading(true);
    setUsersError('');
    try {
      const data = await userService.getUsers(currentPage, PAGE_SIZE);
      setUsers(data.users);
      setFiltered(data.users);
      setTotal(data.total ?? data.users.length);
    } catch {
      setUsersError('No se pudieron cargar los usuarios. Verifica que el backend esté activo.');
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(page);
  }, [fetchUsers, page]);

  // ── Filtro por búsqueda
  useEffect(() => {
    if (!search.trim()) {
      setFiltered(users);
      return;
    }
    const term = search.toLowerCase();
    setFiltered(
      users.filter(
        (u) => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
      )
    );
  }, [search, users]);

  // ── Carga de roles
  const fetchRoles = useCallback(async () => {
    setRolesLoading(true);
    setRolesError('');
    try {
      const data = await roleService.getRoles();
      setRoles(data);
    } catch {
      setRolesError('No se pudieron cargar los roles.');
    } finally {
      setRolesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const roleBadge = (r: string) =>
    r === 'admin'
      ? 'badge badge-secondary'
      : r === 'moderator'
      ? 'badge'
      : 'badge badge-success';

  // ── Handlers usuarios
  const handleUserSaved = (updated: User) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    setEditingUser(null);
    setUserSavedMsg(`✅ Usuario "${updated.name}" actualizado correctamente.`);
    setTimeout(() => setUserSavedMsg(''), 4000);
  };

  // ── Handlers roles
  const handleRoleSaved = (saved: Role) => {
    setRoles((prev) => {
      const exists = prev.find((r) => r.id === saved.id);
      return exists ? prev.map((r) => (r.id === saved.id ? saved : r)) : [saved, ...prev];
    });
    setRoleModal({ open: false, role: null });
  };

  const handleDeleteRole = async (id: string) => {
    if (!confirm('¿Eliminar este rol? La acción fallará si hay usuarios asignados.')) return;
    setDeletingRoleId(id);
    setRolesActionError('');
    try {
      await roleService.deleteRole(id);
      setRoles((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;
      setRolesActionError(axiosErr.response?.data?.message ?? 'No se pudo eliminar el rol.');
    } finally {
      setDeletingRoleId(null);
    }
  };

  return (
    <div className="space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Panel de Administración</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>Gestión de usuarios y roles del sistema</p>
        </div>

        {/* Tabs */}
        <div style={{ borderBottom: '1px solid var(--border)' }}>
          <nav className="flex gap-6">
            {(['usuarios', 'roles'] as AdminTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                  color: activeTab === tab ? 'var(--primary)' : 'var(--muted-foreground)',
                  padding: '12px 0',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'color 0.15s',
                }}
              >
                {tab === 'usuarios' ? `Usuarios (${total})` : `Roles (${roles.length})`}
              </button>
            ))}
          </nav>
        </div>

        {/* ─── TAB: USUARIOS ─── */}
        {activeTab === 'usuarios' && (
          <>
            {userSavedMsg && (
              <div className="alert-success">{userSavedMsg}</div>
            )}

            {/* Search */}
            <div className="card card-body">
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', color: 'var(--muted-foreground)', pointerEvents: 'none' }}>
                  <iconify-icon icon="lucide:search" style={{ fontSize: '16px' }} />
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nombre o email..."
                  className="input-field"
                  style={{ paddingLeft: '34px' }}
                />
              </div>
            </div>

            {/* Table */}
            <div className="card">
              {usersLoading ? (
                <div className="card-body"><LoadingSpinner fullScreen={false} /></div>
              ) : usersError ? (
                <div className="card-body text-center">
                  <p className="text-sm" style={{ color: 'var(--destructive)' }}>{usersError}</p>
                  <button
                    onClick={() => fetchUsers(page)}
                    className="mt-3 text-sm"
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
                  >
                    Reintentar
                  </button>
                </div>
              ) : filtered.length === 0 ? (
                <div className="card-body text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  No se encontraron usuarios.
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        {['Nombre', 'Email', 'Rol', 'Acciones'].map((col) => (
                          <th key={col}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((u) => (
                        <tr key={u.id}>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="avatar-placeholder avatar-placeholder-sm">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium">{u.name}</span>
                            </div>
                          </td>
                          <td style={{ color: 'var(--muted-foreground)' }}>{u.email}</td>
                          <td>
                            <span className={`${roleBadge(u.role)} capitalize`}>{u.role}</span>
                          </td>
                          <td>
                            <button
                              onClick={() => setEditingUser(u)}
                              className="text-sm font-medium"
                              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
                            >
                              Editar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination */}
            {!usersLoading && !usersError && totalPages > 1 && (
              <div className="pagination">
                <p className="pagination-info">Página {page} de {totalPages}</p>
                <div className="pagination-controls">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="page-btn outline disabled:opacity-40"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="page-btn outline disabled:opacity-40"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ─── TAB: ROLES ─── */}
        {activeTab === 'roles' && (
          <>
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm" style={{ color: 'var(--muted-foreground)', minWidth: 0 }}>Administra los roles disponibles en el sistema.</p>
              <button
                onClick={() => setRoleModal({ open: true, role: null })}
                className="btn-primary"
                style={{ flexShrink: 0, whiteSpace: 'nowrap' }}
              >
                + Crear rol
              </button>
            </div>

            {rolesActionError && (
              <div className="alert-error">{rolesActionError}</div>
            )}

            <div className="card">
              {rolesLoading ? (
                <div className="card-body"><LoadingSpinner fullScreen={false} /></div>
              ) : rolesError ? (
                <div className="card-body text-center">
                  <p className="text-sm" style={{ color: 'var(--destructive)' }}>{rolesError}</p>
                  <button
                    onClick={fetchRoles}
                    className="mt-3 text-sm"
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
                  >
                    Reintentar
                  </button>
                </div>
              ) : roles.length === 0 ? (
                <div className="card-body text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>No hay roles creados.</div>
              ) : (
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        {['Nombre', 'Descripción', 'Acciones'].map((col) => (
                          <th key={col}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {roles.map((r) => (
                        <tr key={r.id}>
                          <td>
                            <span className={`${roleBadge(r.name)} capitalize`}>{r.name}</span>
                          </td>
                          <td className="max-w-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
                            {r.description ?? (
                              <span style={{ fontStyle: 'italic', color: 'var(--muted-foreground)' }}>Sin descripción</span>
                            )}
                          </td>
                          <td>
                            <div className="flex gap-4">
                              <button
                                onClick={() => setRoleModal({ open: true, role: r })}
                                className="text-sm font-medium"
                                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteRole(r.id)}
                                disabled={deletingRoleId === r.id}
                                className="text-sm font-medium disabled:opacity-40"
                                style={{ background: 'none', border: 'none', color: 'var(--destructive)', cursor: 'pointer' }}
                              >
                                {deletingRoleId === r.id ? 'Eliminando...' : 'Eliminar'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

      {/* Modal: Editar usuario */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          roles={roles}
          onClose={() => setEditingUser(null)}
          onSaved={handleUserSaved}
        />
      )}

      {/* Modal: Crear / Editar rol */}
      {roleModal.open && (
        <RoleModal
          role={roleModal.role}
          onClose={() => setRoleModal({ open: false, role: null })}
          onSaved={handleRoleSaved}
        />
      )}
    </div>
  );
}
