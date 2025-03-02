import React, { useState } from "react";
import {
  doc,
  updateDoc,
  getDoc,
  setDoc,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import { firestore } from "../firebase/firebase";

interface Comment {
  id: string;
  text: string;
  username: string;
  replies: Comment[];
  createdAt: any;
}

interface Post {
  id: string;
  imageUrl: string;
  username: string;
  likes: string[];
  comments: Comment[];
  createdAt: any;
}

interface PostProps {
  post: Post;
  user: any;
  onDelete?: (postId: string) => void;
  onLike: (postId: string) => void;
}

const timeAgo = (timestamp: any): string => {
  console.log(timestamp);
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

const Post: React.FC<PostProps> = ({ post, user, onDelete, onLike }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [newReply, setNewReply] = useState<{ [key: string]: string }>({});

  const handleAddComment = async () => {
    if (!user || !newComment.trim()) return;
    setLoading(true);
    try {
      const postRef = doc(firestore, "posts", post.id);
      const postDoc = await getDoc(postRef);
      const comments = postDoc.data()?.comments || [];
      const newCommentObj = {
        id: Date.now().toString(),
        text: newComment,
        username: user.displayName,
        replies: [],
        createdAt: Date.now(),
      };
      await updateDoc(postRef, { comments: [...comments, newCommentObj] });
      post.comments.push(newCommentObj);
      setNewComment("");
    } catch {
      setError("Failed to add comment.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddReply = async (commentId: string) => {
    if (!user || !newReply[commentId]?.trim()) return;
    setLoading(true);
    try {
      const postRef = doc(firestore, "posts", post.id);
      const postDoc = await getDoc(postRef);
      const comments = postDoc.data()?.comments || [];
      const index = comments.findIndex((c: any) => c.id === commentId);
      if (index > -1) {
        const reply = {
          id: Date.now().toString(),
          text: newReply[commentId],
          username: user.displayName,
          createdAt: Date.now(),
          replies: [],
        };
        comments[index].replies.push(reply);
        await updateDoc(postRef, { comments });
        post.comments[index].replies.push(reply);
        setNewReply({ ...newReply, [commentId]: "" });
      }
    } catch {
      setError("Failed to add reply.");
    } finally {
      setLoading(false);
    }
  };
  async function toggleSavePost(postId: any) {
    console.log(user);

    const saveDocRef = doc(firestore, "saves", `${user?.uid}_${postId}`);

    try {
      await setDoc(saveDocRef, {
        userId: user?.uid,
        postId: postId,
        savedAt: serverTimestamp(),
      });
    } catch (error) {
      console.log(error);
      setError("Failed to saved.");
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 max-w-2xl mx-auto h-50 w-full">
      {error && (
        <div className="text-red-600 bg-red-100 px-4 py-2 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center space-x-3 mb-4">
        <img
          src={`https://api.dicebear.com/7.x/identicon/svg?seed=${post.username}`}
          alt="avatar"
          className="w-8 h-8 rounded-full border-2 border-gray-200"
        />
        <div>
          <p className="font-semibold text-gray-800">{post.username}</p>
          <p className="text-xs text-gray-500">{timeAgo(post.createdAt)}</p>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(post.id)}
            className={`ml-auto text-red-500 hover:text-red-700 text-sm ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            Delete
          </button>
        )}
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
          onClick={() => onLike(post.id)}
          className={`flex items-center space-x-1.5 ${
            !user ? "opacity-50 cursor-not-allowed" : "hover:text-blue-600"
          }`}
          disabled={!user}
        >
          <span className="text-xl">👍</span>
          <span className="text-sm font-medium">{post.likes.length}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center space-x-1.5 ${
            !user ? "opacity-50 cursor-not-allowed" : "hover:text-blue-600"
          }`}
          disabled={!user}
        >
          <span className="text-xl">💬</span>
          <span className="text-sm font-medium">{post.comments.length}</span>
        </button>

        <button
          onClick={() => toggleSavePost(post.id)}
          className="text-xl hover:text-blue-600"
        >
          🔖
        </button>
      </div>

      {showComments && (
        <div className="mt-4 space-y-4">
          {post.comments.map((comment) => (
            <div key={comment.id} className="space-y-2">
              <div className="flex items-start space-x-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm text-gray-800">
                      {comment.username}
                    </span>
                    <span className="text-xs text-gray-500">
                      <p>{comment.createdAt}</p>
                      {timeAgo(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{comment.text}</p>
                </div>
              </div>

              {comment.replies.length > 0 && (
                <div className="ml-6 pl-3 border-l-2 border-gray-100 space-y-2">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex items-start space-x-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-sm text-gray-800">
                            {reply.username}
                          </span>
                          <span className="text-xs text-gray-500">
                            {timeAgo(reply.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">
                          {reply.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {user && (
                <div className="ml-6 pl-3 flex gap-2">
                  <input
                    type="text"
                    className="flex-1 text-sm px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="Write a reply..."
                    value={newReply[comment.id] || ""}
                    onChange={(e) =>
                      setNewReply({
                        ...newReply,
                        [comment.id]: e.target.value,
                      })
                    }
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleAddReply(comment.id)
                    }
                  />
                  <button
                    onClick={() => handleAddReply(comment.id)}
                    className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Reply
                  </button>
                </div>
              )}
            </div>
          ))}

          {user && (
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 text-sm px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
              />
              <button
                onClick={handleAddComment}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              >
                Post
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Post;
