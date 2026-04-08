export type AuditAction = string;

export interface AuditLogEntry {
  actorId?: string | null;
  actorEmail?: string | null;
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  correlationId?: string | null;
  outcome?: string;
  failureReason?: string | null;
  metadata?: Record<string, unknown> | null;
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogListResponse {
  data: AuditLogEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuditLogQuery {
  mode: 'all' | 'entity' | 'actor';
  page?: number;
  limit?: number;
  actorId?: string;
  entityType?: string;
  entityId?: string;
}
