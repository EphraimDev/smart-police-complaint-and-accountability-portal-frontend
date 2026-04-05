import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import { UserManagementPage } from './UserManagementPage';

describe('UserManagementPage', () => {
  it('shows loading skeleton initially', () => {
    render(<UserManagementPage />);
    // Table skeleton rows appear while loading
    expect(screen.getByText('User Management')).toBeInTheDocument();
  });

  it('renders users table after loading', async () => {
    render(<UserManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Superintendent Abubakar')).toBeInTheDocument();
    });

    expect(screen.getByText('Inspector Chukwu')).toBeInTheDocument();
    expect(screen.getByText('DSP Fatima Bello')).toBeInTheDocument();
  });

  it('renders Add User button', async () => {
    render(<UserManagementPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });
  });

  it('opens create user modal on Add User click', async () => {
    const { user } = render(<UserManagementPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /add user/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Add New User')).toBeInTheDocument();
  });

  it('shows user roles and statuses', async () => {
    render(<UserManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument();
    });

    expect(screen.getAllByText('active').length).toBeGreaterThanOrEqual(1);
  });
});
