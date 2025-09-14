import React, { useEffect, useState } from "react";
import { auth, db } from "../utils/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Profile from "./Profile";

export default function Home() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // listen for auth changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // fetch user details from Firestore
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      } else {
        setUser(null);
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <h2 className="text-xl font-bold">You are not logged in</h2>
      </div>
    );
  }

  return (
    <Profile/>
    // <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
    //   <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md text-center">
    //     <h2 className="text-2xl font-bold mb-4">Welcome 👋</h2>

    //     {userData && (
    //       <div className="mb-4">
    //         <p className="text-lg font-semibold">{userData.name}</p>
    //         <p className="text-gray-600">Age: {userData.age}</p>
    //         <p className="text-gray-600">Bio: {userData.bio}</p>
    //       </div>
    //     )}

    //     <button
    //       onClick={handleLogout}
    //       className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
    //     >
    //       Logout
    //     </button>
    //   </div>
    // </div>
  );
}
