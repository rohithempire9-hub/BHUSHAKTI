import './server.ts';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import firebaseConfigData from './firebase-applet-config.json';
import type { LandslideStation } from './src/types/landslide';

const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfigData) : getApp();
const db = getFirestore(firebaseApp, (firebaseConfigData as any).firestoreDatabaseId || '(default)');
const PERSISTENCE_INTERVAL_MS = 10_000;

let persistenceBusy = false;

function riskLevel(station: LandslideStation): string {
  return String((station.riskAssessment as any)?.riskLevel || (station.riskAssessment as any)?.severity || 'UNKNOWN').toUpperCase();
}

function riskScore(station: LandslideStation): number {
  const value = Number((station.riskAssessment as any)?.riskScore ?? (station.riskAssessment as any)?.score ?? 0);
  return Number.isFinite(value) ? value : 0;
}

async function persistCurrentState() {
  if (persistenceBusy) return;
  persistenceBusy = true;

  try {
    const stations = await getDocs(collection(db, 'stations'));
    const writes: Promise<unknown>[] = [];

    stations.forEach((stationDoc) => {
      const station = stationDoc.data() as LandslideStation;
      if (!station.id || !station.telemetry || !station.riskAssessment) return;

      const timestamp = Date.now();
      const base = `${station.id}_${timestamp}`;
      const level = riskLevel(station);
      const score = riskScore(station);

      // Append-only history: the dashboard continues reading the existing stations collection.
      writes.push(setDoc(doc(db, 'telemetry', base), {
        stationId: station.id,
        stationName: (station as any).name || (station as any).stationName || station.id,
        telemetry: station.telemetry,
        source: 'virtual_sensor_stream',
        recordedAt: serverTimestamp()
      }));

      writes.push(setDoc(doc(db, 'risk_assessments', base), {
        stationId: station.id,
        riskAssessment: station.riskAssessment,
        riskScore: score,
        riskLevel: level,
        source: 'bhuShakti_risk_engine',
        recordedAt: serverTimestamp()
      }));

      // Create a stable incident record when a station enters a critical state.
      if (score >= 80 || level.includes('CRITICAL')) {
        const incidentId = `INC-${station.id}-ACTIVE`;
        writes.push(setDoc(doc(db, 'incidents', incidentId), {
          incidentId,
          stationId: station.id,
          stationName: (station as any).name || (station as any).stationName || station.id,
          severity: 'CRITICAL',
          riskScore: score,
          status: 'ACTIVE',
          lastDetectedAt: serverTimestamp(),
          source: 'automatic_risk_monitor'
        }, { merge: true }));
      }
    });

    await Promise.all(writes);
    console.log(`[BhuShakti Persistence] Stored ${stations.size} station states in Firestore`);
  } catch (error) {
    // Persistence is deliberately non-fatal: an unavailable history collection must never take down the dashboard.
    console.error('[BhuShakti Persistence] History write failed:', error);
  } finally {
    persistenceBusy = false;
  }
}

setTimeout(() => void persistCurrentState(), 3_000);
setInterval(() => void persistCurrentState(), PERSISTENCE_INTERVAL_MS);
