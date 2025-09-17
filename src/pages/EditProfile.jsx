import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../context/AuthContext";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { PREFERENCE_CATEGORIES } from "../utils/preferences";
import { useNavigate } from "react-router";

const EditProfile = () => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "male",
    bio: "",
    photoURL: "",
    preferences: PREFERENCE_CATEGORIES, // default full list
  });

  const [loading, setLoading] = useState(false);
  const navigate=useNavigate();

  // Fetch user data
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

  // Simplified change handler
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle drag & drop reorder
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
      console.log(uploadImgURL.url);
      setFormData({ ...formData, photoURL: uploadImgURL.url })
    } catch (error) {
      console.log(error);
    }
  }

  // Save profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, formData);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 shadow-lg rounded-lg bg-white">
      <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your Name"
          className="w-full border p-2 rounded"
        />

        {/* Age */}
        <input
          type="number"
          name="age"
          value={formData.age}
          onChange={handleChange}
          placeholder="Your Age"
          className="w-full border p-2 rounded"
        />

        {/* Gender */}
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        {/* Bio */}
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          placeholder="Write something about yourself..."
          className="w-full border p-2 rounded"
        />

        {/* Photo URL */}
        <input
          type="file"
          name="photoURL"
          onChange={fileUpload}
          className="border p-3"
        />

        {/* Preferences - Drag and Drop */}
        <div>
          <h3 className="font-semibold mb-2">Reorder Your Preferences</h3>
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
                      {(provided) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="p-2 border rounded bg-gray-100"
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

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          onClick={()=>navigate('/profile')}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
