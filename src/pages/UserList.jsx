// src/pages/UsersList.jsx
import { useEffect, useState } from "react";
import { db } from "../utils/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router";
import calculateInversionCount from "../utils/calculateInversionCount";
import calculateManhattanDistance from "../utils/calculateManhattanDistance";
import dummyProfileImg from "../constants/dummyProfileImg";
import { motion } from "framer-motion";

const UsersList = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Helper: Check if user fits preference
  const isUserInPreference = (loggedInUser, candidate) => {
    const { preferredAgeGroup, preferredGender } = loggedInUser;
    const { age, gender } = candidate;

    const ageOk =
      preferredAgeGroup === "-1" ||
      (preferredAgeGroup === "18-30" && age >= 18 && age <= 30) ||
      (preferredAgeGroup === "31-45" && age >= 31 && age <= 45) ||
      (preferredAgeGroup === "45+" && age > 45);

    const genderOk = preferredGender === "-1" || preferredGender === gender;
    return ageOk && genderOk;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!currentUser) return;

        // Logged-in user
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          console.error("No such document for current user!");
          setLoading(false);
          return;
        }
        const loggedInUser = { uid: currentUser.uid, ...docSnap.data() };
        setUserData(loggedInUser);

        // All other users
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersData = [];
        querySnapshot.forEach((docSnap) => {
          if (docSnap.id !== currentUser.uid) {
            usersData.push({ uid: docSnap.id, ...docSnap.data() });
          }
        });

        // Compatibility calculation
        const n = loggedInUser?.preferences?.length || 0;
        const updatedUsers = usersData
          .filter((user) => isUserInPreference(loggedInUser, user))
          .map((user) => {
            let preferenceScore = 0;
            if (n > 1) {
              const inversionCount = calculateInversionCount(loggedInUser, user);
              const maxInversions = (n * (n - 1)) / 2;
              preferenceScore = (
                (1 - inversionCount / maxInversions) *
                100
              ).toFixed(2);
            }

            const behaviorScore = calculateManhattanDistance(
              user.behaviorScores,
              loggedInUser.behaviorScores
            );

            return {
              ...user,
              preferenceScore,
              behaviorScore,
            };
          })
          .sort((a, b) => b.preferenceScore - a.preferenceScore);

        setUsers(updatedUsers);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

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

  return (
    <div className="mx-auto px-4 bg-gradient-to-b from-pink-50 to-purple-50 py-10 px-4">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 bg-pink-500 text-white rounded-full shadow hover:bg-pink-600 transition"
      >
        ← Back to Profile
      </button>

      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Potential Matches
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {users.map((user) => (
          <Link
            key={user.uid}
            to={`/profile/${user.uid}`}
            className="rounded-2xl shadow-md hover:shadow-lg transition p-5 flex flex-col items-center text-center bg-white/80 backdrop-blur-sm"
          >
            <img
              src={user.photoURL || dummyProfileImg}
              alt={user.name}
              className="w-24 h-24 object-cover rounded-full border-4 border-pink-200 mb-3"
              onError={(e) => (e.target.src = dummyProfileImg)}
            />
            <h3 className="text-lg font-semibold text-gray-800">
              {user.name}
            </h3>
            <p className="text-sm text-gray-600">{user.age} yrs</p>
            <p className="text-sm mt-2 text-gray-500 line-clamp-2">
              {user.bio}
            </p>

            <div className="mt-4 space-y-1">
              <p className="font-bold text-pink-600">
                Preference Match: {user.preferenceScore}%
              </p>
              <p className="font-bold text-purple-600">
                Behavior Match: {user.behaviorScore}%
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default UsersList;
