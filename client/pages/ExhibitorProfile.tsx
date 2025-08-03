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
  postComments: Record<string, any>;
}

export default function ExhibitorProfile() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
            return { postId: postDoc.id, ...postDoc.data() } as Post;
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
          return { postId: postDoc.id, ...postDoc.data() } as Post;
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
        className="flex flex-col lg:flex-row gap-4 lg:gap-6 p-4 lg:p-6 max-w-[1483px] mx-auto"
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
          />

          {/* Write New Post - Only show if user owns this profile */}
          {isOwnProfile && (
            <div className="w-full bg-white rounded-[16px] shadow-sm border border-gray-100">
              {/* Top Section */}
              <div className="relative h-[98px] p-4 lg:p-6">
                <div className="flex items-center gap-3 lg:gap-4">
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
              <div className="bg-[#10B981] h-[57px] rounded-b-[16px] flex items-center justify-between px-4 lg:px-6">
                {/* Icons */}
                <div className="flex items-center gap-4 lg:gap-16">
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
          {loadingPosts ? (
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
          ) : userPosts.length > 0 ? (
            userPosts.map((post) => (
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

                  {/* Post Asset */}
                  {post.postAssetUrl && (
                    <>
                      {post.postType === "image" && (
                        <img
                          src={post.postAssetUrl}
                          alt="Post content"
                          className="w-full h-[307px] rounded-[18px] object-cover mb-4"
                        />
                      )}
                      {post.postType === "video" && (
                        <video
                          src={post.postAssetUrl}
                          controls
                          className="w-full h-[307px] rounded-[18px] object-cover mb-4"
                        />
                      )}
                    </>
                  )}

                  {/* Post Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-8">
                      {/* Like with counter */}
                      <div className="flex items-center gap-2 relative">
                        <div className="relative">
                          <svg
                            className="w-[22px] h-[21px]"
                            viewBox="0 0 22 22"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M20.504 10.4698V17.9846H17.171L17.0027 18.0035C13.9084 18.6923 11.858 19.189 10.8361 19.4966C9.47867 19.9051 8.97267 20.0048 8.05197 20.0636C7.36337 20.1088 6.58127 19.8557 6.22487 19.5092C6.02797 19.3181 5.88057 18.9254 5.82227 18.3164C5.81019 18.1887 5.76236 18.0665 5.68379 17.9625C5.60522 17.8585 5.4988 17.7765 5.37567 17.7253C5.10177 17.6119 4.87407 17.4271 4.68377 17.1583C4.50777 16.9126 4.39337 16.4548 4.37247 15.7922C4.36879 15.6704 4.33262 15.5515 4.26736 15.4468C4.20211 15.3421 4.10993 15.255 3.99957 15.1937C3.35937 14.8399 3.04257 14.4409 2.97657 13.9726C2.90397 13.4549 3.07997 12.8722 3.54087 12.2086C3.64901 12.0529 3.68928 11.8632 3.65313 11.6796C3.61698 11.4961 3.50724 11.3333 3.34727 11.2258C2.90617 10.9297 2.66417 10.5181 2.60367 9.93427C2.50687 9.00397 3.12837 8.31622 4.53527 8.17867C5.78831 8.06037 7.05345 8.16107 8.26867 8.47582C8.40652 8.51021 8.55179 8.5063 8.68739 8.46455C8.82299 8.4228 8.94328 8.34496 9.03411 8.24017C9.12493 8.13538 9.18252 8.00801 9.20008 7.87305C9.21765 7.73808 9.19447 7.60114 9.13327 7.47832C8.58327 6.36742 8.27747 5.45077 8.20597 4.74097C8.11247 3.79912 8.34017 3.11662 8.87257 2.55382C9.27627 2.12752 9.92197 1.88392 10.164 1.93432C10.483 1.99942 10.6909 2.17582 10.9615 2.79322C11.121 3.15862 11.198 3.46942 11.33 4.19497C11.4565 4.88377 11.5258 5.19457 11.6699 5.60197C12.1044 6.83677 13.1703 8.11672 14.6014 8.99977C15.6044 9.61792 16.6914 10.1019 17.8321 10.4383C17.9033 10.4592 17.9775 10.4699 18.0521 10.4698H20.504V10.4698ZM20.5502 19.4158C20.9055 19.4252 21.2245 19.3496 21.4918 19.1711C21.8328 18.9433 21.9934 18.5842 21.9967 18.1705L21.9934 10.4813C22.0308 10.0718 21.9043 9.69592 21.6051 9.41662C21.3246 9.15412 20.9583 9.03022 20.5711 9.03862H18.1676C17.1953 8.74291 16.2684 8.32558 15.411 7.79752C14.2582 7.08562 13.409 6.06502 13.0845 5.14522C12.9734 4.82812 12.914 4.56562 12.8018 3.94822C12.65 3.11977 12.5554 2.73442 12.3376 2.23882C11.8866 1.20772 11.2948 0.703719 10.4786 0.534669"
                              fill="#000"
                            />
                          </svg>
                          {/* Like counter */}
                          {post.postLikes > 0 && (
                            <div className="absolute -bottom-3 -left-2">
                              <div className="bg-[#10B981] border-2 border-white rounded-lg px-1">
                                <span className="text-white text-[11px] font-roboto">
                                  {post.postLikes}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Comment */}
                      <div className="flex items-center gap-2">
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
                        d="M14.9857 2C18.0482 2 20 3.43503 20 6.25765V20.3309C20 20.7736 19.8285 21.1982 19.5232 21.5112C19.2179 21.8242 18.8038 22 18.3608 22C18.0965 21.9957 17.8368 21.9291 17.5863 21.7971L11.974 18.6635L6.38442 21.8037C5.7112 22.1624 4.89545 21.9969 4.38431 21.3975L4.28627 21.2719L4.19263 21.1174C4.07042 20.8782 4.00448 20.613 4 20.3309V6.43434C4 3.49929 5.90915 2 9.01434 2H14.9857ZM14.9857 3.44775H9.01434C6.61925 3.44775 5.41205 4.39579 5.41205 6.43434L5.41195 20.3189C5.41267 20.3631 5.42346 20.4065 5.41172 20.3897L5.44919 20.4519C5.51373 20.5421 5.63485 20.5715 5.71962 20.5265L11.3068 17.3883C11.7233 17.1576 12.225 17.1576 12.6435 17.3894L18.2463 20.5173C18.2887 20.5397 18.3355 20.5517 18.372 20.5523C18.4293 20.5523 18.4842 20.529 18.5247 20.4875C18.5652 20.446 18.5879 20.3897 18.5879 20.3309V6.25765C18.5879 4.35788 17.35 3.44775 14.9857 3.44775ZM15.4079 8.31663C15.7978 8.31663 16.1139 8.64072 16.1139 9.0405C16.1139 9.40697 15.8483 9.70984 15.5037 9.75777L15.4079 9.76438H8.54042C8.1505 9.76438 7.8344 9.44029 7.8344 9.0405C7.8344 8.67404 8.10001 8.37117 8.44462 8.32324L8.54042 8.31663H15.4079Z"
                        fill="#200E32"
                      />
                    </svg>
                  </div>

                  {/* Comment Section */}
                  <div className="mt-4 bg-[#F6F6F6] rounded-[18px] p-3 flex items-center gap-3">
                    <img
                      src={
                        userData?.companyLogoUrl ||
                        userData?.profilePictureUrl ||
                        "https://api.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=80"
                      }
                      alt="Profile"
                      className="w-[26px] h-[26px] rounded-full object-cover"
                    />
                    <input
                      type="text"
                      placeholder="Write a comment"
                      className="flex-1 text-black/36 font-roboto text-[11px] bg-transparent outline-none placeholder-black/36"
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="w-full bg-white rounded-[16px] shadow-sm border border-gray-100 p-6 text-center">
              <p className="text-gray-500">No posts available.</p>
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
