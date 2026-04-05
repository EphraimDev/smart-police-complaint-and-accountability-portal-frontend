import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchDashboardStats,
  fetchComplaints,
  fetchComplaint,
  assignComplaint,
  updateComplaintStatus,
  fetchComplaintTimeline,
  fetchComplaintNotes,
  addComplaintNote,
  fetchOfficers,
  fetchOfficer,
  fetchStations,
  fetchReports,
  fetchUsers,
  createUser,
  updateUser,
  deactivateUser,
  updateProfile,
  changePassword,
  fetchStatusHistory,
} from '@/services/api';
import type { AssignComplaintPayload, UpdateStatusPayload } from '@/types/dashboard';
import type {
  ReportFilters,
  CreateUserPayload,
  UpdateUserPayload,
  ProfileUpdatePayload,
  ChangePasswordPayload,
} from '@/types/reports';

/* ── Query keys ── */
export const queryKeys = {
  dashboardStats: ['dashboard', 'stats'] as const,
  complaints: (page: number, status?: string) => ['complaints', page, status] as const,
  complaint: (id: string) => ['complaints', id] as const,
  complaintTimeline: (id: string) => ['complaints', id, 'timeline'] as const,
  complaintNotes: (id: string) => ['complaints', id, 'notes'] as const,
  complaintHistory: (id: string) => ['complaints', id, 'history'] as const,
  officers: (page: number) => ['officers', page] as const,
  officer: (id: string) => ['officers', id] as const,
  stations: (page: number) => ['stations', page] as const,
  reports: (filters?: ReportFilters) => ['reports', filters] as const,
  users: (page: number) => ['admin', 'users', page] as const,
  user: (id: string) => ['admin', 'users', id] as const,
};

/* ── Dashboard ── */

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboardStats,
    queryFn: fetchDashboardStats,
  });
}

/* ── Complaints ── */

export function useComplaints(page = 1, status?: string) {
  return useQuery({
    queryKey: queryKeys.complaints(page, status),
    queryFn: () => fetchComplaints(page, 20, status ? { status } : undefined),
  });
}

export function useComplaint(id: string) {
  return useQuery({
    queryKey: queryKeys.complaint(id),
    queryFn: () => fetchComplaint(id),
    enabled: !!id,
  });
}

export function useComplaintTimeline(id: string) {
  return useQuery({
    queryKey: queryKeys.complaintTimeline(id),
    queryFn: () => fetchComplaintTimeline(id),
    enabled: !!id,
  });
}

export function useComplaintNotes(id: string) {
  return useQuery({
    queryKey: queryKeys.complaintNotes(id),
    queryFn: () => fetchComplaintNotes(id),
    enabled: !!id,
  });
}

export function useStatusHistory(id: string) {
  return useQuery({
    queryKey: queryKeys.complaintHistory(id),
    queryFn: () => fetchStatusHistory(id),
    enabled: !!id,
  });
}

export function useAssignComplaint(complaintId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssignComplaintPayload) => assignComplaint(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.complaint(complaintId) });
    },
  });
}

export function useUpdateComplaintStatus(complaintId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateStatusPayload) =>
      updateComplaintStatus(complaintId, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.complaint(complaintId) });
      void qc.invalidateQueries({ queryKey: queryKeys.complaintHistory(complaintId) });
    },
  });
}

export function useAddComplaintNote(complaintId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { content: string; isInternal?: boolean }) =>
      addComplaintNote(complaintId, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.complaintNotes(complaintId) });
    },
  });
}

/* ── Officers ── */

export function useOfficers(page = 1) {
  return useQuery({
    queryKey: queryKeys.officers(page),
    queryFn: () => fetchOfficers(page),
  });
}

export function useOfficer(id: string) {
  return useQuery({
    queryKey: queryKeys.officer(id),
    queryFn: () => fetchOfficer(id),
    enabled: !!id,
  });
}

/* ── Stations ── */

export function useStations(page = 1) {
  return useQuery({
    queryKey: queryKeys.stations(page),
    queryFn: () => fetchStations(page),
  });
}

/* ── Reports ── */

export function useReports(filters?: ReportFilters) {
  return useQuery({
    queryKey: queryKeys.reports(filters),
    queryFn: () => fetchReports(filters),
  });
}

/* ── Admin: Users ── */

export function useUsers(page = 1) {
  return useQuery({
    queryKey: queryKeys.users(page),
    queryFn: () => fetchUsers(page),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useUpdateUser(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateUserPayload) => updateUser(userId, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useDeactivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => deactivateUser(userId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

/* ── Profile ── */

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (payload: ProfileUpdatePayload) => updateProfile(payload),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => changePassword(payload),
  });
}
