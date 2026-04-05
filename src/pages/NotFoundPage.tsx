import { Link } from 'react-router-dom';
import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <Logo size="md" showText={false} />
      <h1 className="mt-6 text-6xl font-bold text-primary-700">404</h1>
      <p className="mt-2 text-xl font-semibold text-gray-700">Page Not Found</p>
      <p className="mt-2 max-w-md text-sm text-gray-500">
        The page you are looking for does not exist or has been moved. Please check the
        URL or return to the homepage.
      </p>
      <div className="mt-8 flex gap-3">
        <Link to="/">
          <Button>Go Home</Button>
        </Link>
        <Link to="/dashboard">
          <Button variant="outline">Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
