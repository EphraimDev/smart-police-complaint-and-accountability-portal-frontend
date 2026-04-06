import { z } from 'zod';

/* Roles */
export type UserRole =
  | 'POLICE_ADMIN'
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'INVESTIGATOR'
  | 'OVERSIGHT_BODY'
  | 'COMPLAINANT'
  | 'PUBLIC';

export const Permission = {
  COMPLAINT_CREATE: 'complaint:create',
  COMPLAINT_READ: 'complaint:read',
  COMPLAINT_READ_OWN: 'complaint:read_own',
  COMPLAINT_UPDATE: 'complaint:update',
  COMPLAINT_DELETE: 'complaint:delete',
  COMPLAINT_ASSIGN: 'complaint:assign',
  COMPLAINT_ESCALATE: 'complaint:escalate',
  COMPLAINT_CLOSE: 'complaint:close',
  EVIDENCE_UPLOAD: 'evidence:upload',
  EVIDENCE_READ: 'evidence:read',
  EVIDENCE_DELETE: 'evidence:delete',
  OFFICER_CREATE: 'officer:create',
  OFFICER_READ: 'officer:read',
  OFFICER_UPDATE: 'officer:update',
  OFFICER_DELETE: 'officer:delete',
  STATION_CREATE: 'station:create',
  STATION_READ: 'station:read',
  STATION_UPDATE: 'station:update',
  STATION_DELETE: 'station:delete',
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DEACTIVATE: 'user:deactivate',
  USER_ASSIGN_ROLE: 'user:assign_role',
  ROLE_CREATE: 'role:create',
  ROLE_READ: 'role:read',
  ROLE_UPDATE: 'role:update',
  ROLE_DELETE: 'role:delete',
  OVERSIGHT_VIEW: 'oversight:view',
  OVERSIGHT_ACTION: 'oversight:action',
  REPORT_VIEW: 'report:view',
  REPORT_EXPORT: 'report:export',
  AUDIT_READ: 'audit:read',
  ADMIN_DASHBOARD: 'admin:dashboard',
  ADMIN_CONFIG: 'admin:config',
  AI_REQUEST_ANALYSIS: 'ai:request_analysis',
  AI_VIEW_RESULTS: 'ai:view_results',
  AI_REVIEW: 'ai:review',
  NOTIFICATION_MANAGE: 'notification:manage',
} as const;

export type PermissionValue = (typeof Permission)[keyof typeof Permission];

const ROLE_ALIASES: Record<string, UserRole> = {
  police_admin: 'POLICE_ADMIN',
  super_admin: 'SUPER_ADMIN',
  admin: 'ADMIN',
  administrator: 'ADMIN',
  investigator: 'INVESTIGATOR',
  oversight_body: 'OVERSIGHT_BODY',
  oversight: 'OVERSIGHT_BODY',
  supervisor: 'OVERSIGHT_BODY',
  complainant: 'COMPLAINANT',
  public: 'PUBLIC',
  officer: 'POLICE_ADMIN',
};

export function normalizeUserRole(...candidates: Array<string | null | undefined>): UserRole {
  for (const candidate of candidates) {
    if (!candidate) continue;

    const normalized = candidate.trim().toLowerCase();
    const compact = normalized.replace(/[\s-]+/g, '_');
    const withoutPrefix = compact.replace(/^role_/, '');

    if (withoutPrefix in ROLE_ALIASES) {
      return ROLE_ALIASES[withoutPrefix];
    }
  }

  return 'PUBLIC';
}

export function normalizeUserRoles(candidates?: Array<string | null | undefined>): UserRole[] {
  if (!candidates?.length) return [];

  return Array.from(new Set(candidates.map((candidate) => normalizeUserRole(candidate))));
}

export function normalizePermissions(
  candidates?: Array<string | null | undefined>,
): PermissionValue[] {
  if (!candidates?.length) return [];

  return Array.from(
    new Set(
      candidates
        .filter((candidate): candidate is string => !!candidate?.trim())
        .map((candidate) => candidate.trim().toLowerCase() as PermissionValue),
    ),
  );
}

export function formatUserRole(role: UserRole): string {
  return role
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/* User */
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: UserRole;
  roles?: UserRole[];
  permissions: PermissionValue[];
  avatarUrl?: string;
  isActive?: boolean;
}

/* Auth state */
export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/* API response */
export interface LoginResponse {
  success: boolean;
  message: string;
  correlationId: string;
  data: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      roles: string[];
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: string;
      tokenType: string;
    };
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: string;
  tokenType?: string;
}

export interface RefreshTokenResponse {
  success?: boolean;
  message?: string;
  correlationId?: string;
  data?: {
    tokens?: AuthTokens;
  };
  accessToken?: string;
  refreshToken?: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

/* Form schemas */
export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
