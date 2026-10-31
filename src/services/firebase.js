import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot 
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAoPB4MlFynrR_gnP7jf3g9CV1-h5LhuTk",
  authDomain: "yara-study-tracker.firebaseapp.com",
  projectId: "yara-study-tracker",
  storageBucket: "yara-study-tracker.firebasestorage.app",
  messagingSenderId: "369842427771",
  appId: "1:369842427771:web:e8e29b84f946ba7d798fde"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Shared singleton doc for all platforms/devices
export const TRACKER_DOC_REF = doc(db, "tracker", "shared_state");

/**
 * Save entire platform state to Cloud Firestore
 */
export async function saveStateToCloud(subjects, schedule, scheduledExams) {
  try {
    await setDoc(TRACKER_DOC_REF, {
      subjects,
      schedule,
      scheduledExams,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.error("Cloud Firestore Save Error:", err);
    throw err;
  }
}
