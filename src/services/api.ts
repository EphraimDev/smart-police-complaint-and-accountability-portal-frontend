import type {
  DashboardStats,
  InternalComplaint,
  PaginatedResponse,
  Officer,
  Station,
  AssignComplaintPayload,
  UpdateStatusPayload,
  StatusHistoryEntry,
  ComplaintNote,
  ComplaintAssignment,
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
import type { LoginResponse, LoginFormData } from '@/types/auth';
import type {
  ComplaintFormData,
  ComplaintSubmissionResponse,
  ComplaintResult,
} from '@/types/complaint';

/* ═══════════════════════════════════════════════
   Common API Client
   ═══════════════════════════════════════════════ */

const API_BASE = import.meta.env.VITE_API_BASE_URL + '/api/v1';
const TOKEN_KEY = 'spcap_token';
const REFRESH_TOKEN_KEY = 'spcap_refresh_token';

/* ── Token helpers ── */

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/* ── Headers ── */

function authHeaders(): HeadersInit {
  const token = getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/* ── Core request helper with token refresh ── */

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token available');

  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    clearTokens();
    throw new Error('Session expired. Please log in again.');
  }

  const data = (await res.json()) as { accessToken: string; refreshToken: string };
  setTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;

  const res = await fetch(fullUrl, {
    ...init,
    headers: { ...authHeaders(), ...init?.headers },
  });

  // Auto-refresh on 401
  if (res.status === 401 && getRefreshToken()) {
    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken();
      }
      const newToken = await refreshPromise;
      refreshPromise = null;

      // Retry the original request with the new token
      const retryRes = await fetch(fullUrl, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${newToken}`,
          ...init?.headers,
        },
      });

      if (!retryRes.ok) {
        const body = await retryRes.json().catch(() => ({}));
        throw new Error(
          (body as { message?: string }).message ?? `Request failed (${retryRes.status})`,
        );
      }

      // Handle 204 No Content
      if (retryRes.status === 204) return {} as T;
      return retryRes.json() as Promise<T>;
    } catch {
      refreshPromise = null;
      clearTokens();
      window.location.href = '/login';
      throw new Error('Session expired. Please log in again.');
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ?? `Request failed (${res.status})`,
    );
  }

  // Handle 204 No Content
  if (res.status === 204) return {} as T;
  return res.json() as Promise<T>;
}

/* ── Public request (no auth headers) ── */

async function publicRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const fullUrl = `${API_BASE}${url}`;
  const res = await fetch(fullUrl, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ?? `Request failed (${res.status})`,
    );
  }

  if (res.status === 204) return {} as T;
  return res.json() as Promise<T>;
}

/* ═══════════════════════════════════════════════
   Auth
   ═══════════════════════════════════════════════ */

export async function login(data: LoginFormData): Promise<LoginResponse> {
  const response = await publicRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ ...data, deviceInfo: navigator.userAgent }),
    // headers: { 'user-agent': navigator.userAgent },
  });
  setTokens(response.accessToken, response.refreshToken);
  return response;
}

export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken();
  try {
    if (refreshToken) {
      await request('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    }
  } finally {
    clearTokens();
  }
}

export function changePassword(
  payload: ChangePasswordPayload,
): Promise<{ message: string }> {
  return request('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/* ═══════════════════════════════════════════════
   Users / Profile
   ═══════════════════════════════════════════════ */

export function fetchCurrentUser(): Promise<AdminUser> {
  return request('/users/me');
}

export function fetchUsers(
  page = 1,
  limit = 20,
  search?: string,
): Promise<PaginatedResponse<AdminUser>> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.set('search', search);
  return request(`/users?${params}`);
}

export function fetchUser(id: string): Promise<AdminUser> {
  return request(`/users/${id}`);
}

export function createUser(payload: CreateUserPayload): Promise<AdminUser> {
  return request('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateUser(id: string, payload: UpdateUserPayload): Promise<AdminUser> {
  return request(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deactivateUser(id: string): Promise<AdminUser> {
  return request(`/users/${id}/deactivate`, { method: 'PATCH' });
}

export function activateUser(id: string): Promise<AdminUser> {
  return request(`/users/${id}/activate`, { method: 'PATCH' });
}

export function assignUserRoles(id: string, roleIds: string[]): Promise<AdminUser> {
  return request(`/users/${id}/roles`, {
    method: 'PATCH',
    body: JSON.stringify({ roleIds }),
  });
}

export function updateProfile(payload: ProfileUpdatePayload): Promise<AdminUser> {
  return request('/users/me', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

/* ═══════════════════════════════════════════════
   Roles & Permissions
   ═══════════════════════════════════════════════ */

export function fetchRoles(): Promise<
  Array<{ id: string; name: string; description?: string }>
> {
  return request('/roles');
}

export function fetchPermissions(): Promise<Array<{ id: string; name: string }>> {
  return request('/permissions');
}

/* ═══════════════════════════════════════════════
   Complaints
   ═══════════════════════════════════════════════ */

export function submitComplaint(
  data: Omit<ComplaintFormData, 'consent'>,
  files?: File[],
): Promise<ComplaintSubmissionResponse> {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('category', data.category);
  if (data.severity) formData.append('severity', data.severity);
  formData.append('isAnonymous', String(data.isAnonymous || false));
  formData.append('complainantName', data.complainantName);
  formData.append('complainantEmail', data.complainantEmail);
  formData.append('complainantPhone', data.complainantPhone);
  if (data.incidentDate) formData.append('incidentDate', data.incidentDate);
  if (data.incidentLocation) formData.append('incidentLocation', data.incidentLocation);
  formData.append('channel', 'web');
  formData.append('source', 'citizen_direct');

  if (files?.length) {
    files.forEach((file) => formData.append('attachments', file));
  }

  const fullUrl = `${API_BASE}/complaints`;
  return fetch(fullUrl, {
    method: 'POST',
    body: formData,
  }).then(async (res) => {
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(
        (body as { message?: string }).message ?? `Request failed (${res.status})`,
      );
    }
    return res.json() as Promise<ComplaintSubmissionResponse>;
  });
}

export function trackComplaint(reference: string): Promise<ComplaintResult> {
  return publicRequest('/complaints/track', {
    method: 'POST',
    body: JSON.stringify({ reference }),
  });
}

export function fetchComplaints(
  page = 1,
  limit = 20,
  filters?: {
    status?: string;
    category?: string;
    severity?: string;
    search?: string;
    stationId?: string;
    officerId?: string;
  },
): Promise<PaginatedResponse<InternalComplaint>> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filters?.status) params.set('status', filters.status);
  if (filters?.category) params.set('category', filters.category);
  if (filters?.severity) params.set('severity', filters.severity);
  if (filters?.search) params.set('search', filters.search);
  if (filters?.stationId) params.set('stationId', filters.stationId);
  if (filters?.officerId) params.set('officerId', filters.officerId);
  return request(`/complaints?${params}`);
}

export function fetchComplaint(id: string): Promise<InternalComplaint> {
  return request(`/complaints/${id}`);
}

export function updateComplaint(
  id: string,
  payload: {
    title?: string;
    description?: string;
    severity?: string;
    incidentLocation?: string;
    stationId?: string;
  },
): Promise<InternalComplaint> {
  return request(`/complaints/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function updateComplaintStatus(
  id: string,
  payload: UpdateStatusPayload,
): Promise<InternalComplaint> {
  return request(`/complaints/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function fetchComplaintTimeline(id: string): Promise<StatusHistoryEntry[]> {
  return request(`/complaints/${id}/timeline`);
}

export function addComplaintNote(
  id: string,
  payload: { content: string; isInternal?: boolean; noteType?: string },
): Promise<ComplaintNote> {
  return request(`/complaints/${id}/notes`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchComplaintNotes(id: string): Promise<ComplaintNote[]> {
  return request(`/complaints/${id}/notes`);
}

/* ═══════════════════════════════════════════════
   Complaint Assignments
   ═══════════════════════════════════════════════ */

export function assignComplaint(
  payload: AssignComplaintPayload,
): Promise<ComplaintAssignment> {
  return request('/complaint-assignments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchAssignmentsForComplaint(
  complaintId: string,
): Promise<ComplaintAssignment[]> {
  return request(`/complaint-assignments/complaint/${complaintId}`);
}

export function reassignComplaint(
  assignmentId: string,
  payload: { newAssigneeId: string; reason?: string },
): Promise<ComplaintAssignment> {
  return request(`/complaint-assignments/${assignmentId}/reassign`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

/* ═══════════════════════════════════════════════
   Complaint Status History
   ═══════════════════════════════════════════════ */

export function fetchStatusHistory(complaintId: string): Promise<StatusHistoryEntry[]> {
  return request(`/complaint-status-history/${complaintId}`);
}

/* ═══════════════════════════════════════════════
   Officers
   ═══════════════════════════════════════════════ */

export function fetchOfficers(
  page = 1,
  limit = 20,
  search?: string,
): Promise<PaginatedResponse<Officer>> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.set('search', search);
  return request(`/officers?${params}`);
}

export function fetchOfficer(id: string): Promise<Officer> {
  return request(`/officers/${id}`);
}

/* ═══════════════════════════════════════════════
   Police Stations
   ═══════════════════════════════════════════════ */

export function fetchStations(
  page = 1,
  limit = 20,
  search?: string,
): Promise<PaginatedResponse<Station>> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.set('search', search);
  return request(`/police-stations?${params}`);
}

export function fetchStation(id: string): Promise<Station> {
  return request(`/police-stations/${id}`);
}

/* ═══════════════════════════════════════════════
   Reports
   ═══════════════════════════════════════════════ */

function reportParams(filters?: ReportFilters): string {
  const params = new URLSearchParams();
  if (filters?.startDate) params.set('startDate', filters.startDate);
  if (filters?.endDate) params.set('endDate', filters.endDate);
  if (filters?.stationId) params.set('stationId', filters.stationId);
  if (filters?.officerId) params.set('officerId', filters.officerId);
  if (filters?.category) params.set('category', filters.category);
  if (filters?.period) params.set('period', filters.period);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export function fetchComplaintSummaryReport(filters?: ReportFilters) {
  return request(`/reports/complaints/summary${reportParams(filters)}`);
}

export function fetchResolutionMetrics(filters?: ReportFilters) {
  return request(`/reports/complaints/resolution${reportParams(filters)}`);
}

export function fetchOverdueReport(filters?: ReportFilters) {
  return request(`/reports/complaints/overdue${reportParams(filters)}`);
}

export function fetchEscalationMetrics(filters?: ReportFilters) {
  return request(`/reports/escalations${reportParams(filters)}`);
}

export function fetchTrendData(filters?: ReportFilters) {
  return request(`/reports/trends${reportParams(filters)}`);
}

/**
 * Aggregate reports from multiple endpoints.
 * Falls back gracefully if individual endpoints fail.
 */
export async function fetchReports(filters?: ReportFilters): Promise<ReportsData> {
  const [summary, trends, escalation] = await Promise.allSettled([
    fetchComplaintSummaryReport(filters),
    fetchTrendData(filters),
    fetchEscalationMetrics(filters),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const summaryData = summary.status === 'fulfilled' ? (summary.value as any) : {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const trendsData = trends.status === 'fulfilled' ? (trends.value as any) : {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const escalationData =
    escalation.status === 'fulfilled' ? (escalation.value as any) : {};

  return {
    complaintsTrend: trendsData.data ?? trendsData.trends ?? [],
    categoryBreakdown: summaryData.categoryBreakdown ?? [],
    statusBreakdown: summaryData.statusBreakdown ?? [],
    stationRankings: summaryData.stationRankings ?? [],
    officerPerformance: summaryData.officerPerformance ?? [],
    summary: {
      totalComplaints: summaryData.totalComplaints ?? 0,
      avgResolutionDays: summaryData.avgResolutionDays ?? 0,
      resolutionRate: summaryData.resolutionRate ?? 0,
      complaintsThisMonth: summaryData.complaintsThisMonth ?? 0,
      changeFromLastMonth: summaryData.changeFromLastMonth ?? 0,
      ...escalationData,
    },
  };
}

/* ═══════════════════════════════════════════════
   Admin Dashboard
   ═══════════════════════════════════════════════ */

export function fetchDashboardStats(): Promise<DashboardStats> {
  return request('/admin/dashboard');
}

/* ═══════════════════════════════════════════════
   Oversight / Escalations
   ═══════════════════════════════════════════════ */

export function escalateComplaint(payload: {
  complaintId: string;
  reason: string;
  description?: string;
  escalatedToId?: string;
}) {
  return request('/oversight/escalations', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/* ═══════════════════════════════════════════════
   Health
   ═══════════════════════════════════════════════ */

export function healthCheck() {
  return publicRequest('/health');
}
