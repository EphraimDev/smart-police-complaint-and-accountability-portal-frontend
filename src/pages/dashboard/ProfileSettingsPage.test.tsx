import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import { ProfileSettingsPage } from './ProfileSettingsPage';

// Seed auth state so useAuth returns a user
function renderWithAuth() {
  localStorage.setItem('spcap_token', 'mock-jwt-token');
  localStorage.setItem(
    'spcap_user',
    JSON.stringify({
      id: 'usr-001',
      email: 'admin@npf.gov.ng',
      fullName: 'Superintendent Abubakar',
      role: 'admin',
    }),
  );
  return render(<ProfileSettingsPage />);
}

describe('ProfileSettingsPage', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('shows the page heading', async () => {
    renderWithAuth();
    await waitFor(() => {
      expect(screen.getByText('Profile & Settings')).toBeInTheDocument();
    });
  });

  it('displays the user name and email in the profile card', async () => {
    renderWithAuth();
    await waitFor(() => {
      expect(screen.getByText('Superintendent Abubakar')).toBeInTheDocument();
    });
    expect(screen.getByText('admin@npf.gov.ng')).toBeInTheDocument();
  });

  it('renders Edit Profile form with pre-filled fields', async () => {
    renderWithAuth();
    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText('Full Name') as HTMLInputElement;
    expect(nameInput.value).toBe('Superintendent Abubakar');
  });

  it('renders Change Password form', async () => {
    renderWithAuth();
    await waitFor(() => {
      // Use heading role to specifically target the <h2> heading
      expect(
        screen.getByRole('heading', { name: /change password/i }),
      ).toBeInTheDocument();
    });

    expect(screen.getByLabelText('Current Password')).toBeInTheDocument();
    expect(screen.getByLabelText('New Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
  });

  it('shows validation error for short password', async () => {
    const { user } = renderWithAuth();

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /change password/i }),
      ).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText('Current Password'), 'old');
    await user.type(screen.getByLabelText('New Password'), 'short');
    await user.type(screen.getByLabelText('Confirm New Password'), 'short');

    const changeBtn = screen.getByRole('button', { name: /change password/i });
    await user.click(changeBtn);

    await waitFor(() => {
      expect(screen.getByText(/at least 8 characters/)).toBeInTheDocument();
    });
  });

  it('shows mismatch error when passwords differ', async () => {
    const { user } = renderWithAuth();

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /change password/i }),
      ).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText('Current Password'), 'oldpassword');
    await user.type(screen.getByLabelText('New Password'), 'newpassword1');
    await user.type(screen.getByLabelText('Confirm New Password'), 'different1');

    const changeBtn = screen.getByRole('button', { name: /change password/i });
    await user.click(changeBtn);

    await waitFor(() => {
      expect(screen.getByText(/do not match/)).toBeInTheDocument();
    });
  });
});
