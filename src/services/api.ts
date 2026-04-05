import type {
  DashboardStats,
  InternalComplaint,
  PaginatedResponse,
  Officer,
  Station,
  AssignComplaintPayload,
  UpdateStatusPayload,
} from '@/types/dashboard';
import type {
  ReportsData,
  ReportFilters,
  AdminUser,
  CreateUserPayload,
  UpdateUserPayload,
  ProfileUpdatePayload,
  ChangePasswordPayload,
} from '@/types/reports';

/* ── Helpers ── */

const TOKEN_KEY = 'spcap_token';

function authHeaders(): HeadersInit {
  const token = localStorage.getItem(TOKEN_KEY);
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { ...authHeaders(), ...init?.headers },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ?? `Request failed (${res.status})`,
    );
  }

  return res.json() as Promise<T>;
}

/* ── Dashboard ── */

export function fetchDashboardStats(): Promise<DashboardStats> {
  return request<DashboardStats>('/api/dashboard/stats');
}

/* ── Complaints ── */

export function fetchComplaints(
  page = 1,
  status?: string,
): Promise<PaginatedResponse<InternalComplaint>> {
  const params = new URLSearchParams({ page: String(page) });
  if (status) params.set('status', status);
  return request<PaginatedResponse<InternalComplaint>>(
    `/api/dashboard/complaints?${params}`,
  );
}

export function fetchComplaint(id: string): Promise<InternalComplaint> {
  return request<InternalComplaint>(`/api/dashboard/complaints/${id}`);
}

export function assignComplaint(
  id: string,
  payload: AssignComplaintPayload,
): Promise<InternalComplaint> {
  return request<InternalComplaint>(`/api/dashboard/complaints/${id}/assign`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateComplaintStatus(
  id: string,
  payload: UpdateStatusPayload,
): Promise<InternalComplaint> {
  return request<InternalComplaint>(`/api/dashboard/complaints/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

/* ── Officers ── */

export function fetchOfficers(page = 1): Promise<PaginatedResponse<Officer>> {
  return request<PaginatedResponse<Officer>>(`/api/dashboard/officers?page=${page}`);
}

export function fetchOfficer(id: string): Promise<Officer> {
  return request<Officer>(`/api/dashboard/officers/${id}`);
}

/* ── Stations ── */

export function fetchStations(page = 1): Promise<PaginatedResponse<Station>> {
  return request<PaginatedResponse<Station>>(`/api/dashboard/stations?page=${page}`);
}

/* ── Reports ── */

export function fetchReports(filters?: ReportFilters): Promise<ReportsData> {
  const params = new URLSearchParams();
  if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters?.dateTo) params.set('dateTo', filters.dateTo);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.category) params.set('category', filters.category);
  if (filters?.state) params.set('state', filters.state);
  if (filters?.station) params.set('station', filters.station);
  const qs = params.toString();
  return request<ReportsData>(`/api/dashboard/reports${qs ? `?${qs}` : ''}`);
}

/* ── Admin: Users ── */

export function fetchUsers(page = 1): Promise<PaginatedResponse<AdminUser>> {
  return request<PaginatedResponse<AdminUser>>(`/api/admin/users?page=${page}`);
}

export function fetchUser(id: string): Promise<AdminUser> {
  return request<AdminUser>(`/api/admin/users/${id}`);
}

export function createUser(payload: CreateUserPayload): Promise<AdminUser> {
  return request<AdminUser>('/api/admin/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateUser(id: string, payload: UpdateUserPayload): Promise<AdminUser> {
  return request<AdminUser>(`/api/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteUser(id: string): Promise<{ message: string }> {
  return request<{ message: string }>(`/api/admin/users/${id}`, {
    method: 'DELETE',
  });
}

/* ── Profile ── */

export function updateProfile(
  payload: ProfileUpdatePayload,
): Promise<{ message: string }> {
  return request<{ message: string }>('/api/profile', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function changePassword(
  payload: ChangePasswordPayload,
): Promise<{ message: string }> {
  return request<{ message: string }>('/api/profile/password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
