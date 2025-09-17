// src/pages/UserProfile.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { db } from "../utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import calculateInversionCount from "../utils/calculateInversionCount";
import dummyProfileImg from "../constants/dummyProfileImg";
import calculateManhattanDistance from"../utils/calculateManhattanDistance";

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [behaviouralCompatibility, setBehaviouralCompatibility]=useState(null);

  const [profile, setProfile] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [preferenceCompatibility, setPreferenceCompatibility] = useState(null);
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
          setBehaviouralCompatibility(calculateManhattanDistance( currentData.behaviorScores, profileData.behaviorScores));
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
      setLoading(false);
    }
    fetchProfile();
    console.log(currentUserData);

    
  }, [id, currentUser]);

  if (loading) return <p className="text-center mt-10">Loading profile...</p>;
  if (!profile) return <p className="text-center mt-10">User not found.</p>;

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 border rounded-lg shadow">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition"
      >
        ← Back to Matches
      </button>

      <div className="flex flex-col items-center">
        <img
          src={profile.photoURL || dummyProfileImg}
          alt={profile.name}
          className="w-32 h-32 rounded-full object-cover mb-4"
        />
        <h2 className="text-2xl font-bold">{profile.name}</h2>
        <p className="text-gray-600">{profile.age} years</p>
        <p className="mt-4">{profile.bio}</p>

        {preferenceCompatibility && (
          <p className="mt-3 text-lg font-semibold text-pink-600">
            Preference Compatibilty: {preferenceCompatibility}%
          </p>
        )}

        {
          <p className="mt-3 text-lg font-semibold text-pink-600">
            Behavioural Compatibilty: {behaviouralCompatibility}%
          </p>
        }
      </div>

      <div className="mt-6">
        <h3 className="font-semibold text-lg">Matching Preferences</h3>
        <ul className="flex flex-wrap gap-2 mt-2">
          {profile.preferences?.map((pref, idx) => (
            <li
              key={idx}
              className={currentUserData.preferences[idx]==pref?"px-3 py-1 bg-pink-100 text-green-600 rounded-full text-sm":"px-3 py-1 bg-pink-100 text-red-600 rounded-full text-sm"}
            >
              {pref}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UserProfile;
