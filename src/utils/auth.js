import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

// Register new user + create Firestore profile
export async function register(email, password) {
  const res = await createUserWithEmailAndPassword(auth, email, password);
  const user = res.user;

  // Create a Firestore document for this user
  await setDoc(doc(db, "users", user.uid), {
    id: user.uid,
    email: user.email,
    name: "", // will update later
    age: null,
    bio: "",
    profileImageUrl: "",
    location: null,
    preferences: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return user;
}

// Login existing user
export function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

// Logout
export function logout() {
  return signOut(auth);
}

// Listen for auth changes
export function onUserStateChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// Get Firestore profile
export async function getUserProfile(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}
