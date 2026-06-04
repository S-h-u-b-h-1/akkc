import { ClipboardList, LayoutDashboard, LogOut, Users } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

import { ROUTES } from '../constants/routes.js';
import { useAuth } from '../hooks/useAuth.js';

const navigationItems = [
  { label: 'Dashboard', to: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: 'Employees', to: ROUTES.EMPLOYEES, icon: Users },
  { label: 'Tasks', to: ROUTES.TASKS, icon: ClipboardList }
];

export function AppLayout() {
  const { logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <span className="brand-mark">ET</span>
          <div>
            <p className="brand-name">Employee Tasks</p>
            <p className="brand-caption">Daily operations</p>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Primary navigation">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                end={item.to === ROUTES.DASHBOARD}
                key={item.to}
                to={item.to}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <button className="sidebar-action" type="button" onClick={logout}>
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
