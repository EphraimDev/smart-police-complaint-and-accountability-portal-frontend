import type { ComplaintStatus } from './complaint';

/* ── Dashboard stats (from GET /api/v1/admin/dashboard) ── */
export interface DashboardStats {
  totalComplaints: number;
  pendingComplaints: number;
  investigatingComplaints: number;
  resolvedComplaints: number;
  totalOfficers: number;
  totalStations: number;
  recentComplaints: InternalComplaint[];
}

/* ── Paginated list (common shape from API) ── */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/* ── Internal complaint (staff-facing, from GET /api/v1/complaints/{id}) ── */
export interface InternalComplaint {
  id: string;
  reference: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  status: ComplaintStatus;
  source?: string;
  channel?: string;
  isAnonymous?: boolean;
  complainantName?: string;
  complainantEmail?: string;
  complainantPhone?: string;
  complainantAddress?: string;
  incidentDate?: string;
  incidentLocation?: string;
  stationId?: string;
  station?: { id: string; name: string; code?: string };
  officerIds?: string[];
  officers?: Array<{ id: string; firstName: string; lastName: string; badgeNumber: string }>;
  assignedInvestigatorId?: string;
  assignedInvestigator?: { id: string; firstName: string; lastName: string };
  isOverdue?: boolean;
  isEscalated?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StatusHistoryEntry {
  id: string;
  status: ComplaintStatus;
  reasonCode?: string;
  reason?: string;
  resolutionSummary?: string;
  createdAt: string;
  changedBy?: { id: string; firstName: string; lastName: string };
}

export interface ComplaintNote {
  id: string;
  content: string;
  isInternal: boolean;
  noteType?: string;
  createdAt: string;
  author?: { id: string; firstName: string; lastName: string };
}

export interface EvidenceItem {
  id: string;
  complaintId: string;
  evidenceType: string;
  accessLevel: string;
  description?: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  fileHash: string;
  storagePath: string;
  createdAt: string;
}

/* ── Assignment ── */
export interface ComplaintAssignment {
  id: string;
  complaintId: string;
  assigneeId: string;
  assignee?: { id: string; firstName: string; lastName: string };
  assignmentReason?: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'reassigned' | 'declined';
  slaDueDate?: string;
  createdAt: string;
}

export interface AssignComplaintPayload {
  complaintId: string;
  assigneeId: string;
  assignmentReason?: string;
  slaDueDate?: string;
}

export interface UpdateStatusPayload {
  status: ComplaintStatus;
  reasonCode?: string;
  reason?: string;
  resolutionSummary?: string;
}

/* ── Officers ── */
export interface Officer {
  id: string;
  badgeNumber: string;
  serviceNumber?: string;
  firstName: string;
  lastName: string;
  rank: string;
  unit?: string;
  stationId?: string;
  station?: { id: string; name: string };
  joinedDate?: string;
  createdAt: string;
}

/* ── Stations ── */
export interface Station {
  id: string;
  code: string;
  name: string;
  address?: string;
  region?: string;
  phone?: string;
  email?: string;
  parentStationId?: string;
  commandingOfficerId?: string;
  createdAt: string;
}
