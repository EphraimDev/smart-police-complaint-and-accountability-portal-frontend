import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  normalizePermissions,
  normalizeUserRole,
  normalizeUserRoles,
  type AuthUser,
  type AuthState,
  type LoginFormData,
} from '@/types/auth';
import {
  login as apiLogin,
  logout as apiLogout,
  getAccessToken,
  getRefreshToken,
  clearTokens,
  fetchPermissions,
} from '@/services/api';

const USER_KEY = 'spcap_user';

export interface AuthContextValue extends AuthState {
  login: (data: LoginFormData) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

type StoredAuthUser = Partial<AuthUser> & {
  id: string;
  email: string;
};

function buildAuthUser(user: {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  role?: string | null;
  roles?: Array<string | null | undefined>;
  permissions?: Array<string | null | undefined>;
  avatarUrl?: string;
  isActive?: boolean;
}): AuthUser {
  const normalizedRoles = normalizeUserRoles(user.roles?.length ? user.roles : [user.role]);
  const role = normalizeUserRole(user.role, normalizedRoles[0]);
  const fullName =
    user.fullName?.trim() ||
    `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() ||
    user.email;

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    fullName,
    role,
    roles: normalizedRoles.length ? normalizedRoles : [role],
    permissions: normalizePermissions(user.permissions),
    avatarUrl: user.avatarUrl,
    isActive: user.isActive,
  };
}

function isStoredAuthUser(value: unknown): value is StoredAuthUser {
  if (!value || typeof value !== 'object') return false;

  const record = value as Record<string, unknown>;
  return typeof record.id === 'string' && typeof record.email === 'string';
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function hydrateAuth() {
      try {
        const storedToken = getAccessToken();
        const storedRefreshToken = getRefreshToken();
        const storedUser = localStorage.getItem(USER_KEY);

        if (!storedToken || !storedUser) {
          return;
        }

        const parsedUser = JSON.parse(storedUser) as unknown;
        if (!isStoredAuthUser(parsedUser)) {
          throw new Error('Stored auth user is invalid');
        }

        const hydratedUser = buildAuthUser(parsedUser);

        if (!isMounted) return;

        setToken(storedToken);
        setRefreshToken(storedRefreshToken);
        setUser(hydratedUser);

        if (hydratedUser.permissions.length === 0) {
          try {
            const permissions = await fetchPermissions();
            if (!isMounted) return;

            const updatedUser = {
              ...hydratedUser,
              permissions: normalizePermissions(permissions),
            };

            localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
            setUser(updatedUser);
          } catch {
            // If permissions fail to load on refresh, keep the stored session alive.
          }
        }
      } catch {
        clearTokens();
        localStorage.removeItem(USER_KEY);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void hydrateAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (data: LoginFormData) => {
    const response = await apiLogin(data);
    const permissions = await fetchPermissions().catch(() => []);

    const loggedInUser = buildAuthUser({
      ...response.data.user,
      roles: response.data.user.roles,
      role: response.data.user.roles.find(Boolean),
      permissions,
    });

    localStorage.setItem(USER_KEY, JSON.stringify(loggedInUser));
    setToken(response.data.tokens.accessToken);
    setRefreshToken(response.data.tokens.refreshToken);
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
