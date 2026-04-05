import type { ComplaintStatus } from './complaint';

/* ── Report filters ── */
export interface ReportFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: ComplaintStatus | '';
  category?: string;
  state?: string;
  station?: string;
}

/* ── Chart data points ── */
export interface TimeSeriesPoint {
  date: string;
  count: number;
}

export interface CategoryBreakdown {
  category: string;
  count: number;
  percentage: number;
}

export interface StatusBreakdown {
  status: ComplaintStatus;
  count: number;
  percentage: number;
}

export interface StationRanking {
  stationId: string;
  stationName: string;
  state: string;
  complaintCount: number;
  resolvedCount: number;
  resolutionRate: number;
}

export interface OfficerPerformance {
  officerId: string;
  officerName: string;
  rank: string;
  assignedCount: number;
  resolvedCount: number;
  avgResolutionDays: number;
}

/* ── Reports response ── */
export interface ReportsData {
  complaintsTrend: TimeSeriesPoint[];
  categoryBreakdown: CategoryBreakdown[];
  statusBreakdown: StatusBreakdown[];
  stationRankings: StationRanking[];
  officerPerformance: OfficerPerformance[];
  summary: {
    totalComplaints: number;
    avgResolutionDays: number;
    resolutionRate: number;
    complaintsThisMonth: number;
    changeFromLastMonth: number;
  };
}

/* ── Admin types ── */
export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: 'admin' | 'officer' | 'investigator' | 'supervisor';
  status: 'active' | 'inactive' | 'suspended';
  stationName?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface CreateUserPayload {
  fullName: string;
  email: string;
  role: AdminUser['role'];
  stationId?: string;
}

export interface UpdateUserPayload {
  fullName?: string;
  email?: string;
  role?: AdminUser['role'];
  status?: AdminUser['status'];
  stationId?: string;
}

/* ── Profile types ── */
export interface ProfileUpdatePayload {
  fullName: string;
  email: string;
  phone?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
