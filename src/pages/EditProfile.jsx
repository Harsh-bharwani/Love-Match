// src/pages/EditProfile.jsx
import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { PREFERENCE_CATEGORIES } from "../utils/preferences";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";

const EditProfile = () => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: "",
    gender: "",
    bio: "",
    photoURL: "",
    preferredGender: "-1",
    preferredAgeGroup: "-1",
    preferences: PREFERENCE_CATEGORIES,
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;

      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setFormData((prev) => ({
          ...prev,
          ...userSnap.data(),
        }));
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const newPreferences = Array.from(formData.preferences);
    const [movedItem] = newPreferences.splice(result.source.index, 1);
    newPreferences.splice(result.destination.index, 0, movedItem);

    setFormData((prev) => ({
      ...prev,
      preferences: newPreferences,
    }));
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
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, formData);
      alert("Profile updated successfully!");
      navigate("/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-pink-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl bg-white shadow-2xl rounded-2xl p-8"
      >
        <h2 className="text-3xl font-bold text-center text-pink-600 mb-6">
          Edit Your Profile
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your Name"
            className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-pink-400 outline-none"
          />

          {/* Age */}
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            placeholder="Your Age"
            className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-pink-400 outline-none"
          />

          {/* Gender */}
          <motion.select
            whileFocus={{ scale: 1.02 }}
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-pink-400 outline-none"
          >
            <option value="-1">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </motion.select>

          {/* Bio */}
          <motion.textarea
            whileFocus={{ scale: 1.02 }}
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Write something about yourself..."
            className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-pink-400 outline-none"
          />

          {/* Upload Photo */}
          <div className="flex flex-col items-center">
            {formData.photoURL && (
              <img
                src={formData.photoURL}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover mb-3"
              />
            )}
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="file"
              onChange={fileUpload}
              className="w-full border p-3 rounded-xl bg-pink-50 cursor-pointer"
            />
          </div>

          {/* Preferences */}
          <div>
            <h3 className="font-semibold mb-2 text-pink-600">
              Reorder Your Preferences
            </h3>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="preferences">
                {(provided) => (
                  <ul
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {formData.preferences.map((pref, index) => (
                      <Draggable key={pref} draggableId={pref} index={index}>
                        {(provided, snapshot) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-3 border rounded-xl bg-pink-50 shadow-sm cursor-grab ${
                              snapshot.isDragging ? "bg-pink-200" : ""
                            }`}
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

          {/* Save / Cancel Buttons */}
          <div className="flex justify-between mt-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              type="submit"
              disabled={loading}
              className="bg-pink-500 text-white px-6 py-2 rounded-xl shadow-md hover:bg-pink-600 disabled:bg-gray-400"
            >
              {loading ? "Saving..." : "Save Changes"}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              type="button"
              onClick={() => navigate("/profile")}
              className="bg-gray-300 text-gray-800 px-6 py-2 rounded-xl shadow-md hover:bg-gray-400"
            >
              Cancel
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditProfile;
