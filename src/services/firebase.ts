import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Firestore
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';
import { LandslideStation, SmsSubscriber, SmsAlertRecord, SensorTelemetry } from '../types/landslide';
import { INITIAL_STATIONS, INITIAL_SUBSCRIBERS, INITIAL_DISPATCHES } from '../data/initialStations';
import { evaluateLandslideRisk } from './mlRiskEngine';
import { auditStationSafety } from './safeZoneAuditor';

let db: Firestore | null = null;
let firebaseInitialized = false;

try {
  const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfigData) : getApp();
  // If a custom firestoreDatabaseId is specified in config, use it; otherwise default
  const databaseId = (firebaseConfigData as any).firestoreDatabaseId || '(default)';
  db = getFirestore(firebaseApp, databaseId !== '(default)' ? databaseId : undefined);
  firebaseInitialized = true;
  console.log('[Firebase] Cloud Firestore initialized with DB ID:', databaseId);
} catch (err) {
  console.warn('[Firebase] Initialization notice (using resilient local cloud sync fallback):', err);
}

export function isFirebaseAvailable(): boolean {
  return firebaseInitialized && db !== null;
}

/**
 * Initialize / seed stations into Firestore if collection is empty
 */
export async function initializeStations(): Promise<LandslideStation[]> {
  if (!db) {
    return INITIAL_STATIONS;
  }

  try {
    const stationsCol = collection(db, 'stations');
    const snapshot = await getDocs(stationsCol);

    const hasNortheastStations =
      !snapshot.empty && snapshot.docs.some((d) => d.id.startsWith('st-ne-'));

    if (snapshot.empty || !hasNortheastStations) {
      console.log('[Firebase] Seeding/Updating 16 Northeast India landslide monitoring stations to Cloud Firestore...');
      const seedPromises = INITIAL_STATIONS.map((station) =>
        setDoc(doc(db!, 'stations', station.id), {
          ...station,
          updatedAt: serverTimestamp()
        })
      );
      await Promise.all(seedPromises);
      return INITIAL_STATIONS;
    } else {
      const stations: LandslideStation[] = [];
      snapshot.forEach((d) => {
        if (d.id.startsWith('st-ne-')) {
          const raw = d.data() as LandslideStation;
          const safeStation: LandslideStation = {
            ...raw,
            disasterHistory: raw.disasterHistory || [],
            safeAuditResult: raw.safeAuditResult || auditStationSafety(raw),
          };
          stations.push(safeStation);
        }
      });
      // Sort numerically by id (st-ne-01 to st-ne-16)
      stations.sort((a, b) => a.id.localeCompare(b.id));
      return stations.length >= 16 ? stations : INITIAL_STATIONS;
    }
  } catch (err) {
    console.warn('[Firebase] Error reading stations from Firestore, using initial seed:', err);
    return INITIAL_STATIONS;
  }
}

/**
 * Update station live telemetry and re-evaluate ML risk
 */
export async function updateStationTelemetry(
  stationId: string,
  newTelemetry: Partial<SensorTelemetry>,
  currentStation: LandslideStation
): Promise<LandslideStation> {
  const updatedTelemetry: SensorTelemetry = {
    ...currentStation.telemetry,
    ...newTelemetry,
    lastUpdated: new Date().toISOString()
  };

  const newRiskAssessment = evaluateLandslideRisk(
    updatedTelemetry,
    currentStation.slopeAngleDeg,
    currentStation.soilType,
    currentStation.vegetationCoverPct,
    currentStation.faultDistanceKm
  );

  let updatedStation: LandslideStation = {
    ...currentStation,
    telemetry: updatedTelemetry,
    riskAssessment: newRiskAssessment
  };

  updatedStation.safeAuditResult = auditStationSafety(updatedStation);

  if (db) {
    try {
      await updateDoc(doc(db, 'stations', stationId), {
        telemetry: updatedTelemetry,
        riskAssessment: newRiskAssessment,
        safeAuditResult: updatedStation.safeAuditResult,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      // Non-blocking fallback
    }
  }

  return updatedStation;
}

/**
 * Fetch or initialize SMS subscribers
 */
export async function getSubscribers(): Promise<SmsSubscriber[]> {
  if (!db) {
    return INITIAL_SUBSCRIBERS;
  }
  try {
    const subsCol = collection(db, 'sms_subscribers');
    const snap = await getDocs(subsCol);
    if (snap.empty) {
      // Seed default emergency personnel
      for (const sub of INITIAL_SUBSCRIBERS) {
        await setDoc(doc(db, 'sms_subscribers', sub.id), sub);
      }
      return INITIAL_SUBSCRIBERS;
    }
    const subs: SmsSubscriber[] = [];
    snap.forEach((d) => subs.push(d.data() as SmsSubscriber));
    return subs;
  } catch (e) {
    return INITIAL_SUBSCRIBERS;
  }
}

/**
 * Register a new mobile number
 */
export async function registerSubscriber(sub: Omit<SmsSubscriber, 'id' | 'registeredAt'>): Promise<SmsSubscriber> {
  const newSub: SmsSubscriber = {
    ...sub,
    id: 'sub-' + Date.now(),
    registeredAt: new Date().toISOString()
  };

  if (db) {
    try {
      await setDoc(doc(db, 'sms_subscribers', newSub.id), newSub);
    } catch (e) {
      console.warn('[Firebase] Subscriber local fallback save', e);
    }
  }
  return newSub;
}

/**
 * Delete a subscriber
 */
export async function deleteSubscriberFromDb(id: string): Promise<void> {
  if (db) {
    try {
      await deleteDoc(doc(db, 'sms_subscribers', id));
    } catch (e) {
      console.warn('[Firebase] Delete subscriber error', e);
    }
  }
}

/**
 * Log SMS alert dispatch
 */
export async function logAlertDispatch(dispatch: SmsAlertRecord): Promise<void> {
  if (db) {
    try {
      await setDoc(doc(db, 'alert_dispatches', dispatch.id), {
        ...dispatch,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.warn('[Firebase] Dispatch log fallback', e);
    }
  }
}

/**
 * Get historical SMS dispatches
 */
export async function getAlertDispatches(): Promise<SmsAlertRecord[]> {
  if (!db) {
    return INITIAL_DISPATCHES;
  }
  try {
    const dispCol = collection(db, 'alert_dispatches');
    const snap = await getDocs(dispCol);
    if (snap.empty) {
      for (const d of INITIAL_DISPATCHES) {
        await setDoc(doc(db, 'alert_dispatches', d.id), d);
      }
      return INITIAL_DISPATCHES;
    }
    const dispatches: SmsAlertRecord[] = [];
    snap.forEach((d) => dispatches.push(d.data() as SmsAlertRecord));
    dispatches.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return dispatches;
  } catch (e) {
    return INITIAL_DISPATCHES;
  }
}
