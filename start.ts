import './server.ts';
import { startFirestoreHistoryWorker } from './src/services/firestoreHistoryWorker';

startFirestoreHistoryWorker();
console.log('[BhuShakti] Firestore analytics history worker started');
