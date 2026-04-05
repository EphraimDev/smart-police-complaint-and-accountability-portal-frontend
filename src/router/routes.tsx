import type { RouteObject } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ProtectedRoute } from '@/router/ProtectedRoute';
import {
  LandingPage,
  SubmitComplaintPage,
  ComplaintSuccessPage,
  TrackComplaintPage,
  ComplaintResultPage,
  FaqPage,
} from '@/pages/public';
import { LoginPage, ForgotPasswordPage } from '@/pages/auth';
import {
  DashboardOverviewPage,
  ComplaintsListPage,
  ComplaintDetailPage,
  OfficersListPage,
  StationsListPage,
  ReportsPage,
  ProfileSettingsPage,
} from '@/pages/dashboard';
import { UserManagementPage } from '@/pages/admin';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const routes: RouteObject[] = [
  /* ── Public routes ── */
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'submit-complaint', element: <SubmitComplaintPage /> },
      { path: 'complaint-success/:trackingId', element: <ComplaintSuccessPage /> },
      { path: 'track-complaint', element: <TrackComplaintPage /> },
      { path: 'complaint/:trackingId', element: <ComplaintResultPage /> },
      { path: 'faq', element: <FaqPage /> },
    ],
  },

  /* ── Auth routes ── */
  {
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
    ],
  },

  /* ── Dashboard routes (authenticated) ── */
  {
    path: 'dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardOverviewPage /> },
      {
        path: 'complaints',
        element: <ComplaintsListPage />,
      },
      {
        path: 'complaints/:id',
        element: <ComplaintDetailPage />,
      },
      {
        path: 'officers',
        element: <OfficersListPage />,
      },
      {
        path: 'stations',
        element: <StationsListPage />,
      },
      {
        path: 'analytics',
        element: <ReportsPage />,
      },
      {
        path: 'users',
        element: <UserManagementPage />,
      },
      {
        path: 'settings',
        element: <ProfileSettingsPage />,
      },
    ],
  },

  /* ── Catch-all ── */
  { path: '*', element: <NotFoundPage /> },
];
