import React, { useState, useEffect } from "react";
import { auth, firestore } from "../firebase/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import PostPage from "./Post";

interface Post {
  id: string;
  imageUrl: string;
  username: string;
  likes: string[];
  comments: {
    id: string;
    text: string;
    username: string;
    replies: { id: string; text: string; username: string }[];
  }[];
}

const FeedsPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [user] = useAuthState(auth);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsCollection = collection(firestore, "posts");
        const postsSnapshot = await getDocs(postsCollection);
        setPosts(
          postsSnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              imageUrl: data.imageUrl,
              username: data.username,
              likes: data.likes || [],
              comments: data.comments || [],
              createdAt: data.createdAt,
            } as Post;
          })
        );
        setLoading(false);
      } catch (err) {
        console.log(err);
        setError("Failed to load posts. Please try again later.");
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleLike = async (postId: string) => {
    if (!user) return;
    try {
      const postRef = doc(firestore, "posts", postId);
      const postDoc = await getDoc(postRef);
      const likes = postDoc.data()?.likes || [];
      if (likes.includes(user.uid)) {
        await updateDoc(postRef, {
          likes: likes.filter((uid: string) => uid !== user.uid),
        });
      } else {
        await updateDoc(postRef, { likes: [...likes, user.uid] });
      }
      setPosts(
        posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                likes: likes.includes(user.uid)
                  ? likes.filter((uid: string) => uid !== user.uid)
                  : [...likes, user.uid],
              }
            : post
        )
      );
    } catch (err) {
      console.log(err);
      setError("Failed to update like. Please try again later.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
        </div>
      ) : (
        <div className="flex flex-col space-y-6">
          {posts.map((post: any) => (
            <PostPage
              key={post.id}
              post={post}
              user={user}
              onLike={handleLike}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedsPage;
