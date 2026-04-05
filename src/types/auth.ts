import { z } from 'zod';

/* ── Roles ── */
export type UserRole = 'admin' | 'officer' | 'investigator' | 'supervisor';

/* ── User ── */
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
}

/* ── Auth state ── */
export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/* ── API response ── */
export interface LoginResponse {
  user: AuthUser;
  token: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

/* ── Form schemas ── */
export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
