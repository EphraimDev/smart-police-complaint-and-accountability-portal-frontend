import { http, HttpResponse } from 'msw';
import type { ComplaintSubmissionResponse, ComplaintResult } from '@/types/complaint';
import type { AuthUser, LoginResponse, ForgotPasswordResponse } from '@/types/auth';
import type {
  DashboardStats,
  InternalComplaint,
  Officer,
  Station,
  PaginatedResponse,
} from '@/types/dashboard';
import type { ReportsData, AdminUser } from '@/types/reports';

/* ── Mock auth data ── */
const mockUser: AuthUser = {
  id: 'usr-001',
  email: 'admin@npf.gov.ng',
  fullName: 'Superintendent Abubakar',
  role: 'admin',
};

/* ── Mock officers ── */
const mockOfficers: Officer[] = [
  {
    id: 'off-001',
    fullName: 'Inspector Chukwu',
    badgeNumber: 'NPF-4421',
    rank: 'Inspector',
    email: 'chukwu@npf.gov.ng',
    phone: '08012345678',
    stationId: 'st-001',
    stationName: 'Ikeja Division',
    assignedComplaints: 3,
    status: 'active',
  },
  {
    id: 'off-002',
    fullName: 'Sergeant Abdullahi',
    badgeNumber: 'NPF-3312',
    rank: 'Sergeant',
    email: 'abdullahi@npf.gov.ng',
    phone: '08098765432',
    stationId: 'st-002',
    stationName: 'Wuse Division',
    assignedComplaints: 1,
    status: 'active',
  },
];

/* ── Mock stations ── */
const mockStations: Station[] = [
  {
    id: 'st-001',
    name: 'Ikeja Division',
    state: 'Lagos',
    lga: 'Ikeja',
    address: '12 Toyin Street, Ikeja, Lagos',
    phone: '01-2345678',
    officerCount: 45,
    complaintCount: 12,
  },
  {
    id: 'st-002',
    name: 'Wuse Division',
    state: 'FCT',
    lga: 'Wuse',
    address: '5 Aminu Kano Crescent, Wuse II, Abuja',
    phone: '09-8765432',
    officerCount: 32,
    complaintCount: 8,
  },
];

/* ── Mock internal complaint ── */
const mockInternalComplaint: InternalComplaint = {
  id: 'cmp-001',
  trackingId: 'NPF-2026-AB12X',
  fullName: 'Emeka Okonkwo',
  email: 'emeka@example.com',
  phone: '08011112222',
  state: 'Lagos',
  lga: 'Ikeja',
  policeStation: 'Ikeja Division',
  officerName: 'Inspector Chukwu',
  officerBadgeNumber: 'NPF-4421',
  incidentDate: '2026-03-25',
  category: 'Extortion / Bribery',
  description:
    'Officer demanded payment at checkpoint without issuing any ticket or receipt.',
  status: 'under-review',
  assignedTo: 'off-001',
  assignedOfficerName: 'Inspector Chukwu',
  submittedAt: '2026-03-28T10:30:00Z',
  lastUpdated: '2026-04-02T14:00:00Z',
  statusHistory: [
    {
      status: 'received',
      date: '2026-03-28T10:30:00Z',
      note: 'Complaint received and logged.',
      updatedBy: 'system',
    },
    {
      status: 'under-review',
      date: '2026-04-02T14:00:00Z',
      note: 'Assigned to oversight unit for preliminary review.',
      updatedBy: 'Superintendent Abubakar',
    },
  ],
  evidence: [
    {
      id: 'ev-001',
      fileName: 'receipt-photo.jpg',
      fileType: 'image/jpeg',
      fileSize: 245000,
      uploadedAt: '2026-03-28T10:32:00Z',
      url: '/uploads/receipt-photo.jpg',
    },
    {
      id: 'ev-002',
      fileName: 'witness-statement.pdf',
      fileType: 'application/pdf',
      fileSize: 120000,
      uploadedAt: '2026-03-28T10:34:00Z',
      url: '/uploads/witness-statement.pdf',
    },
  ],
};

const mockDashboardStats: DashboardStats = {
  totalComplaints: 156,
  pendingComplaints: 23,
  investigatingComplaints: 14,
  resolvedComplaints: 98,
  totalOfficers: 240,
  totalStations: 36,
  recentComplaints: [mockInternalComplaint],
};

/* ── Mock complaint data ── */
const mockComplaintResult: ComplaintResult = {
  trackingId: 'NPF-2026-AB12X',
  status: 'under-review',
  category: 'Extortion / Bribery',
  policeStation: 'Ikeja Division',
  state: 'Lagos',
  submittedAt: '2026-03-28T10:30:00Z',
  lastUpdated: '2026-04-02T14:00:00Z',
  statusHistory: [
    {
      status: 'received',
      date: '2026-03-28T10:30:00Z',
      note: 'Complaint received and logged.',
    },
    {
      status: 'under-review',
      date: '2026-04-02T14:00:00Z',
      note: 'Assigned to oversight unit for preliminary review.',
    },
  ],
};

/**
 * Default request handlers for MSW.
 */
export const handlers = [
  // Health-check
  http.get('/api/health', () => {
    return HttpResponse.json({ status: 'ok' });
  }),

  // Submit complaint
  http.post('/api/complaints', async () => {
    const body: ComplaintSubmissionResponse = {
      trackingId: 'NPF-2026-AB12X',
      message: 'Complaint submitted successfully.',
    };
    return HttpResponse.json(body, { status: 201 });
  }),

  // Get complaint by tracking ID
  http.get('/api/complaints/:trackingId', ({ params }) => {
    const { trackingId } = params;
    if (trackingId === 'NPF-2026-AB12X') {
      return HttpResponse.json(mockComplaintResult);
    }
    return HttpResponse.json({ message: 'Complaint not found' }, { status: 404 });
  }),

  // Login
  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };
    if (body.email === 'admin@npf.gov.ng' && body.password === 'password123') {
      const response: LoginResponse = { user: mockUser, token: 'mock-jwt-token' };
      return HttpResponse.json(response);
    }
    return HttpResponse.json({ message: 'Invalid email or password' }, { status: 401 });
  }),

  // Forgot password
  http.post('/api/auth/forgot-password', async () => {
    const response: ForgotPasswordResponse = {
      message: 'If that email is registered, a reset link has been sent.',
    };
    return HttpResponse.json(response);
  }),

  /* ── Dashboard endpoints ── */

  // Dashboard stats
  http.get('/api/dashboard/stats', () => {
    return HttpResponse.json(mockDashboardStats);
  }),

  // List complaints (paginated)
  http.get('/api/dashboard/complaints', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const body: PaginatedResponse<InternalComplaint> = {
      data: [mockInternalComplaint],
      total: 1,
      page,
      pageSize: 10,
      totalPages: 1,
    };
    return HttpResponse.json(body);
  }),

  // Get single complaint
  http.get('/api/dashboard/complaints/:id', ({ params }) => {
    if (params.id === 'cmp-001') {
      return HttpResponse.json(mockInternalComplaint);
    }
    return HttpResponse.json({ message: 'Complaint not found' }, { status: 404 });
  }),

  // Assign complaint
  http.post('/api/dashboard/complaints/:id/assign', async ({ request }) => {
    const body = (await request.json()) as { officerId: string };
    const officer = mockOfficers.find((o) => o.id === body.officerId);
    return HttpResponse.json({
      ...mockInternalComplaint,
      assignedTo: body.officerId,
      assignedOfficerName: officer?.fullName ?? 'Unknown',
    });
  }),

  // Update complaint status
  http.patch('/api/dashboard/complaints/:id/status', async ({ request }) => {
    const body = (await request.json()) as { status: string; note: string };
    return HttpResponse.json({
      ...mockInternalComplaint,
      status: body.status,
      statusHistory: [
        ...mockInternalComplaint.statusHistory,
        {
          status: body.status,
          date: new Date().toISOString(),
          note: body.note,
          updatedBy: 'Test User',
        },
      ],
    });
  }),

  // List officers
  http.get('/api/dashboard/officers', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const body: PaginatedResponse<Officer> = {
      data: mockOfficers,
      total: 2,
      page,
      pageSize: 10,
      totalPages: 1,
    };
    return HttpResponse.json(body);
  }),

  // Get single officer
  http.get('/api/dashboard/officers/:id', ({ params }) => {
    const officer = mockOfficers.find((o) => o.id === params.id);
    if (officer) return HttpResponse.json(officer);
    return HttpResponse.json({ message: 'Officer not found' }, { status: 404 });
  }),

  // List stations
  http.get('/api/dashboard/stations', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const body: PaginatedResponse<Station> = {
      data: mockStations,
      total: 2,
      page,
      pageSize: 10,
      totalPages: 1,
    };
    return HttpResponse.json(body);
  }),

  /* ── Reports endpoint ── */
  http.get('/api/dashboard/reports', () => {
    const body: ReportsData = {
      complaintsTrend: [
        { date: '2026-01', count: 12 },
        { date: '2026-02', count: 18 },
        { date: '2026-03', count: 24 },
        { date: '2026-04', count: 15 },
      ],
      categoryBreakdown: [
        { category: 'Extortion / Bribery', count: 45, percentage: 29 },
        { category: 'Physical Assault', count: 30, percentage: 19 },
        { category: 'Unlawful Detention', count: 22, percentage: 14 },
        { category: 'Harassment / Intimidation', count: 20, percentage: 13 },
        { category: 'Negligence of Duty', count: 15, percentage: 10 },
        { category: 'Other', count: 24, percentage: 15 },
      ],
      statusBreakdown: [
        { status: 'received', count: 23, percentage: 15 },
        { status: 'under-review', count: 21, percentage: 13 },
        { status: 'investigating', count: 14, percentage: 9 },
        { status: 'resolved', count: 85, percentage: 55 },
        { status: 'dismissed', count: 13, percentage: 8 },
      ],
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
      summary: {
        totalComplaints: 156,
        avgResolutionDays: 9,
        resolutionRate: 63,
        complaintsThisMonth: 24,
        changeFromLastMonth: 12,
      },
    };
    return HttpResponse.json(body);
  }),

  /* ── Admin: Users ── */
  http.get('/api/admin/users', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const mockUsers: AdminUser[] = [
      {
        id: 'usr-001',
        fullName: 'Superintendent Abubakar',
        email: 'admin@npf.gov.ng',
        role: 'admin',
        status: 'active',
        stationName: 'Force HQ',
        createdAt: '2025-01-15T00:00:00Z',
        lastLoginAt: '2026-04-04T09:00:00Z',
      },
      {
        id: 'usr-002',
        fullName: 'Inspector Chukwu',
        email: 'chukwu@npf.gov.ng',
        role: 'officer',
        status: 'active',
        stationName: 'Ikeja Division',
        createdAt: '2025-03-10T00:00:00Z',
        lastLoginAt: '2026-04-03T14:30:00Z',
      },
      {
        id: 'usr-003',
        fullName: 'DSP Fatima Bello',
        email: 'fatima@npf.gov.ng',
        role: 'supervisor',
        status: 'active',
        stationName: 'Wuse Division',
        createdAt: '2025-06-01T00:00:00Z',
      },
    ];
    const body: PaginatedResponse<AdminUser> = {
      data: mockUsers,
      total: 3,
      page,
      pageSize: 10,
      totalPages: 1,
    };
    return HttpResponse.json(body);
  }),

  http.post('/api/admin/users', async ({ request }) => {
    const payload = (await request.json()) as {
      fullName: string;
      email: string;
      role: string;
    };
    const newUser: AdminUser = {
      id: 'usr-new',
      fullName: payload.fullName,
      email: payload.email,
      role: payload.role as AdminUser['role'],
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    return HttpResponse.json(newUser, { status: 201 });
  }),

  http.patch('/api/admin/users/:id', async ({ request, params }) => {
    const payload = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ id: params.id, ...payload });
  }),

  http.delete('/api/admin/users/:id', () => {
    return HttpResponse.json({ message: 'User removed' });
  }),

  /* ── Profile ── */
  http.patch('/api/profile', async () => {
    return HttpResponse.json({ message: 'Profile updated successfully.' });
  }),

  http.post('/api/profile/password', async () => {
    return HttpResponse.json({ message: 'Password changed successfully.' });
  }),
];
