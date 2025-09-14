import { useState } from "react";
import { auth, db } from "../utils/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { PREFERENCE_CATEGORIES } from "../utils/preferences";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    gender: "male",
    bio: "",
    photoURL: "",
  });

  const [preferenceRanks, setPreferenceRanks] = useState(
    PREFERENCE_CATEGORIES.reduce((acc, pref) => {
      acc[pref] = "";
      return acc;
    }, {})
  );

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePreferenceChange = (e, pref) => {
    setPreferenceRanks({
      ...preferenceRanks,
      [pref]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // 1. Create auth user
      const { user } = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // 2. Sort preferences based on rank
      const orderedPrefs = Object.entries(preferenceRanks)
        .sort((a, b) => Number(a[1]) - Number(b[1]))
        .map(([pref]) => pref);

      // 3. Save in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: formData.name,
        email: formData.email,
        age: Number(formData.age),
        gender: formData.gender,
        bio: formData.bio,
        photoURL: formData.photoURL || "",
        orderedList: orderedPrefs,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      alert("User registered successfully!");
    } catch (err) {
      console.error("Error registering:", err);
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-4">Register</h2>
        <form onSubmit={handleRegister} className="space-y-3">
          {/* Basic Info */}
          <input
            type="text"
            name="name"
            placeholder="Name"
            className="w-full p-2 border rounded"
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-2 border rounded"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full p-2 border rounded"
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="age"
            placeholder="Age"
            className="w-full p-2 border rounded"
            onChange={handleChange}
            required
          />
          <select
            name="gender"
            className="w-full p-2 border rounded"
            onChange={handleChange}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <textarea
            name="bio"
            placeholder="Your bio"
            className="w-full p-2 border rounded"
            onChange={handleChange}
          />
          <input
            type="text"
            name="photoURL"
            placeholder="Profile Image URL"
            className="w-full p-2 border rounded"
            onChange={handleChange}
          />

          {/* Preferences Ranking */}
          <h3 className="text-lg font-semibold mt-4">Rank Your Preferences</h3>
          <p className="text-sm text-gray-500 mb-2">
            Assign a rank (1 = most important, 10 = least important). No
            duplicates allowed.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {PREFERENCE_CATEGORIES.map((pref) => (
              <div key={pref} className="flex flex-col">
                <label className="text-sm">{pref}</label>
                <input
                  type="number"
                  min="1"
                  max={PREFERENCE_CATEGORIES.length}
                  value={preferenceRanks[pref]}
                  onChange={(e) => handlePreferenceChange(e, pref)}
                  className="p-2 border rounded"
                  required
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-pink-500 text-white py-2 rounded hover:bg-pink-600 mt-4"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;