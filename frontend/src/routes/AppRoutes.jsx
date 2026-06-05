import { Navigate, Route, Routes } from 'react-router-dom';

import { AppLayout } from '../layouts/AppLayout.jsx';
import { AdminDashboard } from '../pages/AdminDashboard.jsx';
import { AdminLoginPage } from '../pages/AdminLoginPage.jsx';
import { AdminSignupPage } from '../pages/AdminSignupPage.jsx';
import { EmployeeDashboard } from '../pages/EmployeeDashboard.jsx';
import { EmployeeLoginPage } from '../pages/EmployeeLoginPage.jsx';
import { NotFoundPage } from '../pages/NotFoundPage.jsx';
import { ROUTES, USER_ROLES } from '../constants/routes.js';
import { useAuth } from '../hooks/useAuth.js';
import { getDashboardRouteForRole } from '../utils/authRedirects.js';
import { ProtectedRoute } from './ProtectedRoute.jsx';

function RootRedirect() {
  const { isAuthenticated, role } = useAuth();

  return (
    <Navigate
      to={isAuthenticated ? getDashboardRouteForRole(role) : ROUTES.ADMIN_LOGIN}
      replace
    />
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.ROOT} element={<RootRedirect />} />
      <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLoginPage />} />
      <Route path={ROUTES.ADMIN_SIGNUP} element={<AdminSignupPage />} />
      <Route path={ROUTES.EMPLOYEE_LOGIN} element={<EmployeeLoginPage />} />

      <Route element={<ProtectedRoute allowedRole={USER_ROLES.ADMIN} />}>
        <Route element={<AppLayout />}>
          <Route
            path={ROUTES.ADMIN_DASHBOARD}
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
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRole={USER_ROLES.EMPLOYEE} />}>
        <Route element={<AppLayout />}>
          <Route
            path={ROUTES.EMPLOYEE_DASHBOARD}
            element={<EmployeeDashboard />}
          />
          <Route
            path={ROUTES.EMPLOYEE_TASKS}
            element={<EmployeeDashboard />}
          />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
