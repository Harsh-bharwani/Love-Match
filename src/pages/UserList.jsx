// src/pages/UsersList.jsx
import { useEffect, useState } from "react";
import { db } from "../utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import calculateInversionCount from "../utils/calculateInversionCount";
import { doc, getDoc } from "firebase/firestore";


const UsersList = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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
        // const loggedInUser = docSnap.data();
        setUserData( docSnap.data());

        // Fetch all other users
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersData = [];
        querySnapshot.forEach((doc) => {
          if (doc.id !== currentUser.uid) {
            usersData.push(doc.data());
          }
        });

        // Calculate compatibility for each user
        const n = userData?.preferences?.length || 0;
        const updatedUsers = usersData.map((user) => {
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
        }).sort((a, b)=> b.compatibilityScore-a.compatibilityScore);

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
    <div className="max-w-2xl mx-auto mt-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Potential Matches</h2>
      <div className="space-y-4">
        {users.map((user) => (
          <div
            key={user.uid}
            className="p-4 border rounded-lg shadow-sm flex justify-between items-center bg-white hover:shadow-md transition"
          >
            <div>
              <h3 className="text-lg font-semibold">{user.name}</h3>
              <p className="text-sm text-gray-600">{user.gender}</p> 
              <p className="text-sm text-gray-600">{user.age} years</p>
              <p className="text-sm">{user.bio}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-pink-600">
                {user.compatibilityScore}%
              </p>
              <p className="text-xs text-gray-500">Compatibility</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersList;