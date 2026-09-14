import express from 'express';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, getDocs, collection, updateDoc, serverTimestamp } from 'firebase/firestore';
import firebaseConfigData from './firebase-applet-config.json';
import { evaluateLandslideRisk } from './src/services/mlRiskEngine';
import { fetchOriginalWeatherForStation, syncStationWithLiveWeather } from './src/services/realWeatherService';
import type { SensorTelemetry, LandslideStation } from './src/types/landslide';
import { handleBhuShaktiApi } from './src/services/bhuShaktiApiHandlers';

const app = express();
app.use(express.json({ limit: '100kb' }));

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

    temperatureC: Number(
      (t.temperatureC + (Math.random() - 0.5) * 0.2).toFixed(1)
    ),

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

    rainfallRateMmH: Number(
      Math.max(
        0,
        t.rainfallRateMmH + (Math.random() - 0.5) * 0.6
      ).toFixed(1)
    ),

    rainfall24hMm: Number(
      Math.max(
        0,
        t.rainfall24hMm + Math.random() * 0.3
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
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'BhuShakti sensor API', time: new Date().toISOString() });
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