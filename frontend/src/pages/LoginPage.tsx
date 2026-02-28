import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthLayout from '../components/AuthLayout';
import type { AxiosError } from 'axios';
import type { ApiError, LoginFormState as FormState, LoginFormErrors as FormErrors } from '../types';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();

  const [form, setForm] = useState<FormState>({ email: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});
    try {
      await login({ email: form.email, password: form.password });
      // La redirección la gestiona AuthContext (el guard de ruta detecta isAuthenticated)
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;
      setErrors({
        general: axiosErr.response?.data?.message ?? 'Credenciales inválidas. Intenta de nuevo.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout activeTab="login">
      <form className="auth-page-form" onSubmit={handleSubmit} noValidate>
        {errors.general && (
          <div className="alert-error">{errors.general}</div>
        )}

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

        {/* Password */}
        <div className="auth-field-group">
          <div className="auth-label-row">
            <label htmlFor="password" className="label-field" style={{ marginBottom: 0 }}>Contraseña</label>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className={`input-field${errors.password ? ' input-error' : ''}`}
            placeholder="••••••••"
          />
          {errors.password && <p className="error-message">{errors.password}</p>}
        </div>

        <button type="submit" className="btn-primary auth-submit-btn" disabled={isLoading}>
          {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
        </button>
      </form>
    </AuthLayout>
  );
}
