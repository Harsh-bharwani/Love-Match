// src/pages/UserProfile.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { db } from "../utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import calculateInversionCount from "../utils/calculateInversionCount";
import dummyProfileImg from "../constants/dummyProfileImg";
import calculateManhattanDistance from "../utils/calculateManhattanDistance";
import { motion } from "framer-motion";

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [preferenceCompatibility, setPreferenceCompatibility] = useState(null);
  const [behaviouralCompatibility, setBehaviouralCompatibility] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        if (!currentUser) return;

        // fetch current logged-in user data
        const currentRef = doc(db, "users", currentUser.uid);
        const currentSnap = await getDoc(currentRef);

        // fetch the profile user data
        const profileRef = doc(db, "users", id);
        const profileSnap = await getDoc(profileRef);

        if (currentSnap.exists() && profileSnap.exists()) {
          const currentData = currentSnap.data();
          const profileData = profileSnap.data();

          setCurrentUserData(currentData);
          setProfile(profileData);

          // calculate preferenceCompatibility
          const inversions = calculateInversionCount(
            currentData.preferences || [],
            profileData.preferences || []
          );
          const n = currentData.preferences?.length || 1;
          const score = (
            (1 - inversions / ((n * (n - 1)) / 2)) *
            100
          ).toFixed(2);

          setPreferenceCompatibility(score);
          setBehaviouralCompatibility(
            calculateManhattanDistance(
              currentData.behaviorScores,
              profileData.behaviorScores
            )
          );
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
      setLoading(false);
    }
    fetchProfile();
  }, [id, currentUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-pink-50 to-purple-50">
        <motion.div
          className="w-16 h-16 text-pink-500"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
        >
          ❤️
        </motion.div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center mt-20 text-gray-600">
        User not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 py-10 px-4">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-5 py-2 bg-pink-500 text-white rounded-full shadow hover:bg-pink-600 transition"
      >
        ← Back to Matches
      </button>

      {/* Profile card */}
      <div className="max-w-3xl mx-auto p-8 rounded-2xl shadow-lg bg-white/80 backdrop-blur-sm">
        <div className="flex flex-col items-center">
          <img
            src={profile.photoURL || dummyProfileImg}
            alt={profile.name}
            onError={(e) => (e.target.src = dummyProfileImg)}
            className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-pink-200"
          />
          <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>
          <p className="text-gray-600">{profile.age} years old</p>
          <p className="mt-4 text-gray-700 text-center">{profile.bio}</p>

          {preferenceCompatibility && (
            <p className="mt-4 text-lg font-semibold text-pink-600">
              Preference Compatibility: {preferenceCompatibility}%
            </p>
          )}

          {behaviouralCompatibility && (
            <p className="mt-2 text-lg font-semibold text-purple-600">
              Behavioural Compatibility: {behaviouralCompatibility}%
            </p>
          )}
        </div>

        {/* Preferences */}
        <div className="mt-6">
          <h3 className="font-semibold text-lg text-gray-800 text-center">
            Matching Preferences
          </h3>
          <ul className="flex flex-wrap justify-center gap-2 mt-3">
            {profile.preferences?.map((pref, idx) => (
              <li
                key={idx}
                className={
                  currentUserData?.preferences?.[idx] === pref
                    ? "px-4 py-1 bg-green-100 text-green-600 rounded-full text-sm shadow"
                    : "px-4 py-1 bg-red-100 text-red-600 rounded-full text-sm shadow"
                }
              >
                {pref}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
