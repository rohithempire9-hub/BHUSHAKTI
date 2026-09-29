import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { getFirestoreDb, isFirebaseAvailable } from './firebase';
import { INITIAL_STATIONS } from '../data/initialStations';

function normalizeTimestamp(value: any): string {
  if (typeof value === 'string') return value;
  if (value?.toDate) return value.toDate().toISOString();
  if (value?.seconds) return new Date(Number(value.seconds) * 1000).toISOString();
  return new Date().toISOString();
}

function generateFallbackTelemetry(stationId?: string, maxRows = 60) {
  const station = INITIAL_STATIONS.find((s) => s.id === stationId) || INITIAL_STATIONS[0];
  const now = Date.now();
  const rows = [];
  const baseRain = station.telemetry.rainfallRateMmH || 4;
  const baseMoist = station.telemetry.soilMoisturePct || 65;
  const basePore = station.telemetry.poreWaterPressureKpa || 25;
  const baseDisp = station.telemetry.displacementMm || 2;
  const baseTilt = station.telemetry.tiltAngleDeg || 1.2;

  for (let i = maxRows - 1; i >= 0; i--) {
    const time = new Date(now - i * 15 * 60 * 1000).toISOString();
    const wave = Math.sin((maxRows - i) / 4) * 0.2;
    rows.push({
      id: `fb-tel-${i}`,
      stationId: station.id,
      stationName: station.name,
      timestamp: time,
      rainfallRateMmH: Math.max(0, Number((baseRain * (1 + wave)).toFixed(1))),
      rainfall24hMm: Math.max(0, Number((station.telemetry.rainfall24hMm + wave * 5).toFixed(1))),
      soilMoisturePct: Math.min(100, Math.max(10, Number((baseMoist + wave * 6).toFixed(1)))),
      poreWaterPressureKpa: Math.max(0, Number((basePore + wave * 4).toFixed(1))),
      displacementMm: Math.max(0, Number((baseDisp + (maxRows - i) * 0.05).toFixed(2))),
      tiltAngleDeg: Math.max(0, Number((baseTilt + (maxRows - i) * 0.02).toFixed(2))),
      temperatureC: Number((station.telemetry.temperatureC + Math.cos(i) * 1.5).toFixed(1))
    });
  }
  return rows;
}

function generateFallbackRisk(stationId?: string, maxRows = 60) {
  const station = INITIAL_STATIONS.find((s) => s.id === stationId) || INITIAL_STATIONS[0];
  const now = Date.now();
  const rows = [];
  const baseScore = station.riskAssessment?.riskScore || 35;
  const status = station.riskAssessment?.status || 'low';
  const baseFos = station.riskAssessment?.safetyFactor || (station.riskAssessment as any)?.factorOfSafety || 1.45;

  for (let i = maxRows - 1; i >= 0; i--) {
    const time = new Date(now - i * 15 * 60 * 1000).toISOString();
    const wave = Math.sin((maxRows - i) / 5) * 4;
    rows.push({
      id: `fb-risk-${i}`,
      stationId: station.id,
      stationName: station.name,
      timestamp: time,
      riskScore: Math.min(100, Math.max(0, Math.round(baseScore + wave))),
      status: String(status).toLowerCase(),
      factorOfSafety: Math.max(0.4, Number((baseFos - wave * 0.03).toFixed(2)))
    });
  }
  return rows;
}

export async function getTelemetryHistory(stationId?: string, maxRows = 120) {
  const db = getFirestoreDb();
  if (!db || !isFirebaseAvailable()) {
    return generateFallbackTelemetry(stationId, Math.min(maxRows, 60));
  }

  try {
    const base = collection(db, 'telemetry');
    const q = stationId
      ? query(base, where('stationId', '==', stationId), orderBy('recordedAt', 'desc'), limit(maxRows))
      : query(base, orderBy('recordedAt', 'desc'), limit(maxRows));

    const timeoutPromise = new Promise<any>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 2500)
    );
    const snapshot = await Promise.race([getDocs(q), timeoutPromise]);
    if (!snapshot || snapshot.empty) {
      return generateFallbackTelemetry(stationId, Math.min(maxRows, 60));
    }

    return snapshot.docs.reverse().map((d: any) => {
      const data: any = d.data();
      const telemetry = data.telemetry || {};
      return {
        id: d.id,
        stationId: data.stationId,
        stationName: data.stationName || data.stationId,
        timestamp: normalizeTimestamp(data.recordedAt),
        rainfallRateMmH: Number(telemetry.rainfallRateMmH || 0),
        rainfall24hMm: Number(telemetry.rainfall24hMm || 0),
        soilMoisturePct: Number(telemetry.soilMoisturePct || 0),
        poreWaterPressureKpa: Number(telemetry.poreWaterPressureKpa || 0),
        displacementMm: Number(telemetry.displacementMm || 0),
        tiltAngleDeg: Number(telemetry.tiltAngleDeg || 0),
        temperatureC: Number(telemetry.temperatureC || 0)
      };
    });
  } catch (_err) {
    return generateFallbackTelemetry(stationId, Math.min(maxRows, 60));
  }
}

export async function getRiskHistory(stationId?: string, maxRows = 120) {
  const db = getFirestoreDb();
  if (!db || !isFirebaseAvailable()) {
    return generateFallbackRisk(stationId, Math.min(maxRows, 60));
  }

  try {
    const base = collection(db, 'risk_assessments');
    const q = stationId
      ? query(base, where('stationId', '==', stationId), orderBy('recordedAt', 'desc'), limit(maxRows))
      : query(base, orderBy('recordedAt', 'desc'), limit(maxRows));

    const timeoutPromise = new Promise<any>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 2500)
    );
    const snapshot = await Promise.race([getDocs(q), timeoutPromise]);
    if (!snapshot || snapshot.empty) {
      return generateFallbackRisk(stationId, Math.min(maxRows, 60));
    }

    return snapshot.docs.reverse().map((d: any) => {
      const data: any = d.data();
      const risk = data.riskAssessment || {};
      return {
        id: d.id,
        stationId: data.stationId,
        stationName: data.stationName || data.stationId,
        timestamp: normalizeTimestamp(data.recordedAt),
        riskScore: Number(data.riskScore ?? risk.riskScore ?? risk.score ?? 0),
        status: String(data.status || risk.status || risk.riskLevel || 'unknown').toLowerCase(),
        factorOfSafety: Number(risk.factorOfSafety ?? risk.safetyFactor ?? 0)
      };
    });
  } catch (_err) {
    return generateFallbackRisk(stationId, Math.min(maxRows, 60));
  }
}
