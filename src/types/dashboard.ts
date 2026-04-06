import type { ComplaintStatus } from './complaint';

/* ── Dashboard stats (from GET /api/v1/admin/dashboard) ── */
export interface DashboardStats {
  success: true;
  message: 'Success';
  correlationId: 'unknown';
  data: {
    stats: {
      totalComplaints: number;
      openComplaints: number;
      resolvedComplaints: number;
      overdueComplaints: number;
      totalUsers: number;
      activeUsers: number;
      totalOfficers: number;
      totalStations: number;
      pendingEscalations: number;
    };
    recentComplaints: {
      id: string;
      createdAt: string;
      referenceNumber: string;
      title: string;
      status: ComplaintStatus;
      severity: string;
    }[];
  };
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
  success: true;
  message: 'Success';
  correlationId: 'unknown';
  data: {
    id: string;
    createdAt: string;
    updatedAt: string;
    createdBy: null | string;
    updatedBy: null | string;
    referenceNumber: string;
    title: string;
    description: string;
    status: ComplaintStatus;
    severity: string;
    category: string;
    source: string;
    channel: string;
    isAnonymous: boolean;
    citizenUserId: string | null;
    complainantNameEncrypted: string;
    complainantEmailEncrypted: string;
    complainantPhoneEncrypted: string;
    complainantAddressEncrypted: string | null;
    incidentDate: string;
    incidentLocation: string;
    stationId: string | null;
    trackingToken: string;
    resolutionSummary: string | null;
    closedAt: string | null;
    slaDueDate: string | null;
    isOverdue: boolean;
    idempotencyKey: string | null;
    version: number;
    station: {
      id: string;
      code: string;
      name: string;
      address: string;
    } | null;
    complainantName: string;
    complainantEmail: string;
    complainantPhone: string;
    complainantAddress: string;
    assignedOfficers: { id: string; firstName: string; lastName: string }[];
  };
}

export interface ComplaintListResponse {
  success: true;
  message: 'Success';
  correlationId: 'unknown';
  data: {
    id: string;
    createdAt: string;
    updatedAt: string;
    referenceNumber: string;
    title: string;
    status: ComplaintStatus;
    severity: string;
    category: string;
    source: string;
    channel: string;
    isAnonymous: boolean;
    stationId: string | null;
    slaDueDate: string | null;
    isOverdue: boolean;
    station: { id: string; name: string } | null;
  }[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface StatusHistoryEntry {
  id: string;
  createdAt: string;
  updatedAt: string;
  complaintId: string;
  previousStatus: ComplaintStatus | null;
  newStatus: ComplaintStatus;
  changedById: string;
  reasonCode: string | null;
  reason: string;
  metadata: Record<string, unknown> | null;
  changedBy: {
    id: true;
    firstName: true;
    lastName: true;
  } | null;
}

export interface StatusHistoryEntryResponse {
  success: true;
  message: 'Success';
  correlationId: 'unknown';
  data: StatusHistoryEntry[];
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
  status:
    | 'pending'
    | 'accepted'
    | 'in_progress'
    | 'completed'
    | 'reassigned'
    | 'declined';
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

export interface CreateStationPayload {
  name: string;
  code: string;
  address?: string;
  region?: string;
  phone?: string;
  email?: string;
}
