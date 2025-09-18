// src/pages/Profile.jsx
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";
import { signOut } from "firebase/auth";
import dummyProfileImg from "../constants/dummyProfileImg";
import { motion } from "framer-motion";

export default function Profile() {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  console.log(userData);
  
  useEffect(() => {
    const fetchUser = async () => {
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      }
    };
    fetchUser();
  }, [currentUser]);

  if (!userData) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600 text-lg">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-white to-purple-100">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="backdrop-blur-lg bg-white/70 shadow-2xl rounded-2xl p-8 w-full max-w-md text-center"
      >
        {/* Profile Image */}
        <motion.img
          whileHover={{ scale: 1.05 }}
          src={userData.photoURL || dummyProfileImg}
          alt={userData.name}
          className="w-28 h-28 mx-auto rounded-full mb-4 object-cover border-4 border-white shadow-md"
        />

        {/* User Info */}
        <h1 className="text-2xl font-bold text-gray-800">{userData.name}</h1>
        <p className="text-gray-500">{userData.age} years old</p>
        <p className="text-gray-700 mt-3 italic">{userData.bio || "No bio yet"}</p>

        {/* Buttons */}
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={() => navigate("/users")}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-lg shadow-md hover:opacity-90 transition"
          >
            Discover People
          </button>

          <button
            onClick={() => navigate("/editProfile")}
            className="w-full border-2 border-purple-400 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition"
          >
            Edit Profile
          </button>

          <button
            onClick={() => signOut(auth)}
            className="w-full bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600 transition"
          >
            Log Out
          </button>
        </div>
      </motion.div>
    </div>
  );
}
