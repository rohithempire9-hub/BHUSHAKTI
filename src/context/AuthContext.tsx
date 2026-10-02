import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BhuUser, UserRole, RolePermissions, ROLE_PERMISSIONS } from '../types/auth';
import {
  authApi,
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser
} from '../services/apiClient';

interface AuthContextValue {
  user: BhuUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  rolePermissions: RolePermissions;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  loginWithGoogle: (params: {
    email: string;
    full_name?: string;
    avatar_url?: string;
    phone?: string;
    organization?: string;
    role?: UserRole;
  }) => Promise<{ ok: boolean; isNewUser?: boolean; user: BhuUser }>;
  updateProfile: (updates: Partial<Pick<BhuUser, 'full_name' | 'phone' | 'organization' | 'role' | 'avatar_url'>>) => Promise<void>;
  register: (data: {
    full_name: string;
    email: string;
    phone: string;
    organization: string;
    role: UserRole;
    password: string;
    confirm_password: string;
    agree_terms: boolean;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUserRole: (newRole: UserRole) => void;
}

const DEFAULT_PERMISSIONS: RolePermissions = {
  canManageUsers: false,
  canConfigureSensors: true,
  canDispatchAlerts: true,
  canViewReports: true,
  canSubmitFieldEvidence: true,
  canSimulateDisasters: true,
  canViewGIS: true,
  isReadOnly: false
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [user, setUser] = useState<BhuUser | null>(() => getStoredUser());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate session on boot
  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      const storedToken = getStoredToken();
      if (!storedToken) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const res = await authApi.getMe();
        if (isMounted && res.ok && res.user) {
          setUser(res.user);
          setStoredUser(res.user);
        }
      } catch (err) {
        console.warn('[Auth] Session check fallback:', err);
        // If expired or invalid 401, clear stored auth
        if ((err as any)?.status === 401) {
          if (isMounted) {
            setUser(null);
            setToken(null);
            setStoredToken(null);
            setStoredUser(null);
          }
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string, rememberMe = true) => {
    setIsLoading(true);
    try {
      const res = await authApi.login({ email, password, rememberMe });
      if (res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: {
    full_name: string;
    email: string;
    phone: string;
    organization: string;
    role: UserRole;
    password: string;
    confirm_password: string;
    agree_terms: boolean;
  }) => {
    setIsLoading(true);
    try {
      const res = await authApi.register(data);
      if (res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } catch (e) {
      console.warn('[Auth] Logout warning:', e);
    } finally {
      setUser(null);
      setToken(null);
      setStoredToken(null);
      setStoredUser(null);
      setIsLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await authApi.getMe();
      if (res.ok && res.user) {
        setUser(res.user);
        setStoredUser(res.user);
      }
    } catch (e) {
      console.warn('[Auth] User refresh failed:', e);
    }
  }, []);

  const updateUserRole = useCallback((newRole: UserRole) => {
    if (!user) return;
    const updated = { ...user, role: newRole };
    setUser(updated);
    setStoredUser(updated);
  }, [user]);

  const role = user?.role || 'Disaster Management Officer';
  const rolePermissions = ROLE_PERMISSIONS[role] || DEFAULT_PERMISSIONS;

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isLoading,
    rolePermissions,
    login,
    register,
    logout,
    refreshUser,
    updateUserRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
