import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/hooks/useAuth';

/** Institutional top bar for dashboard pages. */
export function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const initials = user
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      {/* Left – visible on mobile or as breadcrumb slot */}
      <div className="flex items-center gap-3 lg:hidden">
        <Logo size="sm" showText={false} />
      </div>

      {/* Right – user area */}
      <div className="ml-auto flex items-center gap-4">
        {/* Role badge */}
        {user && (
          <span className="hidden rounded bg-primary-50 px-2 py-0.5 text-xs font-medium capitalize text-primary-700 md:inline-block">
            {user.role}
          </span>
        )}

        {/* Notification bell */}
        <button
          type="button"
          aria-label="Notifications"
          className="focus-ring relative rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zm0 16a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
        </button>

        {/* Avatar + name */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-800">
            {initials}
          </div>
          <span className="hidden text-sm font-medium text-gray-700 md:block">
            {user?.fullName ?? 'User'}
          </span>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="focus-ring rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-danger-700"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
