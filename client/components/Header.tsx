import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import MSMLogo from "../assets/logo.webp";
import EasemyexpoLogo from "../assets/easemyexpo-logo.webp";

interface HeaderProps {
  onMenuToggle?: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [userData, setUserData] = useState<any>(null);

  // Fetch user data to get profile type
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

  const handleProfileClick = () => {
    if (!userData) return;

    // Navigate based on profile type and pass userData through state
    if (userData.profileType === "visitor") {
      navigate("/visitor/profile", {
        state: { userData },
      });
    } else if (userData.profileType === "exhibitor") {
      navigate("/exhibitor/profile", {
        state: { userData },
      });
    }
  };

  const handleLogoClick = () => {
    // Only navigate if we're not already on the home page
    if (location.pathname !== "/home") {
      navigate("/home");
    }
  };

  const handleChatClick = () => {
    navigate("/chats");
  };

  return (
    <header className="w-full h-[76px] bg-white border-b border-gray-200 flex items-center justify-between px-2 sm:px-4 lg:px-6">
      {/* Mobile Menu Button & Logo */}
      <div className="flex items-center">
        {/* Hamburger Menu Button - Only on mobile */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-1 sm:p-2 mr-1 sm:mr-2 rounded-lg hover:bg-gray-100"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 12H21"
              stroke="#333"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 6H21"
              stroke="#333"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 18H21"
              stroke="#333"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Logo */}
        <div
          className="flex items-center cursor-pointer hover:opacity-80"
          onClick={handleLogoClick}
        >
          <img
            src={EasemyexpoLogo}
            alt="Easemyexpo"
            className="h-[37px] w-auto"
          />
          &nbsp;&nbsp;&nbsp;
          <img
            src={MSMLogo}
            alt="MSM Logo"
            className="h-[37px] w-auto"
          />
        </div>
      </div>

      {/* Search Bar - Hidden on mobile, shows on desktop */}
      <div className="hidden lg:flex flex-1 max-w-[588px] mx-16">
        <div className="relative h-[44px] bg-[#F6F6F6] rounded-[18px] flex items-center w-full">
          <input
            type="text"
            placeholder="Search"
            className="flex-1 bg-transparent px-8 text-[14px] text-black/50 placeholder-black/50 outline-none"
          />
          <button className="w-[72px] h-[44px] bg-[#10B981] rounded-r-[18px] flex items-center justify-center">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9.78319 1.66667C14.2582 1.66667 17.8982 5.30667 17.8982 9.78167C17.8982 11.893 17.088 13.8186 15.7621 15.2637L18.371 17.8672C18.6152 18.1114 18.616 18.5064 18.3719 18.7506C18.2502 18.8739 18.0894 18.9347 17.9294 18.9347C17.7702 18.9347 17.6102 18.8739 17.4877 18.7522L14.8472 16.1192C13.4583 17.2315 11.6971 17.8975 9.78319 17.8975C5.30819 17.8975 1.66736 14.2567 1.66736 9.78167C1.66736 5.30667 5.30819 1.66667 9.78319 1.66667ZM9.78319 2.91667C5.99736 2.91667 2.91736 5.99583 2.91736 9.78167C2.91736 13.5675 5.99736 16.6475 9.78319 16.6475C13.5682 16.6475 16.6482 13.5675 16.6482 9.78167C16.6482 5.99583 13.5682 2.91667 9.78319 2.91667Z"
                fill="white"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Right Icons */}
      <div className="flex items-center gap-1 sm:gap-3 lg:gap-6">
        {/* Search Icon - Mobile only */}
        <button className="lg:hidden p-1 sm:p-2 rounded-lg hover:bg-gray-100">
          <svg
            width="24"
            height="24"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M9.78319 1.66667C14.2582 1.66667 17.8982 5.30667 17.8982 9.78167C17.8982 11.893 17.088 13.8186 15.7621 15.2637L18.371 17.8672C18.6152 18.1114 18.616 18.5064 18.3719 18.7506C18.2502 18.8739 18.0894 18.9347 17.9294 18.9347C17.7702 18.9347 17.6102 18.8739 17.4877 18.7522L14.8472 16.1192C13.4583 17.2315 11.6971 17.8975 9.78319 17.8975C5.30819 17.8975 1.66736 14.2567 1.66736 9.78167C1.66736 5.30667 5.30819 1.66667 9.78319 1.66667ZM9.78319 2.91667C5.99736 2.91667 2.91736 5.99583 2.91736 9.78167C2.91736 13.5675 5.99736 16.6475 9.78319 16.6475C13.5682 16.6475 16.6482 13.5675 16.6482 9.78167C16.6482 5.99583 13.5682 2.91667 9.78319 2.91667Z"
              fill="#666"
            />
          </svg>
        </button>

        {/* Notification Icon */}
        {/*<div className="relative">
          <svg
            width="24"
            height="24"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="lg:w-7 lg:h-7"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12.0451 23.457C12.6494 24.1302 13.4252 24.5 14.2302 24.5H14.2314C15.0399 24.5 15.8192 24.1302 16.4247 23.4558C16.7491 23.0977 17.3021 23.0685 17.6602 23.3917C18.0196 23.7148 18.0487 24.269 17.7256 24.6272C16.7829 25.6737 15.5427 26.25 14.2314 26.25H14.2291C12.9212 26.2488 11.6834 25.6725 10.7442 24.626C10.4211 24.2678 10.4502 23.7137 10.8096 23.3917C11.1689 23.0673 11.7219 23.0965 12.0451 23.457ZM14.2883 1.16666C19.4742 1.16666 22.9578 5.20566 22.9578 8.9775C22.9578 10.9177 23.4513 11.7402 23.9752 12.6128C24.4932 13.4738 25.08 14.4515 25.08 16.2995C24.6728 21.021 19.7437 21.406 14.2883 21.406C8.83299 21.406 3.90265 21.021 3.50014 16.3742C3.49665 14.4515 4.08349 13.4738 4.60149 12.6128L4.78435 12.305C5.23461 11.5312 5.61882 10.6894 5.61882 8.9775C5.61882 5.20566 9.10249 1.16666 14.2883 1.16666ZM14.2883 2.91666C10.2108 2.91666 7.36882 6.111 7.36882 8.9775C7.36882 11.403 6.69565 12.5242 6.10065 13.5135C5.62349 14.308 5.24665 14.9357 5.24665 16.2995C5.44149 18.4998 6.89399 19.656 14.2883 19.656C21.6418 19.656 23.1398 18.4485 23.3335 16.2237C23.33 14.9357 22.9532 14.308 22.476 13.5135C21.881 12.5242 21.2078 11.403 21.2078 8.9775C21.2078 6.111 18.3658 2.91666 14.2883 2.91666Z"
              fill="black"
              fillOpacity="0.6"
            />
          </svg>
          <div className="absolute -top-1 -right-1 w-[16px] h-[16px] lg:w-[18px] lg:h-[18px] bg-[#10B981] border border-white rounded-full flex items-center justify-center">
            <span className="text-white text-[10px] lg:text-[11px] font-normal">
              9+
            </span>
          </div>
        </div>*/}

        {/* Chat Icon */}
        <div className="relative cursor-pointer hover:opacity-80" onClick={handleChatClick}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="lg:w-7 lg:h-7"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M13.7065 1.16701C17.0583 1.16701 20.2083 2.47018 22.5743 4.83735C27.465 9.72801 27.465 17.6847 22.5743 22.5753C20.1768 24.974 16.9486 26.2433 13.6785 26.2433C11.8958 26.2433 10.1015 25.8665 8.42264 25.0895C7.92797 24.8912 7.4648 24.7045 7.1323 24.7045C6.74964 24.7069 6.23514 24.8842 5.73814 25.0557C4.71847 25.4057 3.44914 25.842 2.50997 24.9063C1.5743 23.9695 2.00597 22.7037 2.35364 21.6852C2.52514 21.1835 2.7013 20.6655 2.7013 20.2735C2.7013 19.9515 2.54614 19.5408 2.30814 18.9493C0.122969 14.2302 1.1333 8.54268 4.8398 4.83851C7.2058 2.47135 10.3546 1.16701 13.7065 1.16701ZM13.7076 2.91701C10.8225 2.91701 8.1123 4.03935 6.07647 6.07635C2.8868 9.26368 2.0188 14.1578 3.91464 18.2563C4.18764 18.9318 4.4513 19.5898 4.4513 20.2735C4.4513 20.956 4.2168 21.6432 4.0103 22.2498C3.83997 22.7492 3.58214 23.5028 3.7478 23.6685C3.90997 23.8365 4.6683 23.5717 5.1688 23.4002C5.76964 23.1948 6.45097 22.9592 7.12647 22.9545C7.80314 22.9545 8.4413 23.2112 9.1168 23.483C13.255 25.3963 18.1491 24.526 21.3376 21.3387C25.5446 17.1293 25.5446 10.2822 21.3376 6.07518C19.3006 4.03818 16.5916 2.91701 13.7076 2.91701ZM18.3124 13.0235C18.9564 13.0235 19.479 13.545 19.479 14.1902C19.479 14.8353 18.9564 15.3568 18.3124 15.3568C17.6684 15.3568 17.141 14.8353 17.141 14.1902C17.141 13.545 17.6579 13.0235 18.3019 13.0235H18.3124ZM13.6354 13.0235C14.2794 13.0235 14.8021 13.545 14.8021 14.1902C14.8021 14.8353 14.2794 15.3568 13.6354 15.3568C12.9914 15.3568 12.4641 14.8353 12.4641 14.1902C12.4641 13.545 12.9798 13.0235 13.6249 13.0235H13.6354ZM8.95802 13.0235C9.60202 13.0235 10.1247 13.545 10.1247 14.1902C10.1247 14.8353 9.60202 15.3568 8.95802 15.3568C8.31402 15.3568 7.78669 14.8353 7.78669 14.1902C7.78669 13.545 8.30352 13.0235 8.94752 13.0235H8.95802Z"
              fill="black"
              fillOpacity="0.6"
            />
          </svg>

        </div>

        {/* Profile Icon */}
        <svg
          width="28"
          height="28"
          viewBox="0 0 35 35"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="lg:w-9 lg:h-9 cursor-pointer hover:opacity-80"
          onClick={handleProfileClick}
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M28.9333 26.5316C28.9333 31.3383 22.3416 31.8939 17.3847 31.8939L17.03 31.8936C13.8719 31.8859 5.83325 31.6865 5.83325 26.5024C5.83325 21.7939 12.16 21.1646 17.0792 21.1409L17.7394 21.1404C20.8973 21.1481 28.9333 21.3475 28.9333 26.5316ZM17.3847 23.3276C11.1708 23.3276 8.02075 24.3951 8.02075 26.5024C8.02075 28.6287 11.1708 29.7064 17.3847 29.7064C23.5972 29.7064 26.7458 28.6389 26.7458 26.5316C26.7458 24.4053 23.5972 23.3276 17.3847 23.3276ZM17.3847 2.91623C21.6547 2.91623 25.127 6.38998 25.127 10.66C25.127 14.93 21.6547 18.4023 17.3847 18.4023H17.338C13.0768 18.3891 9.62492 14.9139 9.63946 10.6556C9.63946 6.38998 13.1133 2.91623 17.3847 2.91623ZM17.3847 4.99873C14.2624 4.99873 11.722 7.53769 11.722 10.66C11.7118 13.7721 14.2333 16.3096 17.3424 16.3212L17.3847 17.3625V16.3212C20.5055 16.3212 23.0445 13.7808 23.0445 10.66C23.0445 7.53769 20.5055 4.99873 17.3847 4.99873Z"
            fill="black"
            fillOpacity="0.6"
          />
        </svg>
      </div>
    </header>
  );
}
