import { useState, type FormEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthLayout from '../components/AuthLayout';
import type { AxiosError } from 'axios';
import type { ApiError, RegisterFormState as FormState, RegisterFormErrors as FormErrors } from '../types';

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (form.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }
    if (!form.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Ingresa un email válido';
    }
    if (!form.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (form.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      setSuccessMessage('¡Cuenta creada! Redirigiendo al login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;
      const message =
        axiosErr.response?.data?.message ?? 'Error al registrar. Intenta de nuevo.';
      setErrors({ general: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout activeTab="register">
      <form className="auth-page-form" onSubmit={handleSubmit} noValidate>
        {errors.general && (
          <div className="alert-error">{errors.general}</div>
        )}
        {successMessage && (
          <div className="alert-success">{successMessage}</div>
        )}

        {/* Nombre completo */}
        <div className="auth-field-group">
          <label htmlFor="name" className="label-field">Nombre completo</label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className={`input-field${errors.name ? ' input-error' : ''}`}
            placeholder="Juan Pérez"
          />
          {errors.name && <p className="error-message">{errors.name}</p>}
        </div>

        {/* Email */}
        <div className="auth-field-group">
          <label htmlFor="email" className="label-field">Correo electrónico</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className={`input-field${errors.email ? ' input-error' : ''}`}
            placeholder="nombre@ejemplo.com"
          />
          {errors.email && <p className="error-message">{errors.email}</p>}
        </div>

        {/* Contraseña */}
        <div className="auth-field-group">
          <label htmlFor="password" className="label-field">Contraseña</label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className={`input-field${errors.password ? ' input-error' : ''}`}
            placeholder="Mínimo 8 caracteres"
          />
          {errors.password && <p className="error-message">{errors.password}</p>}
        </div>

        {/* Confirmar contraseña */}
        <div className="auth-field-group">
          <label htmlFor="confirmPassword" className="label-field">Confirmar contraseña</label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
            className={`input-field${errors.confirmPassword ? ' input-error' : ''}`}
            placeholder="Repite tu contraseña"
          />
          {errors.confirmPassword && (
            <p className="error-message">{errors.confirmPassword}</p>
          )}
        </div>

        <button type="submit" className="btn-primary auth-submit-btn" disabled={isLoading}>
          {isLoading ? 'Registrando...' : 'Crear Cuenta'}
        </button>
      </form>
    </AuthLayout>
  );
}
