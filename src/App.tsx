import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase/firebase";
import { useDispatch } from "react-redux";
import { setUser } from "./store/authSlice";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import FeedsPage from "./components/FeedsPage";
import MyPostsPage from "./components/MyPostsPage";
import SavedPostsPage from "./components/SavedPostsPage";
import AddPostPage from "./components/AddPostPage";
import EditPostPage from "./components/EditPostPage";
import AppBar from "./components/AppBar";
import { onAuthStateChanged } from "firebase/auth";

const App: React.FC = () => {
  const [user, loading, error] = useAuthState(auth);
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(setUser(user));
      } else {
        dispatch(setUser(null));
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <AppBar />
      <div className="container mx-auto p-4">
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/" /> : <LoginPage />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/" /> : <RegisterPage />}
          />
          <Route
            path="/my-posts"
            element={user ? <MyPostsPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/saved-posts"
            element={user ? <SavedPostsPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/add-post"
            element={user ? <AddPostPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/edit-post/:postId"
            element={user ? <EditPostPage /> : <Navigate to="/login" />}
          />
          <Route path="/" element={<FeedsPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
