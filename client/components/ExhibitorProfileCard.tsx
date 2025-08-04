import React from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";

interface UserData {
  name?: string;
  companyName?: string;
  description?: string;
  location?: string;
  companyLogoUrl?: string;
  profilePictureUrl?: string;
  profileType?: string;
}

interface ExhibitorProfileCardProps {
  userData?: UserData;
  isOwnProfile: boolean;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function ExhibitorProfileCard({
  userData,
  isOwnProfile,
  activeTab = "discussion",
  onTabChange,
}: ExhibitorProfileCardProps) {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate("/home");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  return (
    <div className="w-full bg-white rounded-[16px] shadow-[0_20px_60px_0_rgba(241,244,248,0.5)] relative">
      {/* Cover Image */}
      <img
        src="https://api.builder.io/api/v1/image/assets/TEMP/45e2be993d79f2ce365d5df175cd0a6fba07f8ce?width=1738"
        alt="Cover"
        className="w-full h-[120px] sm:h-[140px] lg:h-[180px] rounded-t-[16px] object-cover"
      />

      {/* Cover Header */}
      <div className="absolute top-3 sm:top-4 lg:top-5 left-2 sm:left-3 lg:left-4 flex items-center gap-2 sm:gap-3">
        <button onClick={handleBackClick}>
          <svg
            className="w-6 h-6"
            viewBox="0 0 25 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11.5813 5L4.42482 12L11.5813 19M4.42482 12H20.7825H4.42482Z"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h1 className="text-white font-poppins text-[16px] sm:text-[18px] lg:text-[20px] font-bold">
          Profile
        </h1>
      </div>

      {/* More Options */}
      <div className="absolute top-3 sm:top-4 lg:top-5 right-3 sm:right-4 lg:right-6">
        <svg
          className="w-6 h-6 transform rotate-90"
          viewBox="0 0 26 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12.0163 12C12.0163 12.5523 12.4741 13 13.0387 13C13.6033 13 14.061 12.5523 14.061 12C14.061 11.4477 13.6033 11 13.0387 11C12.4741 11 12.0163 11.4477 12.0163 12Z"
            fill="white"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12.0163 19C12.0163 19.5523 12.4741 20 13.0387 20C13.6033 20 14.061 19.5523 14.061 19C14.061 18.4477 13.6033 18 13.0387 18C12.4741 18 12.0163 18.4477 12.0163 19Z"
            fill="white"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12.0163 5C12.0163 5.55228 12.4741 6 13.0387 6C13.6033 6 14.061 5.55228 14.061 5C14.061 4.44772 13.6033 4 13.0387 4C12.4741 4 12.0163 4.44772 12.0163 5Z"
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
          userData?.companyLogoUrl ||
          userData?.profilePictureUrl ||
          "https://api.builder.io/api/v1/image/assets/TEMP/833e35d118fb7590985211bbd9a6a359efea55d2?width=348"
        }
        alt={`${userData?.companyName || userData?.name || "Easemyexpo"} Profile`}
        className="absolute left-2 sm:left-3 lg:left-4 top-[100px] sm:top-[120px] lg:top-[160px] w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] lg:w-[174px] lg:h-[161px] rounded-full border-[3px] lg:border-[5px] border-white object-cover"
      />

      {/* Content */}
      <div className="pt-[70px] sm:pt-[80px] lg:pt-[100px] px-2 sm:px-4 lg:px-6 pb-4 lg:pb-6">
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Profile Info */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 sm:gap-4">
            <div className="flex-1 lg:ml-[190px]">
              {/* Exhibitor Badge */}
              <div className="inline-flex items-center gap-1 px-[6px] sm:px-[7px] py-[4px] sm:py-[5px] rounded-[6px] sm:rounded-[7px] bg-[rgba(16,185,129,0.25)] mb-1.5 sm:mb-2">
                <div className="flex items-center justify-center w-[9px] h-[9px] sm:w-[11px] sm:h-[11px]">
                  <svg
                    className="w-[9px] h-[9px] sm:w-[11px] sm:h-[11px]"
                    viewBox="0 0 12 11"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5.43883 1.60431C5.45821 1.55702 5.49122 1.51657 5.53366 1.4881C5.5761 1.45963 5.62605 1.44443 5.67716 1.44443C5.72826 1.44443 5.77821 1.45963 5.82065 1.4881C5.86309 1.51657 5.89611 1.55702 5.91549 1.60431L6.88945 3.94685C6.90768 3.99068 6.93765 4.02863 6.97606 4.05653C7.01447 4.08443 7.05984 4.10119 7.10716 4.10497L9.63624 4.30756C9.86495 4.32589 9.95753 4.61143 9.78337 4.76039L7.85653 6.41131C7.82053 6.4421 7.79371 6.48221 7.77899 6.52724C7.76428 6.57227 7.76225 6.62049 7.77312 6.6666L8.36208 9.13472C8.37391 9.18424 8.37081 9.23615 8.35316 9.28391C8.33551 9.33166 8.3041 9.37312 8.26291 9.40303C8.22171 9.43295 8.17257 9.44999 8.1217 9.45199C8.07083 9.454 8.0205 9.44088 7.97708 9.41431L5.81145 8.09201C5.77101 8.06731 5.72455 8.05424 5.67716 8.05424C5.62977 8.05424 5.5833 8.06731 5.54287 8.09201L3.37724 9.41476C3.33382 9.44134 3.28349 9.45446 3.23262 9.45245C3.18174 9.45045 3.13261 9.43341 3.09141 9.40349C3.05021 9.37358 3.01881 9.33212 3.00116 9.28437C2.98351 9.23661 2.9804 9.1847 2.99224 9.13518L3.5812 6.6666C3.59212 6.62049 3.59011 6.57226 3.5754 6.52722C3.56068 6.48218 3.53382 6.44207 3.49778 6.41131L1.57095 4.76039C1.53215 4.72731 1.50404 4.68347 1.49017 4.6344C1.47631 4.58534 1.47732 4.53326 1.49307 4.48477C1.50883 4.43628 1.53862 4.39355 1.57867 4.36201C1.61873 4.33046 1.66724 4.31151 1.71808 4.30756L4.24716 4.10497C4.29448 4.10119 4.33984 4.08443 4.37825 4.05653C4.41667 4.02863 4.44664 3.99068 4.46487 3.94685L5.43883 1.60431Z"
                      stroke="#10B981"
                      strokeWidth="0.6875"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-[#10B981] font-poppins text-[7px] sm:text-[8px] font-bold leading-[10px] sm:leading-[11px] tracking-[-0.08px]">
                  Exhibitor
                </span>
              </div>

              {/* Company Name and Description */}
              <div className="flex flex-col gap-1.5 sm:gap-2">
                <h2 className="text-[#10B981] font-poppins text-[14px] sm:text-[16px] lg:text-[18px] font-semibold">
                  {userData?.companyName || userData?.name || "Easemyexpo"}
                </h2>
                <p className="text-[#212121] font-poppins text-[12px] sm:text-[13px] lg:text-[14px] leading-[18px] sm:leading-[20px] lg:leading-[1.5]">
                  {userData?.description ||
                    "Easemyexpo is top exhibitor from bangalore who has a well known experience in exhibitions."}
                </p>
              </div>
            </div>

            {/* Location and Action Buttons */}
            <div className="flex flex-col lg:flex-col gap-3 lg:gap-6 lg:items-end lg:min-w-fit">
              {/* Location */}
              <div className="flex items-center gap-1.5 sm:gap-2 lg:justify-end">
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4"
                  viewBox="0 0 17 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2.625 7.33328L15.5748 1.33328L9.44069 13.9999L8.07755 8.66662L2.625 7.33328Z"
                    fill="#00B966"
                  />
                </svg>
                <span className="text-[#212121] font-poppins text-[10px] sm:text-[11px] lg:text-[12px] leading-[1.5]">
                  {userData?.location || "Bangalore, India"}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button className="flex items-center justify-center px-3 sm:px-4 lg:px-[31px] py-1.5 sm:py-[6px] border border-[#10B981] rounded-[10px] lg:rounded-[12px] bg-white min-h-[28px] sm:min-h-[31px]">
                  <span className="text-[#10B981] font-poppins text-[10px] sm:text-[11px] lg:text-[12px] font-medium text-center whitespace-nowrap">
                    Request Catalogue
                  </span>
                </button>
                {!isOwnProfile && (
                  <button className="flex items-center justify-center px-3 sm:px-4 lg:px-[16px] py-1.5 sm:py-[6px] rounded-[10px] lg:rounded-[12px] bg-[#10B981] min-h-[28px] sm:min-h-[31px] min-w-[100px] sm:min-w-[125px]">
                    <span className="text-white font-poppins text-[10px] sm:text-[11px] lg:text-[12px] font-medium text-center whitespace-nowrap">
                      Send Message
                    </span>
                  </button>
                )}
                {isOwnProfile && (
                  <button
                    className="flex items-center justify-center px-3 sm:px-4 lg:px-[16px] py-1.5 sm:py-[6px] rounded-[10px] lg:rounded-[12px] bg-[#10B981] min-h-[28px] sm:min-h-[31px] min-w-[100px] sm:min-w-[125px] hover:bg-[#0ea574] transition-colors"
                    onClick={handleLogout}
                  >
                    <span className="text-white font-poppins text-[10px] sm:text-[11px] lg:text-[12px] font-medium text-center whitespace-nowrap">
                      Logout
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="overflow-x-auto">
        <div className="flex items-start justify-start px-4 lg:px-6 pt-4 min-w-max lg:min-w-0">
          <div className="relative pb-2 px-2 lg:px-0 lg:w-[151px]">
            <button
              onClick={() => onTabChange?.("discussion")}
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
              onClick={() => onTabChange?.("portfolio")}
              className="whitespace-nowrap text-left"
            >
              <span
                className={`font-poppins text-[12px] lg:text-[14px] ${
                  activeTab === "portfolio"
                    ? "text-[#10B981] font-semibold"
                    : "text-[#212121] font-medium"
                }`}
              >
                Portfolio
              </span>
            </button>
            {activeTab === "portfolio" && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#10B981]"></div>
            )}
          </div>
        </div>
      </div>
      <div className="w-full h-0 border-b border-[#F2F2F2]"></div>
    </div>
  );
}
