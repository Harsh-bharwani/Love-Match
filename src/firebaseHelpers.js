// src/firebaseHelpers.js
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "./utils/firebase";

export async function createOrUpdateUserDoc(user) {
  if (!user || !user.uid) return;
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  const baseData = {
    uid: user.uid,
    displayName: user.displayName || "",
    email: user.email || "",
    photoURL: user.photoURL || "",
    preferences: [], // default empty array
    updatedAt: serverTimestamp(),
  };

  if (!snap.exists()) {
    // create doc for new user
    await setDoc(ref, {
      ...baseData,
      createdAt: serverTimestamp(),
    });
    return { created: true };
  } else {
    // update
    await updateDoc(ref, baseData);
    return { created: false };
  }
}
