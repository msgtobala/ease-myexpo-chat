import React from "react";
import { useNavigate } from "react-router-dom";
import EasemyexpoLogo from "../assets/logo.webp";

export default function CreationConfirmation() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    // Navigate to login screen
    navigate("/login");
  };

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Logo */}
      <div className="absolute top-6 left-6 lg:top-[24px] lg:left-[29px]">
        <img
          src={EasemyexpoLogo}
          alt="Easemyexpo"
          className="h-[37px] w-auto"
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Success Icon */}
        <div className="mb-12">
          <svg
            width="180"
            height="180"
            viewBox="0 0 180 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M80.7808 7.96925C86.075 3.39282 93.925 3.39282 99.2192 7.96925V7.96925C102.975 11.2159 108.162 12.2477 112.874 10.6854V10.6854C119.517 8.48338 126.769 11.4874 129.909 17.7415V17.7415C132.137 22.1784 136.534 25.1165 141.486 25.4766V25.4766C148.465 25.9841 154.016 31.5348 154.523 38.5144V38.5144C154.884 43.466 157.822 47.8632 162.259 50.0908V50.0908C168.513 53.2307 171.517 60.4831 169.315 67.1256V67.1256C167.752 71.8381 168.784 77.0249 172.031 80.7808V80.7808C176.607 86.075 176.607 93.925 172.031 99.2192V99.2192C168.784 102.975 167.752 108.162 169.315 112.874V112.874C171.517 119.517 168.513 126.769 162.259 129.909V129.909C157.822 132.137 154.884 136.534 154.523 141.486V141.486C154.016 148.465 148.465 154.016 141.486 154.523V141.486C136.534 154.884 132.137 157.822 129.909 162.259V162.259C126.769 168.513 119.517 171.517 112.874 169.315V169.315C108.162 167.752 102.975 168.784 99.2192 172.031V172.031C93.925 176.607 86.075 176.607 80.7808 172.031V172.031C77.0249 168.784 71.8381 167.752 67.1256 169.315V169.315C60.4831 171.517 53.2307 168.513 50.0908 162.259V162.259C47.8632 157.822 43.466 154.884 38.5144 154.523V154.523C31.5348 154.016 25.9841 148.465 25.4766 141.486V141.486C25.1165 136.534 22.1784 132.137 17.7415 129.909V129.909C11.4874 126.769 8.48338 119.517 10.6854 112.874V112.874C12.2477 108.162 11.2159 102.975 7.96925 99.2192V99.2192C3.39282 93.925 3.39282 86.075 7.96925 80.7808V80.7808C11.2159 77.0249 12.2477 71.8381 10.6854 67.1256V67.1256C8.48338 60.4831 11.4874 53.2307 17.7415 50.0908V50.0908C22.1784 47.8632 25.1165 43.466 25.4766 38.5144V38.5144C25.9841 31.5348 31.5348 25.9841 38.5144 25.4766V38.5144C43.466 25.1165 47.8632 22.1784 50.0908 17.7415V17.7415C53.2307 11.4874 60.4831 8.48338 67.1256 10.6854V10.6854C71.8381 12.2477 77.0249 11.2159 80.7808 7.96925V7.96925Z"
              fill="#10B981"
            />
            <circle
              cx="90"
              cy="90"
              r="64.6734"
              fill="#E3FFF6"
              style={{
                filter: "drop-shadow(0px 3.618px 3.618px rgba(0, 0, 0, 0.25))",
              }}
            />
            <path
              d="M69.6483 90.4524L83.2199 104.02L110.352 76.8845"
              stroke="#10B981"
              strokeWidth="5.42714"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Text Content */}
        <div className="text-center mb-16 max-w-[662px]">
          <h1 className="text-[32px] font-normal text-[#26203B] font-poppins mb-1">
            Account created successfully!
          </h1>
          <p className="text-[24px] font-normal text-[#9C9AA5] font-poppins leading-normal">
            Welcome aboard! Let's Start your journey with Easemyexpo!
          </p>
        </div>

        {/* Let's Start Button */}
        <button
          onClick={handleGetStarted}
          className="flex items-center justify-center gap-2 w-[210px] h-[48px] px-5 py-[10px] bg-[#10B981] rounded-lg text-white font-poppins text-[16px] font-normal transition-all duration-200 hover:bg-[#0ea571]"
        >
          Let's Start!
        </button>
      </div>
    </div>
  );
}
