import type { ComplaintStatus } from './complaint';

/* ── Dashboard stats ── */
export interface DashboardStats {
  totalComplaints: number;
  pendingComplaints: number;
  investigatingComplaints: number;
  resolvedComplaints: number;
  totalOfficers: number;
  totalStations: number;
  recentComplaints: InternalComplaint[];
}

/* ── Internal complaint (staff-facing, richer than public ComplaintResult) ── */
export interface InternalComplaint {
  id: string;
  trackingId: string;
  fullName: string;
  email: string;
  phone: string;
  state: string;
  lga: string;
  policeStation: string;
  officerName?: string;
  officerBadgeNumber?: string;
  incidentDate: string;
  category: string;
  description: string;
  status: ComplaintStatus;
  assignedTo?: string;
  assignedOfficerName?: string;
  submittedAt: string;
  lastUpdated: string;
  statusHistory: StatusHistoryEntry[];
  evidence: EvidenceItem[];
}

export interface StatusHistoryEntry {
  status: ComplaintStatus;
  date: string;
  note: string;
  updatedBy?: string;
}

export interface EvidenceItem {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  url: string;
}

/* ── Paginated list ── */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/* ── Assignment ── */
export interface AssignComplaintPayload {
  officerId: string;
}

export interface UpdateStatusPayload {
  status: ComplaintStatus;
  note: string;
}

/* ── Officers ── */
export interface Officer {
  id: string;
  fullName: string;
  badgeNumber: string;
  rank: string;
  email: string;
  phone: string;
  stationId: string;
  stationName: string;
  assignedComplaints: number;
  status: 'active' | 'inactive' | 'suspended';
}

/* ── Stations ── */
export interface Station {
  id: string;
  name: string;
  state: string;
  lga: string;
  address: string;
  phone: string;
  officerCount: number;
  complaintCount: number;
}
