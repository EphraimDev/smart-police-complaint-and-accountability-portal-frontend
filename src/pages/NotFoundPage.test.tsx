import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { NotFoundPage } from './NotFoundPage';

describe('NotFoundPage', () => {
  it('renders 404 heading', () => {
    render(<NotFoundPage />);
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
  });

  it('shows descriptive text', () => {
    render(<NotFoundPage />);
    expect(screen.getByText(/does not exist or has been moved/)).toBeInTheDocument();
  });

  it('renders Go Home and Dashboard links', () => {
    render(<NotFoundPage />);
    expect(screen.getByRole('link', { name: /go home/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute(
      'href',
      '/dashboard',
    );
  });
});
