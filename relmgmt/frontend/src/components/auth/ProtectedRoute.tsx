import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
  requiredRole?: string;
  loadingComponent?: ReactNode;
}

/**
 * ProtectedRoute component that wraps child components requiring authentication
 * Redirects to login page if user is not authenticated
 * Shows loading indicator while authentication is being checked
 */
export function ProtectedRoute({
  children,
  redirectTo = '/login',
  requiredRole,
  loadingComponent = <div>Loading...</div>
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading indicator while authentication is being checked
  if (isLoading) {
    return <>{loadingComponent}</>;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Check role-based access (simplified for MVP - single user)
  // In a full implementation, this would check user roles against requiredRole
  if (requiredRole) {
    // For MVP, since we have simplified auth with single admin user,
    // we'll always allow access if authenticated
    // Future enhancement: implement proper role checking
    // if (!hasRequiredRole(user, requiredRole)) {
    //   return <Navigate to="/unauthorized" replace />;
    // }
  }

  // User is authenticated and authorized, render protected content
  return <>{children}</>;
}