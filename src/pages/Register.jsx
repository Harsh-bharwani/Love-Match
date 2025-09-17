// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router";
import { auth, db } from "../utils/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { PREFERENCE_CATEGORIES } from "../utils/preferences";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    gender: "-1",
    bio: "",
    photoURL: "",
    preferredGender: "-1",
    preferredAgeGroup: "-1",
    preferences: PREFERENCE_CATEGORIES
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(formData.preferences);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFormData({
      ...formData,
      preferences: items,
    });
  };

  const fileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      console.log(file);
      const data = new FormData();
      data.append("file", file)
      data.append("upload_preset", "love_match_stock_images")
      data.append("cloud_name", "dpk4fw8i2")
      const res = await fetch("https://api.cloudinary.com/v1_1/dpk4fw8i2/image/upload", {
        method: "POST",
        body: data
      });
      const uploadImgURL = await res.json();
      console.log("j");

      console.log(uploadImgURL.url);
      setFormData({...formData, photoURL: uploadImgURL.url })

    } catch (error) {
      console.log(error);
    }
  }
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1. Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // 2. Update Firebase Auth profile (displayName + photoURL)
      await updateProfile(user, {
        displayName: formData.name,
        photoURL: formData.photoURL,
      });

      // 3. Save extra details in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: formData.name,
        email: formData.email,
        age: formData.age,
        gender: formData.gender,
        bio: formData.bio,
        photoURL: formData.photoURL,
        preferences: formData.preferences,
        preferredAgeGroup: formData.preferredAgeGroup,
        preferredGender: formData.preferredGender,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      navigate("/questions");
    } catch (error) {
      console.error("Error registering user:", error.message);
      alert(error.message);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 border rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Create Account</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="number"
          name="age"
          placeholder="Age"
          value={formData.age}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="-1">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        <textarea
          name="bio"
          placeholder="Short Bio"
          value={formData.bio}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <input
          type="file"
          name="photoURL"
          onChange={fileUpload}
          className="border p-3"
        />
        <select
          name="preferredGender"
          value={formData.preferredGender}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="-1">Select Preferred Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <select
          name="preferredAgeGroup"
          value={formData.preferredAgeGroup}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="-1">Select Preferred AgeGroup</option>
          <option value="18-30">18-30</option>
          <option value="31-45">31-45</option>
          <option value="45+">45+</option>
        </select>
        <div>
          <h3 className="text-lg font-semibold mb-2">Rank Your Preferences</h3>
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="preferences">
              {(provided) => (
                <ul
                  className="bg-gray-50 p-4 rounded space-y-2"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {formData.preferences.map((pref, index) => (
                    <Draggable key={pref} draggableId={pref} index={index}>
                      {(provided) => (
                        <li
                          className="p-2 bg-white border rounded shadow cursor-pointer"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          {pref}
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <button
          type="submit"
          className="w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
