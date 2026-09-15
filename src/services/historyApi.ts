import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';

const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfigData) : getApp();
const db = getFirestore(firebaseApp, (firebaseConfigData as any).firestoreDatabaseId || '(default)');

function normalizeTimestamp(value: any): string {
  if (typeof value === 'string') return value;
  if (value?.toDate) return value.toDate().toISOString();
  if (value?.seconds) return new Date(Number(value.seconds) * 1000).toISOString();
  return new Date().toISOString();
}

export async function getTelemetryHistory(stationId?: string, maxRows = 120) {
  const base = collection(db, 'telemetry');
  const q = stationId
    ? query(base, where('stationId', '==', stationId), orderBy('recordedAt', 'desc'), limit(maxRows))
    : query(base, orderBy('recordedAt', 'desc'), limit(maxRows));

  const snapshot = await getDocs(q);
  return snapshot.docs.reverse().map((d) => {
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
}

export async function getRiskHistory(stationId?: string, maxRows = 120) {
  const base = collection(db, 'risk_assessments');
  const q = stationId
    ? query(base, where('stationId', '==', stationId), orderBy('recordedAt', 'desc'), limit(maxRows))
    : query(base, orderBy('recordedAt', 'desc'), limit(maxRows));

  const snapshot = await getDocs(q);
  return snapshot.docs.reverse().map((d) => {
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
}
