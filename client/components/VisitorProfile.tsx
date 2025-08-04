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
  bio?: string;
  website?: string;
}

interface VisitorProfileProps {
  userData?: UserData;
  isOwnProfile?: boolean;
}

export default function VisitorProfile({
  userData,
  isOwnProfile,
}: VisitorProfileProps) {
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
      {/* Cover Image with Profile Header */}
      <div className="relative h-[120px] sm:h-[140px] lg:h-[180px] rounded-t-[16px] overflow-hidden">
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/3a993f4a9d8d4dc397a942cf16ddbe361fb7b739?width=1700"
          alt="Cover"
          className="w-full h-full object-cover"
        />

        {/* Profile Header Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent">
          <div className="flex items-center justify-between p-2 sm:p-3 lg:p-4">
            {/* Back Arrow and Title */}
            <div className="flex items-center gap-3">
              <button
                className="w-6 h-6 flex items-center justify-center"
                onClick={handleBackClick}
              >
                <svg
                  width="24"
                  height="24"
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
              <h1 className="text-white text-[16px] sm:text-[18px] lg:text-[20px] font-bold">
                {userData?.name
                  ? `${userData.name}'s Profile`
                  : "Jason's Profile"}
              </h1>
            </div>

            {/* More Options */}
            <button className="w-6 h-6 transform rotate-90">
              <svg
                width="24"
                height="24"
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
            </button>
          </div>
        </div>
      </div>

      {/* Profile Picture */}
      <div className="absolute left-2 sm:left-3 lg:left-[18px] top-[100px] sm:top-[120px] lg:top-[157px] w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] lg:w-[169px] lg:h-[165px] rounded-full border-[3px] lg:border-[5px] border-white overflow-hidden bg-white">
        <img
          src={
            userData?.profilePictureUrl ||
            userData?.companyLogoUrl ||
            "https://api.builder.io/api/v1/image/assets/TEMP/420294678ac6505d9c5a5d63c2e787c16492d634?width=90"
          }
          alt={userData?.name || "Jason Roy"}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Profile Content */}
      <div className="pt-16 sm:pt-20 lg:pt-16 px-2 sm:px-4 lg:px-6 pb-3 sm:pb-4 lg:pb-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between">
          {/* Profile Info Section */}
          <div className="flex flex-col lg:flex-row lg:items-start gap-3 sm:gap-4 lg:gap-6 flex-1">
            {/* Space for profile picture */}
            <div className="w-[100px] sm:w-[120px] lg:w-[169px] flex-shrink-0"></div>

            {/* Profile Details */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                <h2 className="text-[14px] sm:text-[16px] lg:text-[18px] font-semibold text-[#10B981]">
                  {userData?.name || "Jason Roy"}
                </h2>
                {/* Top Commentor Badge */}
                <div className="bg-[rgba(16,185,129,0.25)] rounded-lg px-1.5 sm:px-2 py-1 flex items-center gap-1 flex-shrink-0">
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 13 13"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="sm:w-[10px] sm:h-[10px] lg:w-3 lg:h-3"
                  >
                    <path
                      d="M2.88861 9.62231C2.89976 9.66935 2.92032 9.71364 2.94904 9.75253C2.97776 9.79141 3.01405 9.82409 3.05572 9.84858C3.09739 9.87308 3.14359 9.88889 3.19154 9.89506C3.23948 9.90124 3.28818 9.89765 3.3347 9.88452C5.46772 9.29558 7.72043 9.29536 9.85356 9.8839C9.90007 9.89702 9.94875 9.9006 9.99668 9.89443C10.0446 9.88825 10.0908 9.87245 10.1324 9.84797C10.1741 9.82348 10.2104 9.79083 10.2391 9.75197C10.2678 9.7131 10.2884 9.66884 10.2996 9.62182L11.4396 4.77707C11.4549 4.71221 11.4517 4.64438 11.4305 4.58122C11.4093 4.51806 11.3709 4.46207 11.3196 4.41956C11.2683 4.37705 11.2061 4.34972 11.1401 4.34063C11.0741 4.33154 11.0069 4.34107 10.946 4.36813L8.68349 5.37368C8.60179 5.40999 8.50946 5.4144 8.42467 5.38604C8.33989 5.35769 8.26879 5.29862 8.22537 5.22047L6.90804 2.84927C6.87705 2.79349 6.8317 2.74701 6.7767 2.71465C6.72171 2.68229 6.65906 2.66522 6.59524 2.66522C6.53143 2.66522 6.46878 2.68229 6.41378 2.71465C6.35879 2.74701 6.31344 2.79349 6.28245 2.84927L4.96512 5.22047C4.9217 5.29862 4.8506 5.35769 4.76582 5.38604C4.68103 5.4144 4.5887 5.40999 4.507 5.37368L2.24417 4.36798C2.1833 4.34092 2.11608 4.3314 2.05008 4.34047C1.98409 4.34955 1.92194 4.37687 1.87063 4.41936C1.81932 4.46185 1.78089 4.51782 1.75967 4.58096C1.73845 4.64411 1.73528 4.71192 1.75051 4.77677L2.88861 9.62231Z"
                      stroke="#10B981"
                      strokeWidth="0.858769"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5.164 8.08647C6.11556 7.98635 7.075 7.98635 8.02657 8.08647"
                      stroke="#10B981"
                      strokeWidth="0.858769"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-[6px] sm:text-[7px] lg:text-[8px] font-semibold text-[#10B981] whitespace-nowrap">
                    Top Commentor
                  </span>
                </div>
              </div>

              <p className="text-[12px] sm:text-[13px] lg:text-[14px] text-[#212121] leading-[18px] sm:leading-[20px] lg:leading-[21px] mb-2">
                {userData?.description ||
                  userData?.bio ||
                  "CEO@American Tourister | Expo BLR Official Member"}
              </p>

              {/* Stats */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                {/* Rating */}
                <div className="flex items-center gap-1">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px]"
                  >
                    <path
                      d="M8.04767 11.5923L11.113 13.5344C11.5049 13.7827 11.9913 13.4134 11.8751 12.9561L10.9894 9.47213C10.9645 9.37509 10.9674 9.27299 10.9979 9.17756C11.0284 9.08212 11.0853 8.99724 11.1619 8.93267L13.9107 6.64478C14.2719 6.34416 14.0855 5.74474 13.6214 5.71462L10.0316 5.48165C9.93495 5.47474 9.84221 5.4405 9.76422 5.38293C9.68623 5.32536 9.6262 5.24682 9.59113 5.15645L8.25229 1.78492C8.2159 1.689 8.15119 1.60643 8.06676 1.54816C7.98232 1.48989 7.88216 1.45868 7.77957 1.45868C7.67698 1.45868 7.57682 1.48989 7.49239 1.54816C7.40796 1.60643 7.34325 1.689 7.30685 1.78492L5.96802 5.15645C5.93294 5.24682 5.87291 5.32536 5.79492 5.38293C5.71694 5.4405 5.6242 5.47474 5.52751 5.48165L1.93773 5.71462C1.47369 5.74474 1.28727 6.34416 1.64845 6.64478L4.39727 8.93267C4.47387 8.99724 4.5307 9.08212 4.5612 9.17756C4.59171 9.27299 4.59467 9.37509 4.56973 9.47213L3.74839 12.7031C3.60886 13.2519 4.19264 13.695 4.66284 13.3971L7.51148 11.5923C7.5916 11.5413 7.6846 11.5142 7.77957 11.5142C7.87455 11.5142 7.96755 11.5413 8.04767 11.5923Z"
                      fill="#10B981"
                    />
                  </svg>
                  <span className="text-[10px] sm:text-[11px] lg:text-[12px] font-medium text-[#1D2026]">
                    4.8
                  </span>
                  <span className="text-[9px] sm:text-[10px] lg:text-[11px] text-[#6E7485]">
                    (134,633 Comments)
                  </span>
                </div>

                {/* Users */}
                <div className="flex items-center gap-1">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px]"
                  >
                    <path
                      d="M5.79741 9.72446C7.54287 9.72446 8.95785 8.30948 8.95785 6.56401C8.95785 4.81854 7.54287 3.40356 5.79741 3.40356C4.05194 3.40356 2.63696 4.81854 2.63696 6.56401C2.63696 8.30948 4.05194 9.72446 5.79741 9.72446Z"
                      stroke="#10B981"
                      strokeWidth="0.972445"
                      strokeMiterlimit="10"
                    />
                    <path
                      d="M9.89453 3.52128C10.3292 3.39881 10.7851 3.37091 11.2315 3.43946C11.6779 3.50801 12.1044 3.67143 12.4823 3.9187C12.8602 4.16597 13.1808 4.49135 13.4223 4.87293C13.6639 5.25451 13.8209 5.68343 13.8827 6.13079C13.9446 6.57816 13.9099 7.03358 13.7809 7.46639C13.6519 7.8992 13.4316 8.29934 13.135 8.63986C12.8383 8.98039 12.4722 9.25339 12.0611 9.44048C11.6501 9.62756 11.2037 9.72439 10.7521 9.72445"
                      stroke="#10B981"
                      strokeWidth="0.972445"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M1.42102 11.9973C1.91462 11.2952 2.5699 10.7222 3.33154 10.3266C4.09318 9.93102 4.93882 9.72449 5.79707 9.72446C6.65532 9.72442 7.50098 9.93089 8.26265 10.3264C9.02432 10.722 9.67965 11.2949 10.1733 11.997"
                      stroke="#10B981"
                      strokeWidth="0.972445"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10.7521 9.72446C11.6104 9.72384 12.4562 9.93005 13.218 10.3256C13.9797 10.7212 14.6349 11.2945 15.1281 11.997"
                      stroke="#10B981"
                      strokeWidth="0.972445"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-[10px] sm:text-[11px] lg:text-[12px] font-medium text-[#1D2026]">
                    430,117
                  </span>
                  <span className="text-[9px] sm:text-[10px] lg:text-[11px] text-[#6E7485]">
                    Discussions
                  </span>
                </div>

                {/* Website */}
                <div className="flex items-center gap-1">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 17 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px]"
                  >
                    <path
                      d="M8.67783 13.615C11.9004 13.615 14.5128 11.0026 14.5128 7.78001C14.5128 4.55743 11.9004 1.94501 8.67783 1.94501C5.45525 1.94501 2.84283 4.55743 2.84283 7.78001C2.84283 11.0026 5.45525 13.615 8.67783 13.615Z"
                      stroke="#10B981"
                      strokeWidth="0.606618"
                      strokeMiterlimit="10"
                    />
                    <path
                      d="M2.84283 7.78H14.5128"
                      stroke="#10B981"
                      strokeWidth="0.606618"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8.67783 13.4584C10.0206 13.4584 11.1091 10.9161 11.1091 7.77999C11.1091 4.64391 10.0206 2.10162 8.67783 2.10162C7.33509 2.10162 6.24658 4.64391 6.24658 7.77999C6.24658 10.9161 7.33509 13.4584 8.67783 13.4584Z"
                      stroke="#10B981"
                      strokeWidth="0.606618"
                      strokeMiterlimit="10"
                    />
                  </svg>
                  <span className="text-[10px] sm:text-[11px] lg:text-[12px] font-medium text-[#1D2026]">
                    {userData?.website || "www.atourist.com"}
                  </span>
                </div>
              </div>

              {/* Social Media Icons */}
              <div className="flex items-center gap-1.5 sm:gap-2 mt-3 sm:mt-4">
                {/* Facebook */}
                <div className="bg-[rgba(16,185,129,0.25)] rounded-md p-1.5 sm:p-2">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 11 11"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6.94046 2.3947H7.87175V0.772701C7.71108 0.750598 7.15851 0.700867 6.51498 0.700867C5.17224 0.700867 4.25242 1.54545 4.25242 3.09774V4.52634H2.77069V6.33961H4.25242V10.9021H6.0691V6.34004H7.4909L7.7166 4.52677H6.06867V3.27754C6.0691 2.75345 6.21022 2.3947 6.94046 2.3947Z"
                      fill="#10B981"
                    />
                  </svg>
                </div>

                {/* Twitter */}
                <div className="bg-[rgba(16,185,129,0.25)] rounded-md p-2">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 11 11"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10.2213 2.63849C9.84198 2.8049 9.43776 2.9152 9.01632 2.96876C9.44987 2.7099 9.78078 2.30312 9.93635 1.81283C9.53212 2.05383 9.08581 2.22406 8.61018 2.31906C8.22636 1.91038 7.67932 1.65726 7.08254 1.65726C5.9247 1.65726 4.99256 2.59705 4.99256 3.74915C4.99256 3.91492 5.00659 4.07432 5.04101 4.22606C3.30234 4.14126 1.76386 3.30795 0.730343 2.03853C0.549909 2.35158 0.444071 2.7099 0.444071 3.09564C0.444071 3.81992 0.817054 4.46197 1.37302 4.83368C1.03702 4.8273 0.707391 4.72975 0.428131 4.57609C0.428131 4.58247 0.428131 4.59076 0.428131 4.59905C0.428131 5.61535 1.15306 6.4595 2.10369 6.65396C1.93345 6.70051 1.74792 6.72282 1.55537 6.72282C1.42148 6.72282 1.28631 6.71517 1.15943 6.68712C1.43041 7.51533 2.19933 8.12422 3.11361 8.14398C2.40208 8.70059 1.49863 9.03596 0.52058 9.03596C0.349071 9.03596 0.184576 9.02831 0.0200806 9.00727C0.946483 9.60468 2.04439 9.94578 3.22838 9.94578C7.0768 9.94578 9.18081 6.75789 9.18081 3.99462C9.18081 3.90217 9.17763 3.81291 9.17316 3.72429C9.58823 3.42973 9.93698 3.06184 10.2213 2.63849Z"
                      fill="#10B981"
                    />
                  </svg>
                </div>

                {/* Instagram */}
                <div className="bg-[rgba(16,185,129,0.25)] rounded-md p-2">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 12 11"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.0903 3.70007C11.0664 3.15803 10.9788 2.78539 10.8532 2.46249C10.7237 2.11974 10.5244 1.81288 10.2633 1.55778C10.0082 1.29871 9.69934 1.09741 9.36056 0.969898C9.03579 0.844334 8.6651 0.756681 8.12306 0.732783C7.57698 0.706861 7.40362 0.700867 6.01861 0.700867C4.6336 0.700867 4.46024 0.706861 3.91619 0.730759C3.37416 0.754657 3.00151 0.842388 2.67869 0.967874C2.33587 1.09741 2.029 1.29669 1.77391 1.55778C1.51484 1.81288 1.31361 2.12177 1.18602 2.46055C1.06046 2.78539 0.972807 3.15601 0.948908 3.69804C0.922986 4.24412 0.916992 4.41748 0.916992 5.80249C0.916992 7.18751 0.922986 7.36087 0.946885 7.90492C0.970783 8.44695 1.05851 8.8196 1.18408 9.1425C1.31361 9.48525 1.51484 9.79211 1.77391 10.0472C2.029 10.3063 2.33789 10.5076 2.67667 10.6351C3.00151 10.7607 3.37213 10.8483 3.91424 10.8722C4.45822 10.8962 4.63166 10.9021 6.01667 10.9021C7.40168 10.9021 7.57504 10.8962 8.11909 10.8722C8.66113 10.8483 9.03377 10.7607 9.35659 10.6351C10.0422 10.37 10.5842 9.828 10.8493 9.1425C10.9747 8.81765 11.0625 8.44695 11.0864 7.90492C11.1103 7.36087 11.1163 7.18751 11.1163 5.80249C11.1163 4.41748 11.1142 4.24412 11.0903 3.70007Z"
                      fill="#10B981"
                    />
                    <path
                      d="M6.01845 3.18195C4.57171 3.18195 3.39789 4.35569 3.39789 5.80251C3.39789 7.24933 4.57171 8.42308 6.01845 8.42308C7.46527 8.42308 8.63901 7.24933 8.63901 5.80251C8.63901 4.35569 7.46527 3.18195 6.01845 3.18195Z"
                      fill="#10B981"
                    />
                    <path
                      d="M9.35475 3.07834C9.35475 3.41618 9.08081 3.69012 8.74289 3.69012C8.40504 3.69012 8.1311 3.41618 8.1311 3.07834C8.1311 2.74041 8.40504 2.46655 8.74289 2.46655C9.08081 2.46655 9.35475 2.74041 9.35475 3.07834Z"
                      fill="#10B981"
                    />
                  </svg>
                </div>

                {/* YouTube */}
                <div className="bg-[rgba(16,185,129,0.25)] rounded-md p-2">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 11 11"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10.7696 3.3527C10.652 2.91569 10.3075 2.57122 9.87056 2.45354C9.07227 2.23508 5.8791 2.23508 5.8791 2.23508C5.8791 2.23508 2.686 2.23508 1.88771 2.44522C1.45918 2.56282 1.10623 2.91577 0.988625 3.3527C0.778564 4.15092 0.778564 5.80634 0.778564 5.80634C0.778564 5.80634 0.778564 7.47009 0.988625 8.25998C1.1063 8.69691 1.45077 9.04146 1.88779 9.15914C2.69441 9.3776 5.87917 9.3776 5.87917 9.3776C5.87917 9.3776 9.07227 9.3776 9.87056 9.16747C10.3076 9.04987 10.652 8.70532 10.7697 8.26838C10.9798 7.47009 10.9798 5.81475 10.9798 5.81475C10.9798 5.81475 10.9882 4.15092 10.7696 3.3527Z"
                      fill="#10B981"
                    />
                    <path
                      d="M4.862 7.33568L7.51731 5.80633L4.862 4.27698V7.33568Z"
                      fill="white"
                    />
                  </svg>
                </div>

                {/* WhatsApp */}
                <div className="bg-[rgba(16,185,129,0.25)] rounded-md p-2">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 11 11"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M9.14137 2.40452C8.24664 1.50874 7.05672 1.0152 5.78906 1.01468C3.17691 1.01468 1.05099 3.14053 1.04994 5.75338C1.04959 6.58863 1.26779 7.40397 1.68252 8.12265L1.01019 10.5784L3.52247 9.91934C4.2147 10.2969 4.99403 10.4959 5.78713 10.4962H5.78912C8.40097 10.4962 10.5271 8.37014 10.5281 5.75718C10.5286 4.49085 10.0362 3.30024 9.14137 2.40452Z"
                      fill="#10B981"
                    />
                  </svg>
                </div>

                {/* Calendar */}
                <div className="bg-[rgba(16,185,129,0.25)] rounded-md p-2">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 11 11"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3.34955 1.95087V2.88837M7.72455 1.95087V2.88837M1.78705 8.51337V3.82587C1.78705 3.57723 1.88582 3.33877 2.06164 3.16295C2.23745 2.98714 2.47591 2.88837 2.72455 2.88837H8.34955C8.59819 2.88837 8.83665 2.98714 9.01246 3.16295C9.18828 3.33877 9.28705 3.57723 9.28705 3.82587V8.51337M1.78705 8.51337C1.78705 8.76201 1.88582 9.00046 2.06164 9.17628C2.23745 9.35209 2.47591 9.45087 2.72455 9.45087H8.34955C8.59819 9.45087 8.83665 9.35209 9.01246 9.17628C9.18828 9.00046 9.28705 8.76201 9.28705 8.51337M1.78705 8.51337V5.38837C1.78705 5.13973 1.88582 4.90127 2.06164 4.72545C2.23745 4.54964 2.47591 4.45087 2.72455 4.45087H8.34955C8.59819 4.45087 8.83665 4.54964 9.01246 4.72545C9.18828 4.90127 9.28705 5.13973 9.28705 5.38837V8.51337"
                      stroke="#10B981"
                      strokeWidth="0.625"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Location and Send Message */}
          <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-3 lg:gap-4 mt-3 lg:mt-0">
            {/* Location */}
            <div className="flex items-center gap-1.5 lg:gap-2">
              <svg
                width="12"
                height="12"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="sm:w-[14px] sm:h-[14px] lg:w-4 lg:h-4"
              >
                <path
                  d="M2 7.33328L14.6667 1.33328L8.66667 13.9999L7.33333 8.66662L2 7.33328Z"
                  fill="#00B966"
                />
              </svg>
              <span className="text-[10px] sm:text-[11px] lg:text-[12px] text-[#212121] leading-[16px] lg:leading-[18px]">
                Bangalore, India
              </span>
            </div>

            {/* Send Message Button - Only show for other users' profiles */}
            {!isOwnProfile && (
              <button className="bg-[#10B981] text-white px-4 sm:px-6 lg:px-8 py-1.5 sm:py-2 rounded-lg lg:rounded-xl text-[10px] sm:text-[11px] lg:text-[12px] font-medium hover:bg-[#0ea574] transition-colors whitespace-nowrap">
                Send Message
              </button>
            )}

            {/* Logout Button - Only show for own profile */}
            {isOwnProfile && (
              <button
                className="bg-[#10B981] text-white px-4 sm:px-6 lg:px-8 py-1.5 sm:py-2 rounded-lg lg:rounded-xl text-[10px] sm:text-[11px] lg:text-[12px] font-medium hover:bg-[#0ea574] transition-colors whitespace-nowrap"
                onClick={handleLogout}
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
