import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';

const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfigData) : getApp();
const db = getFirestore(firebaseApp, (firebaseConfigData as any).firestoreDatabaseId || '(default)');

function timestampMs(value: any): number {
  if (value?.toMillis) return value.toMillis();
  if (value?.seconds) return Number(value.seconds) * 1000;
  const parsed = Date.parse(String(value || ''));
  return Number.isFinite(parsed) ? parsed : Date.now();
}

export type AnalyticsPoint = {
  id: string;
  stationId: string;
  stationName: string;
  timestamp: string;
  rainfallMmH: number;
  rainfall24hMm: number;
  soilMoisturePct: number;
  poreWaterPressureKpa: number;
  displacementMm: number;
  tiltAngleDeg: number;
  riskScore: number;
  riskStatus: string;
};

export async function loadFirestoreAnalytics(stationId?: string, maxRows = 160): Promise<AnalyticsPoint[]> {
  const [telemetrySnap, riskSnap] = await Promise.all([
    getDocs(collection(db, 'telemetry')),
    getDocs(collection(db, 'risk_assessments'))
  ]);

  const riskByStationTime = new Map<string, any>();
  riskSnap.forEach((d) => {
    const r: any = d.data();
    if (stationId && r.stationId !== stationId) return;
    const time = timestampMs(r.recordedAt);
    riskByStationTime.set(`${r.stationId}_${time}`, r);
  });

  const rows: AnalyticsPoint[] = [];
  telemetrySnap.forEach((d) => {
    const item: any = d.data();
    if (stationId && item.stationId !== stationId) return;
    const t = item.telemetry || {};
    const timeMs = timestampMs(item.recordedAt);
    const nearbyRisk = Array.from(riskByStationTime.entries())
      .filter(([key]) => key.startsWith(`${item.stationId}_`))
      .map(([, value]) => value)
      .sort((a, b) => Math.abs(timestampMs(a.recordedAt) - timeMs) - Math.abs(timestampMs(b.recordedAt) - timeMs))[0];
    const risk = nearbyRisk?.riskAssessment || {};

    rows.push({
      id: d.id,
      stationId: item.stationId,
      stationName: item.stationName || item.stationId,
      timestamp: new Date(timeMs).toISOString(),
      rainfallMmH: Number(t.rainfallRateMmH || 0),
      rainfall24hMm: Number(t.rainfall24hMm || 0),
      soilMoisturePct: Number(t.soilMoisturePct || 0),
      poreWaterPressureKpa: Number(t.poreWaterPressureKpa || 0),
      displacementMm: Number(t.displacementMm || 0),
      tiltAngleDeg: Number(t.tiltAngleDeg || 0),
      riskScore: Number(nearbyRisk?.riskScore ?? risk.riskScore ?? risk.score ?? 0),
      riskStatus: String(nearbyRisk?.status ?? risk.status ?? risk.riskLevel ?? 'unknown').toLowerCase()
    });
  });

  rows.sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));
  return rows.slice(-maxRows);
}
