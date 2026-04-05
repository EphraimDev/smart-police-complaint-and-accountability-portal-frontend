import { Outlet, Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/Button';

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* ── Navbar ── */}
      <header className="border-b border-gray-200 bg-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" aria-label="Home">
            <Logo size="md" />
          </Link>

          <ul className="flex items-center gap-6 text-sm font-medium text-gray-600">
            <li>
              <Link to="/" className="hover:text-primary-600">
                Home
              </Link>
            </li>
            <li>
              <Link to="/submit-complaint" className="hover:text-primary-600">
                File Complaint
              </Link>
            </li>
            <li>
              <Link to="/track-complaint" className="hover:text-primary-600">
                Track
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:text-primary-600">
                FAQ
              </Link>
            </li>
            <li>
              <Link to="/login">
                <Button size="sm">Sign In</Button>
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      {/* ── Page content ── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-200 bg-primary-900 py-8 text-center">
        <Logo size="sm" className="mb-3 justify-center [&_span]:text-white" />
        <p className="text-xs text-primary-300">
          &copy; {new Date().getFullYear()} Smart Police Complaint &amp; Accountability
          Portal
        </p>
      </footer>
    </div>
  );
}
