import React, { useState } from "react";
import { auth } from "../utils/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link } from "react-router";
import { useNavigate } from "react-router";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      navigate("/profile");
    } catch (err) {
      console.log(err);

      if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password ❌");
      } else {
        setError("Something went wrong. Try again.");
      }
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-pink-300">
      <form
        onSubmit={handleLogin}
        className={`bg-white/70 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/30 animate-fadeIn ${
          error ? "animate-shake" : ""
        }`}
      >
        <h2 className="text-3xl font-extrabold mb-6 text-center text-pink-700 drop-shadow">
          Welcome Back 💕
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-3 text-center font-medium">
            {error}
          </p>
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full mb-3 px-4 py-3 border rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full mb-5 px-4 py-3 border rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-lg shadow-md font-semibold transition transform hover:scale-105 hover:shadow-lg disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-sm text-gray-700 mt-5">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-pink-600 font-semibold hover:underline hover:text-pink-700 transition"
          >
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
