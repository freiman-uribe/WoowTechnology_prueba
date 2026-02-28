import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import bgAuth from '../assets/image.png';
import icon from '../assets/icon.svg';

interface AuthLayoutProps {
  activeTab: 'login' | 'register';
  children: ReactNode;
}
export default function AuthLayout({ activeTab, children }: AuthLayoutProps) {
  const navigate = useNavigate();

  const isLogin    = activeTab === 'login';
  const isRegister = activeTab === 'register';

  return (
    <div className="auth-split-layout">
      <div className="auth-hero">
        <img src={bgAuth} alt="" className="auth-hero-bg" aria-hidden="true" />
        <div className="auth-hero-overlay" aria-hidden="true" />

        <div className="auth-hero-content">
          <div className="auth-brand">
            <img src={icon} alt="WoowApp Logo" className="auth-brand-icon" />
            WoowApp
          </div>

          <div className="auth-hero-text">
            <h1>Construyendo el futuro web</h1>
            <p>
              Únete a nuestra plataforma y descubre todas las herramientas necesarias
              para gestionar tus proyectos de manera eficiente.
            </p>
          </div>
        </div>
      </div>

      {/* ── Panel derecho: formulario ───────────────────────── */}
      <div className="auth-form-side">
        <div className="auth-form-inner">

          {/* Encabezado */}
          <div className="auth-form-header">
            <h2>{isLogin ? 'Bienvenido de nuevo' : 'Crear una cuenta'}</h2>
            <p>
              {isLogin
                ? 'Ingresa tus credenciales para acceder a tu cuenta'
                : 'Ingresa tus datos para registrarte en la plataforma'}
            </p>
          </div>

          {/* Tabs de navegación */}
          <div className="auth-tabs" role="tablist">
            <button
              role="tab"
              aria-selected={isLogin}
              className={`auth-tab${isLogin ? ' active' : ''}`}
              onClick={() => navigate('/login')}
            >
              Iniciar Sesión
            </button>
            <button
              role="tab"
              aria-selected={isRegister}
              className={`auth-tab${isRegister ? ' active' : ''}`}
              onClick={() => navigate('/register')}
            >
              Registrarse
            </button>
          </div>

          {/* Contenido del formulario */}
          {children}
        </div>
      </div>
    </div>
  );
}
