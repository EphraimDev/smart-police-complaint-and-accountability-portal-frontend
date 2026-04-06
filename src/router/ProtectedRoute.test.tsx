import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/store/AuthContext';
import { ProtectedRoute } from '@/router/ProtectedRoute';
import { canAccessUserManagement } from '@/access-control';
import { Permission } from '@/types/auth';

function TestDashboard() {
  return <div>Dashboard Content</div>;
}

function LoginStub() {
  return <div>Login Page</div>;
}

function renderWithRoutes(initialEntries: string[]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginStub />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <TestDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute canAccess={canAccessUserManagement}>
                <div>Admin Only</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('redirects unauthenticated users to /login', async () => {
    renderWithRoutes(['/dashboard']);

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

  it('renders protected content when authenticated', async () => {
    localStorage.setItem('spcap_token', 'mock-jwt-token');
    localStorage.setItem(
      'spcap_user',
      JSON.stringify({
        id: 'usr-001',
        email: 'admin@npf.gov.ng',
        fullName: 'Superintendent Abubakar',
        firstName: 'Superintendent',
        lastName: 'Abubakar',
        role: 'ADMIN',
        roles: ['ADMIN'],
        permissions: [Permission.USER_READ],
      }),
    );

    renderWithRoutes(['/dashboard']);

    await waitFor(() => {
      expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
    });
  });

  it('shows access denied for unauthorized role', async () => {
    localStorage.setItem('spcap_token', 'mock-jwt-token');
    localStorage.setItem(
      'spcap_user',
      JSON.stringify({
        id: 'usr-002',
        email: 'officer@npf.gov.ng',
        fullName: 'Constable Ibrahim',
        firstName: 'Constable',
        lastName: 'Ibrahim',
        role: 'PUBLIC',
        roles: ['PUBLIC'],
        permissions: [Permission.NOTIFICATION_MANAGE],
      }),
    );

    renderWithRoutes(['/dashboard/admin']);

    await waitFor(() => {
      expect(screen.getByText(/access denied/i)).toBeInTheDocument();
    });
  });

  it('allows access for correct role', async () => {
    localStorage.setItem('spcap_token', 'mock-jwt-token');
    localStorage.setItem(
      'spcap_user',
      JSON.stringify({
        id: 'usr-001',
        email: 'admin@npf.gov.ng',
        fullName: 'Superintendent Abubakar',
        firstName: 'Superintendent',
        lastName: 'Abubakar',
        role: 'SUPER_ADMIN',
        roles: ['SUPER_ADMIN'],
        permissions: [],
      }),
    );

    renderWithRoutes(['/dashboard/admin']);

    await waitFor(() => {
      expect(screen.getByText('Admin Only')).toBeInTheDocument();
    });
  });

  it('allows access when permissions grant the page', async () => {
    localStorage.setItem('spcap_token', 'mock-jwt-token');
    localStorage.setItem(
      'spcap_user',
      JSON.stringify({
        id: 'usr-003',
        email: 'oversight@npf.gov.ng',
        fullName: 'Oversight User',
        firstName: 'Oversight',
        lastName: 'User',
        role: 'OVERSIGHT_BODY',
        roles: ['OVERSIGHT_BODY'],
        permissions: [Permission.USER_READ],
      }),
    );

    renderWithRoutes(['/dashboard/admin']);

    await waitFor(() => {
      expect(screen.getByText('Admin Only')).toBeInTheDocument();
    });
  });
});
