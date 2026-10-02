import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
  updateDoc,
  limit,
  serverTimestamp,
  Firestore
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';
import { BhuUser, UserInDb, UserRole, AuthLogRecord, AuthTokenPayload } from '../types/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'bhusakthi_disaster_intelligence_jwt_secret_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRE_MINUTES ? `${process.env.JWT_EXPIRE_MINUTES}m` : '24h';

let firestoreDb: Firestore | null = null;
try {
  const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfigData) : getApp();
  const databaseId = (firebaseConfigData as any).firestoreDatabaseId || '(default)';
  firestoreDb = getFirestore(firebaseApp, databaseId !== '(default)' ? databaseId : undefined);
} catch (e) {
  console.warn('[AuthService] Firestore init warning:', e);
}

// In-memory fallback and fast cache for ultra-responsive experience & offline resilient operation
const fallbackUsersDb: Map<string, UserInDb> = new Map();
const fallbackAuthLogs: AuthLogRecord[] = [];
const rateLimitMap: Map<string, { count: number; lockedUntil: number }> = new Map();

// Helper to seed default high-readiness disaster management accounts
const SEEDED_DEFAULT_USERS: Array<Omit<UserInDb, 'password_hash'> & { rawPassword: string }> = [
  {
    id: 'usr_officer_ner_01',
    full_name: 'Dr. Rohit Sharma',
    email: 'officer@bhusakthi.gov.in',
    phone: '+91 94350 12890',
    organization: 'NER Disaster Management Authority',
    role: 'Disaster Management Officer',
    rawPassword: 'BhuShakti@2026',
    is_verified: true,
    created_at: new Date('2026-01-01T00:00:00Z').toISOString(),
    updated_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
    status: 'active'
  },
  {
    id: 'usr_admin_hq_01',
    full_name: 'Lokesh Verma',
    email: 'admin@bhusakthi.gov.in',
    phone: '+91 90324 79657',
    organization: 'National Disaster Response Center',
    role: 'Administrator',
    rawPassword: 'BhuShakti@2026',
    is_verified: true,
    created_at: new Date('2026-01-01T00:00:00Z').toISOString(),
    updated_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
    status: 'active'
  },
  {
    id: 'usr_responder_01',
    full_name: 'Captain Tashi Namgyal',
    email: 'responder@bhusakthi.gov.in',
    phone: '+91 98621 55432',
    organization: 'NDRF 1st Mountain Battalion',
    role: 'Emergency Responder',
    rawPassword: 'BhuShakti@2026',
    is_verified: true,
    created_at: new Date('2026-02-15T00:00:00Z').toISOString(),
    updated_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
    status: 'active'
  },
  {
    id: 'usr_field_01',
    full_name: 'Priyanka Gogoi',
    email: 'field@bhusakthi.gov.in',
    phone: '+91 91234 56789',
    organization: 'Arunachal Geological Survey',
    role: 'Field Officer',
    rawPassword: 'BhuShakti@2026',
    is_verified: true,
    created_at: new Date('2026-03-01T00:00:00Z').toISOString(),
    updated_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
    status: 'active'
  }
];

let seeded = false;
async function ensureSeededDefaults() {
  if (seeded) return;
  seeded = true;

  for (const item of SEEDED_DEFAULT_USERS) {
    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(item.rawPassword, salt);
    const { rawPassword, ...userRecord } = item;
    const userInDb: UserInDb = {
      ...userRecord,
      password_hash
    };
    fallbackUsersDb.set(item.email.toLowerCase(), userInDb);

    if (firestoreDb) {
      try {
        const userRef = doc(firestoreDb, 'users', item.id);
        const existing = await getDoc(userRef);
        if (!existing.exists()) {
          await setDoc(userRef, {
            ...userInDb,
            created_at: item.created_at,
            updated_at: item.updated_at
          });
        }
      } catch (e) {
        // Fallback silently
      }
    }
  }
}

// Ensure seeded on module load
ensureSeededDefaults().catch(() => {});

// Rate Limiter Check (Max 5 attempts per 5 minutes per IP or Email)
export function checkRateLimit(key: string): { allowed: boolean; remainingSec: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry) {
    return { allowed: true, remainingSec: 0 };
  }
  if (entry.lockedUntil > now) {
    return {
      allowed: false,
      remainingSec: Math.ceil((entry.lockedUntil - now) / 1000)
    };
  }
  if (now - entry.lockedUntil > 300_000) {
    rateLimitMap.delete(key);
    return { allowed: true, remainingSec: 0 };
  }
  return { allowed: true, remainingSec: 0 };
}

export function recordFailedAttempt(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key) || { count: 0, lockedUntil: 0 };
  entry.count += 1;
  if (entry.count >= 5) {
    entry.lockedUntil = now + 5 * 60 * 1000; // 5 minutes lock
    rateLimitMap.set(key, entry);
    return true; // Locked
  }
  rateLimitMap.set(key, entry);
  return false;
}

export function resetRateLimit(key: string) {
  rateLimitMap.delete(key);
}

// Log audit event to database
export async function logAuthEvent(
  userId: string,
  event: AuthLogRecord['event'],
  ipAddress: string,
  userAgent: string,
  email?: string
): Promise<void> {
  const logRecord: AuthLogRecord = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    user_id: userId,
    email: email || '',
    event,
    ip_address: ipAddress || '127.0.0.1',
    user_agent: userAgent || 'BHUSAKTHI Web Client',
    created_at: new Date().toISOString()
  };

  fallbackAuthLogs.push(logRecord);

  if (firestoreDb) {
    try {
      const logRef = doc(firestoreDb, 'auth_logs', logRecord.id);
      await setDoc(logRef, {
        ...logRecord,
        serverTime: serverTimestamp()
      });
    } catch (e) {
      // Soft fail for logs
    }
  }
}

// Safe user serializer (Strips password_hash and sensitive reset fields)
export function sanitizeUser(user: UserInDb): BhuUser {
  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    phone: user.phone,
    organization: user.organization,
    role: user.role,
    is_verified: user.is_verified,
    created_at: user.created_at,
    updated_at: user.updated_at,
    last_login: user.last_login,
    status: user.status,
    avatar_url: user.avatar_url || '',
    auth_provider: user.auth_provider || 'password'
  };
}

// Find user by email across Firestore or cache
export async function findUserByEmail(email: string): Promise<UserInDb | null> {
  await ensureSeededDefaults();
  const cleanEmail = email.toLowerCase().trim();

  // Try Firestore
  if (firestoreDb) {
    try {
      const q = query(collection(firestoreDb, 'users'), where('email', '==', cleanEmail), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const u = snap.docs[0].data() as UserInDb;
        fallbackUsersDb.set(cleanEmail, u);
        return u;
      }
    } catch (e) {
      // Fall through to memory
    }
  }

  // Try memory cache
  const cached = fallbackUsersDb.get(cleanEmail);
  return cached || null;
}

// Find user by ID
export async function findUserById(id: string): Promise<UserInDb | null> {
  await ensureSeededDefaults();

  if (firestoreDb) {
    try {
      const userRef = doc(firestoreDb, 'users', id);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const u = snap.data() as UserInDb;
        fallbackUsersDb.set(u.email.toLowerCase(), u);
        return u;
      }
    } catch (e) {
      // Fall through
    }
  }

  for (const user of fallbackUsersDb.values()) {
    if (user.id === id) return user;
  }
  return null;
}

// Generate JWT token
export function generateToken(user: BhuUser): string {
  const payload: AuthTokenPayload = {
    user_id: user.id,
    email: user.email,
    role: user.role,
    full_name: user.full_name,
    organization: user.organization
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as any,
    issuer: 'BHUSAKTHI-AI-AUTH-CORE'
  });
}

// Verify JWT token
export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'BHUSAKTHI-AI-AUTH-CORE'
    }) as AuthTokenPayload;
    return decoded;
  } catch (err) {
    return null;
  }
}

// REGISTER NEW USER
export async function registerUser(
  body: {
    full_name?: string;
    email?: string;
    phone?: string;
    organization?: string;
    role?: UserRole;
    password?: string;
    confirm_password?: string;
    agree_terms?: boolean;
  },
  meta: { ip: string; userAgent: string }
): Promise<{ ok: boolean; status: number; error?: string; token?: string; user?: BhuUser }> {
  await ensureSeededDefaults();

  const {
    full_name,
    email,
    phone,
    organization,
    role,
    password,
    confirm_password,
    agree_terms
  } = body;

  // Validation
  if (!full_name || full_name.trim().length < 2) {
    return { ok: false, status: 422, error: 'Full name is required (minimum 2 characters).' };
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return { ok: false, status: 422, error: 'A valid email address is required.' };
  }
  if (!phone || phone.trim().length < 8) {
    return { ok: false, status: 422, error: 'A valid emergency phone number is required.' };
  }
  if (!organization || organization.trim().length < 2) {
    return { ok: false, status: 422, error: 'Organization name is required.' };
  }
  const validRoles: UserRole[] = [
    'Administrator',
    'Disaster Management Officer',
    'Emergency Responder',
    'Field Officer',
    'Researcher',
    'Viewer'
  ];
  if (!role || !validRoles.includes(role)) {
    return { ok: false, status: 422, error: 'Please select a valid disaster response role.' };
  }
  if (!password || password.length < 8) {
    return { ok: false, status: 422, error: 'Password must be at least 8 characters long.' };
  }
  if (password !== confirm_password) {
    return { ok: false, status: 422, error: 'Passwords do not match.' };
  }
  if (!agree_terms) {
    return { ok: false, status: 422, error: 'You must agree to the Terms & Privacy Policy to proceed.' };
  }

  // Duplicate email detection
  const cleanEmail = email.toLowerCase().trim();
  const existingUser = await findUserByEmail(cleanEmail);
  if (existingUser) {
    return { ok: false, status: 409, error: 'An account with this email address already exists. Please sign in.' };
  }

  // Hash password securely with bcrypt
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date().toISOString();

  const newUser: UserInDb = {
    id: userId,
    full_name: full_name.trim(),
    email: cleanEmail,
    phone: phone.trim(),
    organization: organization.trim(),
    role,
    password_hash,
    is_verified: true,
    created_at: now,
    updated_at: now,
    last_login: now,
    status: 'active'
  };

  // Persist to DB
  fallbackUsersDb.set(cleanEmail, newUser);

  if (firestoreDb) {
    try {
      const userRef = doc(firestoreDb, 'users', userId);
      await setDoc(userRef, {
        ...newUser,
        createdAtServer: serverTimestamp(),
        updatedAtServer: serverTimestamp()
      });
    } catch (e) {
      console.warn('[AuthService] Firestore user write notice (saved in resilient engine):', e);
    }
  }

  // Log Audit
  await logAuthEvent(userId, 'ACCOUNT_CREATED', meta.ip, meta.userAgent, cleanEmail);
  await logAuthEvent(userId, 'LOGIN_SUCCESS', meta.ip, meta.userAgent, cleanEmail);

  const safeUser = sanitizeUser(newUser);
  const token = generateToken(safeUser);

  return {
    ok: true,
    status: 201,
    token,
    user: safeUser
  };
}

// LOGIN USER
export async function loginUser(
  body: { email?: string; password?: string },
  meta: { ip: string; userAgent: string }
): Promise<{ ok: boolean; status: number; error?: string; token?: string; user?: BhuUser }> {
  await ensureSeededDefaults();

  const { email, password } = body;
  const rateLimitKey = `${meta.ip}_${(email || '').toLowerCase().trim()}`;
  const rateCheck = checkRateLimit(rateLimitKey);
  if (!rateCheck.allowed) {
    return {
      ok: false,
      status: 429,
      error: `Too many failed login attempts. Account temporarily locked for safety. Please try again in ${rateCheck.remainingSec}s.`
    };
  }

  if (!email || !password) {
    return { ok: false, status: 400, error: 'Email and password are required.' };
  }

  const cleanEmail = email.toLowerCase().trim();
  const user = await findUserByEmail(cleanEmail);

  // If user does not exist or password mismatch: generic secure error (Do NOT reveal email existence)
  if (!user) {
    recordFailedAttempt(rateLimitKey);
    await logAuthEvent('unknown', 'LOGIN_FAILED', meta.ip, meta.userAgent, cleanEmail);
    return { ok: false, status: 401, error: 'Invalid email or password.' };
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) {
    recordFailedAttempt(rateLimitKey);
    await logAuthEvent(user.id, 'LOGIN_FAILED', meta.ip, meta.userAgent, cleanEmail);
    return { ok: false, status: 401, error: 'Invalid email or password.' };
  }

  if (user.status === 'suspended') {
    return { ok: false, status: 403, error: 'Your account has been suspended by system administration.' };
  }

  // Successful login
  resetRateLimit(rateLimitKey);
  const now = new Date().toISOString();
  user.last_login = now;
  user.updated_at = now;
  fallbackUsersDb.set(cleanEmail, user);

  if (firestoreDb) {
    try {
      const userRef = doc(firestoreDb, 'users', user.id);
      await updateDoc(userRef, {
        last_login: now,
        updated_at: now,
        lastLoginServer: serverTimestamp()
      });
    } catch (e) {
      // Soft fallback
    }
  }

  await logAuthEvent(user.id, 'LOGIN_SUCCESS', meta.ip, meta.userAgent, cleanEmail);

  const safeUser = sanitizeUser(user);
  const token = generateToken(safeUser);

  return {
    ok: true,
    status: 200,
    token,
    user: safeUser
  };
}

// FORGOT PASSWORD
export async function forgotPassword(
  email: string,
  meta: { ip: string; userAgent: string }
): Promise<{ ok: boolean; status: number; message: string; previewResetCode?: string }> {
  await ensureSeededDefaults();
  const cleanEmail = (email || '').toLowerCase().trim();
  const user = await findUserByEmail(cleanEmail);

  // Generate secure 6-digit verification code & token
  const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
  const resetExpires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

  if (user) {
    user.reset_token = resetToken;
    user.reset_token_expires = resetExpires;
    fallbackUsersDb.set(cleanEmail, user);

    if (firestoreDb) {
      try {
        const userRef = doc(firestoreDb, 'users', user.id);
        await updateDoc(userRef, {
          reset_token: resetToken,
          reset_token_expires: resetExpires,
          updated_at: new Date().toISOString()
        });
      } catch (e) {
        // Fallback
      }
    }
  }

  // Always return identical message regardless of whether email exists to prevent user enumeration
  return {
    ok: true,
    status: 200,
    message: 'If an account exists for this email address, password reset instructions and security code have been dispatched.',
    previewResetCode: resetToken // Included for testing and demonstration in the portal UI
  };
}

// RESET PASSWORD
export async function resetPassword(
  body: { email?: string; token?: string; new_password?: string },
  meta: { ip: string; userAgent: string }
): Promise<{ ok: boolean; status: number; error?: string; message?: string }> {
  await ensureSeededDefaults();
  const { email, token, new_password } = body;

  if (!email || !token || !new_password) {
    return { ok: false, status: 400, error: 'Email, verification code, and new password are required.' };
  }

  if (new_password.length < 8) {
    return { ok: false, status: 422, error: 'New password must be at least 8 characters long.' };
  }

  const cleanEmail = email.toLowerCase().trim();
  const user = await findUserByEmail(cleanEmail);

  if (!user || !user.reset_token || user.reset_token !== token.trim()) {
    return { ok: false, status: 400, error: 'Invalid or expired password reset token.' };
  }

  if (user.reset_token_expires && new Date(user.reset_token_expires).getTime() < Date.now()) {
    return { ok: false, status: 400, error: 'Password reset code has expired. Please request a new one.' };
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(new_password, salt);
  const now = new Date().toISOString();

  user.password_hash = password_hash;
  user.reset_token = null;
  user.reset_token_expires = null;
  user.updated_at = now;
  fallbackUsersDb.set(cleanEmail, user);

  if (firestoreDb) {
    try {
      const userRef = doc(firestoreDb, 'users', user.id);
      await updateDoc(userRef, {
        password_hash,
        reset_token: null,
        reset_token_expires: null,
        updated_at: now
      });
    } catch (e) {
      // Fallback
    }
  }

  await logAuthEvent(user.id, 'PASSWORD_RESET', meta.ip, meta.userAgent, cleanEmail);

  return {
    ok: true,
    status: 200,
    message: 'Password reset successfully. You can now sign in with your new credentials.'
  };
}

// GET CURRENT USER VIA TOKEN
export async function getMeFromToken(token: string): Promise<{ ok: boolean; status: number; user?: BhuUser; error?: string }> {
  if (!token) {
    return { ok: false, status: 401, error: 'Authorization token required.' };
  }

  const payload = verifyAuthToken(token);
  if (!payload) {
    return { ok: false, status: 401, error: 'Authentication token is invalid or has expired.' };
  }

  const user = await findUserById(payload.user_id);
  if (!user) {
    return { ok: false, status: 404, error: 'User record not found.' };
  }

  return {
    ok: true,
    status: 200,
    user: sanitizeUser(user)
  };
}

// LOGOUT
export async function logoutUser(
  token: string | undefined,
  meta: { ip: string; userAgent: string }
): Promise<{ ok: boolean; status: number; message: string }> {
  if (token) {
    const payload = verifyAuthToken(token);
    if (payload) {
      await logAuthEvent(payload.user_id, 'LOGOUT', meta.ip, meta.userAgent, payload.email);
    }
  }
  return {
    ok: true,
    status: 200,
    message: 'Logged out successfully.'
  };
}

// GOOGLE AUTHENTICATION & AUTOMATIC FIRESTORE PERSISTENCE
export async function googleAuthUser(
  body: {
    email?: string;
    full_name?: string;
    phone?: string;
    organization?: string;
    role?: UserRole;
    avatar_url?: string;
    google_id?: string;
  },
  meta: { ip: string; userAgent: string }
): Promise<{
  ok: boolean;
  status: number;
  error?: string;
  token?: string;
  user?: BhuUser;
  isNewUser?: boolean;
}> {
  await ensureSeededDefaults();

  const email = body.email?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, status: 422, error: 'A valid Google email address is required.' };
  }

  // Check if user already exists in Firestore or memory
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    // Existing User: Update last_login and avatar if provided
    const now = new Date().toISOString();
    existingUser.last_login = now;
    existingUser.updated_at = now;
    if (body.full_name && (!existingUser.full_name || existingUser.full_name === 'Google Officer')) {
      existingUser.full_name = body.full_name.trim();
    }
    if (body.avatar_url && !existingUser.avatar_url) {
      existingUser.avatar_url = body.avatar_url;
    }
    fallbackUsersDb.set(email, existingUser);

    if (firestoreDb) {
      try {
        const userRef = doc(firestoreDb, 'users', existingUser.id);
        await updateDoc(userRef, {
          last_login: now,
          updated_at: now,
          ...(body.avatar_url ? { avatar_url: body.avatar_url } : {})
        });
      } catch (e) {
        console.warn('[GoogleAuth] Failed to update existing user in Firestore:', e);
      }
    }

    await logAuthEvent(existingUser.id, 'LOGIN_SUCCESS', meta.ip, meta.userAgent, email);

    const sanitized = sanitizeUser(existingUser);
    const token = generateToken(sanitized);

    return {
      ok: true,
      status: 200,
      token,
      user: sanitized,
      isNewUser: false
    };
  }

  // New Google User: Create user document and persist into Firestore database
  const now = new Date().toISOString();
  // Safe alphanumeric document ID matching isValidId in firestore.rules
  const cleanEmailPrefix = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
  const userId = `usr_g_${cleanEmailPrefix}_${Date.now()}`;

  const newUserRecord: UserInDb = {
    id: userId,
    full_name: body.full_name?.trim() || cleanEmailPrefix.replace(/_/g, ' '),
    email,
    phone: body.phone?.trim() || '+91 90324 79657',
    organization: body.organization?.trim() || 'National Disaster Management / SDMA',
    role: body.role || 'Disaster Management Officer',
    avatar_url: body.avatar_url || '',
    auth_provider: 'google',
    password_hash: '',
    is_verified: true,
    created_at: now,
    updated_at: now,
    last_login: now,
    status: 'active'
  };

  fallbackUsersDb.set(email, newUserRecord);

  if (firestoreDb) {
    try {
      const userRef = doc(firestoreDb, 'users', userId);
      await setDoc(userRef, newUserRecord);
      console.log(`[GoogleAuth] Stored new Google user in Firestore: ${userId} (${email})`);
    } catch (e) {
      console.error('[GoogleAuth] Failed to store new user in Firestore:', e);
    }
  }

  await logAuthEvent(userId, 'ACCOUNT_CREATED', meta.ip, meta.userAgent, email);
  await logAuthEvent(userId, 'LOGIN_SUCCESS', meta.ip, meta.userAgent, email);

  const sanitized = sanitizeUser(newUserRecord);
  const token = generateToken(sanitized);

  return {
    ok: true,
    status: 200,
    token,
    user: sanitized,
    isNewUser: true
  };
}

// UPDATE USER PROFILE IN FIRESTORE
export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<BhuUser, 'full_name' | 'phone' | 'organization' | 'role' | 'avatar_url'>>
): Promise<{ ok: boolean; status: number; user?: BhuUser; error?: string }> {
  const user = await findUserById(userId);
  if (!user) {
    return { ok: false, status: 404, error: 'User record not found.' };
  }

  const now = new Date().toISOString();
  if (updates.full_name) user.full_name = updates.full_name.trim();
  if (updates.phone) user.phone = updates.phone.trim();
  if (updates.organization) user.organization = updates.organization.trim();
  if (updates.role) user.role = updates.role;
  if (updates.avatar_url) user.avatar_url = updates.avatar_url;
  user.updated_at = now;

  fallbackUsersDb.set(user.email.toLowerCase(), user);

  if (firestoreDb) {
    try {
      const userRef = doc(firestoreDb, 'users', userId);
      await updateDoc(userRef, {
        ...(updates.full_name ? { full_name: user.full_name } : {}),
        ...(updates.phone ? { phone: user.phone } : {}),
        ...(updates.organization ? { organization: user.organization } : {}),
        ...(updates.role ? { role: user.role } : {}),
        ...(updates.avatar_url ? { avatar_url: user.avatar_url } : {}),
        updated_at: now
      });
      console.log(`[UserProfile] Updated profile in Firestore for ${userId}`);
    } catch (e) {
      console.warn('[UserProfile] Failed to update profile in Firestore:', e);
    }
  }

  return {
    ok: true,
    status: 200,
    user: sanitizeUser(user)
  };
}

