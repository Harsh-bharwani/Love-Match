// src/pages/UsersList.jsx
import { useEffect, useState } from "react";
import { db } from "../utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import calculateInversionCount from "../utils/calculateInversionCount";

const UsersList = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersData = [];
        querySnapshot.forEach((doc) => {
          if (doc.id !== currentUser.uid) {
            usersData.push(doc.data());
          }
        });

        // Calculate compatibility
        const updatedUsers = usersData.map((user) => {
          const inversionCount = calculateInversionCount(
            currentUser,
            user
          );
          const compatibilityScore = 100 - inversionCount * 10; 
          // 👆 just a sample formula, we can refine later
          return { ...user, compatibilityScore };
        });

        setUsers(updatedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) fetchUsers();
  }, [currentUser]);

  if (loading) return <p className="text-center mt-10">Loading users...</p>;

  return (
    <div className="max-w-2xl mx-auto mt-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Potential Matches</h2>
      <div className="space-y-4">
        {users.map((user) => (
          <div
            key={user.uid}
            className="p-4 border rounded-lg shadow-sm flex justify-between items-center"
          >
            <div>
              <h3 className="text-lg font-semibold">{user.name}</h3>
              <p className="text-sm text-gray-600">{user.age} years</p>
              <p className="text-sm">{user.bio}</p>
              <p className="text-xs text-gray-500">
                Interests: {user.preferences?.interests?.join(", ")}
              </p>
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