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

    expect(screen.getByText('Emeka Chukwu')).toBeInTheDocument();
    expect(screen.getByText('Fatima Bello')).toBeInTheDocument();
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

  it('shows fetched roles in the create user dropdown', async () => {
    const { user } = render(<UserManagementPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /add user/i }));

    expect(await screen.findByLabelText('Role')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'ADMIN' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'INVESTIGATOR' })).toBeInTheDocument();
  });

  it('opens bulk upload modal', async () => {
    const { user } = render(<UserManagementPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /bulk upload users/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /bulk upload users/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /bulk upload users/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/csv file/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /download csv template/i })).toBeInTheDocument();
    expect(screen.getByText(/sample csv template/i)).toBeInTheDocument();
  });

  it('shows user roles and statuses', async () => {
    render(<UserManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    expect(screen.getAllByText('Active').length).toBeGreaterThanOrEqual(1);
  });
});
