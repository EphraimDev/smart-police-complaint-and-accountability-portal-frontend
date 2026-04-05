import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import { LoginPage } from '@/pages/auth/LoginPage';

/* Mock useNavigate */
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('LoginPage', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    localStorage.clear();
  });

  it('renders login form', () => {
    render(<LoginPage />, { routerProps: { initialEntries: ['/login'] } });

    expect(screen.getByRole('heading', { name: /staff login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    const { user } = render(<LoginPage />, {
      routerProps: { initialEntries: ['/login'] },
    });

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });

  it('shows validation error for invalid email', async () => {
    const { user } = render(<LoginPage />, {
      routerProps: { initialEntries: ['/login'] },
    });

    await user.type(screen.getByLabelText(/email address/i), 'not-an-email');
    await user.type(screen.getByLabelText(/password/i), 'something');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/enter a valid email/i)).toBeInTheDocument();
  });

  it('logs in successfully and navigates to dashboard', async () => {
    const { user } = render(<LoginPage />, {
      routerProps: { initialEntries: ['/login'] },
    });

    await user.type(screen.getByLabelText(/email address/i), 'admin@npf.gov.ng');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });

    expect(localStorage.getItem('spcap_token')).toBe('mock-jwt-token');
  });

  it('shows server error on invalid credentials', async () => {
    const { user } = render(<LoginPage />, {
      routerProps: { initialEntries: ['/login'] },
    });

    await user.type(screen.getByLabelText(/email address/i), 'wrong@npf.gov.ng');
    await user.type(screen.getByLabelText(/password/i), 'wrongpass');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
  });

  it('has a link to forgot password page', () => {
    render(<LoginPage />, { routerProps: { initialEntries: ['/login'] } });

    const link = screen.getByRole('link', { name: /forgot your password/i });
    expect(link).toHaveAttribute('href', '/forgot-password');
  });
});
