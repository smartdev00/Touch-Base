import { FirebaseApp, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage } from "firebase/storage";



// Initialize Firebase
let app: FirebaseApp;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error("Error initializing Firebase:", error);
  throw error;
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };