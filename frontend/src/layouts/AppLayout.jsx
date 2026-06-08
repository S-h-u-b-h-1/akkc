import { ClipboardList, Database, LayoutDashboard, LogOut, ShieldCheck, Users } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { BrandLogo } from '../components/BrandLogo.jsx';
import { FIRM } from '../constants/firm.js';
import { ROUTES, USER_ROLES } from '../constants/routes.js';
import { useAuth } from '../hooks/useAuth.js';
import { getLoginRouteForRole } from '../utils/authRedirects.js';

const adminNavigationItems = [
  { label: 'Team AKKC', to: ROUTES.ADMIN_DASHBOARD, icon: LayoutDashboard },
  { label: 'Admins', to: ROUTES.ADMIN_ADMINS, icon: ShieldCheck },
  { label: 'Team', to: ROUTES.ADMIN_EMPLOYEES, icon: Users },
  { label: 'Assignments', to: ROUTES.ADMIN_TASKS, icon: ClipboardList },
  { label: 'Data cleanup', to: ROUTES.ADMIN_MAINTENANCE, icon: Database }
];

const employeeNavigationItems = [
  { label: 'Team AKKC', to: ROUTES.EMPLOYEE_DASHBOARD, icon: LayoutDashboard },
  { label: 'My work', to: ROUTES.EMPLOYEE_TASKS, icon: ClipboardList }
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
        <BrandLogo className="brand-block" />

        <div className="sidebar-user">
          <span>{user?.name ?? 'Signed in'}</span>
          <small>{user?.email ?? (user?.username ? `@${user.username}` : FIRM.TAGLINE)}</small>
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
