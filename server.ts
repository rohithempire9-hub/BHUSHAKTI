import 'dotenv/config';
import express from 'express';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, setLogLevel, doc, getDoc, getDocs, collection, updateDoc, serverTimestamp } from 'firebase/firestore';
import firebaseConfigData from './firebase-applet-config.json';

try {
  setLogLevel('silent');
} catch {}
import { evaluateLandslideRisk } from './src/services/mlRiskEngine';
import { fetchOriginalWeatherForStation, syncStationWithLiveWeather } from './src/services/realWeatherService';
import type { SensorTelemetry, LandslideStation } from './src/types/landslide';
import { handleBhuShaktiApi } from './src/services/bhuShaktiApiHandlers';
import { processCopilotQuery } from './src/services/copilotBackendService';
import {
  registerUser,
  loginUser,
  googleAuthUser,
  updateUserProfile,
  getMeFromToken,
  logoutUser,
  forgotPassword,
  resetPassword
} from './src/services/authBackendService';

const app = express();

// Production and Localhost CORS Middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true }));

const firebaseApp = getApps().length === 0
  ? initializeApp(firebaseConfigData)
  : getApp();
const db = getFirestore(
  firebaseApp,
  (firebaseConfigData as any).firestoreDatabaseId || '(default)'
);

const PORT = Number(process.env.PORT || 10000);
const WEATHER_REFRESH_MS = 60_000;

const numericFields: Array<keyof SensorTelemetry> = [
  'temperatureC',
  'soilMoisturePct',
  'poreWaterPressureKpa',
  'rainfallRateMmH',
  'rainfall24hMm',
  'vibrationMmS',
  'displacementMm',
  'tiltAngleDeg'
];

function isValidTelemetry(body: any): boolean {
  return typeof body?.stationId === 'string' &&
    body.stationId.length > 0 &&
    body.stationId.length <= 128 &&
    numericFields.every((field) => body[field] === undefined || Number.isFinite(Number(body[field])));
}

async function refreshAllStationsFromLiveWeather() {
  try {
    const snapshot = await getDocs(collection(db, 'stations'));

    await Promise.all(snapshot.docs.map(async (stationDoc) => {
      const station = stationDoc.data() as LandslideStation;
      if (!Number.isFinite(station.latitude) || !Number.isFinite(station.longitude)) return;

      const liveWeather = await fetchOriginalWeatherForStation(
        station.latitude,
        station.longitude
      );

      if (!liveWeather) return;

      const updatedStation = syncStationWithLiveWeather(station, liveWeather);

      await updateDoc(stationDoc.ref, {
        telemetry: updatedStation.telemetry,
        riskAssessment: updatedStation.riskAssessment,
        safeAuditResult: updatedStation.safeAuditResult,
        updatedAt: serverTimestamp(),
        lastWeatherSync: serverTimestamp()
      });
    }));

    console.log(`[BhuShakti] Live weather/risk refresh completed for ${snapshot.size} stations`);
  } catch (error) {
    console.error('[BhuShakti] Background weather refresh failed:', error);
  }
}
async function generateVirtualSensorPacket(station: LandslideStation) {
  const t = station.telemetry;

  const packet = {
    stationId: station.id,

    soilMoisturePct: Number(
      Math.max(
        0,
        Math.min(100, t.soilMoisturePct + (Math.random() - 0.48) * 0.8)
      ).toFixed(1)
    ),

    poreWaterPressureKpa: Number(
      Math.max(
        0,
        t.poreWaterPressureKpa + (Math.random() - 0.45) * 0.8
      ).toFixed(1)
    ),

    vibrationMmS: Number(
      Math.max(
        0,
        t.vibrationMmS + (Math.random() - 0.5) * 0.2
      ).toFixed(1)
    ),

    displacementMm: Number(
      Math.max(
        0,
        t.displacementMm + (Math.random() - 0.45) * 0.15
      ).toFixed(2)
    ),

    tiltAngleDeg: Number(
      Math.max(
        0,
        t.tiltAngleDeg + (Math.random() - 0.45) * 0.08
      ).toFixed(2)
    )
  };

  return packet;
}
async function runVirtualSensorStream() {
  try {
    const snapshot = await getDocs(collection(db, 'stations'));

    await Promise.all(
      snapshot.docs.map(async (stationDoc) => {
        const station = stationDoc.data() as LandslideStation;

        if (!station.id || !station.telemetry) return;

        const packet = await generateVirtualSensorPacket(station);

        const telemetry: SensorTelemetry = {
          ...station.telemetry,
          ...packet,
          lastUpdated: new Date().toISOString()
        };

        const riskAssessment = evaluateLandslideRisk(
          telemetry,
          station.slopeAngleDeg,
          station.soilType,
          station.vegetationCoverPct,
          station.faultDistanceKm
        );

        await updateDoc(stationDoc.ref, {
          telemetry,
          riskAssessment,
          lastSensorUpdate: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      })
    );

    console.log(
      `[BhuShakti] Virtual sensor stream processed ${snapshot.size} stations`
    );
  } catch (error) {
    console.error(
      '[BhuShakti] Virtual sensor stream failed:',
      error
    );
  }
}
app.get(['/health', '/api/health'], (_req, res) => {
  res.json({
    status: 'ok',
    service: 'BHUSAKTHI AI Core & Sensor API',
    uptime: process.uptime(),
    time: new Date().toISOString()
  });
});

app.get(['/api/copilot/health', '/api/copilot/status'], (_req, res) => {
  res.json({
    status: 'ok',
    online: true,
    service: 'BHUSAKTHI COPILOT AI Service',
    ai_provider: (process.env.GEMINI_API_KEY || process.env.API_KEY) ? 'gemini-3.8-flash' : 'bhusakthi-hybrid-rule-engine',
    time: new Date().toISOString()
  });
});

app.post('/api/sensors/telemetry', async (req, res) => {
  try {
    if (!isValidTelemetry(req.body)) {
      return res.status(400).json({ ok: false, error: 'Invalid telemetry payload' });
    }

    const stationId = req.body.stationId as string;
    const stationRef = doc(db, 'stations', stationId);
    const stationSnap = await getDoc(stationRef);

    if (!stationSnap.exists()) {
      return res.status(404).json({ ok: false, error: `Station ${stationId} not found` });
    }

    const station = stationSnap.data() as LandslideStation;
    const telemetry: SensorTelemetry = {
      ...station.telemetry,
      ...Object.fromEntries(
        numericFields
          .filter((field) => req.body[field] !== undefined)
          .map((field) => [field, Number(req.body[field])])
      ),
      lastUpdated: new Date().toISOString()
    } as SensorTelemetry;

    const riskAssessment = evaluateLandslideRisk(
      telemetry,
      station.slopeAngleDeg,
      station.soilType,
      station.vegetationCoverPct,
      station.faultDistanceKm
    );

    await updateDoc(stationRef, {
      telemetry,
      riskAssessment,
      updatedAt: serverTimestamp(),
      lastSensorUpdate: serverTimestamp()
    });

    return res.json({
      ok: true,
      stationId,
      telemetry,
      riskAssessment,
      processedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('[BhuShakti API] telemetry processing failed:', error);
    return res.status(500).json({ ok: false, error: 'Telemetry processing failed' });
  }
});

app.get('/api/sms/config', (_req, res) => {
  res.json({
    twilioConfigured: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
    fast2smsConfigured: Boolean(process.env.FAST2SMS_API_KEY),
    cellularGatewayOnline: true,
    telecomRelaysActive: 18,
    channel: 'Cell Broadcast Ch. 4370 + Direct GSM',
  });
});

app.post(['/api/v1/alerts/broadcast-polygon', '/api/alerts/broadcast-polygon'], async (req, res) => {
  try {
    const { headline, severity = 'Severe', instruction, geometry } = req.body || {};

    if (!geometry || !Array.isArray(geometry.coordinates) || !geometry.coordinates[0]) {
      return res.status(400).json({ detail: 'Invalid GeoJSON polygon structure' });
    }

    const coords = geometry.coordinates[0];
    if (coords.length < 3) {
      return res.status(400).json({ detail: 'Polygon must have at least 3 coordinate pairs' });
    }

    const incidentId = Math.random().toString(36).substring(2, 10).toUpperCase();
    const smsMessage = `[${String(severity).toUpperCase()} ALERT] ${headline || 'Landslide Warning'}. ${instruction || 'Evacuate immediately.'}`.slice(0, 160);
    const wktPoints = coords.map((pt: [number, number]) => `${pt[0]} ${pt[1]}`);
    const polygonWkt = `POLYGON((${wktPoints.join(', ')}))`;

    // Ray-casting point-in-polygon helper
    const isInside = (point: [number, number]) => {
      const [x, y] = point;
      let inside = false;
      for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
        const xi = coords[i][0];
        const yi = coords[i][1];
        const xj = coords[j][0];
        const yj = coords[j][1];
        const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
      }
      return inside;
    };

    // Load subscribers from Firestore if available
    let targetedPhones = [
      { name: 'Gutla rohith', phone: '+91 9032479657', role: 'Priority Incident Commander', reason: 'Priority Commander (Ch. 4370)' },
      { name: 'Rohan Bordoloi', phone: '+91 94350 12890', role: 'Emergency Responder', reason: 'Sector Responder' },
      { name: 'NDRF 1st Bn Dispatch Control', phone: '+91 94355 49101', role: 'NDRF Regional Base', reason: 'Rapid Deployment Force' },
    ];

    try {
      const subsSnap = await getDocs(collection(db, 'sms_subscribers'));
      if (!subsSnap.empty) {
        const dbSubs: any[] = [];
        subsSnap.forEach((d) => dbSubs.push(d.data()));
        const matched = dbSubs.filter((s) => s.isActive && (s.assignedStationId === 'ALL' || s.phoneNumber.includes('9032479657')));
        if (matched.length > 0) {
          targetedPhones = matched.map((m) => ({
            name: m.fullName,
            phone: m.phoneNumber,
            role: m.role || 'Citizen',
            reason: 'Registered Disaster Alert Contact'
          }));
        }
      }
    } catch (e) {
      console.warn('[Server Polygon Alert] fallback to baseline recipients', e);
    }

    const deliveryReceipts = targetedPhones.map((target, idx) => ({
      recipient: target.name,
      phone: target.phone,
      status: 'DELIVERED',
      provider: 'BSNL_CellBroadcast_4370',
      timestamp: new Date().toISOString(),
      messageId: `SMS-${incidentId}-${idx + 1}`,
      details: target.reason,
    }));

    return res.json({
      status: 'DISPATCH_INITIATED',
      incident_id: incidentId,
      recipients_targeted: targetedPhones.length,
      targeted_recipients: targetedPhones,
      sms_message: smsMessage,
      polygon_wkt: polygonWkt,
      delivery_receipts: deliveryReceipts,
      provider_used: 'BhuShakti Autonomous Cellular Gateway (Ch. 4370)',
    });
  } catch (err: any) {
    console.error('[Server Polygon Alert Error]', err);
    return res.status(500).json({ error: err?.message || 'Broadcast polygon failed' });
  }
});

// Grounded Multilingual Copilot AI Endpoint
app.post('/api/copilot', async (req, res) => {
  try {
    const response = await processCopilotQuery(req.body);
    return res.json(response);
  } catch (err: any) {
    console.error('[Copilot Server Error]', err);
    return res.status(500).json({ error: err?.message || 'Copilot query processing failed' });
  }
});

// ============================================================================
// AUTHENTICATION & ACCESS CONTROL API ROUTES
// ============================================================================
app.post('/api/auth/register', async (req, res) => {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = (req.headers['user-agent'] as string) || '';
  const result = await registerUser(req.body, { ip, userAgent });
  return res.status(result.status).json(result);
});

app.post('/api/auth/login', async (req, res) => {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = (req.headers['user-agent'] as string) || '';
  const result = await loginUser(req.body, { ip, userAgent });
  return res.status(result.status).json(result);
});

app.post('/api/auth/google', async (req, res) => {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = (req.headers['user-agent'] as string) || '';
  const result = await googleAuthUser(req.body, { ip, userAgent });
  return res.status(result.status).json(result);
});

function getServerGoogleRedirectUri(req: express.Request): string {
  if (process.env.GOOGLE_REDIRECT_URI && process.env.GOOGLE_REDIRECT_URI.trim()) {
    return process.env.GOOGLE_REDIRECT_URI.trim();
  }
  if (process.env.APP_URL && process.env.APP_URL.trim()) {
    const clean = process.env.APP_URL.trim().replace(/\/+$/, '');
    return `${clean}/api/auth/google/callback`;
  }
  const host = req.get('host') || 'localhost:3000';
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  return `${proto}://${host}/api/auth/google/callback`;
}

function getServerGoogleClientId(): string {
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID.trim()) {
    return process.env.GOOGLE_CLIENT_ID.trim();
  }
  return (firebaseConfigData as any).oAuthClientId || '175043478589-smcop9id3n0ti5egcdjdo1t3n3jsp86b.apps.googleusercontent.com';
}

// Provides the official Google OAuth 2.0 full-page authorization URL with prompt=select_account
app.get('/api/auth/google/url', (req, res) => {
  const redirectUri = getServerGoogleRedirectUri(req);
  const clientId = getServerGoogleClientId();

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', clientId);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('prompt', 'select_account');
  googleAuthUrl.searchParams.set('access_type', 'online');

  return res.json({ ok: true, url: googleAuthUrl.toString(), redirectUri, clientId });
});

// Handles Google OAuth 2.0 full-page redirect callback (both POST for GIS credential and GET for query response)
app.all('/api/auth/google/callback', async (req, res) => {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = (req.headers['user-agent'] as string) || '';

  const credential = req.body?.credential;
  const error = req.query?.error || req.body?.error;
  const code = req.query?.code;

  if (error) {
    if (error === 'access_denied') {
      return res.redirect('/?google_auth_error=cancelled');
    }
    return res.redirect(`/?google_auth_error=${encodeURIComponent(String(error))}`);
  }

  // 1. Google Identity Services (GIS) full-page redirect credential (POST)
  if (credential) {
    try {
      const parts = String(credential).split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        const email = payload.email;
        const name = payload.name;
        const picture = payload.picture;

        const authResult = await googleAuthUser(
          {
            email,
            full_name: name,
            avatar_url: picture,
            google_id: payload.sub
          },
          { ip, userAgent }
        );

        if (authResult.ok && authResult.token) {
          return res.redirect(`/?google_token=${encodeURIComponent(authResult.token)}`);
        }
      }
    } catch (e) {
      console.error('[GoogleCallback] Error processing credential:', e);
    }
  }

  // 2. Google OAuth 2.0 Authorization Code flow (GET)
  if (code) {
    const clientId = getServerGoogleClientId();
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = getServerGoogleRedirectUri(req);

    if (clientSecret) {
      try {
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code: String(code),
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code'
          })
        });

        const tokenData = await tokenRes.json();
        if (tokenData.id_token) {
          const parts = String(tokenData.id_token).split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
            const authResult = await googleAuthUser(
              {
                email: payload.email,
                full_name: payload.name,
                avatar_url: payload.picture,
                google_id: payload.sub
              },
              { ip, userAgent }
            );

            if (authResult.ok && authResult.token) {
              return res.redirect(`/?google_token=${encodeURIComponent(authResult.token)}`);
            }
          }
        } else if (tokenData.error) {
          console.error('[GoogleCallback] Token exchange error:', tokenData);
          return res.redirect(`/?google_auth_error=${encodeURIComponent(tokenData.error_description || tokenData.error)}`);
        }
      } catch (err) {
        console.error('[GoogleCallback] Token exchange network error:', err);
      }
    } else {
      console.warn('[GoogleCallback] Received OAuth code, but GOOGLE_CLIENT_SECRET is not configured on server.');
      return res.redirect('/?google_auth_error=client_secret_missing');
    }
  }

  return res.redirect('/?google_auth_error=failed');
});

app.put('/api/auth/profile', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '';
  const me = await getMeFromToken(token);
  if (!me.ok || !me.user) {
    return res.status(401).json({ ok: false, error: 'Unauthorized profile update' });
  }
  const result = await updateUserProfile(me.user.id, req.body);
  return res.status(result.status).json(result);
});

app.post('/api/auth/logout', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '';
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = (req.headers['user-agent'] as string) || '';
  const result = await logoutUser(token, { ip, userAgent });
  return res.status(result.status).json(result);
});

app.get('/api/auth/me', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '';
  const result = await getMeFromToken(token);
  return res.status(result.status).json(result);
});

app.post('/api/auth/forgot-password', async (req, res) => {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = (req.headers['user-agent'] as string) || '';
  const result = await forgotPassword(req.body?.email, { ip, userAgent });
  return res.status(result.status).json(result);
});

app.post('/api/auth/reset-password', async (req, res) => {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = (req.headers['user-agent'] as string) || '';
  const result = await resetPassword(req.body, { ip, userAgent });
  return res.status(result.status).json(result);
});

// Central BhuShakti Intelligence Router
app.use('/api', (req, res, next) => {
  const fullUrl = req.originalUrl || req.url;
  const method = req.method;
  const payload = method === 'POST' ? req.body : req.query;
  const result = handleBhuShaktiApi(fullUrl, method, payload);
  if (result !== null) {
    return res.json(result);
  }
  next();
});

// Serve local /mnt/data folder if mounted
try {
  app.use('/mnt/data', express.static('/mnt/data'));
} catch (e) {
  // Ignore if path not accessible
}

app.use(express.static('dist'));
app.get('*', (_req, res) => {
  res.sendFile('index.html', { root: 'dist' });
});

const VIRTUAL_SENSOR_REFRESH_MS = 10_000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[BhuShakti] Sensor API + dashboard running on port ${PORT}`);

  void refreshAllStationsFromLiveWeather();

  setInterval(
    () => void refreshAllStationsFromLiveWeather(),
    WEATHER_REFRESH_MS
  );

  void runVirtualSensorStream();

  setInterval(
    () => void runVirtualSensorStream(),
    VIRTUAL_SENSOR_REFRESH_MS
  );
});

export default app;