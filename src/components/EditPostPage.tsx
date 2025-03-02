import React, { useState, useEffect } from "react";
import { auth, firestore } from "../firebase/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";

const EditPostPage: React.FC = () => {
  const [user] = useAuthState(auth);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: any }>();

  useEffect(() => {
    const fetchPost = async () => {
      if (!user || !postId) return;
      setLoading(true);
      try {
        const postRef = doc(firestore, "posts", postId);
        const postDoc = await getDoc(postRef);
        if (postDoc.exists() && postDoc.data().userId === user.uid) {
          setImageUrl(postDoc.data().imageUrl);
        } else {
          setError(
            "Post not found or you do not have permission to edit this post."
          );
        }
        setLoading(false);
      } catch (err) {
        setError("Failed to load post. Please try again later.");
        setLoading(false);
      }
    };
    fetchPost();
  }, [user, postId]);

  const handleUpdatePost = async () => {
    if (!user || !imageUrl.trim()) {
      setError("Please provide an image URL.");
      return;
    }
    setLoading(true);
    try {
      const postRef = doc(firestore, "posts", postId);
      await updateDoc(postRef, {
        imageUrl,
      });
      setLoading(false);
      navigate("/");
    } catch (err) {
      setError("Failed to update post. Please try again later.");
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Edit Post</h2>
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
            <svg
              className="fill-current h-6 w-6 text-red-500"
              role="button"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <title>Close</title>
              <path d="M14.348 5.652a1 1 0 10-1.414-1.414L10 7.172 7.066 4.238a1 1 0 00-1.414 1.414L8.828 10l-3.176 3.176a1 1 0 101.414 1.414L10 12.828l2.934 2.934a1 1 0 001.414-1.414L11.172 10l3.176-3.176z" />
            </svg>
          </span>
        </div>
      )}
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="imageUrl"
        >
          Image URL
        </label>
        <input
          type="text"
          id="imageUrl"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Enter image URL"
          className="p-2 border border-gray-300 rounded w-full"
        />
      </div>
      <button
        onClick={handleUpdatePost}
        className={`p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200 ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={loading}
      >
        {loading ? "Updating..." : "Update Post"}
      </button>
    </div>
  );
};

export default EditPostPage;
