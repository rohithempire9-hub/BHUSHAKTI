import express from 'express';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, getDocs, collection, updateDoc, serverTimestamp } from 'firebase/firestore';
import firebaseConfigData from './firebase-applet-config.json';
import { evaluateLandslideRisk } from './src/services/mlRiskEngine';
import { fetchOriginalWeatherForStation, syncStationWithLiveWeather } from './src/services/realWeatherService';
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