import express from 'express';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import firebaseConfigData from './firebase-applet-config.json';
import { evaluateLandslideRisk } from './src/services/mlRiskEngine';
import type { SensorTelemetry, LandslideStation } from './src/types/landslide';

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

app.use(express.static('dist'));
app.get('*', (_req, res) => {
  res.sendFile('index.html', { root: 'dist' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[BhuShakti] Sensor API + dashboard running on port ${PORT}`);
});
