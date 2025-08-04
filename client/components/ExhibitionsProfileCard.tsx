import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface JoinedProfile {
  id: string;
  url: string;
}

interface Exhibition {
  exhibition_id: string;
  exhibition_name: string;
  exhibition_description: string;
  exhibition_location: string;
  brochures: string[];
  exhibition_image_url: string;
  joined_profile: Record<string, JoinedProfile>;
}

interface ExhibitionsProfileCardProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  exhibitionData?: Exhibition;
  onJoin?: () => void;
  isUserJoined?: boolean;
}

export default function ExhibitionsProfileCard({
  activeTab,
  onTabChange,
  exhibitionData,
  onJoin,
  isUserJoined = false,
}: ExhibitionsProfileCardProps) {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate("/home");
  };
  return (
    <div className="w-full bg-white rounded-[16px] shadow-[0_20px_60px_0_rgba(241,244,248,0.5)] relative">
      {/* Cover Image */}
      <img
        src="https://api.builder.io/api/v1/image/assets/TEMP/3ad6b6a4ca008eac7215dd4d8ad95fd1c30dbfb2?width=1700"
        alt="Cover"
        className="w-full h-[180px] rounded-t-[16px] object-cover"
      />

      {/* Cover Header */}
      <div className="absolute top-5 left-6 flex items-center gap-3">
        <button onClick={handleBackClick}>
          <svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11 5L4 12L11 19M4 12H20H4Z"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h1 className="text-white font-poppins text-[20px] font-bold">
          Exhibition Profile
        </h1>
      </div>

      {/* More Options */}
      <div className="absolute top-5 right-6">
        <svg
          className="w-6 h-6 transform rotate-90"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11 12C11 12.5523 11.4477 13 12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12Z"
            fill="white"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M11 19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19Z"
            fill="white"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M11 5C11 5.55228 11.4477 6 12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5Z"
            fill="white"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Profile Picture */}
      <img
        src={
          exhibitionData?.exhibition_image_url ||
          "https://api.builder.io/api/v1/image/assets/TEMP/7d4619eab365852e251410ff58cc0fb165eee94b?width=340"
        }
        alt={`${exhibitionData?.exhibition_name || "Expo SF"} Profile`}
        className="absolute left-4 lg:left-6 top-[120px] lg:top-[160px] w-[120px] h-[120px] lg:w-[170px] lg:h-[161px] rounded-full border-[3px] lg:border-[5px] border-white object-cover"
      />

      {/* Content */}
      <div className="pt-[80px] lg:pt-[100px] px-4 lg:px-6 pb-6">
        <div className="flex flex-col gap-4">
          {/* Profile Info */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1 lg:ml-[190px]">
              {/* Company Name and Description */}
              <div className="flex flex-col gap-2 mb-4">
                <h2 className="text-[#10B981] font-poppins text-[16px] lg:text-[18px] font-semibold">
                  {exhibitionData?.exhibition_name || "Expo SF"}
                </h2>
                <p className="text-[#212121] font-poppins text-[13px] lg:text-[14px] leading-[1.5]">
                  {exhibitionData?.exhibition_description ||
                    "Official expo SF group for exhibition and event enthusiast who are looking to connect and explore expos."}
                </p>
              </div>

              {/* Members and Community Icon */}
              <div className="flex items-center gap-2 mb-4">
                {/* Community Icon */}
                <div className="flex items-center">
                  <svg
                    className="w-[16px] lg:w-[18px] h-4 lg:h-5"
                    viewBox="0 0 18 21"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14.0332 13.8863C14.4168 13.6201 14.8668 13.4697 15.3311 13.4525C15.7954 13.4353 16.2549 13.552 16.6567 13.7892C17.0584 14.0263 17.3858 14.3741 17.6011 14.7925C17.8163 15.2108 17.9106 15.6825 17.8731 16.153C16.8891 16.5024 15.8439 16.6384 14.8049 16.5521C14.8017 15.6077 14.5341 14.6828 14.0332 13.8871C13.5886 13.1786 12.9753 12.5955 12.25 12.1917C11.5248 11.788 10.711 11.5766 9.88406 11.5771C9.05722 11.5767 8.24363 11.7882 7.51854 12.1919C6.79346 12.5957 6.18029 13.1788 5.73577 13.8871M14.8041 16.5513L14.8049 16.5771C14.8049 16.7646 14.7951 16.9496 14.7746 17.1321C13.2863 17.9998 11.5999 18.4549 9.88406 18.4521C8.10435 18.4521 6.43372 17.9721 4.99354 17.1321C4.97246 16.9393 4.96233 16.7454 4.9632 16.5513M4.9632 16.5513C3.92459 16.6407 2.87996 16.5052 1.89668 16.1538C1.85924 15.6834 1.95359 15.2119 2.16883 14.7937C2.38406 14.3755 2.71139 14.0278 3.11295 13.7907C3.51452 13.5536 3.97394 13.4369 4.43808 13.4539C4.90221 13.471 5.35212 13.6212 5.73577 13.8871M4.9632 16.5513C4.96614 15.6069 5.23518 14.6829 5.73577 13.8871M12.3445 6.57715C12.3445 7.24019 12.0853 7.87607 11.6238 8.34492C11.1624 8.81376 10.5366 9.07715 9.88406 9.07715C9.23151 9.07715 8.60569 8.81376 8.14427 8.34492C7.68285 7.87607 7.42363 7.24019 7.42363 6.57715C7.42363 5.91411 7.68285 5.27822 8.14427 4.80938C8.60569 4.34054 9.23151 4.07715 9.88406 4.07715C10.5366 4.07715 11.1624 4.34054 11.6238 4.80938C12.0853 5.27822 12.3445 5.91411 12.3445 6.57715ZM17.2654 9.07715C17.2654 9.32338 17.2176 9.56719 17.1249 9.79468C17.0322 10.0222 16.8962 10.2289 16.7249 10.403C16.5535 10.5771 16.3501 10.7152 16.1262 10.8094C15.9023 10.9036 15.6624 10.9521 15.42 10.9521C15.1777 10.9521 14.9377 10.9036 14.7139 10.8094C14.49 10.7152 14.2865 10.5771 14.1152 10.403C13.9438 10.2289 13.8079 10.0222 13.7152 9.79468C13.6224 9.56719 13.5747 9.32338 13.5747 9.07715C13.5747 8.57987 13.7691 8.10295 14.1152 7.75132C14.4613 7.39969 14.9306 7.20215 15.42 7.20215C15.9094 7.20215 16.3788 7.39969 16.7249 7.75132C17.0709 8.10295 17.2654 8.57987 17.2654 9.07715ZM6.19341 9.07715C6.19341 9.32338 6.14568 9.56719 6.05295 9.79468C5.96021 10.0222 5.82429 10.2289 5.65293 10.403C5.48158 10.5771 5.27815 10.7152 5.05427 10.8094C4.83038 10.9036 4.59042 10.9521 4.34809 10.9521C4.10576 10.9521 3.8658 10.9036 3.64192 10.8094C3.41803 10.7152 3.2146 10.5771 3.04325 10.403C2.8719 10.2289 2.73597 10.0222 2.64323 9.79468C2.5505 9.56719 2.50277 9.32338 2.50277 9.07715C2.50277 8.57987 2.69718 8.10295 3.04325 7.75132C3.38931 7.39969 3.85868 7.20215 4.34809 7.20215C4.8375 7.20215 5.30687 7.39969 5.65293 7.75132C5.999 8.10295 6.19341 8.57987 6.19341 9.07715Z"
                      stroke="#10B981"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                {/* Member Avatars */}
                <div className="flex items-center">
                  {exhibitionData?.joined_profile ? (
                    <div className="flex items-center relative">
                      {/* Render first 5 avatars */}
                      {Object.values(exhibitionData.joined_profile)
                        .slice(0, 5)
                        .map((profile, index) => (
                          <img
                            key={profile.id}
                            src={profile.url}
                            alt={`Member ${profile.id}`}
                            className={`w-7 h-7 lg:w-9 lg:h-9 rounded-full border-2 border-white object-cover ${
                              index > 0 ? "-ml-1.5 lg:-ml-2" : ""
                            }`}
                            style={{ zIndex: 5 - index }}
                          />
                        ))}

                      {/* Show count if more than 5 members */}
                      {Object.keys(exhibitionData.joined_profile).length >
                        5 && (
                        <div className="w-4 h-4 lg:w-5 lg:h-5 rounded-full bg-[#10B981] border-2 border-white flex items-center justify-center -ml-1.5 lg:-ml-2 relative">
                          <span className="text-white text-[6px] lg:text-[8px] font-poppins font-medium">
                            +
                            {Object.keys(exhibitionData.joined_profile).length -
                              5}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Fallback SVG for when no data is available */
                    <svg
                      className="w-[75px] h-5"
                      viewBox="0 0 76 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="10.97"
                        cy="9.95"
                        r="9.5"
                        fill="#E5E7EB"
                        stroke="white"
                        strokeWidth="0.86"
                      />
                      <circle
                        cx="22.3"
                        cy="9.95"
                        r="9.5"
                        fill="#D1D5DB"
                        stroke="white"
                        strokeWidth="0.86"
                      />
                      <circle
                        cx="32.76"
                        cy="9.95"
                        r="9.5"
                        fill="#9CA3AF"
                        stroke="white"
                        strokeWidth="0.86"
                      />
                      <text
                        x="59"
                        y="12.62"
                        fill="white"
                        fontSize="6"
                        fontFamily="Poppins"
                      >
                        +3
                      </text>
                    </svg>
                  )}
                </div>
              </div>
            </div>

            {/* Location and Action Button */}
            <div className="flex flex-row lg:flex-col items-center justify-between lg:justify-start gap-4 lg:gap-6 lg:items-end lg:min-w-fit">
              {/* Location */}
              <div className="flex items-center gap-2">
                <svg
                  className="w-3 lg:w-4 h-3 lg:h-4"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 7.33328L14.6667 1.33328L8.66667 13.9999L7.33333 8.66662L2 7.33328Z"
                    fill="#00B966"
                  />
                </svg>
                <span className="text-[#212121] font-poppins text-[12px] lg:text-[14px] leading-[1.5]">
                  {exhibitionData?.exhibition_location || "SF, USA"}
                </span>
              </div>

              {/* Join Button */}
              <div className="flex">
                <button
                  onClick={isUserJoined ? undefined : onJoin}
                  disabled={isUserJoined}
                  className={`flex items-center justify-center px-[20px] lg:px-[33px] py-[6px] lg:py-[7px] rounded-[16px] lg:rounded-[18px] min-h-[28px] lg:min-h-[31px] min-w-[80px] lg:min-w-[99px] transition-colors ${
                    isUserJoined
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#10B981] hover:bg-[#0ea574] cursor-pointer"
                  }`}
                >
                  <span className="text-white font-poppins text-[11px] lg:text-[12px] font-medium text-center">
                    {isUserJoined ? "Joined" : "Join"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="overflow-x-auto">
        <div className="flex items-start justify-start lg:justify-between px-4 lg:px-6 pt-4 min-w-max lg:min-w-0">
          <div className="relative pb-2 px-2 lg:px-0 lg:w-[151px]">
            <button
              onClick={() => onTabChange("discussion")}
              className="whitespace-nowrap text-left lg:pl-9"
            >
              <span
                className={`font-poppins text-[12px] lg:text-[14px] ${
                  activeTab === "discussion"
                    ? "text-[#10B981] font-semibold"
                    : "text-[#212121] font-medium"
                }`}
              >
                Discussion
              </span>
            </button>
            {activeTab === "discussion" && (
              <div className="absolute bottom-0 left-0 w-full lg:w-[151px] h-[2px] bg-[#10B981]"></div>
            )}
          </div>
          <div className="relative pb-2 px-2 lg:px-0">
            <button
              onClick={() => onTabChange("exhibitor-catalogue")}
              className="whitespace-nowrap text-left"
            >
              <span
                className={`font-poppins text-[12px] lg:text-[14px] ${
                  activeTab === "exhibitor-catalogue"
                    ? "text-[#10B981] font-semibold"
                    : "text-[#212121] font-medium"
                }`}
              >
                Exhibitor Catalogue
              </span>
            </button>
            {activeTab === "exhibitor-catalogue" && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#10B981]"></div>
            )}
          </div>
          <div className="relative pb-2 px-2 lg:px-0">
            <button
              onClick={() => onTabChange("members")}
              className="whitespace-nowrap text-left"
            >
              <span
                className={`font-poppins text-[12px] lg:text-[14px] ${
                  activeTab === "members"
                    ? "text-[#10B981] font-semibold"
                    : "text-[#212121] font-medium"
                }`}
              >
                Members
              </span>
            </button>
            {activeTab === "members" && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#10B981]"></div>
            )}
          </div>
          <div className="relative pb-2 px-2 lg:px-0">
            <button onClick={() => onTabChange("settings")} className="whitespace-nowrap text-left">
              <span
                className={`font-poppins text-[12px] lg:text-[14px] ${
                  activeTab === "settings"
                    ? "text-[#10B981] font-semibold"
                    : "text-[#212121] font-medium"
                }`}
              >
                Settings
              </span>
            </button>
            {activeTab === "settings" && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#10B981]"></div>
            )}
          </div>
        </div>
      </div>
      <div className="w-full h-0 border-b border-[#F2F2F2]"></div>
    </div>
  );
}
