// src/pages/Questions.jsx
import { useState } from "react";
import { useNavigate } from "react-router";
import { db } from "../utils/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

const QUESTIONS = [
    "How much do you enjoy being the center of attention?",


    "How often do you keep things neat and well - organized ?",

    "How excited are you to try new experiences or adventures ?",

    "How easily do you get upset or stressed out ?",

    "How much do you go out of your way to help others ?"
];

const Questions = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState([]);

    const handleAnswer = async (value) => {
        const updatedAnswers = [...answers, value];
        setAnswers(updatedAnswers);

        if (currentIndex < QUESTIONS.length - 1) {
            // Move to next question
            setCurrentIndex(currentIndex + 1);
        } else {
            // All answered → Save in Firestore
            try {
                const userRef = doc(db, "users", currentUser.uid);
                await updateDoc(userRef, {
                    behaviorScores: updatedAnswers,
                    updatedAt: new Date()
                });

                navigate("/profile");
            } catch (error) {
                console.error("Error saving answers:", error.message);
                alert("Failed to save answers. Please try again.");
            }
        }
    };

    return (
        <div className="max-w-lg mx-auto mt-16 p-6 border rounded-lg shadow text-center">
            <h2 className="text-xl font-bold mb-6">
                Question {currentIndex + 1} of {QUESTIONS.length}
            </h2>
            <p className="text-lg mb-6">{QUESTIONS[currentIndex]}</p>

            <div className="flex justify-center gap-4">
                {[1, 2, 3, 4, 5].map((num) => (
                    <button
                        key={num}
                        onClick={() => handleAnswer(num)}
                        className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
                    >
                        {num}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Questions;
