import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
  resource?: string;
}

export const ProtectedRoute = ({ children, resource }: ProtectedRouteProps) => {
  const { isAuthenticated, hasPermission } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (resource && !hasPermission(resource)) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};
