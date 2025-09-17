import { useState } from "react";
import { useNavigate } from "react-router";
import { db } from "../utils/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

const QUESTIONS = [
  "How much do you enjoy being the center of attention?",
  "How often do you keep things neat and well-organized?",
  "How excited are you to try new experiences or adventures?",
  "How easily do you get upset or stressed out?",
  "How much do you go out of your way to help others?"
];

const Questions = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [saving, setSaving] = useState(false);

  const handleAnswer = async (value) => {
    const updatedAnswers = [...answers, value];
    setAnswers(updatedAnswers);

    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Save to Firestore
      setSaving(true);
      try {
        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, {
          behaviorScores: updatedAnswers,
          updatedAt: new Date(),
        });
        navigate("/profile");
      } catch (error) {
        console.error("Error saving answers:", error.message);
        alert("Failed to save answers. Please try again.");
      }
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-pink-300 px-4">
      <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl max-w-lg w-full animate-fadeIn">
        <h2 className="text-2xl font-bold text-pink-700 mb-6 text-center">
          Question {currentIndex + 1} of {QUESTIONS.length}
        </h2>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / QUESTIONS.length) * 100}%` }}
          ></div>
        </div>

        <p className="text-lg font-medium text-gray-800 mb-8 text-center animate-fadeSlide">
          {QUESTIONS[currentIndex]}
        </p>

        {/* Answer Buttons */}
        <div className="grid grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              onClick={() => handleAnswer(num)}
              disabled={saving}
              className="bg-white border-2 border-pink-400 text-pink-600 font-semibold py-3 rounded-xl shadow hover:bg-pink-500 hover:text-white transition transform hover:scale-105 disabled:opacity-50"
            >
              {num}
            </button>
          ))}
        </div>

        {saving && (
          <p className="mt-6 text-center text-gray-600 animate-pulse">
            Saving your answers...
          </p>
        )}
      </div>
    </div>
  );
};

export default Questions;
