import { ClipboardList, LayoutDashboard, LogOut, Users } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { ROUTES, USER_ROLES } from '../constants/routes.js';
import { useAuth } from '../hooks/useAuth.js';
import { getLoginRouteForRole } from '../utils/authRedirects.js';

const adminNavigationItems = [
  { label: 'Dashboard', to: ROUTES.ADMIN_DASHBOARD, icon: LayoutDashboard },
  { label: 'Employees', to: ROUTES.ADMIN_EMPLOYEES, icon: Users },
  { label: 'Tasks', to: ROUTES.ADMIN_TASKS, icon: ClipboardList }
];

const employeeNavigationItems = [
  { label: 'Dashboard', to: ROUTES.EMPLOYEE_DASHBOARD, icon: LayoutDashboard },
  { label: 'My tasks', to: ROUTES.EMPLOYEE_TASKS, icon: ClipboardList }
];

export function AppLayout() {
  const { logout, role, user } = useAuth();
  const navigate = useNavigate();
  const navigationItems = role === USER_ROLES.ADMIN ? adminNavigationItems : employeeNavigationItems;

  const handleLogout = () => {
    const loginRoute = getLoginRouteForRole(role);
    logout();
    navigate(loginRoute, { replace: true });
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <span className="brand-mark">ET</span>
          <div>
            <p className="brand-name">Employee Tasks</p>
            <p className="brand-caption">{role === USER_ROLES.ADMIN ? 'Admin' : 'Employee'}</p>
          </div>
        </div>

        <div className="sidebar-user">
          <span>{user?.name ?? 'Signed in'}</span>
          <small>{user?.email}</small>
        </div>

        <nav className="sidebar-nav" aria-label="Primary navigation">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                end
                key={item.to}
                to={item.to}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <button className="sidebar-action" type="button" onClick={handleLogout}>
          <LogOut size={18} aria-hidden="true" />
          <span>Sign out</span>
        </button>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
