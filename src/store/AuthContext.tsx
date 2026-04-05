import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AuthUser, AuthState, LoginFormData } from '@/types/auth';
import {
  login as apiLogin,
  logout as apiLogout,
  getAccessToken,
  getRefreshToken,
  clearTokens,
} from '@/services/api';

/* ── Storage keys ── */
const USER_KEY = 'spcap_user';

/* ── Context value ── */
export interface AuthContextValue extends AuthState {
  login: (data: LoginFormData) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

/* ── Provider ── */
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /* Hydrate from storage on mount */
  useEffect(() => {
    try {
      const storedToken = getAccessToken();
      const storedRefreshToken = getRefreshToken();
      const storedUser = localStorage.getItem(USER_KEY);
      if (storedToken && storedUser) {
        setToken(storedToken);
        setRefreshToken(storedRefreshToken);
        setUser(JSON.parse(storedUser) as AuthUser);
      }
    } catch {
      clearTokens();
      localStorage.removeItem(USER_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (data: LoginFormData) => {
    const response = await apiLogin(data);

    const loggedInUser: AuthUser = {
      ...response.user,
      fullName:
        response.user.fullName ??
        `${response.user.firstName ?? ''} ${response.user.lastName ?? ''}`.trim(),
      role:
        response.user.role ??
        (response.user.roles?.[0]?.name as AuthUser['role']) ??
        'officer',
    };

    localStorage.setItem(USER_KEY, JSON.stringify(loggedInUser));
    setToken(response.accessToken);
    setRefreshToken(response.refreshToken);
    setUser(loggedInUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // Ignore logout API errors
    }
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setRefreshToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      refreshToken,
      isAuthenticated: !!token,
      isLoading,
      login,
      logout,
    }),
    [user, token, refreshToken, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
