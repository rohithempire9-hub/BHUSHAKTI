export type UserRole =
  | 'Administrator'
  | 'Disaster Management Officer'
  | 'Emergency Responder'
  | 'Field Officer'
  | 'Researcher'
  | 'Viewer';

export interface BhuUser {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  organization: string;
  role: UserRole;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  status: 'active' | 'suspended';
  avatar_url?: string;
  auth_provider?: 'google' | 'microsoft' | 'password';
}

export interface UserInDb extends BhuUser {
  password_hash: string;
  reset_token?: string | null;
  reset_token_expires?: string | null;
}

export interface AuthLogRecord {
  id: string;
  user_id: string;
  email?: string;
  event: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGOUT' | 'PASSWORD_RESET' | 'ACCOUNT_CREATED';
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface AuthTokenPayload {
  user_id: string;
  email: string;
  role: UserRole;
  full_name: string;
  organization: string;
}

export interface AuthState {
  user: BhuUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface RolePermissions {
  canManageUsers: boolean;
  canConfigureSensors: boolean;
  canDispatchAlerts: boolean;
  canViewReports: boolean;
  canSubmitFieldEvidence: boolean;
  canSimulateDisasters: boolean;
  canViewGIS: boolean;
  isReadOnly: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  'Administrator': {
    canManageUsers: true,
    canConfigureSensors: true,
    canDispatchAlerts: true,
    canViewReports: true,
    canSubmitFieldEvidence: true,
    canSimulateDisasters: true,
    canViewGIS: true,
    isReadOnly: false
  },
  'Disaster Management Officer': {
    canManageUsers: false,
    canConfigureSensors: true,
    canDispatchAlerts: true,
    canViewReports: true,
    canSubmitFieldEvidence: true,
    canSimulateDisasters: true,
    canViewGIS: true,
    isReadOnly: false
  },
  'Emergency Responder': {
    canManageUsers: false,
    canConfigureSensors: false,
    canDispatchAlerts: true,
    canViewReports: true,
    canSubmitFieldEvidence: true,
    canSimulateDisasters: false,
    canViewGIS: true,
    isReadOnly: false
  },
  'Field Officer': {
    canManageUsers: false,
    canConfigureSensors: false,
    canDispatchAlerts: false,
    canViewReports: true,
    canSubmitFieldEvidence: true,
    canSimulateDisasters: false,
    canViewGIS: true,
    isReadOnly: false
  },
  'Researcher': {
    canManageUsers: false,
    canConfigureSensors: false,
    canDispatchAlerts: false,
    canViewReports: true,
    canSubmitFieldEvidence: false,
    canSimulateDisasters: true,
    canViewGIS: true,
    isReadOnly: true
  },
  'Viewer': {
    canManageUsers: false,
    canConfigureSensors: false,
    canDispatchAlerts: false,
    canViewReports: true,
    canSubmitFieldEvidence: false,
    canSimulateDisasters: false,
    canViewGIS: true,
    isReadOnly: true
  }
};
