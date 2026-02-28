import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      textAlign: 'center',
      minHeight: '60vh',
    }}>
      {/* Número 404 con gradiente */}
      <div style={{
        fontSize: 'clamp(80px, 15vw, 180px)',
        fontWeight: 900,
        lineHeight: 1,
        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        margin: '0 0 24px',
        letterSpacing: '-4px',
      }}>
        404
      </div>

      <h1 style={{
        fontSize: '28px',
        fontWeight: 700,
        color: 'var(--foreground)',
        margin: '0 0 16px',
      }}>
        Página no encontrada
      </h1>

      <p style={{
        fontSize: '15px',
        color: 'var(--muted-foreground)',
        maxWidth: '460px',
        margin: '0 0 40px',
        lineHeight: 1.6,
      }}>
        Lo sentimos, la página que buscas no existe, ha sido movida o está
        temporalmente inactiva.
      </p>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={() => navigate(-1)} className="btn-primary" style={{ gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Volver atrás
        </button>

        <button
          onClick={() => navigate(isAuthenticated ? '/profile' : '/login')}
          className="btn-secondary"
          style={{ gap: '8px' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          {isAuthenticated ? 'Ir al inicio' : 'Ir al login'}
        </button>
      </div>
    </div>
  );
}

