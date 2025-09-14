import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDMqeD-bGo046fagp-uSCKFvsayo5SfOXY",
  authDomain: "love-match-1cb93.firebaseapp.com",
  projectId: "love-match-1cb93",
  storageBucket: "love-match-1cb93.firebasestorage.app",
  messagingSenderId: "926425908748",
  appId: "1:926425908748:web:8a394ee53a1c41ca265029",
  measurementId: "G-VGJPTD6FW2"
};

const app=initializeApp(firebaseConfig);

export const auth=getAuth(app);
export const db=getFirestore(app);
export default app;