import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';
import type { LandslideStation } from '../types/landslide';

const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfigData) : getApp();
const db = getFirestore(firebaseApp, (firebaseConfigData as any).firestoreDatabaseId || '(default)');

const HISTORY_INTERVAL_MS = 30_000;
let running = false;

function getRiskScore(station: LandslideStation): number {
  const risk = station.riskAssessment as any;
  const score = Number(risk?.riskScore ?? risk?.score ?? 0);
  return Number.isFinite(score) ? score : 0;
}

function getRiskStatus(station: LandslideStation): string {
  return String((station.riskAssessment as any)?.status || (station.riskAssessment as any)?.riskLevel || 'unknown').toLowerCase();
}

async function persistHistory() {
  if (running) return;
  running = true;

  try {
    const snapshot = await getDocs(collection(db, 'stations'));
    const writes: Promise<unknown>[] = [];
    const recordedAt = Date.now();

    snapshot.forEach((stationDoc) => {
      const station = stationDoc.data() as LandslideStation;
      if (!station.id || !station.telemetry || !station.riskAssessment) return;

      const key = `${station.id}_${recordedAt}`;
      writes.push(
        setDoc(doc(db, 'telemetry', key), {
          stationId: station.id,
          stationName: station.name,
          telemetry: station.telemetry,
          recordedAt: serverTimestamp(),
          source: 'live_station_history'
        })
      );

      writes.push(
        setDoc(doc(db, 'risk_assessments', key), {
          stationId: station.id,
          stationName: station.name,
          riskAssessment: station.riskAssessment,
          riskScore: getRiskScore(station),
          status: getRiskStatus(station),
          recordedAt: serverTimestamp(),
          source: 'bhuShakti_risk_engine'
        })
      );

      const score = getRiskScore(station);
      if (score >= 80 || getRiskStatus(station) === 'critical') {
        writes.push(
          setDoc(doc(db, 'incidents', `INC-${station.id}-ACTIVE`), {
            incidentId: `INC-${station.id}-ACTIVE`,
            stationId: station.id,
            stationName: station.name,
            severity: 'CRITICAL',
            riskScore: score,
            status: 'ACTIVE',
            lastDetectedAt: serverTimestamp(),
            source: 'automatic_risk_monitor'
          }, { merge: true })
        );
      }
    });

    await Promise.all(writes);
    console.log(`[BhuShakti History] Persisted ${snapshot.size} station histories`);
  } catch (error) {
    console.warn('[BhuShakti History] Non-fatal Firestore history error:', error);
  } finally {
    running = false;
  }
}

export function startFirestoreHistoryWorker() {
  void persistHistory();
  setInterval(() => void persistHistory(), HISTORY_INTERVAL_MS);
}
