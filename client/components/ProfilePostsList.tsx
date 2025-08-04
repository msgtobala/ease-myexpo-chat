import React, { useState, useEffect } from "react";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDocs,
  query,
  collection,
  where,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/use-toast";

interface Comment {
  commentId: string;
  commentedBy: string;
  commentedByType: string;
  commentedByProfileImage: string;
  commentContent: string;
  commentedTime: any;
}

interface Post {
  postId: string;
  postedBy: string;
  postedByType: string;
  postedByProfileImage: string;
  postContent: string;
  postType: string;
  postAssetUrl: string | null;
  postedTime: any;
  postLikes: number;
  likedBy: string[];
  postComments: Comment[];
  postCommentsCount: number;
}

interface ProfilePostsListProps {
  posts: Post[];
  loading: boolean;
  userData: any;
}

export default function ProfilePostsList({ posts, loading, userData }: ProfilePostsListProps) {
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const [showComments, setShowComments] = useState<{ [postId: string]: boolean }>({});
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const [livePostsData, setLivePostsData] = useState<{ [postId: string]: Post }>({});
  const { user } = useAuth();
  const { toast } = useToast();

  // Set up real-time listeners for all posts
  useEffect(() => {
    if (!posts || posts.length === 0) return;

    const unsubscribes: (() => void)[] = [];

    posts.forEach((post) => {
      const unsubscribe = onSnapshot(
        doc(db, "posts", post.postId),
        (postDoc) => {
          if (postDoc.exists()) {
            const data = postDoc.data();

            // Handle different comment data structures
            let normalizedComments: Comment[] = [];
            if (Array.isArray(data.postComments)) {
              normalizedComments = data.postComments;
            } else if (data.postComments && typeof data.postComments === 'object') {
              normalizedComments = Object.values(data.postComments) as Comment[];
            }

            const updatedPost: Post = {
              postId: postDoc.id,
              ...data,
              likedBy: data.likedBy || [],
              postComments: normalizedComments,
              postCommentsCount: data.postCommentsCount || normalizedComments.length
            } as Post;

            setLivePostsData(prev => ({
              ...prev,
              [post.postId]: updatedPost
            }));
          }
        },
        (error) => {
          console.error(`Error listening to post ${post.postId}:`, error);
        }
      );

      unsubscribes.push(unsubscribe);
    });

    // Cleanup function
    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [posts]);

  // Fetch current user data for comments
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          console.log("Fetching user data for:", user.uid);
          
          // Try multiple field names that might store user ID
          let userSnapshot = await getDocs(query(collection(db, "users"), where("uid", "==", user.uid)));
          
          // If not found with 'uid', try 'userId'
          if (userSnapshot.empty) {
            userSnapshot = await getDocs(query(collection(db, "users"), where("userId", "==", user.uid)));
          }
          
          // If still not found, try with document ID
          if (userSnapshot.empty) {
            try {
              const userDocRef = doc(db, "users", user.uid);
              const userDoc = await getDoc(userDocRef);
              if (userDoc.exists()) {
                setCurrentUserData(userDoc.data());
                console.log("User data found by document ID:", userDoc.data());
                return;
              }
            } catch (docError) {
              console.log("Document ID fetch failed:", docError);
            }
          }
          
          if (!userSnapshot.empty) {
            const userData = userSnapshot.docs[0].data();
            setCurrentUserData(userData);
            console.log("User data found:", userData);
          } else {
            console.log("No user data found for uid:", user.uid);
            // Fallback: use basic user info from auth
            setCurrentUserData({
              name: user.displayName || user.email || "Unknown User",
              profileType: "visitor",
              profilePictureUrl: user.photoURL || "",
              uid: user.uid
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          // Fallback: use basic user info from auth
          setCurrentUserData({
            name: user.displayName || user.email || "Unknown User",
            profileType: "visitor",
            profilePictureUrl: user.photoURL || "",
            uid: user.uid
          });
        }
      }
    };

    fetchUserData();
  }, [user]);

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "Just now";

    const now = new Date();
    const postTime = timestamp.toDate
      ? timestamp.toDate()
      : new Date(timestamp);
    const diffInSeconds = Math.floor(
      (now.getTime() - postTime.getTime()) / 1000,
    );

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const handleLike = async (postId: string, currentLikedBy: string[]) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to like posts.",
        variant: "destructive",
      });
      return;
    }

    try {
      const postRef = doc(db, "posts", postId);
      const isCurrentlyLiked = currentLikedBy.includes(user.uid);

      if (isCurrentlyLiked) {
        // Unlike the post
        await updateDoc(postRef, {
          likedBy: arrayRemove(user.uid),
          postLikes: Math.max(0, currentLikedBy.length - 1),
        });
      } else {
        // Like the post
        await updateDoc(postRef, {
          likedBy: arrayUnion(user.uid),
          postLikes: currentLikedBy.length + 1,
        });
      }
    } catch (error) {
      console.error("Error updating like:", error);
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCommentSubmit = async (postId: string) => {
    const commentText = commentInputs[postId]?.trim();
    
    if (!commentText) return;
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to comment on posts.",
        variant: "destructive",
      });
      return;
    }

    console.log("Comment submission - user:", user);
    console.log("Comment submission - currentUserData:", currentUserData);
    
    // If currentUserData is not available, use fallback data from auth
    const userData = currentUserData || {
      name: user.displayName || user.email || "Unknown User",
      profileType: "visitor",
      profilePictureUrl: user.photoURL || "",
      uid: user.uid
    };

    try {
      const postRef = doc(db, "posts", postId);
      const currentPost = posts.find(p => p.postId === postId);
      
      if (!currentPost) {
        toast({
          title: "Error",
          description: "Post not found. Please refresh the page.",
          variant: "destructive",
        });
        return;
      }

      const newComment: Comment = {
        commentId: `${Date.now()}_${user.uid}`,
        commentedBy: userData.name || userData.displayName || userData.fullName || user.displayName || "Unknown User",
        commentedByType: userData.profileType || "visitor",
        commentedByProfileImage: userData.profilePictureUrl || userData.companyLogoUrl || user.photoURL || "",
        commentContent: commentText,
        commentedTime: new Date(),
      };

      // Handle different comment data structures (array, object, or undefined)
      let existingComments: Comment[] = [];
      if (Array.isArray(currentPost.postComments)) {
        existingComments = currentPost.postComments;
      } else if (currentPost.postComments && typeof currentPost.postComments === 'object') {
        // Convert object to array if it's stored as an object
        existingComments = Object.values(currentPost.postComments) as Comment[];
      }
      
      const updatedComments = [...existingComments, newComment];

      await updateDoc(postRef, {
        postComments: updatedComments,
        postCommentsCount: updatedComments.length,
      });

      // Clear the comment input
      setCommentInputs(prev => ({
        ...prev,
        [postId]: ""
      }));

      toast({
        title: "Comment Added",
        description: "Your comment has been posted successfully.",
      });

    } catch (error) {
      console.error("Error adding comment:", error);
      
      // Provide more specific error messages
      let errorMessage = "Failed to add comment. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch")) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (error.message.includes("permission")) {
          errorMessage = "Permission denied. Please check your account permissions.";
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleCommentInputChange = (postId: string, value: string) => {
    setCommentInputs(prev => ({
      ...prev,
      [postId]: value
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent, postId: string) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCommentSubmit(postId);
    }
  };

  const toggleComments = (postId: string) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const isPostLikedByUser = (likedBy: string[]) => {
    return user ? likedBy.includes(user.uid) : false;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1].map((i) => (
          <div
            key={i}
            className="w-full bg-white rounded-[18px] shadow-sm border border-gray-100 p-4"
          >
            <div className="animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 bg-gray-200 rounded-full"></div>
                <div>
                  <div className="h-3 bg-gray-200 rounded w-24 mb-1"></div>
                  <div className="h-2 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="w-full bg-white rounded-[16px] shadow-sm border border-gray-100 p-6 text-center">
        <p className="text-gray-500">No posts available.</p>
      </div>
    );
  }

  // Get the most up-to-date post data (live data if available, fallback to original)
  const getPostData = (post: Post): Post => {
    return livePostsData[post.postId] || post;
  };

  return (
    <div className="space-y-6">
      {posts.map((originalPost) => {
        const post = getPostData(originalPost);
        return (
          <div
            key={post.postId}
            className="w-full bg-white rounded-[18px] shadow-sm border border-gray-100"
          >
          <div className="p-4">
            {/* Post Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={
                    post.postedByProfileImage ||
                    "https://api.builder.io/api/v1/image/assets/TEMP/e2a6d10a28fbc88f64804440fbfc80879f704750?width=91"
                  }
                  alt={post.postedBy}
                  className="w-11 h-11 rounded-full object-cover"
                />
                <div>
                  <div className="text-black font-poppins text-[14px] font-medium">
                    {post.postedBy}
                  </div>
                  <div className="text-black/46 font-poppins text-[12px]">
                    {post.postedByType?.[0]?.toUpperCase() +
                      post.postedByType?.slice(1).toLowerCase()}{" "}
                    • {formatTime(post.postedTime)}
                  </div>
                </div>
              </div>
              <svg
                className="w-1 h-4"
                viewBox="0 0 4 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="2" cy="2" r="2" fill="#C4C4C4" />
                <circle cx="2" cy="8" r="2" fill="#C4C4C4" />
                <circle cx="2" cy="15" r="2" fill="#C4C4C4" />
              </svg>
            </div>

            {/* Post Content */}
            {post.postContent && (
              <div className="text-black font-poppins text-[14px] mb-4">
                {post.postContent}
              </div>
            )}

            {/* Post Media */}
            {post.postAssetUrl && (
              <div className="mb-4">
                {post.postType === "image" ? (
                  <img
                    src={post.postAssetUrl}
                    alt="Post image"
                    className="w-full max-h-[400px] rounded-[18px] object-cover"
                  />
                ) : post.postType === "video" ? (
                  <video
                    src={post.postAssetUrl}
                    controls
                    className="w-full max-h-[400px] rounded-[18px]"
                  />
                ) : null}
              </div>
            )}

            {/* Post Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                {/* Like */}
                <button 
                  className="flex items-center gap-2 hover:opacity-75 transition-opacity"
                  onClick={() => handleLike(post.postId, post.likedBy || [])}
                >
                  <div className="relative">
                    <svg
                      className="w-[20px] h-[18px]"
                      viewBox="0 0 24 24"
                      fill={isPostLikedByUser(post.likedBy || []) ? "#EF4444" : "none"}
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                        stroke={isPostLikedByUser(post.likedBy || []) ? "#EF4444" : "#666"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  {post.postLikes > 0 && (
                    <span className={`text-[12px] font-poppins ${
                      isPostLikedByUser(post.likedBy || []) ? "text-[#EF4444]" : "text-[#200E32]"
                    }`}>
                      {post.postLikes}
                    </span>
                  )}
                </button>

                {/* Comment */}
                <button 
                  className="flex items-center gap-2 hover:opacity-75 transition-opacity"
                  onClick={() => toggleComments(post.postId)}
                >
                  <div className="relative">
                    <svg
                      className="w-[24px] h-[24px]"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12.058 2.00008C16.2115 2.03077 19.9153 4.61803 21.3675 8.50387C22.8199 12.3901 21.7187 16.7681 18.5997 19.5079C15.4812 22.2473 10.9929 22.7804 7.31788 20.848L7.27208 20.8319C7.26493 20.8278 7.26378 20.8242 7.26224 20.8194L6.57971 20.4332C6.4407 20.3763 6.28665 20.3671 6.19261 20.3909C5.4831 20.646 4.75798 20.8554 4.02167 21.018L3.88671 21.0343C3.07616 21.0523 2.66776 20.5263 2.66776 19.7609L2.6873 19.597C2.87136 18.8357 3.10204 18.0865 3.36458 17.3927C3.40531 17.2613 3.39175 17.1192 3.32147 16.9875L3.13765 16.6292C1.51288 13.5227 1.63541 9.79358 3.46059 6.8001C5.28554 3.80701 8.54635 1.98613 12.058 2.00008ZM12.0484 3.39463L11.7675 3.39903C8.85494 3.48236 6.17338 5.03121 4.65196 7.52649C3.08168 10.1019 2.97627 13.3099 4.37662 15.9874L4.55755 16.3402C4.79818 16.7905 4.84853 17.3183 4.68389 17.8451C4.42804 18.5246 4.21419 19.2192 4.04356 19.9249L4.138 19.557L4.53273 19.4541C4.66823 19.4168 4.80406 19.3775 4.9406 19.3361L5.35272 19.2055L5.77133 19.0617C6.21354 18.9399 6.6837 18.9681 7.14685 19.159C7.24408 19.2059 7.36471 19.271 7.51677 19.3569L7.93909 19.5993C7.94625 19.6012 7.95251 19.6029 7.95729 19.6042L7.94496 19.6026L8.23269 19.7468C11.2582 21.2076 14.8626 20.778 17.4587 18.6466L17.6788 18.4596C20.3626 16.1021 21.31 12.3357 20.0605 8.99235C18.8109 5.64861 15.6231 3.42182 12.0484 3.39463Z"
                        fill="#200E32"
                      />
                    </svg>
                  </div>
                  {(post.postCommentsCount || 0) > 0 && (
                    <span className="text-[12px] font-poppins text-[#200E32]">
                      {post.postCommentsCount}
                    </span>
                  )}
                </button>

                {/* Share */}
                <svg
                  className="w-[24px] h-[24px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21.7046 4.59148L21.668 4.73245L17.0228 20.3719C16.5618 21.9229 14.5395 22.2329 13.6263 20.9534L13.5387 20.8201L9.64298 14.366L3.16744 10.3802C1.79097 9.5328 2.01645 7.48605 3.48604 6.93298L3.63713 6.88275L19.2937 2.32702C20.709 1.91742 22.0162 3.18582 21.7046 4.59148ZM19.7846 3.75317L19.7117 3.76759L4.05573 8.32316C3.72984 8.41775 3.64979 8.83646 3.88762 9.05312L3.95374 9.10278L10.078 12.872L15.3233 7.59257C15.5887 7.32541 16.0052 7.29982 16.2996 7.5167L16.3839 7.58903C16.6511 7.85441 16.6767 8.27099 16.4598 8.56533L16.3875 8.64969L11.135 13.936L14.823 20.045C14.9985 20.3359 15.4093 20.3069 15.5545 20.0214L15.585 19.9447L20.2303 4.30467C20.3202 4.00306 20.0734 3.72216 19.7846 3.75317Z"
                    fill="#200E32"
                  />
                </svg>
              </div>

              <svg
                className="w-[24px] h-[24px]"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14.9857 2C18.0482 2 20 3.43503 20 6.25765V20.3309C20 20.7736 19.8285 21.1982 19.5232 21.5112C19.2179 21.8242 18.8038 22 18.3608 22C18.0965 21.9957 17.8368 21.9291 17.5863 21.7971L11.974 18.6635L6.38442 21.8037C5.7112 22.1624 4.89545 21.9969 4.38431 21.3975L4.28627 21.2719L4.19263 21.1174C4.07042 20.8782 4.00448 20.613 4 20.3309V6.43434C4 3.49929 5.90915 2 9.01434 2H14.9857ZM14.9857 3.44775H9.01434C6.61925 3.44775 5.41205 4.39579 5.41205 6.43434L5.41195 20.3189C5.41267 20.3631 5.42346 20.4065 5.41172 20.3897L5.44919 20.4519C5.51373 0.5421 5.63485 20.5715 5.71962 20.5265L11.3068 17.3883C11.7233 17.1576 12.225 17.1576 12.6435 17.3894L18.2463 20.5173C18.2887 20.5397 18.3355 20.5517 18.372 20.5523C18.4293 20.5523 18.4842 20.529 18.5247 20.4875C18.5652 20.446 18.5879 20.3897 18.5879 20.3309V6.25765C18.5879 4.35788 17.35 3.44775 14.9857 3.44775ZM15.4079 8.31663C15.7978 8.31663 16.1139 8.64072 16.1139 9.0405C16.1139 9.40697 15.8483 9.70984 15.5037 9.75777L15.4079 9.76438H8.54042C8.1505 9.76438 7.8344 9.44029 7.8344 9.0405C7.8344 8.67404 8.10001 8.37117 8.44462 8.32324L8.54042 8.31663H15.4079Z"
                  fill="#200E32"
                />
              </svg>
            </div>

            {/* Comments Display */}
            {showComments[post.postId] && Array.isArray(post.postComments) && post.postComments.length > 0 && (
              <div className="mt-4 space-y-3">
                {post.postComments.map((comment) => (
                  <div key={comment.commentId} className="flex gap-3 bg-gray-50 rounded-[12px] p-3">
                    <img
                      src={
                        comment.commentedByProfileImage ||
                        "https://api.builder.io/api/v1/image/assets/TEMP/d064c0d047315af10f082e5ddd186ed5e3ba3001?width=80"
                      }
                      alt={comment.commentedBy}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[#212121] font-poppins text-[13px] font-medium">
                          {comment.commentedBy}
                        </span>
                        <span className="text-[#666] font-poppins text-[11px]">
                          {comment.commentedByType?.[0]?.toUpperCase() + comment.commentedByType?.slice(1).toLowerCase()}
                        </span>
                        <span className="text-[#999] font-poppins text-[10px]">
                          {formatTime(comment.commentedTime)}
                        </span>
                      </div>
                      <p className="text-[#212121] font-poppins text-[12px] leading-[1.4]">
                        {comment.commentContent}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Comment Input Section */}
            <div className="mt-4 bg-[#F6F6F6] rounded-[18px] p-3 flex items-center gap-3">
              <img
                src={
                  currentUserData?.profilePictureUrl ||
                  currentUserData?.companyLogoUrl ||
                  user?.photoURL ||
                  "https://api.builder.io/api/v1/image/assets/TEMP/d064c0d047315af10f082e5ddd186ed5e3ba3001?width=80"
                }
                alt="Your Avatar"
                className="w-7 h-7 rounded-full object-cover"
              />
              <input
                type="text"
                placeholder="Write a comment"
                value={commentInputs[post.postId] || ""}
                onChange={(e) => handleCommentInputChange(post.postId, e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, post.postId)}
                className="flex-1 text-black font-roboto text-[12px] bg-transparent outline-none placeholder-black/36"
              />
              <button
                onClick={() => handleCommentSubmit(post.postId)}
                disabled={!commentInputs[post.postId]?.trim()}
                className="ml-auto px-3 py-1 bg-[#10B981] text-white rounded-lg text-[11px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#0EA573] transition-colors"
              >
                Post
              </button>
            </div>
          </div>
        </div>
        );
      })}
    </div>
  );
}
