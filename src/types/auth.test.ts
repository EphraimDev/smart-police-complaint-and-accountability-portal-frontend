import { describe, expect, it } from 'vitest';
import { formatUserRole, normalizePermissions, normalizeUserRole } from './auth';

describe('auth helpers', () => {
  it('normalizes backend role values', () => {
    expect(normalizeUserRole('SUPER_ADMIN')).toBe('SUPER_ADMIN');
    expect(normalizeUserRole('admin')).toBe('ADMIN');
    expect(normalizeUserRole('ROLE_OVERSIGHT_BODY')).toBe('OVERSIGHT_BODY');
  });

  it('maps legacy aliases to the closest backend role', () => {
    expect(normalizeUserRole('supervisor')).toBe('OVERSIGHT_BODY');
    expect(normalizeUserRole('officer')).toBe('POLICE_ADMIN');
  });

  it('normalizes permissions and removes duplicates', () => {
    expect(normalizePermissions(['USER:READ', 'user:read', 'report:view'])).toEqual([
      'user:read',
      'report:view',
    ]);
  });

  it('formats roles for display', () => {
    expect(formatUserRole('SUPER_ADMIN')).toBe('Super Admin');
  });
});
