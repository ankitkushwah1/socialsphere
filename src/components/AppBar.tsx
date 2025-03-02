import React, { useEffect, useState } from "react";
import { auth } from "../firebase/firebase";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { setUser } from "../store/authSlice";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom";

const AppBar: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(setUser(null));
      setIsMenuOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="bg-blue-600 shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex-shrink-0">
            <span className="text-2xl font-bold text-white">SocialSphere</span>
          </Link>

          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {user ? (
                <>
                  <Link
                    to="/add-post"
                    className="rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Add Post
                  </Link>
                  <Link
                    to="/my-posts"
                    className="rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    My Posts
                  </Link>
                  <Link
                    to="/saved-posts"
                    className="rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Saved Posts
                  </Link>
                  <span className="px-3 py-2 text-sm font-medium text-white">
                    Hi, {user.displayName?.split(" ")[0]}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="rounded-md bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="rounded-md bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600"
                >
                  Login
                </Link>
              )}
            </div>
          </div>

          <div className="flex md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-blue-700 focus:outline-none"
            >
              <svg
                className={`h-6 w-6 ${isMenuOpen ? "hidden" : "block"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`h-6 w-6 ${isMenuOpen ? "block" : "hidden"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {user ? (
              <>
                <Link
                  to="/add-post"
                  onClick={toggleMenu}
                  className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-blue-700"
                >
                  Add Post
                </Link>
                <Link
                  to="/my-posts"
                  onClick={toggleMenu}
                  className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-blue-700"
                >
                  My Posts
                </Link>
                <Link
                  to="/saved-posts"
                  onClick={toggleMenu}
                  className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-blue-700"
                >
                  Saved Posts
                </Link>
                <div className="border-t border-blue-700 pt-4">
                  <span className="block px-3 py-2 text-base font-medium text-white">
                    Logged in as: {user.displayName}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="w-full rounded-md bg-red-500 px-3 py-2 text-left text-base font-medium text-white hover:bg-red-600"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                onClick={toggleMenu}
                className="block rounded-md bg-green-500 px-3 py-2 text-base font-medium text-white hover:bg-green-600"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default AppBar;
