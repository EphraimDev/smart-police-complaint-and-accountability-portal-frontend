import { Permission, type AuthUser, type PermissionValue, type UserRole } from '@/types/auth';

function hasAnyRole(user: AuthUser | null | undefined, roles: UserRole[]): boolean {
  if (!user) return false;
  return roles.includes(user.role) || user.roles?.some((role) => roles.includes(role)) === true;
}

export function hasAnyPermission(
  user: AuthUser | null | undefined,
  permissions: PermissionValue[],
): boolean {
  if (!user) return false;
  return permissions.some((permission) => user.permissions.includes(permission));
}

export function canAccessDashboard(user: AuthUser | null | undefined): boolean {
  return !!user;
}

export function canAccessComplaints(user: AuthUser | null | undefined): boolean {
  return (
    hasAnyRole(user, ['SUPER_ADMIN']) ||
    hasAnyPermission(user, [
      Permission.COMPLAINT_CREATE,
      Permission.COMPLAINT_READ,
      Permission.COMPLAINT_READ_OWN,
      Permission.COMPLAINT_UPDATE,
      Permission.COMPLAINT_DELETE,
      Permission.COMPLAINT_ASSIGN,
      Permission.COMPLAINT_ESCALATE,
      Permission.COMPLAINT_CLOSE,
    ])
  );
}

export function canAccessOfficers(user: AuthUser | null | undefined): boolean {
  return (
    hasAnyRole(user, ['SUPER_ADMIN']) ||
    hasAnyPermission(user, [
      Permission.OFFICER_CREATE,
      Permission.OFFICER_READ,
      Permission.OFFICER_UPDATE,
      Permission.OFFICER_DELETE,
    ])
  );
}

export function canAccessStations(user: AuthUser | null | undefined): boolean {
  return (
    hasAnyRole(user, ['SUPER_ADMIN']) ||
    hasAnyPermission(user, [
      Permission.STATION_CREATE,
      Permission.STATION_READ,
      Permission.STATION_UPDATE,
      Permission.STATION_DELETE,
    ])
  );
}

export function canAccessAnalytics(user: AuthUser | null | undefined): boolean {
  return (
    hasAnyRole(user, ['SUPER_ADMIN']) ||
    hasAnyPermission(user, [
      Permission.REPORT_VIEW,
      Permission.REPORT_EXPORT,
      Permission.AUDIT_READ,
      Permission.ADMIN_DASHBOARD,
    ])
  );
}

export function canAccessAudit(user: AuthUser | null | undefined): boolean {
  return (
    hasAnyRole(user, ['SUPER_ADMIN']) ||
    hasAnyPermission(user, [Permission.AUDIT_READ, Permission.ADMIN_DASHBOARD])
  );
}

export function canAccessUserManagement(user: AuthUser | null | undefined): boolean {
  return (
    hasAnyRole(user, ['SUPER_ADMIN', 'ADMIN']) ||
    hasAnyPermission(user, [
      Permission.USER_CREATE,
      Permission.USER_READ,
      Permission.USER_UPDATE,
      Permission.USER_DEACTIVATE,
      Permission.USER_ASSIGN_ROLE,
      Permission.ROLE_CREATE,
      Permission.ROLE_READ,
      Permission.ROLE_UPDATE,
      Permission.ROLE_DELETE,
    ])
  );
}
