import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAizjTSgm6Rbq8PmkZXgEYdoMQnw5KZm4A",
  authDomain: "socialsphere-9d77c.firebaseapp.com",
  projectId: "socialsphere-9d77c",
  storageBucket: "socialsphere-9d77c.firebasestorage.app",
  messagingSenderId: "857715950847",
  appId: "1:857715950847:web:0939bde6f9ea0f6e5c78ca",
  measurementId: "G-4HB1SVSM41",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
