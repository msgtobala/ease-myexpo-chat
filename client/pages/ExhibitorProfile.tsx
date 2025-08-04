import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  doc,
  getDoc,
  query,
  where,
  getDocs,
  collection,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import Header from "../components/Header";
import LeftSidebar from "../components/LeftSidebar";
import CommunityDiscussions from "../components/CommunityDiscussions";
import MobileMenu from "../components/MobileMenu";
import ExhibitorProfileCard from "../components/ExhibitorProfileCard";
import PostCreationModal from "../components/PostCreationModal";
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

export default function ExhibitorProfile() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("discussion");
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postModalMode, setPostModalMode] = useState<
    "photo" | "video" | "both"
  >("both");
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

  const openPostModal = (mode: "photo" | "video" | "both") => {
    setPostModalMode(mode);
    setIsPostModalOpen(true);
  };

  const closePostModal = () => {
    setIsPostModalOpen(false);
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
          {/* Exhibitor Profile Card */}
          <ExhibitorProfileCard
            userData={userData}
            isOwnProfile={isOwnProfile}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Tab Content */}
          {activeTab === "discussion" && (
            <>
              {/* Write New Post - Only show if user owns this profile */}
          {isOwnProfile && (
            <div className="w-full bg-white rounded-[16px] shadow-sm border border-gray-100">
              {/* Top Section */}
              <div className="relative h-[98px] p-2 sm:p-4 lg:p-6">
                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                  <img
                    src={
                      userData?.companyLogoUrl ||
                      userData?.profilePictureUrl ||
                      "https://api.builder.io/api/v1/image/assets/TEMP/4843185ee37befdbbb1d81cdcf0196fca3078f32?width=83"
                    }
                    alt="Profile"
                    className="w-10 h-10 rounded-[18px] object-cover"
                  />
                  <input
                    type="text"
                    placeholder="Write something ..."
                    className="flex-1 text-[#666666] font-roboto text-[14px] lg:text-[16px] bg-transparent outline-none placeholder-[#666666] cursor-pointer"
                    onClick={() => openPostModal("both")}
                    readOnly
                  />
                  <svg
                    className="w-[22px] h-[24px] ml-auto"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M19.7438 19.2089C20.0873 19.2089 20.3658 19.498 20.3658 19.8545C20.3658 20.1813 20.1318 20.4514 19.8282 20.4941L19.7438 20.5H13.2537C12.9102 20.5 12.6317 20.211 12.6317 19.8545C12.6317 19.5277 12.8657 19.2576 13.1693 19.2148L13.2537 19.2089H19.7438ZM13.4315 4.41662C14.6093 3.19446 16.5195 3.19446 17.6973 4.41662L18.92 5.6854C20.0977 6.90755 20.0977 8.88985 18.92 10.112L9.72991 19.6486C9.20441 20.1939 8.49194 20.4999 7.74828 20.4999H3.98462C3.63499 20.4999 3.35403 20.201 3.36275 19.8383L3.45742 15.8975C3.47624 15.1526 3.76994 14.4425 4.27758 13.9157L13.4315 4.41662ZM12.72 6.979L5.15732 14.8287C4.87514 15.1215 4.71161 15.5169 4.70115 15.9305L4.62216 19.2084L7.74828 19.2088C8.11612 19.2088 8.46986 19.0745 8.74907 18.8317L8.85017 18.7357L16.4503 10.849L12.72 6.979ZM16.8176 5.32953C16.1257 4.61156 15.0032 4.61156 14.3113 5.32953L13.6004 6.066L17.3298 9.936L18.0402 9.19909C18.6937 8.52101 18.73 7.44433 18.1491 6.72195L18.0402 6.59831L16.8176 5.32953Z"
                      fill="#666666"
                    />
                  </svg>
                </div>
              </div>

              {/* Bottom Section - Green */}
              <div className="bg-[#10B981] h-[57px] rounded-b-[16px] flex items-center justify-between px-2 sm:px-4 lg:px-6">
                {/* Icons */}
                <div className="flex items-center gap-1 sm:gap-4 lg:gap-16 overflow-x-auto">
                  {/* Photo */}
                  <div
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80"
                    onClick={() => openPostModal("photo")}
                  >
                    <svg
                      className="w-[28px] h-[24px]"
                      viewBox="0 0 29 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M19.903 2C23.8735 2 26.5196 4.42887 26.5196 7.91408V16.0849C26.5196 19.5703 23.8733 22 19.903 22H9.79116C5.82267 22 3.18628 19.5722 3.18628 16.0849V7.91408C3.18628 4.43059 5.83037 2 9.79116 2H19.903ZM19.903 3.50383H9.79116C6.82705 3.50383 4.93979 5.2387 4.93979 7.91408V16.0849C4.93979 18.7647 6.82009 20.4962 9.79116 20.4962H19.903C22.8772 20.4962 24.7661 18.7618 24.7661 16.0849V7.91408C24.7661 5.23744 22.8774 3.50383 19.903 3.50383ZM20.734 12.1835L20.886 12.3086L23.3129 14.4561C23.6499 14.7543 23.6412 15.2303 23.2935 15.5193C22.9774 15.7821 22.4899 15.7998 22.1507 15.5768L22.0537 15.5027L19.627 13.3553C19.2042 12.9814 18.5169 12.9779 18.0878 13.3269L17.9936 13.4137L15.3883 16.1312C14.4668 17.0939 12.8087 17.1971 11.7359 16.3903L11.5934 16.2747L10.5536 15.3648C10.2805 15.1217 9.84495 15.0987 9.54165 15.2949L9.44585 15.3684L7.65844 16.9855C7.32532 17.2869 6.77039 17.2996 6.41897 17.0139C6.09949 16.7542 6.05819 16.3372 6.3036 16.0372L6.38583 15.9509L8.17286 14.3341C9.11364 13.4819 10.6629 13.4365 11.6651 14.1967L11.8111 14.3167L12.8456 15.222C13.148 15.4865 13.6327 15.4933 13.9452 15.2553L14.0334 15.1766L16.6389 12.4589C17.6742 11.3782 19.5382 11.2689 20.734 12.1835ZM10.8544 6.64124C12.4702 6.64124 13.7816 7.76589 13.7816 9.15164C13.7816 10.5374 12.4702 11.662 10.8544 11.662C9.23862 11.662 7.92835 10.5374 7.92835 9.15164C7.92835 7.76583 9.23862 6.64124 10.8544 6.64124ZM10.8544 8.14507C10.2074 8.14507 9.68185 8.59611 9.68185 9.15164C9.68185 9.70716 10.2074 10.1582 10.8544 10.1582C11.5017 10.1582 12.028 9.70684 12.028 9.15164C12.028 8.59643 11.5017 8.14507 10.8544 8.14507Z"
                        fill="white"
                      />
                    </svg>
                    <span className="text-white font-poppins text-[16px]">
                      Photo
                    </span>
                  </div>

                  {/* Video */}
                  <div
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80"
                    onClick={() => openPostModal("video")}
                  >
                    <svg
                      className="w-[28px] h-[24px]"
                      viewBox="0 0 29 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M14.8921 4.49982C17.7179 4.49982 19.6853 6.03379 19.8948 8.28415L22.9833 7.2019C24.3195 6.73455 25.7775 7.52863 25.8837 8.7353L25.8899 8.87632V15.5153C25.8899 16.7526 24.4813 17.6087 23.1375 17.237L22.9828 17.1886L19.8948 16.1062C19.6848 18.3551 17.7134 19.8908 14.8921 19.8908H7.57822C4.58559 19.8908 2.55688 18.1717 2.55688 15.7028V8.68782C2.55688 6.21891 4.58559 4.49982 7.57822 4.49982H14.8921ZM14.8921 5.99982H7.57822C5.54763 5.99982 4.30688 7.0512 4.30688 8.68782V15.7028C4.30688 17.3394 5.54763 18.3908 7.57822 18.3908H14.8921C16.9176 18.3908 18.1634 17.3367 18.1634 15.7028L18.1632 15.0173C18.1628 15.0066 18.1627 14.9959 18.1629 14.9852L18.1634 8.68782C18.1634 7.0516 16.9219 5.99982 14.8921 5.99982ZM23.7241 8.57141L23.6449 8.59056L19.9134 9.89682V14.4928L23.6444 15.7999C23.855 15.8736 24.0827 15.7642 24.1307 15.5854L24.1399 15.5153V8.87632C24.1399 8.68152 23.9353 8.54203 23.7241 8.57141Z"
                        fill="white"
                      />
                    </svg>
                    <span className="text-white font-poppins text-[16px]">
                      Video
                    </span>
                  </div>

                  {/* Event */}
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-[27px] h-[24px]"
                      viewBox="0 0 28 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M17.8008 2C18.1951 2 18.5209 2.26247 18.5725 2.603L18.5796 2.69767L18.5797 3.48626C21.7781 3.68121 23.7367 5.51888 23.7265 8.48579V16.9744C23.7265 20.1193 21.5275 22 17.9932 22H9.20985C5.67969 22 3.47656 20.0872 3.47656 16.9041V8.48579C3.47656 5.51995 5.44139 3.68177 8.63294 3.48635L8.63303 2.69767C8.63303 2.31236 8.98173 2 9.41187 2C9.80617 2 10.132 2.26247 10.1836 2.603L10.1907 2.69767L10.1906 3.469H17.0216L17.0219 2.69767C17.0219 2.31236 17.3706 2 17.8008 2ZM22.1684 10.283H5.03356L5.03425 16.9041C5.03425 19.2292 6.43437 20.5198 8.95415 20.6006L9.20985 20.6047H17.9932C20.683 20.6047 22.1688 19.3338 22.1688 16.9744L22.1684 10.283ZM18.224 16.136C18.6542 16.136 19.0029 16.4484 19.0029 16.8337C19.0029 17.1869 18.7099 17.4788 18.3297 17.525L18.224 17.5314C17.7843 17.5314 17.4356 17.219 17.4356 16.8337C17.4356 16.4805 17.7286 16.1886 18.1087 16.1424L18.224 16.136ZM13.6159 16.136C14.0461 16.136 14.3948 16.4484 14.3948 16.8337C14.3948 17.1869 14.1018 17.4788 13.7216 17.525L13.6159 17.5314C13.1762 17.5314 12.8275 17.219 12.8275 16.8337C12.8275 16.4805 13.1205 16.1886 13.5006 16.1424L13.6159 16.136ZM8.9982 16.136C9.42835 16.136 9.77705 16.4484 9.77705 16.8337C9.77705 17.1869 9.48404 17.4788 9.10389 17.525L8.98858 17.5314C8.55844 17.5314 8.20974 17.219 8.20974 16.8337C8.20974 16.4805 8.50274 16.1886 8.8829 16.1424L8.9982 16.136ZM18.224 12.5206C18.6542 12.5206 19.0029 12.833 19.0029 13.2183C19.0029 13.5715 18.7099 13.8634 18.3297 13.9096L18.224 13.916C17.7843 13.916 17.4356 13.6036 17.4356 13.2183C17.4356 12.8651 17.7286 12.5732 18.1087 12.527L18.224 12.5206ZM13.6159 12.5206C14.0461 12.5206 14.3948 12.833 14.3948 13.2183C14.3948 13.5715 14.1018 13.8634 13.7216 13.9096L13.6159 13.916C13.1762 13.916 12.8275 13.6036 12.8275 13.2183C12.8275 12.8651 13.1205 12.5732 13.5006 12.527L13.6159 12.5206ZM8.9982 12.5206C9.42835 12.5206 9.77705 12.833 9.77705 13.2183C9.77705 13.5715 9.48404 13.8634 9.10389 13.9096L8.98858 13.916C8.55844 13.916 8.20974 13.6036 8.20974 13.2183C8.20974 12.8651 8.50274 12.5732 8.8829 12.527L8.9982 12.5206Z"
                        fill="white"
                      />
                    </svg>
                    <span className="text-white font-poppins text-[16px]">
                      Event
                    </span>
                  </div>

                  {/* Article */}
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-[30px] h-[24px]"
                      viewBox="0 0 31 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M20.0614 2C24.0564 2 26.4452 3.92 26.4827 7.132V16.791C26.4827 20.048 24.0877 22 20.0614 22H10.4052C9.89016 22 9.40141 21.968 8.94142 21.905L8.66891 21.864C5.70517 21.371 3.98267 19.555 3.98267 16.791V7.209C3.98267 6.875 4.00767 6.555 4.05767 6.249C4.49392 3.564 6.80017 2 10.4052 2H20.0614ZM20.0502 3.457H10.4052C7.33517 3.457 5.77892 4.72 5.77892 7.209V16.791C5.77892 19.28 7.33517 20.543 10.4052 20.543H20.0502C23.1189 20.543 24.6652 19.28 24.6652 16.791V7.209C24.6652 4.72 23.1189 3.457 20.0502 3.457ZM19.7239 15.51C20.2164 15.51 20.6152 15.834 20.6152 16.234C20.6152 16.634 20.2164 16.958 19.7239 16.958H10.7102C10.2177 16.958 9.81766 16.634 9.81766 16.234C9.81766 15.834 10.2177 15.51 10.7102 15.51H19.7239ZM19.7239 11.271C20.0677 11.241 20.4039 11.373 20.5877 11.61C20.7714 11.849 20.7714 12.151 20.5877 12.39C20.4039 12.627 20.0677 12.759 19.7239 12.729H10.7102C10.2527 12.687 9.90641 12.374 9.90641 12C9.90641 11.626 10.2527 11.312 10.7102 11.271H19.7239ZM14.1502 7.042C14.6077 7.083 14.9539 7.397 14.9539 7.771C14.9539 8.144 14.6077 8.458 14.1502 8.499H10.7214C10.2627 8.458 9.91641 8.144 9.91641 7.771C9.91641 7.397 10.2627 7.083 10.7214 7.042H14.1502Z"
                        fill="white"
                      />
                    </svg>
                    <span className="text-white font-poppins text-[16px]">
                      Article
                    </span>
                  </div>
                </div>

                {/* Send Icon */}
                <svg
                  className="w-[25px] h-[24px]"
                  viewBox="0 0 25 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M11.1735 14.8178L14.9552 20.7508C15.1207 21.0108 15.3792 21.0078 15.4837 20.9938C15.5881 20.9798 15.8394 20.9178 15.9304 20.6228L20.6594 5.17777C20.7422 4.90477 20.5901 4.71877 20.5219 4.65277C20.4557 4.58677 20.2665 4.44577 19.9924 4.52077L4.0091 9.04677C3.7061 9.13277 3.63992 9.37877 3.62544 9.47977C3.61096 9.58277 3.60683 9.83777 3.87466 10.0008L10.0804 13.7538L15.5633 8.39577C15.8642 8.10177 16.3554 8.09877 16.6605 8.38977C16.9656 8.68077 16.9676 9.15677 16.6667 9.45077L11.1735 14.8178ZM15.403 22.4998C14.6833 22.4998 14.0235 22.1458 13.6347 21.5378L9.62539 15.2468L3.05254 11.2718C2.34417 10.8428 1.97395 10.0788 2.08874 9.27577C2.20249 8.47277 2.77229 7.83477 3.5727 7.60777L19.556 3.08177C20.2913 2.87377 21.0793 3.07077 21.6212 3.59277C22.163 4.11977 22.3647 4.88977 22.1455 5.60377L17.4164 21.0478C17.1796 21.8248 16.5178 22.3738 15.6895 22.4808C15.5922 22.4928 15.4981 22.4998 15.403 22.4998Z"
                    fill="white"
                  />
                </svg>
              </div>
            </div>
          )}

              {/* User Posts */}
              <ProfilePostsList
                posts={userPosts}
                loading={loadingPosts}
                userData={userData}
              />
            </>
          )}

          {activeTab === "portfolio" && (
            <div className="w-full bg-white rounded-[16px] shadow-sm border border-gray-100">
              <div className="p-4 lg:p-6">
                <h2 className="text-[#212121] font-poppins text-[18px] lg:text-[20px] font-semibold mb-4 lg:mb-6">
                  Portfolio Documents
                </h2>

                {/* Document List */}
                <div className="space-y-4">
                  {userData?.brochureUrl && Array.isArray(userData.brochureUrl) && userData.brochureUrl.length > 0 ? (
                    userData.brochureUrl.map((brochureUrl, index) => {
                      // Extract filename from URL
                      const filename =
                        brochureUrl.split("/").pop()?.split("?")[0] ||
                        `document-${index + 1}.pdf`;
                      const displayName = decodeURIComponent(filename);

                      return (
                        <div key={index} className="flex items-center gap-4 p-3">
                          {/* PDF Icon */}
                          <svg
                            className="w-12 h-12 flex-shrink-0"
                            viewBox="0 0 48 48"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M15.584 42.5H32.416C34.2725 42.5 36.053 41.7625 37.3657 40.4497C38.6785 39.137 39.416 37.3565 39.416 35.5V24.44C39.4166 22.5837 38.68 20.8032 37.368 19.49L25.43 7.55C24.7799 6.90001 24.0082 6.38442 23.1589 6.03268C22.3096 5.68094 21.3993 5.49993 20.48 5.5H15.584C13.7275 5.5 11.947 6.2375 10.6342 7.55025C9.32148 8.86301 8.58398 10.6435 8.58398 12.5V35.5C8.58398 37.3565 9.32148 39.137 10.6342 40.4497C11.947 41.7625 13.7275 42.5 15.584 42.5Z"
                              stroke="#10B981"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M23.376 6.21997V17.54C23.376 18.6008 23.7974 19.6183 24.5476 20.3684C25.2977 21.1185 26.3151 21.54 27.376 21.54H38.7"
                              stroke="#10B981"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M14.5 33V31M14.5 31V27H16.5C17.0304 27 17.5391 27.2107 17.9142 27.5858C18.2893 27.9609 18.5 28.4696 18.5 29C18.5 29.5304 18.2893 30.0391 17.9142 30.4142C17.5391 30.7893 17.0304 31 16.5 31H14.5ZM30.5 33V30.5M30.5 30.5V27H33.5M30.5 30.5H33.5M22.5 33V27H23.5C24.2956 27 25.0587 27.3161 25.6213 27.8787C26.1839 28.4413 26.5 29.2044 26.5 30C26.5 30.7956 26.1839 31.5587 25.6213 32.1213C25.0587 32.6839 24.2956 33 23.5 33H22.5Z"
                              stroke="#10B981"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>

                          {/* Document Info */}
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <h3 className="text-[#1D2026] font-inter text-[14px] font-medium leading-[20px] tracking-[-0.14px]">
                                {displayName}
                              </h3>
                              <a
                                href={brochureUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center px-3 py-2 rounded-lg bg-[#10B981] border border-[#10B981] min-w-[101px] h-8 hover:bg-[#0ea574] transition-colors"
                              >
                                <span className="text-white font-poppins text-[12px] font-medium">
                                  Download
                                </span>
                              </a>
                            </div>
                            <p className="text-[#6E7485] font-inter text-[14px] leading-[22px] tracking-[-0.14px]">
                              PDF Document
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : userData?.brochureUrl && typeof userData.brochureUrl === 'string' ? (
                    // Handle single brochureUrl as string
                    <div className="flex items-center gap-4 p-3">
                      {/* PDF Icon */}
                      <svg
                        className="w-12 h-12 flex-shrink-0"
                        viewBox="0 0 48 48"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M15.584 42.5H32.416C34.2725 42.5 36.053 41.7625 37.3657 40.4497C38.6785 39.137 39.416 37.3565 39.416 35.5V24.44C39.4166 22.5837 38.68 20.8032 37.368 19.49L25.43 7.55C24.7799 6.90001 24.0082 6.38442 23.1589 6.03268C22.3096 5.68094 21.3993 5.49993 20.48 5.5H15.584C13.7275 5.5 11.947 6.2375 10.6342 7.55025C9.32148 8.86301 8.58398 10.6435 8.58398 12.5V35.5C8.58398 37.3565 9.32148 39.137 10.6342 40.4497C11.947 41.7625 13.7275 42.5 15.584 42.5Z"
                          stroke="#10B981"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M23.376 6.21997V17.54C23.376 18.6008 23.7974 19.6183 24.5476 20.3684C25.2977 21.1185 26.3151 21.54 27.376 21.54H38.7"
                          stroke="#10B981"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M14.5 33V31M14.5 31V27H16.5C17.0304 27 17.5391 27.2107 17.9142 27.5858C18.2893 27.9609 18.5 28.4696 18.5 29C18.5 29.5304 18.2893 30.0391 17.9142 30.4142C17.5391 30.7893 17.0304 31 16.5 31H14.5ZM30.5 33V30.5M30.5 30.5V27H33.5M30.5 30.5H33.5M22.5 33V27H23.5C24.2956 27 25.0587 27.3161 25.6213 27.8787C26.1839 28.4413 26.5 29.2044 26.5 30C26.5 30.7956 26.1839 31.5587 25.6213 32.1213C25.0587 32.6839 24.2956 33 23.5 33H22.5Z"
                          stroke="#10B981"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>

                      {/* Document Info */}
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <h3 className="text-[#1D2026] font-inter text-[14px] font-medium leading-[20px] tracking-[-0.14px]">
                            {userData.brochureUrl.split("/").pop()?.split("?")[0] || "Company Brochure"}
                          </h3>
                          <a
                            href={userData.brochureUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center px-3 py-2 rounded-lg bg-[#10B981] border border-[#10B981] min-w-[101px] h-8 hover:bg-[#0ea574] transition-colors"
                          >
                            <span className="text-white font-poppins text-[12px] font-medium">
                              Download
                            </span>
                          </a>
                        </div>
                        <p className="text-[#6E7485] font-inter text-[14px] leading-[22px] tracking-[-0.14px]">
                          PDF Document
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <p>No portfolio documents available.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Post Creation Modal */}
      <PostCreationModal
        isOpen={isPostModalOpen}
        onClose={closePostModal}
        mode={postModalMode}
        postedByType="exhibitor"
      />
    </div>
  );
}
