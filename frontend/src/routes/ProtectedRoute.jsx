import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth.js';
import { getDashboardRouteForRole, getLoginRouteForRole } from '../utils/authRedirects.js';

export function ProtectedRoute({ allowedRole }) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={getLoginRouteForRole(allowedRole)} replace state={{ from: location }} />;
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to={getDashboardRouteForRole(role)} replace />;
  }

  return <Outlet />;
}
