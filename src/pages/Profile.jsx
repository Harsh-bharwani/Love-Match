
// src/pages/Profile.jsx
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";

export default function Profile() {
    const { currentUser } = useAuth();
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();

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
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-md text-center">
                <img
                    src={userData.photoURL
 || "https://media.licdn.com/dms/image/v2/D4D03AQEdBWGX3_vN5Q/profile-displayphoto-shrink_200_200/B4DZc7pjiLGUAk-/0/1749052439493?e=2147483647&v=beta&t=Xr3-qJXNXwXGBcgFZcCCntE8El1LAjzCRo-RR25feu4"}
                    alt={userData.name}
                    className="w-28 h-28 mx-auto rounded-full mb-4 object-cover border"
                />
                <h1 className="text-2xl font-bold mb-2">{userData.name}</h1>
                <p className="text-gray-600 mb-2">{userData.age} years</p>
                <p className="text-gray-700">{userData.bio}</p>
                <button
                    onClick={() => navigate("/users")}
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                    Discover People
                </button>
            </div>
        </div>
    );
}
