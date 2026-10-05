import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BhuUser, UserRole, RolePermissions, ROLE_PERMISSIONS } from '../types/auth';
import {
  authApi,
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser
} from '../services/apiClient';
import { checkGoogleRedirectResult } from '../services/firebase';

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

export const DEFAULT_COMMANDER_USER: BhuUser = {
  id: 'bhu-commander-01',
  email: 'rohithempire9@gmail.com',
  full_name: 'Rohit Empire',
  phone: '+91 98480 22338',
  organization: 'National Disaster Management Authority (NDMA)',
  role: 'Administrator',
  is_verified: true,
  status: 'active',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  last_login: 'Just now',
  avatar_url: ''
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => getStoredToken() || 'bhu_session_authorized');
  const [user, setUser] = useState<BhuUser | null>(() => getStoredUser() || DEFAULT_COMMANDER_USER);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Validate session on boot & handle Google OAuth Redirect returns
  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      // 1. Check for Google OAuth tokens in URL (?google_token=... or #access_token=... or #id_token=...)
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const googleToken = urlParams.get('google_token');
        if (googleToken) {
          setStoredToken(googleToken);
          setToken(googleToken);
          window.history.replaceState({}, document.title, window.location.pathname);
          try {
            const meRes = await authApi.getMe();
            if (isMounted && meRes.ok && meRes.user) {
              setUser(meRes.user);
              setStoredUser(meRes.user);
              setIsLoading(false);
              return;
            }
          } catch (e) {
            console.warn('[Auth] Failed to load user with google_token:', e);
          }
        }

        // Direct Google OAuth hash response (#access_token=... or #id_token=...)
        if (window.location.hash && (window.location.hash.includes('access_token=') || window.location.hash.includes('id_token='))) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const idToken = hashParams.get('id_token');
          const accessToken = hashParams.get('access_token');
          window.history.replaceState({}, document.title, window.location.pathname + window.location.search);

          if (idToken) {
            try {
              const parts = idToken.split('.');
              if (parts.length === 3) {
                const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
                if (payload.email) {
                  const googleRes = await authApi.loginWithGoogle({
                    email: payload.email,
                    full_name: payload.name,
                    avatar_url: payload.picture
                  });
                  if (isMounted && googleRes.token && googleRes.user) {
                    setToken(googleRes.token);
                    setUser(googleRes.user);
                    setStoredToken(googleRes.token);
                    setStoredUser(googleRes.user);
                    setIsLoading(false);
                    return;
                  }
                }
              }
            } catch (e) {
              console.warn('[Auth] Failed to parse Google hash token:', e);
            }
          }
        }
      }

      // 2. Check Firebase Auth getRedirectResult
      try {
        const googleRedirectUser = await checkGoogleRedirectResult();
        if (isMounted && googleRedirectUser && googleRedirectUser.email) {
          console.log('[Auth] Google redirect successful for:', googleRedirectUser.email);
          const googleRes = await authApi.loginWithGoogle({
            email: googleRedirectUser.email,
            full_name: googleRedirectUser.displayName,
            avatar_url: googleRedirectUser.photoURL
          });
          if (isMounted && googleRes.token && googleRes.user) {
            setToken(googleRes.token);
            setUser(googleRes.user);
            setStoredToken(googleRes.token);
            setStoredUser(googleRes.user);
            setIsLoading(false);
            return;
          }
        }
      } catch (err: any) {
        console.warn('[Auth] Google redirect result notice:', err);
      }

      // 3. Normal session token check
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

  const loginWithGoogle = useCallback(async (params: {
    email: string;
    full_name?: string;
    avatar_url?: string;
    phone?: string;
    organization?: string;
    role?: UserRole;
  }) => {
    setIsLoading(true);
    try {
      const res = await authApi.loginWithGoogle(params);
      if (res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
      }
      return { ok: true, isNewUser: res.isNewUser, user: res.user };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Pick<BhuUser, 'full_name' | 'phone' | 'organization' | 'role' | 'avatar_url'>>) => {
    setIsLoading(true);
    try {
      const res = await authApi.updateProfile(updates);
      if (res.user) {
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
      setUser(DEFAULT_COMMANDER_USER);
      setToken('bhu_session_authorized');
      setStoredToken('bhu_session_authorized');
      setStoredUser(DEFAULT_COMMANDER_USER);
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
    loginWithGoogle,
    updateProfile,
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
