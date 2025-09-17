
// src/pages/Profile.jsx
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";
import { signOut } from "firebase/auth";
import { auth } from "../utils/firebase";
import dummyProfileImg from "../constants/dummyProfileImg";

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

    console.log(userData.photoURL.slice(0,userData.photoURL.indexOf('?')-4)+"preview")

    

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-md text-center">
                <img
                    src={userData.photoURL
                        || dummyProfileImg}
                    alt={userData.name}
                    className="w-28 h-28 mx-auto rounded-full mb-4 object-cover border"
                />
                {/* {
                    const imgString=
                    userData.photoURL.indexOf('?')
                } */}
                <h1 className="text-2xl font-bold mb-2">{userData.name}</h1>
                <p className="text-gray-600 mb-2">{userData.age} years</p>
                <p className="text-gray-700">{userData.bio}</p>
                <button
                    onClick={() => navigate("/users")}
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                    Discover People
                </button>
                <button
                    onClick={() => navigate("/editProfile")}
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 ms-3"
                >
                    Edit Profile
                </button>
                <button
                    onClick={() => signOut(auth)}
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 ms-3"
                >
                    LogOut
                </button>
            </div>
        </div>
    );
}
