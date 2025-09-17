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
    preferences: PREFERENCE_CATEGORIES,
  });
  const [loading, setLoading]=useState(false);

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
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "love_match_stock_images");
      data.append("cloud_name", "dpk4fw8i2");
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dpk4fw8i2/image/upload",
        {
          method: "POST",
          body: data,
        }
      );
      const uploadImgURL = await res.json();
      setFormData({ ...formData, photoURL: uploadImgURL.url });
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;
      await updateProfile(user, {
        displayName: formData.name,
        photoURL: formData.photoURL,
      });
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
        updatedAt: new Date(),
      });
      navigate("/questions");
      setLoading(false);
    } catch (error) {
      console.error("Error registering user:", error.message);
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-200 via-purple-200 to-pink-300">
      <div className="w-full max-w-lg p-8 rounded-2xl shadow-xl bg-white/70 backdrop-blur-lg border border-white/40 animate-fadeIn">
        <h2 className="text-3xl font-extrabold text-center text-pink-700 mb-6 drop-shadow">
          Create Your Love Match Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image preview */}
          {formData.photoURL && (
            <div className="flex justify-center mb-3">
              <img
                src={formData.photoURL}
                alt="Preview"
                className="w-24 h-24 rounded-full object-cover shadow-md border-2 border-pink-500"
              />
            </div>
          )}

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-pink-400 outline-none transition"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-pink-400 outline-none transition"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-pink-400 outline-none transition"
            required
          />

          <input
            type="number"
            name="age"
            placeholder="Age"
            value={formData.age}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-pink-400 outline-none transition"
            required
          />

          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-pink-400 outline-none transition"
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
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-pink-400 outline-none transition"
          />

          <input
            type="file"
            name="photoURL"
            onChange={fileUpload}
            className="w-full border p-2 rounded-lg bg-white/50 cursor-pointer"
          />

          <select
            name="preferredGender"
            value={formData.preferredGender}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-pink-400 outline-none transition"
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
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-pink-400 outline-none transition"
          >
            <option value="-1">Select Preferred AgeGroup</option>
            <option value="18-30">18-30</option>
            <option value="31-45">31-45</option>
            <option value="45+">45+</option>
          </select>

          {/* Preferences drag & drop */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-pink-600">
              Rank Your Preferences
            </h3>
            <DragDropContext onDragEnd={handleOnDragEnd}>
              <Droppable droppableId="preferences">
                {(provided) => (
                  <ul
                    className="bg-pink-50 p-4 rounded-lg space-y-2"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {formData.preferences.map((pref, index) => (
                      <Draggable key={pref} draggableId={pref} index={index}>
                        {(provided, snapshot) => (
                          <li
                            className={`p-2 rounded-lg shadow cursor-pointer transition ${
                              snapshot.isDragging
                                ? "bg-pink-200 scale-105"
                                : "bg-white"
                            }`}
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
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-lg shadow-md font-semibold transition transform hover:scale-105 hover:shadow-lg"
          >
           {loading? "Register..." :  "Register"} 
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
