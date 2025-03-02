import React, { useState, useEffect } from "react";
import { auth, firestore } from "../firebase/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import PostPage from "./Post";

interface Post {
  id: string;
  imageUrl: string;
  username: string;
  likes: string[];
  comments: string[];
}
const timeAgo = (timestamp: any): string => {
  const now = Date.now();
  const diff = now - toMillis(timestamp);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
};
const toMillis = (timestamp: { seconds: number; nanoseconds: number }) => {
  return (
    timestamp.seconds * 1000 + Math.floor(timestamp.nanoseconds / 1_000_000)
  );
};
const MyPostsPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [user, loading, error] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("user", user);
    if (!user) return;
    const fetchPosts = async () => {
      const postsCollection = collection(firestore, "posts");
      const q = query(postsCollection, where("userId", "==", user.uid));
      const postsSnapshot = await getDocs(q);
      setPosts(
        postsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Post))
      );
    };
    fetchPosts();
  }, [user]);

  const handleDelete = async (postId: string) => {
    const postRef = doc(firestore, "posts", postId);
    await deleteDoc(postRef);
    setPosts(posts.filter((post) => post.id !== postId));
  };

  const handleUpdate = async (postId: string) => {
    navigate(`/edit-post/${postId}`);
  };

  return (
    <div className="container mx-auto p-4">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
        </div>
      ) : (
        <div className="flex flex-col space-y-6">
          {posts.map((post: any) => (
            <div className="bg-white rounded-lg shadow-md p-4 mb-4 max-w-2xl mx-auto h-50 w-full">
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src={`https://api.dicebear.com/7.x/identicon/svg?seed=${post.username}`}
                  alt="avatar"
                  className="w-8 h-8 rounded-full border-2 border-gray-200"
                />
                <div>
                  <p className="font-semibold text-gray-800">{post.username}</p>
                  <p className="text-xs text-gray-500">
                    {timeAgo(post.createdAt)}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <img
                  src={post.imageUrl}
                  alt="Post"
                  className="h-50 w-full rounded-lg object-cover"
                />
              </div>

              <div className="flex items-center space-x-4 mb-4">
                <button
                  onClick={() => handleDelete(post.id)}
                  className="p-2 bg-red-500 text-white rounded"
                >
                  Delete
                </button>

                <button
                  onClick={() => handleUpdate(post.id)}
                  className="p-2 bg-red-500 text-white rounded"
                >
                  Update
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPostsPage;
