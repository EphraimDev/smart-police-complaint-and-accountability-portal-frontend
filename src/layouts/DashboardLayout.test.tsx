import { describe, it, expect, vi } from 'vitest';
import { render as rtlRender, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from '@/store/AuthContext';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import type { AuthUser } from '@/types/auth';

// Suppress ResizeObserver / layout warnings in test environment
vi.stubGlobal(
  'ResizeObserver',
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

function setAuthStorage(user: AuthUser) {
  localStorage.setItem('spcap_token', 'mock-jwt-token');
  localStorage.setItem('spcap_user', JSON.stringify(user));
}

const adminUser: AuthUser = {
  id: 'usr-001',
  email: 'admin@npf.gov.ng',
  fullName: 'Superintendent Abubakar',
  role: 'admin',
};

const officerUser: AuthUser = {
  id: 'usr-002',
  email: 'officer@npf.gov.ng',
  fullName: 'Constable Ibrahim',
  role: 'officer',
};

function renderDashboard(user: AuthUser) {
  setAuthStorage(user);
  return {
    user: userEvent.setup(),
    ...rtlRender(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <Routes>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<div>Dashboard Home</div>} />
            </Route>
            <Route path="/login" element={<LocationDisplay />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    ),
  };
}

describe('DashboardLayout – role-aware navigation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows admin-only nav items for admin role', async () => {
    renderDashboard(adminUser);

    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeInTheDocument();
    });

    expect(screen.getByText('Officers')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
  });

  it('hides admin-only nav items for officer role', async () => {
    renderDashboard(officerUser);

    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeInTheDocument();
    });

    expect(screen.queryByText('Officers')).not.toBeInTheDocument();
    expect(screen.queryByText('Analytics')).not.toBeInTheDocument();
    // Common items still visible
    expect(screen.getByText('Complaints')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('displays user name and role badge', async () => {
    renderDashboard(adminUser);

    await waitFor(() => {
      expect(screen.getByText('Superintendent Abubakar')).toBeInTheDocument();
    });

    expect(screen.getByText('admin')).toBeInTheDocument();
  });

  it('displays user initials in avatar', async () => {
    renderDashboard(adminUser);

    await waitFor(() => {
      expect(screen.getByText('SA')).toBeInTheDocument(); // Superintendent Abubakar
    });
  });
});

describe('DashboardLayout – logout flow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('clears auth state and navigates to login on logout', async () => {
    const { user } = renderDashboard(adminUser);

    await waitFor(() => {
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/login');
    });

    expect(localStorage.getItem('spcap_token')).toBeNull();
    expect(localStorage.getItem('spcap_user')).toBeNull();
  });
});
