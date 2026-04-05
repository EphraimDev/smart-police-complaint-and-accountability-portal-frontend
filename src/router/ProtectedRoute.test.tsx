import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/store/AuthContext';
import { ProtectedRoute } from '@/router/ProtectedRoute';

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
              <ProtectedRoute allowedRoles={['admin']}>
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
        role: 'admin',
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
        role: 'officer',
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
        role: 'admin',
      }),
    );

    renderWithRoutes(['/dashboard/admin']);

    await waitFor(() => {
      expect(screen.getByText('Admin Only')).toBeInTheDocument();
    });
  });
});
