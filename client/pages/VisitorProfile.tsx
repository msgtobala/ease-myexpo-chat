import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import Header from "../components/Header";
import LeftSidebar from "../components/LeftSidebar";
import CommunityDiscussions from "../components/CommunityDiscussions";
import VisitorProfileCard from "../components/VisitorProfile";
import SocialMediaPost from "../components/SocialMediaPost";
import MobileMenu from "../components/MobileMenu";
import ProfilePostsList from "../components/ProfilePostsList";

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

export default function VisitorProfile() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const location = useLocation();
  const userData = location.state?.userData;
  const { user } = useAuth();

  if (userData === null || userData === undefined) {
    return <Navigate to="/home" />;
  }

  // Check if the current user owns this profile
  const isOwnProfile =
    user &&
    userData &&
    (user.uid === userData.userId || user.uid === userData.userId);

  // Fetch user posts based on userData.posts array
  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!userData?.posts || userData.posts.length === 0) {
        setLoadingPosts(false);
        return;
      }

      try {
        const postsPromises = userData.posts.map(async (postId: string) => {
          const postDoc = await getDoc(doc(db, "posts", postId));
          if (postDoc.exists()) {
            const data = postDoc.data();

            // Handle different comment data structures
            let normalizedComments: Comment[] = [];
            if (Array.isArray(data.postComments)) {
              normalizedComments = data.postComments;
            } else if (data.postComments && typeof data.postComments === 'object') {
              normalizedComments = Object.values(data.postComments) as Comment[];
            }

            return {
              postId: postDoc.id,
              ...data,
              likedBy: data.likedBy || [],
              postComments: normalizedComments,
              postCommentsCount: data.postCommentsCount || normalizedComments.length
            } as Post;
          }
          return null;
        });

        const fetchedPosts = await Promise.all(postsPromises);
        const validPosts = fetchedPosts.filter(
          (post): post is Post => post !== null,
        );

        // Sort posts by posted time (newest first)
        validPosts.sort((a, b) => {
          const timeA = a.postedTime?.toDate
            ? a.postedTime.toDate()
            : new Date(a.postedTime);
          const timeB = b.postedTime?.toDate
            ? b.postedTime.toDate()
            : new Date(b.postedTime);
          return timeB.getTime() - timeA.getTime();
        });

        setUserPosts(validPosts);
        setLoadingPosts(false);
      } catch (error) {
        console.error("Error fetching user posts:", error);
        setLoadingPosts(false);
      }
    };

    fetchUserPosts();
  }, [userData?.posts]);

  // Listen for real-time updates to user's posts array (for own profile)
  useEffect(() => {
    if (!isOwnProfile || !user?.uid) return;

    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (userDoc) => {
        if (userDoc.exists()) {
          const updatedUserData = userDoc.data();
          const updatedPosts = updatedUserData?.posts || [];

          // If posts array changed, refetch the posts
          if (
            JSON.stringify(updatedPosts) !== JSON.stringify(userData?.posts)
          ) {
            fetchPostsFromArray(updatedPosts);
          }
        }
      },
      (error) => {
        console.error("Error listening to user updates:", error);
      },
    );

    return () => unsubscribe();
  }, [isOwnProfile, user?.uid]);

  // Helper function to fetch posts from array
  const fetchPostsFromArray = async (postsArray: string[]) => {
    if (!postsArray || postsArray.length === 0) {
      setUserPosts([]);
      setLoadingPosts(false);
      return;
    }

    try {
      setLoadingPosts(true);
      const postsPromises = postsArray.map(async (postId: string) => {
        const postDoc = await getDoc(doc(db, "posts", postId));
        if (postDoc.exists()) {
          const data = postDoc.data();

          // Handle different comment data structures
          let normalizedComments: Comment[] = [];
          if (Array.isArray(data.postComments)) {
            normalizedComments = data.postComments;
          } else if (data.postComments && typeof data.postComments === 'object') {
            normalizedComments = Object.values(data.postComments) as Comment[];
          }

          return {
            postId: postDoc.id,
            ...data,
            likedBy: data.likedBy || [],
            postComments: normalizedComments,
            postCommentsCount: data.postCommentsCount || normalizedComments.length
          } as Post;
        }
        return null;
      });

      const fetchedPosts = await Promise.all(postsPromises);
      const validPosts = fetchedPosts.filter(
        (post): post is Post => post !== null,
      );

      // Sort posts by posted time (newest first)
      validPosts.sort((a, b) => {
        const timeA = a.postedTime?.toDate
          ? a.postedTime.toDate()
          : new Date(a.postedTime);
        const timeB = b.postedTime?.toDate
          ? b.postedTime.toDate()
          : new Date(b.postedTime);
        return timeB.getTime() - timeA.getTime();
      });

      setUserPosts(validPosts);
      setLoadingPosts(false);
    } catch (error) {
      console.error("Error fetching posts from array:", error);
      setLoadingPosts(false);
    }
  };

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
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="h-screen bg-[#F6F6F6] overflow-hidden">
      {/* Header */}
      <Header onMenuToggle={toggleMobileMenu} />

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        activeItem="profile"
        onItemClick={closeMobileMenu}
      />

      {/* Main Layout */}
      <div
        className="flex flex-col lg:flex-row gap-4 lg:gap-6 p-2 sm:p-4 lg:p-6 max-w-[1483px] mx-auto"
        style={{ height: "calc(100vh - 76px)" }}
      >
        {/* Left Sidebar Container - Hidden on mobile, visible on desktop */}
        <div className="hidden lg:block w-[300px] space-y-6">
          {/* Navigation Menu */}
          <LeftSidebar activeItem="profile" onItemClick={() => {}} />

          {/* Community Discussions */}
          <CommunityDiscussions />
        </div>

        {/* Main Content Area */}
        <div
          className="flex-1 space-y-4 lg:space-y-6 overflow-y-auto lg:pr-2 pb-8 lg:pb-16"
          style={{ scrollBehavior: "smooth" }}
        >
          {/* Visitor Profile */}
          <VisitorProfileCard userData={userData} isOwnProfile={isOwnProfile} />

          {/* User Posts */}
          <ProfilePostsList
            posts={userPosts}
            loading={loadingPosts}
            userData={userData}
          />

          {/* Social Media Post - Fallback if no posts */}
          {/*{!loadingPosts && userPosts.length === 0 && (
            <SocialMediaPost />
          )}*/}
        </div>
      </div>
    </div>
  );
}
