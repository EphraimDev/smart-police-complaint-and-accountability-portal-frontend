import { http, HttpResponse } from 'msw';
import type { ComplaintSubmissionResponse, ComplaintResult } from '@/types/complaint';
import type { AuthUser, LoginResponse, ForgotPasswordResponse } from '@/types/auth';
import type {
  DashboardStats,
  InternalComplaint,
  Officer,
  Station,
  PaginatedResponse,
  StatusHistoryEntry,
} from '@/types/dashboard';
import type { AdminUser } from '@/types/reports';

/* ── Mock auth data ── */
const mockUser: AuthUser = {
  id: 'usr-001',
  email: 'admin@npf.gov.ng',
  fullName: 'Superintendent Abubakar',
  firstName: 'Superintendent',
  lastName: 'Abubakar',
  role: 'ADMIN',
  roles: ['ADMIN'],
  permissions: ['user:read', 'report:view'],
};

/* ── Mock officers ── */
const mockOfficers: Officer[] = [
  {
    id: 'off-001',
    firstName: 'Emeka',
    lastName: 'Chukwu',
    badgeNumber: 'NPF-4421',
    rank: 'Inspector',
    stationId: 'st-001',
    station: { id: 'st-001', name: 'Ikeja Division' },
    createdAt: '2025-01-15T00:00:00Z',
  },
  {
    id: 'off-002',
    firstName: 'Ibrahim',
    lastName: 'Abdullahi',
    badgeNumber: 'NPF-3312',
    rank: 'Sergeant',
    stationId: 'st-002',
    station: { id: 'st-002', name: 'Wuse Division' },
    createdAt: '2025-03-10T00:00:00Z',
  },
];

/* ── Mock stations ── */
const mockStations: Station[] = [
  {
    id: 'st-001',
    name: 'Ikeja Division',
    code: 'IKJ-001',
    address: '12 Toyin Street, Ikeja, Lagos',
    region: 'Lagos',
    phone: '01-2345678',
    email: 'ikeja@npf.gov.ng',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'st-002',
    name: 'Wuse Division',
    code: 'WSE-001',
    address: '5 Aminu Kano Crescent, Wuse II, Abuja',
    region: 'FCT',
    phone: '09-8765432',
    email: 'wuse@npf.gov.ng',
    createdAt: '2024-01-01T00:00:00Z',
  },
];

/* ── Mock internal complaint ── */
const mockInternalComplaint: InternalComplaint = {
  id: 'cmp-001',
  reference: 'NPF-2026-AB12X',
  title: 'Extortion at checkpoint',
  complainantName: 'Emeka Okonkwo',
  complainantEmail: 'emeka@example.com',
  complainantPhone: '08011112222',
  incidentDate: '2026-03-25',
  incidentLocation: 'Ikeja, Lagos',
  category: 'corruption',
  severity: 'medium',
  description:
    'Officer demanded payment at checkpoint without issuing any ticket or receipt.',
  status: 'under_review',
  station: { id: 'st-001', name: 'Ikeja Division' },
  assignedInvestigator: { id: 'off-001', firstName: 'Emeka', lastName: 'Chukwu' },
  createdAt: '2026-03-28T10:30:00Z',
  updatedAt: '2026-04-02T14:00:00Z',
};

/* ── Mock status history ── */
const mockStatusHistory: StatusHistoryEntry[] = [
  {
    id: 'sh-001',
    status: 'submitted',
    reason: 'Complaint received and logged.',
    changedBy: { id: 'usr-sys', firstName: 'System', lastName: '' },
    createdAt: '2026-03-28T10:30:00Z',
  },
  {
    id: 'sh-002',
    status: 'under_review',
    reason: 'Assigned to oversight unit for preliminary review.',
    changedBy: { id: 'usr-001', firstName: 'Superintendent', lastName: 'Abubakar' },
    createdAt: '2026-04-02T14:00:00Z',
  },
];

const mockDashboardStats: DashboardStats = {
  totalComplaints: 156,
  pendingComplaints: 23,
  investigatingComplaints: 14,
  resolvedComplaints: 98,
  totalOfficers: 240,
  totalStations: 36,
  recentComplaints: [mockInternalComplaint],
};

/* ── Mock complaint result (public tracking) ── */
const mockComplaintResult: ComplaintResult = {
  id: 'cmp-001',
  reference: 'NPF-2026-AB12X',
  title: 'Extortion at checkpoint',
  status: 'under_review',
  category: 'corruption',
  severity: 'medium',
  description:
    'Officer demanded payment at checkpoint without issuing any ticket or receipt.',
  incidentLocation: 'Ikeja, Lagos',
  createdAt: '2026-03-28T10:30:00Z',
  updatedAt: '2026-04-02T14:00:00Z',
  statusHistory: [
    {
      status: 'submitted',
      createdAt: '2026-03-28T10:30:00Z',
      reason: 'Complaint received and logged.',
      changedBy: 'system',
    },
    {
      status: 'under_review',
      createdAt: '2026-04-02T14:00:00Z',
      reason: 'Assigned to oversight unit.',
      changedBy: 'Superintendent Abubakar',
    },
  ],
};

function buildLoginResponse(): LoginResponse {
  return {
    success: true,
    message: 'Login successful',
    correlationId: 'corr-login-001',
    data: {
      user: {
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        roles: ['ADMIN'],
      },
      tokens: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: '15m',
        tokenType: 'Bearer',
      },
    },
  };
}

function buildPermissionsResponse() {
  return {
    data: [
      { id: 'perm-1', name: 'user:read' },
      { id: 'perm-2', name: 'report:view' },
    ],
  };
}

/**
 * Default request handlers for MSW — aligned with the real API at /api/v1.
 */
export const handlers = [
  // Health-check
  http.get('/api/v1/health', () => {
    return HttpResponse.json({ status: 'ok' });
  }),

  // Submit complaint
  http.post('/api/v1/complaints', async () => {
    const body: ComplaintSubmissionResponse = {
      id: 'cmp-new',
      reference: 'NPF-2026-XY99Z',
      trackingToken: 'tok_abc123',
    };
    return HttpResponse.json(body, { status: 201 });
  }),

  // Track complaint (public)
  http.post('/api/v1/complaints/track', async ({ request }) => {
    const payload = (await request.json()) as { reference?: string };
    if (payload.reference === 'NPF-2026-AB12X') {
      return HttpResponse.json(mockComplaintResult);
    }
    return HttpResponse.json({ message: 'Complaint not found' }, { status: 404 });
  }),

  // Login
  http.post('/api/v1/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };
    if (body.email === 'admin@npf.gov.ng' && body.password === 'password123') {
      return HttpResponse.json(buildLoginResponse());
    }
    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }),
  http.post('http://localhost:3006/api/v1/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };
    if (body.email === 'admin@npf.gov.ng' && body.password === 'password123') {
      return HttpResponse.json(buildLoginResponse());
    }
    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }),

  http.get('/api/v1/permissions', () => {
    return HttpResponse.json(buildPermissionsResponse());
  }),
  http.get('http://localhost:3006/api/v1/permissions', () => {
    return HttpResponse.json(buildPermissionsResponse());
  }),
  http.get('/api/v1/roles', () => {
    return HttpResponse.json({
      data: [
        { id: 'role-super-admin', name: 'SUPER_ADMIN' },
        { id: 'role-admin', name: 'ADMIN' },
        { id: 'role-investigator', name: 'INVESTIGATOR' },
      ],
    });
  }),
  http.get('http://localhost:3006/api/v1/roles', () => {
    return HttpResponse.json({
      data: [
        { id: 'role-super-admin', name: 'SUPER_ADMIN' },
        { id: 'role-admin', name: 'ADMIN' },
        { id: 'role-investigator', name: 'INVESTIGATOR' },
      ],
    });
  }),

  // Refresh token
  http.post('/api/v1/auth/refresh', async () => {
    return HttpResponse.json({
      accessToken: 'mock-refreshed-access-token',
      refreshToken: 'mock-refreshed-refresh-token',
    });
  }),

  // Logout
  http.post('/api/v1/auth/logout', async () => {
    return HttpResponse.json({ message: 'Logged out' });
  }),

  // Change password
  http.post('/api/v1/auth/change-password', async () => {
    return HttpResponse.json({ message: 'Password changed successfully.' });
  }),

  // Forgot password (kept at old path since no API equivalent)
  http.post('/api/auth/forgot-password', async () => {
    const response: ForgotPasswordResponse = {
      message: 'If that email is registered, a reset link has been sent.',
    };
    return HttpResponse.json(response);
  }),

  /* ── Dashboard endpoints ── */

  // Admin dashboard stats
  http.get('/api/v1/admin/dashboard', () => {
    return HttpResponse.json(mockDashboardStats);
  }),

  // List complaints (paginated)
  http.get('/api/v1/complaints', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const body: PaginatedResponse<InternalComplaint> = {
      data: [mockInternalComplaint],
      total: 1,
      page,
      limit: 10,
      totalPages: 1,
    };
    return HttpResponse.json(body);
  }),

  // Get single complaint
  http.get('/api/v1/complaints/:id', ({ params }) => {
    if (params.id === 'cmp-001') {
      return HttpResponse.json(mockInternalComplaint);
    }
    return HttpResponse.json({ message: 'Complaint not found' }, { status: 404 });
  }),

  // Complaint timeline
  http.get('/api/v1/complaints/:id/timeline', () => {
    return HttpResponse.json(mockStatusHistory);
  }),

  // Complaint notes
  http.get('/api/v1/complaints/:id/notes', () => {
    return HttpResponse.json([]);
  }),

  http.post('/api/v1/complaints/:id/notes', async () => {
    return HttpResponse.json(
      { id: 'note-new', content: 'Test note', createdAt: new Date().toISOString() },
      { status: 201 },
    );
  }),

  // Status history
  http.get('/api/v1/complaint-status-history/complaint/:id', () => {
    return HttpResponse.json(mockStatusHistory);
  }),

  // Assign complaint
  http.post('/api/v1/complaint-assignments', async ({ request }) => {
    const body = (await request.json()) as { complaintId: string; assigneeId: string };
    const officer = mockOfficers.find((o) => o.id === body.assigneeId);
    return HttpResponse.json({
      ...mockInternalComplaint,
      assignedInvestigator: officer
        ? { id: officer.id, firstName: officer.firstName, lastName: officer.lastName }
        : undefined,
    });
  }),

  // Update complaint status
  http.patch('/api/v1/complaints/:id/status', async ({ request }) => {
    const body = (await request.json()) as { status: string; reason?: string };
    return HttpResponse.json({
      ...mockInternalComplaint,
      status: body.status,
    });
  }),

  // List officers
  http.get('/api/v1/officers', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const body: PaginatedResponse<Officer> = {
      data: mockOfficers,
      total: 2,
      page,
      limit: 10,
      totalPages: 1,
    };
    return HttpResponse.json(body);
  }),
  http.get('http://localhost:3006/api/v1/officers', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const body: PaginatedResponse<Officer> = {
      data: mockOfficers,
      total: 2,
      page,
      limit: 10,
      totalPages: 1,
    };
    return HttpResponse.json(body);
  }),
  http.post('/api/v1/officers/bulk-upload', async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('file');
    const stationId = formData.get('stationId');

    if (!(file instanceof File)) {
      return HttpResponse.json({ message: 'File is required.' }, { status: 400 });
    }
    if (typeof stationId !== 'string' || !stationId.trim()) {
      return HttpResponse.json({ message: 'Station is required.' }, { status: 400 });
    }

    return HttpResponse.json({
      message: '2 officers uploaded successfully.',
      count: 2,
      fileName: file.name,
      stationId,
    });
  }),
  http.post('http://localhost:3006/api/v1/officers/bulk-upload', async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('file');
    const stationId = formData.get('stationId');

    if (!(file instanceof File)) {
      return HttpResponse.json({ message: 'File is required.' }, { status: 400 });
    }
    if (typeof stationId !== 'string' || !stationId.trim()) {
      return HttpResponse.json({ message: 'Station is required.' }, { status: 400 });
    }

    return HttpResponse.json({
      message: '2 officers uploaded successfully.',
      count: 2,
      fileName: file.name,
      stationId,
    });
  }),

  // List stations
  http.get('/api/v1/police-stations', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const body: PaginatedResponse<Station> = {
      data: mockStations,
      total: 2,
      page,
      limit: 10,
      totalPages: 1,
    };
    return HttpResponse.json(body);
  }),

  /* ── Reports endpoints ── */
  http.get('/api/v1/reports/complaints/summary', () => {
    return HttpResponse.json({
      totalComplaints: 156,
      avgResolutionDays: 9,
      resolutionRate: 63,
      complaintsThisMonth: 24,
      changeFromLastMonth: 12,
    });
  }),

  http.get('/api/v1/reports/trends', () => {
    return HttpResponse.json({
      complaintsTrend: [
        { date: '2026-01', count: 12 },
        { date: '2026-02', count: 18 },
        { date: '2026-03', count: 24 },
        { date: '2026-04', count: 15 },
      ],
      categoryBreakdown: [
        { category: 'corruption', count: 45, percentage: 29 },
        { category: 'excessive_force', count: 30, percentage: 19 },
        { category: 'unlawful_arrest', count: 22, percentage: 14 },
        { category: 'harassment', count: 20, percentage: 13 },
        { category: 'negligence', count: 15, percentage: 10 },
        { category: 'other', count: 24, percentage: 15 },
      ],
      statusBreakdown: [
        { status: 'submitted', count: 23, percentage: 15 },
        { status: 'under_review', count: 21, percentage: 13 },
        { status: 'under_investigation', count: 14, percentage: 9 },
        { status: 'resolved', count: 85, percentage: 55 },
        { status: 'rejected', count: 13, percentage: 8 },
      ],
    });
  }),

  http.get('/api/v1/reports/complaints/resolution', () => {
    return HttpResponse.json({
      stationRankings: [
        {
          stationId: 'st-001',
          stationName: 'Ikeja Division',
          state: 'Lagos',
          complaintCount: 45,
          resolvedCount: 38,
          resolutionRate: 84,
        },
        {
          stationId: 'st-002',
          stationName: 'Wuse Division',
          state: 'FCT',
          complaintCount: 32,
          resolvedCount: 25,
          resolutionRate: 78,
        },
      ],
      officerPerformance: [
        {
          officerId: 'off-001',
          officerName: 'Inspector Chukwu',
          rank: 'Inspector',
          assignedCount: 12,
          resolvedCount: 10,
          avgResolutionDays: 7,
        },
        {
          officerId: 'off-002',
          officerName: 'Sergeant Abdullahi',
          rank: 'Sergeant',
          assignedCount: 8,
          resolvedCount: 6,
          avgResolutionDays: 12,
        },
      ],
    });
  }),

  http.get('/api/v1/reports/complaints/overdue', () => {
    return HttpResponse.json([]);
  }),

  http.get('/api/v1/reports/escalations', () => {
    return HttpResponse.json([]);
  }),

  /* ── Admin: Users ── */
  http.get('/api/v1/users', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const mockUsers: AdminUser[] = [
      {
        id: 'usr-001',
        firstName: 'Superintendent',
        lastName: 'Abubakar',
        fullName: 'Superintendent Abubakar',
        email: 'admin@npf.gov.ng',
        role: 'ADMIN',
        isActive: true,
        stationName: 'Force HQ',
        createdAt: '2025-01-15T00:00:00Z',
        lastLoginAt: '2026-04-04T09:00:00Z',
      },
      {
        id: 'usr-002',
        firstName: 'Emeka',
        lastName: 'Chukwu',
        fullName: 'Emeka Chukwu',
        email: 'chukwu@npf.gov.ng',
        role: 'POLICE_ADMIN',
        isActive: true,
        stationName: 'Ikeja Division',
        createdAt: '2025-03-10T00:00:00Z',
        lastLoginAt: '2026-04-03T14:30:00Z',
      },
      {
        id: 'usr-003',
        firstName: 'Fatima',
        lastName: 'Bello',
        fullName: 'Fatima Bello',
        email: 'fatima@npf.gov.ng',
        role: 'OVERSIGHT_BODY',
        isActive: true,
        stationName: 'Wuse Division',
        createdAt: '2025-06-01T00:00:00Z',
      },
    ];
    const body: PaginatedResponse<AdminUser> = {
      data: mockUsers,
      total: 3,
      page,
      limit: 10,
      totalPages: 1,
    };
    return HttpResponse.json(body);
  }),
  http.get('http://localhost:3006/api/v1/police-stations', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const body: PaginatedResponse<Station> = {
      data: mockStations,
      total: 2,
      page,
      limit: 10,
      totalPages: 1,
    };
    return HttpResponse.json(body);
  }),
  http.post('/api/v1/police-stations', async ({ request }) => {
    const payload = (await request.json()) as {
      name: string;
      code: string;
      address?: string;
      region?: string;
      phone?: string;
      email?: string;
    };

    return HttpResponse.json(
      {
        id: 'st-003',
        name: payload.name,
        code: payload.code,
        address: payload.address,
        region: payload.region,
        phone: payload.phone,
        email: payload.email,
        createdAt: new Date().toISOString(),
      },
      { status: 201 },
    );
  }),
  http.post('http://localhost:3006/api/v1/police-stations', async ({ request }) => {
    const payload = (await request.json()) as {
      name: string;
      code: string;
      address?: string;
      region?: string;
      phone?: string;
      email?: string;
    };

    return HttpResponse.json(
      {
        id: 'st-003',
        name: payload.name,
        code: payload.code,
        address: payload.address,
        region: payload.region,
        phone: payload.phone,
        email: payload.email,
        createdAt: new Date().toISOString(),
      },
      { status: 201 },
    );
  }),
  http.post('/api/v1/police-stations/bulk-upload', async () => {
    return HttpResponse.json({ message: '2 stations uploaded successfully.', count: 2 });
  }),
  http.post('http://localhost:3006/api/v1/police-stations/bulk-upload', async () => {
    return HttpResponse.json({ message: '2 stations uploaded successfully.', count: 2 });
  }),
  http.get('http://localhost:3006/api/v1/users', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const mockUsers: AdminUser[] = [
      {
        id: 'usr-001',
        firstName: 'Superintendent',
        lastName: 'Abubakar',
        fullName: 'Superintendent Abubakar',
        email: 'admin@npf.gov.ng',
        role: 'ADMIN',
        isActive: true,
        stationName: 'Force HQ',
        createdAt: '2025-01-15T00:00:00Z',
        lastLoginAt: '2026-04-04T09:00:00Z',
      },
      {
        id: 'usr-002',
        firstName: 'Emeka',
        lastName: 'Chukwu',
        fullName: 'Emeka Chukwu',
        email: 'chukwu@npf.gov.ng',
        role: 'POLICE_ADMIN',
        isActive: true,
        stationName: 'Ikeja Division',
        createdAt: '2025-03-10T00:00:00Z',
        lastLoginAt: '2026-04-03T14:30:00Z',
      },
      {
        id: 'usr-003',
        firstName: 'Fatima',
        lastName: 'Bello',
        fullName: 'Fatima Bello',
        email: 'fatima@npf.gov.ng',
        role: 'OVERSIGHT_BODY',
        isActive: true,
        stationName: 'Wuse Division',
        createdAt: '2025-06-01T00:00:00Z',
      },
    ];
    const body: PaginatedResponse<AdminUser> = {
      data: mockUsers,
      total: 3,
      page,
      limit: 10,
      totalPages: 1,
    };
    return HttpResponse.json(body);
  }),

  // Current user profile
  http.get('/api/v1/users/me', () => {
    return HttpResponse.json(mockUser);
  }),

  http.post('/api/v1/users', async ({ request }) => {
    const payload = (await request.json()) as {
      firstName: string;
      lastName: string;
      email: string;
    };
    const newUser: AdminUser = {
      id: 'usr-new',
      firstName: payload.firstName,
      lastName: payload.lastName,
      fullName: `${payload.firstName} ${payload.lastName}`,
      email: payload.email,
      role: 'POLICE_ADMIN',
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    return HttpResponse.json(newUser, { status: 201 });
  }),
  http.post('/api/v1/users/bulk-upload', async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return HttpResponse.json({ message: 'File is required.' }, { status: 400 });
    }

    return HttpResponse.json({
      message: '2 users uploaded successfully.',
      count: 2,
      fileName: file.name,
    });
  }),
  http.post('http://localhost:3006/api/v1/users/bulk-upload', async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return HttpResponse.json({ message: 'File is required.' }, { status: 400 });
    }

    return HttpResponse.json({
      message: '2 users uploaded successfully.',
      count: 2,
      fileName: file.name,
    });
  }),

  http.put('/api/v1/users/:id', async ({ request, params }) => {
    const payload = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ id: params.id, ...payload });
  }),

  http.patch('/api/v1/users/:id/deactivate', ({ params }) => {
    return HttpResponse.json({ id: params.id, isActive: false });
  }),

  http.patch('/api/v1/users/:id/activate', ({ params }) => {
    return HttpResponse.json({ id: params.id, isActive: true });
  }),

  /* ── Profile ── */
  http.patch('/api/v1/users/me', async () => {
    return HttpResponse.json({ message: 'Profile updated successfully.' });
  }),
];
