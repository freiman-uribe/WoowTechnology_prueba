import { Navigate, Outlet } from 'react-router-dom';
import { useAuthGuard } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

export default function AdminRoute() {
  const { isAuthenticated, isLoading, user } = useAuthGuard();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/profile" replace />;
  }

  return <Outlet />;
}
