import type { ComplaintStatus } from './complaint';

/* ── Report filters ── */
export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  stationId?: string;
  officerId?: string;
  category?: string;
  period?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
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

/* ── Reports response (aggregated from multiple endpoints) ── */
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
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'admin' | 'officer' | 'investigator' | 'supervisor';
  roles?: Array<{ id: string; name: string }>;
  isActive: boolean;
  stationName?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  roleIds?: string[];
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

/* ── Profile types ── */
export interface ProfileUpdatePayload {
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
