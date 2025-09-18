// src/pages/UsersList.jsx
import { useEffect, useState } from "react";
import { db } from "../utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import calculateInversionCount from "../utils/calculateInversionCount";
import { doc, getDoc } from "firebase/firestore";
import { Link } from "react-router";
import { useNavigate } from "react-router";
import dummyProfileImg from "../constants/dummyProfileImg";
import calculateManhattanDistance from"../utils/calculateManhattanDistance";

const UsersList = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!currentUser) return;

        // Fetch logged-in user
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          console.error("No such document for current user!");
          setLoading(false);
          return;
        }
        const loggedInUser = docSnap.data();
        setUserData(loggedInUser);
        // Fetch all other users
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersData = [];
        querySnapshot.forEach((doc) => {
          if (doc.uid !== currentUser.uid) {
            usersData.push(doc.data());
          }
        });
        console.log(loggedInUser);
        
        // Calculate compatibility for each user
        const n = loggedInUser?.preferences?.length || 0;
        const updatedUsers = usersData.filter((user) => {
          const userAge = user.age;
          const curUserPrefAge = loggedInUser.preferredAgeGroup;
          const curUserPrefGender=loggedInUser.preferredGender;
          const userGender=user.gender;          
          return   (user.uid != loggedInUser.uid && (curUserPrefAge == "-1" || curUserPrefAge == "18-30" && userAge >= 18 && userAge <= 30 || curUserPrefAge == "31-45" && userAge >= 31 && userAge <= 45 || curUserPrefAge == "45+" && userAge >45) &&  (curUserPrefGender==-1 || curUserPrefGender==userGender))
        }).map((user) => {
          let compatibilityScore = 0;
          if (n > 1) {
            const inversionCount = calculateInversionCount(
              loggedInUser,
              user
            );
            const maxInversions = (n * (n - 1)) / 2; // max possible inversions
            compatibilityScore = (
              (1 - inversionCount / maxInversions) *
              100
            ).toFixed(2);
          }
          return { ...user, compatibilityScore };
        }).sort((a, b) => b.compatibilityScore - a.compatibilityScore);

        setUsers(updatedUsers);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  if (loading) return <p className="text-center mt-10">Loading users...</p>;

  return (
    <div className="max-w-5xl mx-auto mt-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition"
      >
        ← Back to Profile
      </button>
      <h2 className="text-2xl font-bold mb-6 text-center">Potential Matches</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {users.map((user) => (
          <Link
            key={user.uid}
            to={`/profile/${user.uid}`}
            className="border rounded-lg shadow hover:shadow-lg transition p-4 flex flex-col items-center text-center"
          >

            <img
              src={user.photoURL || dummyProfileImg}
              alt={user.name}
              className="w-24 h-24 object-cover rounded-full mb-3"
            />
            <h3 className="text-lg font-semibold">{user.name}</h3>
            <p className="text-sm text-gray-600">{user.age} yrs</p>
            <p className="text-sm mt-2 line-clamp-2">{user.bio}</p>
            <p className="mt-3 font-bold text-pink-600">
              Preference Compatibility- {user.compatibilityScore}% 
            </p>
            <p className="mt-3 font-bold text-pink-600">
              Behavioural Compatibility- {(calculateManhattanDistance(user.behaviorScores, userData.behaviorScores))}%
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};


export default UsersList;