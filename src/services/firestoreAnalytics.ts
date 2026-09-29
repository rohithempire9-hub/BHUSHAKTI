import { collection, getDocs } from 'firebase/firestore';
import { getFirestoreDb, isFirebaseAvailable } from './firebase';
import { INITIAL_STATIONS } from '../data/initialStations';

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

function generateFallbackAnalytics(stationId?: string, maxRows = 60): AnalyticsPoint[] {
  const station = INITIAL_STATIONS.find((s) => s.id === stationId) || INITIAL_STATIONS[0];
  const now = Date.now();
  const rows: AnalyticsPoint[] = [];
  const baseRain = station.telemetry.rainfallRateMmH || 5;
  const baseMoist = station.telemetry.soilMoisturePct || 65;
  const basePore = station.telemetry.poreWaterPressureKpa || 25;
  const baseDisp = station.telemetry.displacementMm || 2;
  const baseTilt = station.telemetry.tiltAngleDeg || 1.2;
  const baseScore = station.riskAssessment?.riskScore || 35;
  const status = station.riskAssessment?.status || 'low';

  for (let i = maxRows - 1; i >= 0; i--) {
    const timeMs = now - i * 15 * 60 * 1000;
    const wave = Math.sin((maxRows - i) / 4) * 0.25;
    rows.push({
      id: `fb-an-${i}`,
      stationId: station.id,
      stationName: station.name,
      timestamp: new Date(timeMs).toISOString(),
      rainfallMmH: Math.max(0, Number((baseRain * (1 + wave)).toFixed(1))),
      rainfall24hMm: Math.max(0, Number((station.telemetry.rainfall24hMm + wave * 5).toFixed(1))),
      soilMoisturePct: Math.min(100, Math.max(10, Number((baseMoist + wave * 6).toFixed(1)))),
      poreWaterPressureKpa: Math.max(0, Number((basePore + wave * 4).toFixed(1))),
      displacementMm: Math.max(0, Number((baseDisp + (maxRows - i) * 0.05).toFixed(2))),
      tiltAngleDeg: Math.max(0, Number((baseTilt + (maxRows - i) * 0.02).toFixed(2))),
      riskScore: Math.min(100, Math.max(0, Math.round(baseScore + wave * 8))),
      riskStatus: String(status).toLowerCase()
    });
  }
  return rows;
}

export async function loadFirestoreAnalytics(stationId?: string, maxRows = 160): Promise<AnalyticsPoint[]> {
  const db = getFirestoreDb();
  if (!db || !isFirebaseAvailable()) {
    return generateFallbackAnalytics(stationId, Math.min(maxRows, 60));
  }

  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 2500)
    );

    const [telemetrySnap, riskSnap] = await Promise.race([
      Promise.all([
        getDocs(collection(db, 'telemetry')),
        getDocs(collection(db, 'risk_assessments'))
      ]),
      timeoutPromise
    ]);

    if (!telemetrySnap || telemetrySnap.empty) {
      return generateFallbackAnalytics(stationId, Math.min(maxRows, 60));
    }

    const riskByStationTime = new Map<string, any>();
    riskSnap.forEach((d: any) => {
      const r: any = d.data();
      if (stationId && r.stationId !== stationId) return;
      const time = timestampMs(r.recordedAt);
      riskByStationTime.set(`${r.stationId}_${time}`, r);
    });

    const rows: AnalyticsPoint[] = [];
    telemetrySnap.forEach((d: any) => {
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
  } catch (_err) {
    return generateFallbackAnalytics(stationId, Math.min(maxRows, 60));
  }
}
