import { useState } from "react";
import { auth, db } from "../utils/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    gender: "male",
    bio: "",
    photoURL: "",
    preferenceGender: "any",
    preferenceMinAge: 18,
    preferenceMaxAge: 40,
    interests: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
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

      // 2. Save in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: formData.name,
        email: formData.email,
        age: Number(formData.age),
        gender: formData.gender,
        bio: formData.bio,
        photoURL: formData.photoURL || "",
        preferences: {
          ageRange: {
            min: Number(formData.preferenceMinAge),
            max: Number(formData.preferenceMaxAge),
          },
          gender: formData.preferenceGender,
          interests: formData.interests
            .split(",")
            .map((i) => i.trim())
            .filter((i) => i !== ""),
        },
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
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-4">Register</h2>
        <form onSubmit={handleRegister} className="space-y-3">
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

          {/* Preferences */}
          <h3 className="text-lg font-semibold mt-4">Preferences</h3>
          <input
            type="number"
            name="preferenceMinAge"
            placeholder="Min Age"
            className="w-full p-2 border rounded"
            onChange={handleChange}
          />
          <input
            type="number"
            name="preferenceMaxAge"
            placeholder="Max Age"
            className="w-full p-2 border rounded"
            onChange={handleChange}
          />
          <select
            name="preferenceGender"
            className="w-full p-2 border rounded"
            onChange={handleChange}
          >
            <option value="any">Any</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <input
            type="text"
            name="interests"
            placeholder="Interests (comma separated)"
            className="w-full p-2 border rounded"
            onChange={handleChange}
          />

          <button
            type="submit"
            className="w-full bg-pink-500 text-white py-2 rounded hover:bg-pink-600"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
