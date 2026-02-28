import { useState, useEffect, type FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/api';
import type { AxiosError } from 'axios';
import type { ApiError, SaveStatus } from '../types';

function validateEmail(value: string): string {
  if (!value.trim()) return 'El email no puede estar vacío';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Introduce un email válido';
  return '';
}

function validateName(value: string): string {
  if (!value.trim()) return 'El nombre no puede estar vacío';
  if (value.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
  return '';
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();

  const [name, setName]   = useState(user?.name  ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [nameError, setNameError]   = useState('');
  const [emailError, setEmailError] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // Sincroniza si el contexto se actualiza
  useEffect(() => {
    if (user) {
      setName(user.name  ?? '');
      setEmail(user.email ?? '');
    }
  }, [user]);

  const isDirty = name.trim() !== (user?.name ?? '') || email.trim() !== (user?.email ?? '');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const nErr = validateName(name);
    const eErr = validateEmail(email);
    setNameError(nErr);
    setEmailError(eErr);
    if (nErr || eErr) return;

    setSaveStatus('loading');
    try {
      await userService.updateMe({ name: name.trim(), email: email.trim() });
      await refreshUser();
      setSaveStatus('success');
      setStatusMessage('Perfil actualizado correctamente');
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;
      setSaveStatus('error');
      setStatusMessage(axiosErr.response?.data?.message ?? 'Error al actualizar el perfil');
    } finally {
      setTimeout(() => setSaveStatus('idle'), 3500);
    }
  };

  const handleCancel = () => {
    setName(user?.name  ?? '');
    setEmail(user?.email ?? '');
    setNameError('');
    setEmailError('');
  };

  const badgeClass = user?.role === 'admin' ? 'badge badge-secondary' : 'badge badge-success';

  return (
    <div className="space-y-6">
      {/* Encabezado de página */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Mi Perfil</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
          Administra tu información personal y credenciales.
        </p>
      </div>

      {/* Mensajes de estado */}
      {saveStatus === 'success' && <div className="alert-success">{statusMessage}</div>}
      {saveStatus === 'error'   && <div className="alert-error">{statusMessage}</div>}

      {/* Tarjeta de perfil */}
      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="text-base font-semibold" style={{ color: 'var(--card-foreground)' }}>Información General</h3>
              <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Actualiza tus datos personales aquí.</p>
            </div>
          </div>

          <div className="card-body space-y-6">
            {/* Avatar + rol */}
            <div className="flex items-center gap-5">
              <div className="avatar-placeholder avatar-placeholder-lg">
                {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
              </div>
              <div>
                <p className="text-base font-semibold" style={{ color: 'var(--card-foreground)' }}>{user?.name}</p>
                <span className={`${badgeClass} capitalize mt-1`}>{user?.role}</span>
              </div>
            </div>

            {/* Campos en cuadrícula */}
            <div className="form-grid">
              {/* Nombre */}
              <div className="form-group">
                <label className="label-field">Nombre</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (nameError) setNameError(validateName(e.target.value));
                  }}
                  className="input-field"
                  placeholder="Tu nombre"
                />
                {nameError && <p className="error-message">{nameError}</p>}
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="label-field">Correo Electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(validateEmail(e.target.value));
                  }}
                  className="input-field"
                  placeholder="tu@email.com"
                />
                {emailError && <p className="error-message">{emailError}</p>}
              </div>

              {/* Rol (solo lectura) */}
              <div className="form-group">
                <label className="label-field">Rol de Sistema</label>
                <input
                  type="text"
                  value={user?.role ?? ''}
                  readOnly
                  disabled
                  className="input-field-muted capitalize"
                />
              </div>
            </div>
          </div>

          {/* Footer con acciones */}
          <div className="card-footer">
            {isDirty && (
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={saveStatus === 'loading' || !isDirty}
              className="btn-primary"
            >
              {saveStatus === 'loading' ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

