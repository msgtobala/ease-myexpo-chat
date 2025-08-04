import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import LeftSidebar from "../components/LeftSidebar";
import CommunityDiscussions from "../components/CommunityDiscussions";
import MobileMenu from "../components/MobileMenu";
import PostCreationModal from "../components/PostCreationModal";
import PostsList from "../components/PostsList";
import TopExhibitions from "../components/TopExhibitions";
import { useAuth } from "../contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useToast } from "../hooks/use-toast";

export default function Discussions() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postModalMode, setPostModalMode] = useState<
    "photo" | "video" | "both"
  >("both");
  const [userData, setUserData] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, [user]);

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

  const handleFollowClick = () => {
    toast({
      title: "Coming Soon",
      description: "This feature will be available soon!",
      duration: 3000,
    });
  };

  return (
    <div className="h-screen bg-[#F6F6F6] overflow-hidden">
      {/* Header */}
      <Header onMenuToggle={toggleMobileMenu} />

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        activeItem="discussions"
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
          <LeftSidebar activeItem="discussions" onItemClick={() => {}} />

          {/* Community Discussions */}
          <CommunityDiscussions />
        </div>

        {/* Main Content Area */}
        <div
          className="flex-[2] space-y-4 lg:space-y-6 overflow-y-auto lg:pr-2 pb-8 lg:pb-16"
          style={{ scrollBehavior: "smooth" }}
        >
          {/* Write New Post */}
          <div className="w-full h-[155px] bg-white rounded-[16px] shadow-sm border border-gray-100">
            {/* Top Section */}
            <div className="relative h-[98px] p-2 sm:p-4 lg:p-6">
              <div className="flex items-center gap-3 lg:gap-4">
                {userData?.profilePictureUrl ||
                  userData?.companyLogoUrl ||
                  user?.photoURL ? (
                  <img
                    src={
                      userData?.profilePictureUrl ||
                      userData?.companyLogoUrl ||
                      user?.photoURL
                    }
                    alt="Profile"
                    className="w-10 h-10 rounded-[18px] object-cover"
                  />
                ) : (
                  <div className="w-11 h-11 bg-gray-200 rounded-full"></div>
                )}
                <input
                  type="text"
                  placeholder={`What's on your mind, ${userData?.name || "there"}?`}
                  className="flex-1 text-[#666666] font-roboto text-[14px] lg:text-[16px] bg-transparent outline-none placeholder-[#666666] cursor-pointer"
                  onFocus={() => openPostModal("both")}
                  readOnly
                />
                <svg
                  className="w-[22px] h-[24px] ml-auto"
                  viewBox="0 0 23 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19.5042 19.2089C19.8364 19.2089 20.1058 19.498 20.1058 19.8545C20.1058 20.1813 19.8795 20.4514 19.5858 20.4941L19.5042 20.5H13.2283C12.8961 20.5 12.6268 20.211 12.6268 19.8545C12.6268 19.5277 12.8531 19.2576 13.1467 19.2148L13.2283 19.2089H19.5042ZM13.4002 4.41662C14.5391 3.19446 16.3864 3.19446 17.5253 4.41662L18.7076 5.6854C19.8465 6.90755 19.8465 8.88985 18.7076 10.112L9.82074 19.6486C9.31258 20.1939 8.62361 20.4999 7.90448 20.4999H4.265C3.92691 20.4999 3.65522 20.201 3.66364 19.8383L3.75519 15.8975C3.77339 15.1526 4.0574 14.4425 4.54829 13.9157L13.4002 4.41662ZM12.7122 6.979L5.39901 14.8287C5.12614 15.1215 4.968 15.5169 4.95789 15.9305L4.88151 19.2084L7.90448 19.2088C8.26019 19.2088 8.60227 19.0745 8.87226 18.8317L8.97002 18.7357L16.3195 10.849L12.7122 6.979ZM16.6745 5.32953C16.0055 4.61156 14.92 4.61156 14.251 5.32953L13.5635 6.066L17.1699 9.936L17.8569 9.19909C18.4888 8.52101 18.5239 7.44433 17.9622 6.72195L17.8569 6.59831L16.6745 5.32953Z"
                    fill="#666666"
                  />
                </svg>
              </div>
            </div>

            {/* Bottom Section - Green */}
            <div className="bg-[#10B981] h-[57px] rounded-b-[16px] flex items-center justify-between px-2 sm:px-4 lg:px-6">
              {/* Icons */}
              <div className="flex items-center gap-1 sm:gap-4 lg:gap-8 overflow-x-auto">
                {/* Photo */}
                <button
                  onClick={() => openPostModal("photo")}
                  className="flex items-center gap-1 sm:gap-2 hover:bg-white/10 px-1 sm:px-2 py-1 rounded-lg transition-colors whitespace-nowrap"
                >
                  <svg
                    className="w-[18px] h-[20px] sm:w-[22px] sm:h-[24px] flex-shrink-0"
                    viewBox="0 0 22 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14.9156 2C18.0243 2 20.0961 4.42887 20.0961 7.91408V16.0849C20.0961 19.5703 18.0242 22 14.9156 22H6.9983C3.89111 22 1.8269 19.5722 1.8269 16.0849V7.91408C1.8269 4.43059 3.89714 2 6.9983 2H14.9156ZM14.9156 3.50383H6.9983C4.67751 3.50383 3.19984 5.2387 3.19984 7.91408V16.0849C3.19984 18.7647 4.67206 20.4962 6.9983 20.4962H14.9156C17.2442 20.4962 18.7232 18.7618 18.7232 16.0849V7.91408C18.7232 5.23744 17.2444 3.50383 14.9156 3.50383ZM15.5662 12.1835L15.6852 12.3086L17.5854 14.4561C17.8492 14.7543 17.8424 15.2303 17.5702 15.5193C17.3227 15.7821 16.941 15.7998 16.6754 15.5768L16.5995 15.5027L14.6994 13.3553C14.3684 12.9814 13.8303 12.9779 13.4943 13.3269L13.4206 13.4137L11.3807 16.1312C10.6592 17.0939 9.36094 17.1971 8.52097 16.3903L8.40937 16.2747L7.59529 15.3648C7.38145 15.1217 7.04043 15.0987 6.80295 15.2949L6.72794 15.3684L5.32846 16.9855C5.06764 17.2869 4.63314 17.2996 4.35799 17.0139C4.10785 16.7542 4.07551 16.3373 4.26766 16.0372L4.33205 15.9509L5.73123 14.3341C6.46783 13.4819 7.68084 13.4365 8.4655 14.1967L8.57988 14.3167L9.38985 15.222C9.62662 15.4865 10.0061 15.4933 10.2508 15.2553L10.3199 15.1766L12.3599 12.4589C13.1704 11.3782 14.6299 11.2689 15.5662 12.1835ZM7.83076 6.64124C9.09589 6.64124 10.1227 7.76589 10.1227 9.15164C10.1227 10.5374 9.09589 11.662 7.83076 11.662C6.56569 11.662 5.53979 10.5374 5.53979 9.15164C5.53979 7.76583 6.56569 6.64124 7.83076 6.64124ZM7.83076 8.14507C7.32418 8.14507 6.91272 8.59611 6.91272 9.15164C6.91272 9.70716 7.32418 10.1582 7.83076 10.1582C8.33764 10.1582 8.74972 9.70684 8.74972 9.15164C8.74972 8.59643 8.33764 8.14507 7.83076 8.14507Z"
                      fill="white"
                    />
                  </svg>
                  <span className="text-white font-poppins text-[14px] sm:text-[16px]">
                    Photo
                  </span>
                </button>

                {/* Video */}
                <button
                  onClick={() => openPostModal("video")}
                  className="flex items-center gap-1 sm:gap-2 hover:bg-white/10 px-1 sm:px-2 py-1 rounded-lg transition-colors whitespace-nowrap"
                >
                  <svg
                    className="w-[18px] h-[20px] sm:w-[22px] sm:h-[24px] flex-shrink-0"
                    viewBox="0 0 22 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.4851 4.4998C13.6977 4.4998 15.2381 6.03378 15.4021 8.28414L17.8203 7.20189C18.8665 6.73453 20.0081 7.52861 20.0912 8.73529L20.096 8.8763V15.5153C20.096 16.7525 18.9932 17.6087 17.941 17.2369L17.8199 17.1886L15.4021 16.1062C15.2377 18.3551 13.6942 19.8908 11.4851 19.8908H5.75863C3.4155 19.8908 1.82709 18.1717 1.82709 15.7028V8.6878C1.82709 6.21889 3.4155 4.4998 5.75863 4.4998H11.4851ZM11.4851 5.9998H5.75863C4.16875 5.9998 3.19728 7.05119 3.19728 8.6878V15.7028C3.19728 17.3394 4.16875 18.3908 5.75863 18.3908H11.4851C13.0711 18.3908 14.0465 17.3367 14.0465 15.7028L14.0463 15.0172C14.046 15.0066 14.0459 14.9959 14.0461 14.9852L14.0465 8.6878C14.0465 7.05158 13.0744 5.9998 11.4851 5.9998ZM18.4003 8.57139L18.3383 8.59055L15.4167 9.8968V14.4928L18.338 15.7999C18.5028 15.8735 18.6811 15.7642 18.7187 15.5854L18.7259 15.5153V8.8763C18.7259 8.68151 18.5657 8.54201 18.4003 8.57139Z"
                      fill="white"
                    />
                  </svg>
                  <span className="text-white font-poppins text-[14px] sm:text-[16px]">
                    Video
                  </span>
                </button>

                {/* Event */}
                <div className="flex items-center gap-1 sm:gap-2 whitespace-nowrap">
                  <svg
                    className="w-[18px] h-[20px] sm:w-[22px] sm:h-[24px] flex-shrink-0"
                    viewBox="0 0 22 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14.3711 2C14.6913 2 14.9559 2.26247 14.9977 2.603L15.0035 2.69767L15.0036 3.48626C17.6006 3.68121 19.1909 5.51888 19.1826 8.48579V16.9744C19.1826 20.1193 17.3971 22 14.5273 22H7.39559C4.52922 22 2.74036 20.0872 2.74036 16.9041V8.48579C2.74036 5.51995 4.33573 3.68177 6.92715 3.48635L6.92723 2.69767C6.92723 2.31236 7.21036 2 7.55963 2C7.87978 2 8.14437 2.26247 8.18625 2.603L8.19202 2.69767L8.19189 3.469H13.7384L13.7387 2.69767C13.7387 2.31236 14.0218 2 14.3711 2ZM17.9175 10.283H4.00459L4.00514 16.9041C4.00514 19.2292 5.142 20.5198 7.18797 20.6006L7.39559 20.6047H14.5273C16.7114 20.6047 17.9178 19.3338 17.9178 16.9744L17.9175 10.283ZM14.7148 16.136C15.0641 16.136 15.3472 16.4484 15.3472 16.8337C15.3472 17.1869 15.1093 17.4788 14.8006 17.525L14.7148 17.5314C14.3577 17.5314 14.0746 17.219 14.0746 16.8337C14.0746 16.4805 14.3125 16.1886 14.6212 16.1424L14.7148 16.136ZM10.9732 16.136C11.3224 16.136 11.6056 16.4484 11.6056 16.8337C11.6056 17.1869 11.3677 17.4788 11.059 17.525L10.9732 17.5314C10.6161 17.5314 10.333 17.219 10.333 16.8337C10.333 16.4805 10.5709 16.1886 10.8796 16.1424L10.9732 16.136ZM7.22374 16.136C7.573 16.136 7.85613 16.4484 7.85613 16.8337C7.85613 17.1869 7.61822 17.4788 7.30955 17.525L7.21593 17.5314C6.86667 17.5314 6.58353 17.219 6.58353 16.8337C6.58353 16.4805 6.82144 16.1886 7.13012 16.1424L7.22374 16.136ZM14.7148 12.5206C15.0641 12.5206 15.3472 12.833 15.3472 13.2183C15.3472 13.5715 15.1093 13.8634 14.8006 13.9096L14.7148 13.916C14.3577 13.916 14.0746 13.6036 14.0746 13.2183C14.0746 12.8651 14.3125 12.5732 14.6212 12.527L14.7148 12.5206ZM10.9732 12.5206C11.3224 12.5206 11.6056 12.833 11.6056 13.2183C11.6056 13.5715 11.3677 13.8634 11.059 13.9096L10.9732 13.916C10.6161 13.916 10.333 13.6036 10.333 13.2183C10.333 12.8651 10.5709 12.5732 10.8796 12.527L10.9732 12.5206ZM7.22374 12.5206C7.573 12.5206 7.85613 12.833 7.85613 13.2183C7.85613 13.5715 7.61822 13.8634 7.30955 13.9096L7.21593 13.916C6.86667 13.916 6.58353 13.6036 6.58353 13.2183C6.58353 12.8651 6.82144 16.1886 7.13012 16.1424L7.22374 16.136ZM14.7148 12.5206C15.0641 12.5206 15.3472 12.833 15.3472 13.2183C15.3472 13.5715 15.1093 13.8634 14.8006 13.9096L14.7148 13.916C14.3577 13.916 14.0746 13.6036 14.0746 13.2183C14.0746 12.8651 14.3125 12.5732 14.6212 12.527L14.7148 12.5206ZM10.9732 12.5206C11.3224 12.5206 11.6056 12.833 11.6056 13.2183C11.6056 13.5715 11.3677 13.8634 11.059 13.9096L10.9732 13.916C10.6161 13.916 10.333 13.6036 10.333 13.2183C10.333 12.8651 10.5709 12.5732 10.8796 12.527L10.9732 12.5206ZM7.22374 12.5206C7.573 12.5206 7.85613 12.833 7.85613 13.2183C7.85613 13.5715 7.61822 13.8634 7.30955 13.9096L7.21593 13.916C6.86667 13.916 6.58353 13.6036 6.58353 13.2183C6.58353 12.8651 6.82144 16.1886 7.13012 16.1424L7.22374 16.136Z"
                      fill="white"
                    />
                  </svg>
                  <span className="text-white font-poppins text-[14px] sm:text-[16px]">
                    Event
                  </span>
                </div>

                {/* Article */}
                <div className="flex items-center gap-1 sm:gap-2 whitespace-nowrap">
                  <svg
                    className="w-[18px] h-[20px] sm:w-[22px] sm:h-[24px] flex-shrink-0"
                    viewBox="0 0 22 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14.49 2C17.4094 2 19.155 3.92 19.1824 7.132V16.791C19.1824 20.048 17.4322 22 14.49 22H7.43348C7.05713 22 6.69997 21.968 6.36381 21.905L6.16468 21.864C3.99886 21.371 2.74011 19.555 2.74011 16.791V7.209C2.74011 6.875 2.75838 6.555 2.79492 6.249C3.11372 3.564 4.79905 2 7.43348 2H14.49ZM14.4817 3.457H7.43348C5.19002 3.457 4.05276 4.72 4.05276 7.209V16.791C4.05276 19.28 5.19002 20.543 7.43348 20.543H14.4817C16.7243 20.543 17.8542 19.28 17.8542 16.791V7.209C17.8542 4.72 16.7243 3.457 14.4817 3.457ZM14.2433 15.51C14.6032 15.51 14.8946 15.834 14.8946 16.234C14.8946 16.634 14.6032 16.958 14.2433 16.958H7.65636C7.29646 16.958 7.00415 16.634 7.00415 16.234C7.00415 15.834 7.29646 15.51 7.65636 15.51H14.2433ZM14.2433 11.271C14.4945 11.241 14.7403 11.373 14.8745 11.61C15.0088 11.849 15.0088 12.151 14.8745 12.39C14.7403 12.627 14.4945 12.759 14.2433 12.729H7.65636C7.32203 12.687 7.06901 12.374 7.06901 12C7.06901 11.626 7.32203 11.312 7.65636 11.271H14.2433ZM10.1702 7.042C10.5045 7.083 10.7576 7.397 10.7576 7.771C10.7576 8.144 10.5045 8.458 10.1702 8.499H7.66458C7.32934 8.458 7.07631 8.144 7.07631 7.771C7.07631 7.397 7.32934 7.083 7.66458 7.042H10.1702Z"
                      fill="white"
                    />
                  </svg>
                  <span className="text-white font-poppins text-[14px] sm:text-[16px]">
                    Article
                  </span>
                </div>
              </div>

              {/* Send Icon */}
              <svg
                className="w-[20px] h-[20px] sm:w-[24px] sm:h-[24px] flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10.8049 14.8178L14.4619 20.7508C14.6219 21.0108 14.8719 21.0078 14.9729 20.9938C15.0739 20.9798 15.3169 20.9178 15.4049 20.6228L19.9779 5.17779C20.0579 4.90479 19.9109 4.71879 19.8449 4.65279C19.7809 4.58679 19.5979 4.44579 19.3329 4.52079L3.87688 9.04679C3.58388 9.13279 3.51988 9.37879 3.50588 9.47979C3.49188 9.58279 3.48788 9.83779 3.74688 10.0008L9.74788 13.7538L15.0499 8.39579C15.3409 8.10179 15.8159 8.09879 16.1109 8.38979C16.4059 8.68079 16.4079 9.15679 16.1169 9.45079L10.8049 14.8178ZM14.8949 22.4998C14.1989 22.4998 13.5609 22.1458 13.1849 21.5378L9.30788 15.2468L2.95188 11.2718C2.26688 10.8428 1.90888 10.0788 2.01988 9.27579C2.12988 8.47279 2.68088 7.83479 3.45488 7.60779L18.9109 3.08179C19.6219 2.87379 20.3839 3.07079 20.9079 3.59279C21.4319 4.11979 21.6269 4.88979 21.4149 5.60379L16.8419 21.0478C16.6129 21.8248 15.9729 22.3738 15.1719 22.4808C15.0779 22.4928 14.9869 22.4998 14.8949 22.4998Z"
                  fill="white"
                />
              </svg>
            </div>
          </div>

          {/* Social Media Posts */}
          <div className="space-y-6">
            <PostsList />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:block flex-1 space-y-6">
          {/* Top Exhibitions */}
          <TopExhibitions />
          {/* People you may know */}
          <div className="w-full h-[306px] bg-[#FCFDFD] rounded-[16px] p-6">
            <div className="text-[#212121] font-poppins text-[16px] font-medium mb-6">
              People you may know
            </div>

            <div className="space-y-4">
              {/* Person 1 */}
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop"
                  alt="John Anderson"
                  className="w-[37px] h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="text-[#212121] font-bricolage text-[16px] font-medium">
                    John Anderson
                  </div>
                  <div className="text-[#212121] font-roboto text-[11px] font-light">
                    Tech Entrepreneur
                  </div>
                </div>
                <button onClick={handleFollowClick}
                  className="border border-[#10B981] bg-white text-[#10B981] px-4 py-2 rounded-lg text-[12px] font-medium">
                  Follow
                </button>
              </div>

              {/* Person 2 */}
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop"
                  alt="Sarah Mitchell"
                  className="w-[37px] h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="text-[#212121] font-roboto text-[16px] font-medium">
                    Sarah Mitchell
                  </div>
                  <div className="text-[#212121] font-roboto text-[11px] font-light">
                    Event Director
                  </div>
                </div>
                <button onClick={handleFollowClick}
                  className="border border-[#10B981] bg-white text-[#10B981] px-4 py-2 rounded-lg text-[12px] font-medium">
                  Follow
                </button>
              </div>

              {/* Person 3 */}
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop"
                  alt="Michael Chen"
                  className="w-[37px] h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="text-[#212121] font-roboto text-[16px] font-medium">
                    Michael Chen
                  </div>
                  <div className="text-[#212121] font-roboto text-[11px] font-light">
                    Exhibition Designer
                  </div>
                </div>
                <button onClick={handleFollowClick}
                  className="border border-[#10B981] bg-white text-[#10B981] px-4 py-2 rounded-lg text-[12px] font-medium">
                  Follow
                </button>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#DFDFDF]">
              <div className="text-center">
                <button className="text-[#10B981] font-roboto text-[12px] font-medium">
                  See All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post Creation Modal */}
      <PostCreationModal
        isOpen={isPostModalOpen}
        onClose={closePostModal}
        mode={postModalMode}
      />
    </div>
  );
}
