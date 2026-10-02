import { BhuUser, UserRole } from '../types/auth';

export const API_BASE_URL = (((import.meta as any).env?.VITE_API_BASE_URL) || '').replace(/\/$/, '');

const AUTH_TOKEN_KEY = 'bhusakthi_auth_token';
const AUTH_USER_KEY = 'bhusakthi_auth_user';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  } catch {}
}

export function getStoredUser(): BhuUser | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: BhuUser | null) {
  try {
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  } catch {}
}

export interface ApiErrorResponse {
  ok: false;
  status: number;
  error: string;
}

export function formatFriendlyErrorMessage(status: number, defaultError?: string): string {
  switch (status) {
    case 400:
      return defaultError || 'Invalid request parameters. Please verify your input.';
    case 401:
      return defaultError || 'Invalid email or password.';
    case 403:
      return defaultError || 'Access restricted. Insufficient operational permissions.';
    case 404:
      return defaultError || 'The requested resource or user record was not found.';
    case 409:
      return defaultError || 'An account with this email address already exists.';
    case 422:
      return defaultError || 'Validation error. Please verify all required fields.';
    case 429:
      return defaultError || 'Too many attempts. Rate limit reached. Please wait a few moments.';
    case 500:
      return 'BHUSAKTHI authentication service is temporarily unavailable. Please try again.';
    case 502:
    case 503:
      return 'Disaster intelligence gateway is undergoing maintenance. Please retry in a moment.';
    default:
      return defaultError || 'An unexpected error occurred while communicating with BHUSAKTHI services.';
  }
}

async function requestWithTimeout<T>(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 15000
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const token = getStoredToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {})
    };

    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    let data: any;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: text || response.statusText };
      }
    }

    if (!response.ok) {
      const friendlyMsg = formatFriendlyErrorMessage(response.status, data?.error || data?.detail);
      const err: any = new Error(friendlyMsg);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data as T;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      const abortErr: any = new Error('Connection timed out while contacting BHUSAKTHI disaster intelligence services.');
      abortErr.status = 504;
      throw abortErr;
    }
    if (!err.status) {
      // Network error or offline
      const netErr: any = new Error('Unable to connect to BHUSAKTHI services. Please check your network connection.');
      netErr.status = 0;
      throw netErr;
    }
    throw err;
  }
}

export const authApi = {
  async register(params: {
    full_name: string;
    email: string;
    phone: string;
    organization: string;
    role: UserRole;
    password: string;
    confirm_password: string;
    agree_terms: boolean;
  }): Promise<{ ok: boolean; token: string; user: BhuUser }> {
    const res = await requestWithTimeout<{ ok: boolean; token: string; user: BhuUser }>(
      `${API_BASE_URL}/api/auth/register`,
      {
        method: 'POST',
        body: JSON.stringify(params)
      }
    );
    if (res.token && res.user) {
      setStoredToken(res.token);
      setStoredUser(res.user);
    }
    return res;
  },

  async login(params: {
    email: string;
    password: string;
    rememberMe?: boolean;
  }): Promise<{ ok: boolean; token: string; user: BhuUser }> {
    const res = await requestWithTimeout<{ ok: boolean; token: string; user: BhuUser }>(
      `${API_BASE_URL}/api/auth/login`,
      {
        method: 'POST',
        body: JSON.stringify(params)
      }
    );
    if (res.token && res.user) {
      setStoredToken(res.token);
      setStoredUser(res.user);
    }
    return res;
  },

  async loginWithGoogle(params: {
    email: string;
    full_name?: string;
    avatar_url?: string;
    phone?: string;
    organization?: string;
    role?: UserRole;
  }): Promise<{ ok: boolean; token: string; user: BhuUser; isNewUser?: boolean }> {
    const res = await requestWithTimeout<{ ok: boolean; token: string; user: BhuUser; isNewUser?: boolean }>(
      `${API_BASE_URL}/api/auth/google`,
      {
        method: 'POST',
        body: JSON.stringify(params)
      }
    );
    if (res.token && res.user) {
      setStoredToken(res.token);
      setStoredUser(res.user);
    }
    return res;
  },

  async updateProfile(updates: Partial<Pick<BhuUser, 'full_name' | 'phone' | 'organization' | 'role' | 'avatar_url'>>): Promise<{ ok: boolean; user: BhuUser }> {
    const res = await requestWithTimeout<{ ok: boolean; user: BhuUser }>(
      `${API_BASE_URL}/api/auth/profile`,
      {
        method: 'PUT',
        body: JSON.stringify(updates)
      }
    );
    if (res.user) {
      setStoredUser(res.user);
    }
    return res;
  },

  async getMe(): Promise<{ ok: boolean; user: BhuUser }> {
    return requestWithTimeout<{ ok: boolean; user: BhuUser }>(
      `${API_BASE_URL}/api/auth/me`,
      {
        method: 'GET'
      }
    );
  },

  async logout(): Promise<{ ok: boolean; message: string }> {
    try {
      await requestWithTimeout<{ ok: boolean; message: string }>(
        `${API_BASE_URL}/api/auth/logout`,
        {
          method: 'POST'
        }
      );
    } finally {
      setStoredToken(null);
      setStoredUser(null);
    }
    return { ok: true, message: 'Logged out successfully' };
  },

  async forgotPassword(email: string): Promise<{ ok: boolean; message: string; previewResetCode?: string }> {
    return requestWithTimeout<{ ok: boolean; message: string; previewResetCode?: string }>(
      `${API_BASE_URL}/api/auth/forgot-password`,
      {
        method: 'POST',
        body: JSON.stringify({ email })
      }
    );
  },

  async resetPassword(params: {
    email: string;
    token: string;
    new_password: string;
  }): Promise<{ ok: boolean; message: string }> {
    return requestWithTimeout<{ ok: boolean; message: string }>(
      `${API_BASE_URL}/api/auth/reset-password`,
      {
        method: 'POST',
        body: JSON.stringify(params)
      }
    );
  }
};
