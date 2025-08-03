import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyANWZbTWgy6Ish2i2cMWmpP1hMBvsQtWYk",
  authDomain: "institutesgoonline.firebaseapp.com",
  projectId: "institutesgoonline",
  storageBucket: "institutesgoonline.firebasestorage.app",
  messagingSenderId: "320362527815",
  appId: "1:320362527815:web:26831ee8be507e14080562",
  measurementId: "G-PFMQ5B2FH1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

export default app;
