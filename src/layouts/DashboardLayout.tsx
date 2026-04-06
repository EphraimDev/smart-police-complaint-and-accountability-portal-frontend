import { Outlet } from 'react-router-dom';
import { Sidebar, type SidebarItem } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { useAuth } from '@/hooks/useAuth';
import type { AuthUser } from '@/types/auth';
import {
  canAccessAnalytics,
  canAccessComplaints,
  canAccessDashboard,
  canAccessOfficers,
  canAccessStations,
  canAccessUserManagement,
} from '@/access-control';

interface NavDef extends SidebarItem {
  isVisible?: (user: AuthUser | null) => boolean;
}

const allNavItems: NavDef[] = [
  { to: '/dashboard', label: 'Overview', end: true, isVisible: canAccessDashboard },
  { to: '/dashboard/complaints', label: 'Complaints', isVisible: canAccessComplaints },
  { to: '/dashboard/officers', label: 'Officers', isVisible: canAccessOfficers },
  { to: '/dashboard/stations', label: 'Stations', isVisible: canAccessStations },
  { to: '/dashboard/analytics', label: 'Analytics', isVisible: canAccessAnalytics },
  { to: '/dashboard/users', label: 'Users', isVisible: canAccessUserManagement },
  { to: '/dashboard/settings', label: 'Settings' },
];

export function DashboardLayout() {
  const { user } = useAuth();

  const navItems: SidebarItem[] = allNavItems
    .filter((item) => !item.isVisible || item.isVisible(user))
    .map(({ isVisible: _isVisible, ...rest }) => rest);

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
