import { Outlet } from 'react-router-dom';
import { Sidebar, type SidebarItem } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types/auth';

interface NavDef extends SidebarItem {
  /** Roles allowed to see this item. Omit to show for all. */
  roles?: UserRole[];
}

const allNavItems: NavDef[] = [
  { to: '/dashboard', label: 'Overview', end: true },
  { to: '/dashboard/complaints', label: 'Complaints' },
  { to: '/dashboard/officers', label: 'Officers', roles: ['admin', 'supervisor'] },
  { to: '/dashboard/stations', label: 'Stations', roles: ['admin', 'supervisor'] },
  { to: '/dashboard/analytics', label: 'Analytics', roles: ['admin', 'supervisor'] },
  { to: '/dashboard/users', label: 'Users', roles: ['admin'] },
  { to: '/dashboard/settings', label: 'Settings' },
];

export function DashboardLayout() {
  const { user } = useAuth();

  const navItems: SidebarItem[] = allNavItems
    .filter((item) => !item.roles || (user && item.roles.includes(user.role)))
    .map(({ roles: _roles, ...rest }) => rest);

  return (
    <div className="flex min-h-screen">
      <Sidebar items={navItems} />

      <div className="flex flex-1 flex-col">
        <Topbar />

        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
