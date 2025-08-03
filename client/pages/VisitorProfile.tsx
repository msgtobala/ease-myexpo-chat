import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from "../contexts/AuthContext";
import {
  doc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import Header from "../components/Header";
import LeftSidebar from "../components/LeftSidebar";
import CommunityDiscussions from "../components/CommunityDiscussions";
import VisitorProfileCard from "../components/VisitorProfile";
import SocialMediaPost from "../components/SocialMediaPost";
import MobileMenu from "../components/MobileMenu";

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
  const isOwnProfile = user && userData && (user.uid === userData.userId || user.uid === userData.userId);

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

  return (
    <div className="h-screen bg-[#F6F6F6] overflow-hidden">
      {/* Header */}
      <Header onMenuToggle={toggleMobileMenu} />

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        activeItem='profile'
        onItemClick={closeMobileMenu}
      />

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 p-4 lg:p-6 max-w-[1483px] mx-auto" style={{height: 'calc(100vh - 76px)'}}>
        {/* Left Sidebar Container - Hidden on mobile, visible on desktop */}
        <div className="hidden lg:block w-[300px] space-y-6">
          {/* Navigation Menu */}
          <LeftSidebar activeItem='profile' onItemClick={() => {}} />

          {/* Community Discussions */}
          <CommunityDiscussions />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 space-y-4 lg:space-y-6 overflow-y-auto lg:pr-2 pb-8 lg:pb-16" style={{scrollBehavior: 'smooth'}}>
          {/* Visitor Profile */}
          <VisitorProfileCard userData={userData} isOwnProfile={isOwnProfile} />

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

          {/* Social Media Post - Fallback if no posts */}
          {/*{!loadingPosts && userPosts.length === 0 && (
            <SocialMediaPost />
          )}*/}
        </div>
      </div>
    </div>
  );
}
