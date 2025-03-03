import React, { useState, useEffect } from "react";
import { auth, firestore } from "../firebase/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { savePosts, setPosts } from "../store/postsSlice";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";

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

const SavedPostsPage: React.FC = () => {
  const [user] = useAuthState(auth);
  const posts = useSelector((state: RootState) => state.posts.savePosts);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user) return;
    const fetchPosts = async () => {
      const savesCollection = collection(firestore, "saves");
      const q = query(savesCollection, where("userId", "==", user?.uid));

      try {
        const querySnapshot = await getDocs(q);

        const savedPosts = [];

        for (const saveDoc of querySnapshot.docs) {
          const saveData = saveDoc.data();

          const postRef = doc(firestore, "posts", saveData.postId);
          const postSnap = await getDoc(postRef);

          if (postSnap.exists()) {
            savedPosts.push({
              id: saveDoc.id,
              savedAt: saveData.savedAt,
              postId: saveData.postId,
              postDetails: postSnap.data(),
            });
          } else {
            console.warn(`Post ${saveData.postId} not found`);
          }
        }

        console.log("Saved Posts with Details:", savedPosts);

        dispatch(savePosts(savedPosts));
      } catch (error) {
        console.error("Error getting saved posts:", error);
        return [];
      }
    };
    fetchPosts();
  }, [user, dispatch]);
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col space-y-6">
        {posts?.map((post: any) => (
          <div className="bg-white rounded-lg shadow-md p-4 mb-4 max-w-2xl mx-auto h-50 w-full">
            <div className="flex items-center space-x-3 mb-4">
              <img
                src={`https://api.dicebear.com/7.x/identicon/svg?seed=${post.postDetails.username}`}
                alt="avatar"
                className="w-8 h-8 rounded-full border-2 border-gray-200"
              />
              <div>
                <p className="font-semibold text-gray-800">
                  {post.postDetails.username}
                </p>
                <p className="text-xs text-gray-500">
                  {timeAgo(post.postDetails.createdAt)}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <img
                src={post.postDetails.imageUrl}
                alt="Post"
                className="h-50 w-full rounded-lg object-cover"
              />
            </div>

            <div className="flex items-center space-x-4 mb-4">
              <button
                className={`flex items-center space-x-1.5 ${
                  !user
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:text-blue-600"
                }`}
                disabled={!user}
              >
                {/* <span className="text-xl">👍</span> */}
                <span className="text-xl">
                  {post.postDetails?.likes?.length ? "❤️" : "🤍"}
                </span>
                <span className="text-sm font-medium">
                  {post.postDetails?.likes?.length}
                </span>
              </button>

              <button
                className={`flex items-center space-x-1.5 ${
                  !user
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:text-blue-600"
                }`}
                disabled={!user}
              >
                <span className="text-xl">💬</span>
                <span className="text-sm font-medium">
                  {post.postDetails?.comments.length}
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedPostsPage;
