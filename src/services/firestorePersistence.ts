import { collection, doc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';

export async function ensureFirestoreCollections(db: any) {
  const seeds: Record<string, string> = {
    telemetry: 'Persistent sensor telemetry history',
    risk_assessments: 'Persistent landslide risk assessment history',
    incidents: 'Persistent disaster incident records',
    alerts: 'Persistent emergency alert records',
    field_verifications: 'Persistent field verification records',
    historical_events: 'Persistent historical landslide/event records',
    sms_subscribers: 'Registered disaster alert contacts'
  };

  for (const [collectionName, description] of Object.entries(seeds)) {
    const snapshot = await getDocs(collection(db, collectionName));
    if (snapshot.empty) {
      await setDoc(doc(db, collectionName, 'seed-system'), {
        type: 'collection_seed',
        description,
        createdAt: serverTimestamp()
      });
      console.log(`[BhuShakti] Firestore collection initialized: ${collectionName}`);
    }
  }
}

export async function saveTelemetryHistory(db: any, stationId: string, telemetry: any, riskAssessment: any, source: string) {
  await setDoc(doc(db, 'telemetry', `${stationId}_${Date.now()}`), {
    stationId,
    telemetry,
    riskAssessment,
    recordedAt: serverTimestamp(),
    source
  });

  await setDoc(doc(db, 'risk_assessments', `${stationId}_${Date.now()}`), {
    stationId,
    riskAssessment,
    recordedAt: serverTimestamp(),
    source
  });
}

export async function saveIncidentAndAlert(db: any, incidentId: string, incident: any, alert: any) {
  await setDoc(doc(db, 'incidents', incidentId), {
    ...incident,
    incidentId,
    createdAt: serverTimestamp()
  });

  await setDoc(doc(db, 'alerts', incidentId), {
    ...alert,
    incidentId,
    createdAt: serverTimestamp()
  });
}
