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
import { LandslideStation, SmsSubscriber, SmsAlertRecord, SensorTelemetry, DisasterEvidenceReport } from '../types/landslide';
import { INITIAL_STATIONS, INITIAL_SUBSCRIBERS, INITIAL_DISPATCHES } from '../data/initialStations';
import { INITIAL_DISASTER_EVIDENCE } from '../data/initialEvidence';
import { evaluateLandslideRisk } from './mlRiskEngine';
import { auditStationSafety } from './safeZoneAuditor';
import { fetchOriginalWeatherForStation, syncStationWithLiveWeather, LiveWeatherData } from './realWeatherService';

let db: Firestore | null = null;
let firebaseInitialized = false;

// Cache live weather briefly so the dashboard can refresh frequently without
// hammering the public weather provider. The risk engine still runs on every
// telemetry update using the newest cached/live environmental state.
const liveWeatherCache = new Map<string, { data: LiveWeatherData; fetchedAtMs: number }>();
const LIVE_WEATHER_CACHE_MS = 30_000;

try {
  const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfigData) : getApp();
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

async function getCachedLiveWeather(station: LandslideStation): Promise<LiveWeatherData | null> {
  const cached = liveWeatherCache.get(station.id);
  const now = Date.now();
  if (cached && now - cached.fetchedAtMs < LIVE_WEATHER_CACHE_MS) {
    return cached.data;
  }

  const liveWeather = await fetchOriginalWeatherForStation(station.latitude, station.longitude);
  if (liveWeather) {
    liveWeatherCache.set(station.id, { data: liveWeather, fetchedAtMs: now });
  }
  return liveWeather;
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
          const defaultStation = INITIAL_STATIONS.find((s) => s.id === d.id);
          const baseStation = defaultStation || INITIAL_STATIONS[0];
          const rawLat = Number(raw.latitude);
          const rawLng = Number(raw.longitude);
          const validLat = typeof raw.latitude === 'number' && !isNaN(rawLat) && isFinite(rawLat) ? rawLat : (defaultStation?.latitude ?? baseStation.latitude);
          const validLng = typeof raw.longitude === 'number' && !isNaN(rawLng) && isFinite(rawLng) ? rawLng : (defaultStation?.longitude ?? baseStation.longitude);

          const safeStation: LandslideStation = {
            ...(defaultStation || raw),
            ...raw,
            latitude: validLat,
            longitude: validLng,
            telemetry: {
              ...baseStation.telemetry,
              ...(raw.telemetry || {}),
            } as any,
            riskAssessment: raw.riskAssessment || baseStation.riskAssessment,
            anthropogenicCutting: raw.anthropogenicCutting || baseStation.anthropogenicCutting,
            glacierRisk: raw.glacierRisk || baseStation.glacierRisk,
            escapeRoute: raw.escapeRoute || baseStation.escapeRoute,
            kpis: raw.kpis || baseStation.kpis,
            disasterHistory: raw.disasterHistory || baseStation.disasterHistory || [],
            safeAuditResult: raw.safeAuditResult || auditStationSafety(raw),
          };
          stations.push(safeStation);
        }
      });
      for (const initSt of INITIAL_STATIONS) {
        if (!stations.some((s) => s.id === initSt.id)) {
          stations.push(initSt);
        }
      }
      stations.sort((a, b) => {
        if (a.id === 'st-ne-agartala') return -1;
        if (b.id === 'st-ne-agartala') return 1;
        return a.id.localeCompare(b.id);
      });
      return stations.length > 0 ? stations : INITIAL_STATIONS;
    }
  } catch (err) {
    console.warn('[Firebase] Error reading stations from Firestore, using initial seed:', err);
    return INITIAL_STATIONS;
  }
}

/**
 * Update station live telemetry and re-evaluate risk.
 * The dashboard's automatic stream sends a four-field telemetry packet.
 * Those packets now trigger a live weather refresh and virtual-sensor
 * calculation instead of random sensor drift.
 */
export async function updateStationTelemetry(
  stationId: string,
  newTelemetry: Partial<SensorTelemetry>,
  currentStation: LandslideStation
): Promise<LandslideStation> {
  const automaticStreamPacket =
    Object.prototype.hasOwnProperty.call(newTelemetry, 'temperatureC') &&
    Object.prototype.hasOwnProperty.call(newTelemetry, 'poreWaterPressureKpa') &&
    Object.prototype.hasOwnProperty.call(newTelemetry, 'rainfall24hMm') &&
    Object.prototype.hasOwnProperty.call(newTelemetry, 'erosionLiveMmH');

  let updatedStation: LandslideStation;

  if (automaticStreamPacket) {
    const liveWeather = await getCachedLiveWeather(currentStation);
    if (liveWeather) {
      // Live online weather -> virtual sensor telemetry -> geotechnical model.
      updatedStation = syncStationWithLiveWeather(currentStation, liveWeather);

      // Keep the rolling 24-hour rainfall value moving with the live rate.
      const previous24h = Number(currentStation.telemetry.rainfall24hMm || 0);
      const hourlyRain = Number(liveWeather.precipitationMm || 0);
      const updated24h = Number(Math.min(500, Math.max(0, previous24h * 0.995 + hourlyRain)).toFixed(1));
      updatedStation.telemetry.rainfall24hMm = updated24h;
      updatedStation.riskAssessment = evaluateLandslideRisk(
        updatedStation.telemetry,
        updatedStation.slopeAngleDeg,
        updatedStation.soilType,
        updatedStation.vegetationCoverPct,
        updatedStation.faultDistanceKm
      );
      updatedStation.safeAuditResult = auditStationSafety(updatedStation);
    } else {
      // Provider failure: preserve the existing telemetry packet so the UI
      // remains operational rather than inventing a new environmental event.
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
      updatedStation = { ...currentStation, telemetry: updatedTelemetry, riskAssessment: newRiskAssessment };
      updatedStation.safeAuditResult = auditStationSafety(updatedStation);
    }
  } else {
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

    updatedStation = {
      ...currentStation,
      telemetry: updatedTelemetry,
      riskAssessment: newRiskAssessment
    };
    updatedStation.safeAuditResult = auditStationSafety(updatedStation);
  }

  if (db) {
    try {
      await updateDoc(doc(db, 'stations', stationId), {
        telemetry: updatedStation.telemetry,
        riskAssessment: updatedStation.riskAssessment,
        safeAuditResult: updatedStation.safeAuditResult,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.warn('[Firebase] Telemetry cloud update failed:', e);
    }
  }

  return updatedStation;
}

/**
 * Fetch or initialize SMS subscribers
 */
export async function getSubscribers(): Promise<SmsSubscriber[]> {
  if (!db) return INITIAL_SUBSCRIBERS;
  try {
    const subsCol = collection(db, 'sms_subscribers');
    const snap = await getDocs(subsCol);
    if (snap.empty) {
      for (const sub of INITIAL_SUBSCRIBERS) await setDoc(doc(db, 'sms_subscribers', sub.id), sub);
      return INITIAL_SUBSCRIBERS;
    }
    const subs: SmsSubscriber[] = [];
    snap.forEach((d) => subs.push(d.data() as SmsSubscriber));
    const gutla = INITIAL_SUBSCRIBERS.find((s) => s.phoneNumber.includes('9032479657'));
    if (gutla && !subs.some((s) => s.phoneNumber.includes('9032479657'))) {
      subs.unshift(gutla);
      setDoc(doc(db, 'sms_subscribers', gutla.id), gutla).catch(() => {});
    }
    return subs;
  } catch (e) {
    return INITIAL_SUBSCRIBERS;
  }
}

/** Register a new mobile number */
export async function registerSubscriber(sub: Omit<SmsSubscriber, 'id' | 'registeredAt'>): Promise<SmsSubscriber> {
  const newSub: SmsSubscriber = { ...sub, id: 'sub-' + Date.now(), registeredAt: new Date().toISOString() };
  if (db) {
    try { await setDoc(doc(db, 'sms_subscribers', newSub.id), newSub); }
    catch (e) { console.warn('[Firebase] Subscriber local fallback save', e); }
  }
  return newSub;
}

/** Delete a subscriber */
export async function deleteSubscriberFromDb(id: string): Promise<void> {
  if (db) {
    try { await deleteDoc(doc(db, 'sms_subscribers', id)); }
    catch (e) { console.warn('[Firebase] Delete subscriber error', e); }
  }
}

/** Log SMS alert dispatch */
export async function logAlertDispatch(dispatch: SmsAlertRecord): Promise<void> {
  if (db) {
    try { await setDoc(doc(db, 'alert_dispatches', dispatch.id), { ...dispatch, createdAt: serverTimestamp() }); }
    catch (e) { console.warn('[Firebase] Dispatch log fallback', e); }
  }
}

/** Get historical SMS dispatches */
export async function getAlertDispatches(): Promise<SmsAlertRecord[]> {
  if (!db) return INITIAL_DISPATCHES;
  try {
    const dispCol = collection(db, 'alert_dispatches');
    const snap = await getDocs(dispCol);
    if (snap.empty) {
      for (const d of INITIAL_DISPATCHES) await setDoc(doc(db, 'alert_dispatches', d.id), d);
      return INITIAL_DISPATCHES;
    }
    const dispatches: SmsAlertRecord[] = [];
    snap.forEach((d) => dispatches.push(d.data() as SmsAlertRecord));
    dispatches.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return dispatches;
  } catch (e) { return INITIAL_DISPATCHES; }
}

/** Initialize / fetch Disaster Evidence & Photos from Cloud Firestore */
export async function getDisasterEvidence(): Promise<DisasterEvidenceReport[]> {
  if (!db) return INITIAL_DISASTER_EVIDENCE;
  try {
    const evCol = collection(db, 'disaster_evidence');
    const snap = await getDocs(evCol);
    if (snap.empty) {
      console.log('[Firebase] Seeding initial disaster evidence field reports to Cloud Firestore...');
      for (const ev of INITIAL_DISASTER_EVIDENCE) {
        await setDoc(doc(db, 'disaster_evidence', ev.id), { ...ev, createdAt: serverTimestamp() });
      }
      return INITIAL_DISASTER_EVIDENCE;
    }
    const reports: DisasterEvidenceReport[] = [];
    snap.forEach((d) => reports.push(d.data() as DisasterEvidenceReport));
    reports.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return reports;
  } catch (e) {
    console.warn('[Firebase] Disaster evidence fetch fallback:', e);
    return INITIAL_DISASTER_EVIDENCE;
  }
}

/** Submit user disaster photo evidence and AI identification to Cloud Firestore */
export async function submitDisasterEvidence(evidence: Omit<DisasterEvidenceReport, 'id' | 'timestamp'>): Promise<DisasterEvidenceReport> {
  const newReport: DisasterEvidenceReport = { ...evidence, id: 'ev-' + Date.now(), timestamp: new Date().toISOString() };
  if (db) {
    try {
      await setDoc(doc(db, 'disaster_evidence', newReport.id), { ...newReport, createdAt: serverTimestamp() });
      console.log('[Firebase] Disaster evidence photo saved to Firestore:', newReport.id);
    } catch (e) { console.warn('[Firebase] Evidence save fallback:', e); }
  }
  return newReport;
}

/** Update verification status of a disaster evidence photo */
export async function updateEvidenceVerificationStatus(id: string, status: DisasterEvidenceReport['verificationStatus'], verifiedBy?: string): Promise<void> {
  if (db) {
    try {
      const updates: any = { verificationStatus: status, updatedAt: serverTimestamp() };
      if (verifiedBy) { updates.verifiedBy = verifiedBy; updates.verifiedAt = new Date().toISOString(); }
      await updateDoc(doc(db, 'disaster_evidence', id), updates);
    } catch (e) { console.warn('[Firebase] Update evidence status error:', e); }
  }
}

/** Delete a disaster evidence report */
export async function deleteDisasterEvidence(id: string): Promise<void> {
  if (db) {
    try { await deleteDoc(doc(db, 'disaster_evidence', id)); }
    catch (e) { console.warn('[Firebase] Delete evidence error:', e); }
  }
}

/** Real-time listener for disaster evidence */
export function subscribeToDisasterEvidence(callback: (evidence: DisasterEvidenceReport[]) => void): () => void {
  if (!db) {
    callback(INITIAL_DISASTER_EVIDENCE);
    return () => {};
  }
  try {
    const evCol = collection(db, 'disaster_evidence');
    return onSnapshot(evCol, (snapshot) => {
      const reports: DisasterEvidenceReport[] = [];
      snapshot.forEach((d) => reports.push(d.data() as DisasterEvidenceReport));
      reports.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      callback(reports);
    }, (error) => {
      console.warn('[Firebase] Evidence snapshot error:', error);
    });
  } catch (e) {
    console.warn('[Firebase] Evidence subscribe error:', e);
    return () => {};
  }
}
