import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If specified, only users with one of these roles may access the route. */
  allowedRoles?: UserRole[];
}

/**
 * Wraps dashboard routes to enforce authentication and optional role checks.
 * - Unauthenticated users are redirected to `/login`.
 * - Authenticated users without an allowed role see a 403 message.
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-300 border-t-primary-700" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 text-center">
        <h1 className="text-2xl font-bold text-danger-700">Access Denied</h1>
        <p className="text-sm text-gray-600">
          You do not have permission to access this page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
