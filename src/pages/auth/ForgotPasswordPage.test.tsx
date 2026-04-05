import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';

describe('ForgotPasswordPage', () => {
  it('renders the reset password form', () => {
    render(<ForgotPasswordPage />, {
      routerProps: { initialEntries: ['/forgot-password'] },
    });

    expect(screen.getByRole('heading', { name: /reset password/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
  });

  it('shows validation error for empty email', async () => {
    const { user } = render(<ForgotPasswordPage />, {
      routerProps: { initialEntries: ['/forgot-password'] },
    });

    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
  });

  it('shows success message after submitting valid email', async () => {
    const { user } = render(<ForgotPasswordPage />, {
      routerProps: { initialEntries: ['/forgot-password'] },
    });

    await user.type(screen.getByLabelText(/email address/i), 'admin@npf.gov.ng');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    expect(await screen.findByText(/reset link has been sent/i)).toBeInTheDocument();
  });

  it('has a link back to login', () => {
    render(<ForgotPasswordPage />, {
      routerProps: { initialEntries: ['/forgot-password'] },
    });

    const link = screen.getByRole('link', { name: /back to login/i });
    expect(link).toHaveAttribute('href', '/login');
  });
});
