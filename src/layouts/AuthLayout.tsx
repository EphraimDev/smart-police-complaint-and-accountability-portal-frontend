import { Outlet, Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* ── Brand ── */}
        <div className="mb-8 text-center">
          <Link to="/" aria-label="Home">
            <Logo size="lg" className="justify-center" />
          </Link>
          <p className="mt-2 text-sm text-gray-500">
            Smart Police Complaint &amp; Accountability Portal
          </p>
        </div>

        {/* ── Auth card ── */}
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-card">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
