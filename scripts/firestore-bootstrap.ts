import { initializeApp } from 'firebase/app';
import { collection, doc, getDocs, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore';
import firebaseConfigData from '../firebase-applet-config.json';

const firebaseApp = initializeApp(firebaseConfigData);
const db = getFirestore(firebaseApp, (firebaseConfigData as any).firestoreDatabaseId || '(default)');

const collections: Record<string, string> = {
  telemetry: 'Persistent sensor telemetry history',
  risk_assessments: 'Persistent landslide risk assessment history',
  incidents: 'Persistent disaster incident records',
  alerts: 'Persistent emergency alert records',
  field_verifications: 'Persistent field verification records',
  historical_events: 'Persistent historical landslide/event records',
  sms_subscribers: 'Registered disaster alert contacts'
};

async function main() {
  for (const [name, description] of Object.entries(collections)) {
    const snapshot = await getDocs(collection(db, name));
    if (snapshot.empty) {
      await setDoc(doc(db, name, 'seed-system'), {
        type: 'collection_seed',
        description,
        createdAt: serverTimestamp()
      });
      console.log(`[BhuShakti] Created Firestore collection: ${name}`);
    } else {
      console.log(`[BhuShakti] Firestore collection already exists: ${name}`);
    }
  }
}

main().catch((error) => {
  console.error('[BhuShakti] Firestore bootstrap failed:', error);
  process.exitCode = 1;
});
