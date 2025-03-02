import React, { useState } from "react";
import { auth, firestore, googleProvider } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../store/authSlice";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log(userCredential);
      const userDocRef = doc(firestore, "users", userCredential.user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        console.log(userData.data());
        dispatch(setUser(userData.data()));
        navigate("/");
      }
    } catch (error) {
      setError("Failed to sign in. Please check your credentials.");
      console.error(error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      dispatch(setUser(userCredential.user));
      navigate("/");
    } catch (error) {
      setError("Failed to sign in with Google.");
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="mb-2 p-2 border border-gray-300 rounded w-80"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="mb-2 p-2 border border-gray-300 rounded w-80"
      />
      <button
        onClick={handleSignIn}
        className="mb-2 p-2 bg-blue-500 text-white rounded w-80 hover:bg-blue-600 transition duration-200"
      >
        Sign In
      </button>
      <button
        onClick={handleGoogleSignIn}
        className="p-2 bg-red-500 text-white rounded w-80 hover:bg-red-600 transition duration-200"
      >
        Sign In with Google
      </button>
    </div>
  );
};

export default LoginPage;
