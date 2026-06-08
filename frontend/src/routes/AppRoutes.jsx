import { Navigate, Route, Routes } from 'react-router-dom';

import { AppLayout } from '../layouts/AppLayout.jsx';
import { AdminDashboard } from '../pages/AdminDashboard.jsx';
import { AdminLoginPage } from '../pages/AdminLoginPage.jsx';
import { EmployeeDashboard } from '../pages/EmployeeDashboard.jsx';
import { EmployeeLoginPage } from '../pages/EmployeeLoginPage.jsx';
import { LandingPage } from '../pages/LandingPage.jsx';
import { NotFoundPage } from '../pages/NotFoundPage.jsx';
import { ROUTES, USER_ROLES } from '../constants/routes.js';
import { useAuth } from '../hooks/useAuth.js';
import { getDashboardRouteForRole } from '../utils/authRedirects.js';
import { ProtectedRoute } from './ProtectedRoute.jsx';

function RootRoute() {
  const { isAuthenticated, role } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={getDashboardRouteForRole(role)} replace />;
  }

  return <LandingPage />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.ROOT} element={<RootRoute />} />
      <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLoginPage />} />
      <Route path={ROUTES.EMPLOYEE_LOGIN} element={<EmployeeLoginPage />} />

      <Route element={<ProtectedRoute allowedRole={USER_ROLES.ADMIN} />}>
        <Route element={<AppLayout />}>
          <Route
            path={ROUTES.ADMIN_ROOT}
            element={<AdminDashboard />}
          />
          <Route
            path={ROUTES.ADMIN_DASHBOARD}
            element={<AdminDashboard />}
          />
          <Route
            path={ROUTES.ADMIN_ADMINS}
            element={<AdminDashboard />}
          />
          <Route
            path={ROUTES.ADMIN_EMPLOYEES}
            element={<AdminDashboard />}
          />

          <Route
            path={ROUTES.ADMIN_TASKS}
            element={<AdminDashboard />}
          />
          <Route
            path="/admin/*"
            element={<Navigate to={ROUTES.ADMIN_DASHBOARD} replace />}
          />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRole={USER_ROLES.EMPLOYEE} />}>
        <Route element={<AppLayout />}>
          <Route
            path={ROUTES.EMPLOYEE_ROOT}
            element={<EmployeeDashboard />}
          />
          <Route
            path={ROUTES.EMPLOYEE_DASHBOARD}
            element={<EmployeeDashboard />}
          />
          <Route
            path={ROUTES.EMPLOYEE_TASKS}
            element={<EmployeeDashboard />}
          />
          <Route
            path="/employee/*"
            element={<Navigate to={ROUTES.EMPLOYEE_DASHBOARD} replace />}
          />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
