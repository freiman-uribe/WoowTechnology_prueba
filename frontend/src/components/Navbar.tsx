import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useEffect } from 'react';

interface NavbarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Navbar({ isOpen, onClose }: NavbarProps) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path ? 'active' : '';

  // Cierra el sidebar al cambiar de ruta
  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Overlay en móvil */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 40,
          }}
        />
      )}

      <aside className={`sidebar${isOpen ? " sidebar-open" : ""}`}>
        {/* Logo */}
        <div className="sidebar-header">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
          <span className="sidebar-logo">AppAdmin</span>

          {/* Botón cerrar — solo visible en móvil */}
          <button
            onClick={onClose}
            className="sidebar-close-btn"
            aria-label="Cerrar menú"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <Link
            to="/profile"
            className={`sidebar-item ${isActive("/profile")}`}
          >
            <iconify-icon icon="lucide:user" style={{ fontSize: "18px" }} />
            Mi Perfil
          </Link>

          {user?.role === "admin" && (
            <Link to="/admin" className={`sidebar-item ${isActive("/admin")}`}>
              <iconify-icon icon="lucide:users" style={{ fontSize: "18px" }} />
              Usuarios
            </Link>
          )}
        </nav>
      </aside>
    </>
  );
}
