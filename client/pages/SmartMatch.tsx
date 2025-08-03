import React, { useState } from "react";
import Header from "../components/Header";
import LeftSidebar from "../components/LeftSidebar";
import CommunityDiscussions from "../components/CommunityDiscussions";
import MobileMenu from "../components/MobileMenu";
import SwipeCard from "../components/SwipeCard";
import MatchCard from "../components/MatchCard";

export default function SmartMatch() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"discover" | "matches">(
    "discover",
  );

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Sample user data - in real app this would come from API
  const users = [
    {
      id: 1,
      name: "Daniel Jones",
      username: "@daniel",
      category: "Expos and Community",
      description:
        "Building Websites and Webapps with Seamless User Experience Across Devices.",
      website: "danieljones.com",
      location: "India",
      company: "Tech Corp.",
      skills: ["Product Strategy", "Data Analysis", "Strategic Thinking"],
      events: ["AI Summit", "Expo BLR"],
      matchPercentage: 95,
      image:
        "https://api.builder.io/api/v1/image/assets/TEMP/c55340957be0d37b91878ecb441cc5d27cf207a5?width=136",
    },
    {
      id: 2,
      name: "Sarah Wilson",
      username: "@sarah",
      category: "Expos and Community",
      description:
        "Building Websites and Webapps with Seamless User Experience Across Devices.",
      website: "sarahwilson.com",
      location: "India",
      company: "Tech Corp.",
      skills: ["Product Strategy", "Data Analysis", "Strategic Thinking"],
      events: ["AI Summit", "Expo BLR"],
      matchPercentage: 95,
      image:
        "https://api.builder.io/api/v1/image/assets/TEMP/d081773160edf0019eec468a08da9cb714d08397?width=136",
    },
    {
      id: 3,
      name: "Alex Chen",
      username: "@alex",
      category: "Expos and Community",
      description:
        "Building Websites and Webapps with Seamless User Experience Across Devices.",
      website: "alexchen.com",
      location: "India",
      company: "Tech Corp.",
      skills: ["Product Strategy", "Data Analysis", "Strategic Thinking"],
      events: ["AI Summit", "Expo BLR"],
      matchPercentage: 95,
      image:
        "https://api.builder.io/api/v1/image/assets/TEMP/bc7a1eff8e56420951453a7f66e906723f9f8bfa?width=136",
    },
    {
      id: 4,
      name: "Maria Garcia",
      username: "@maria",
      category: "Expos and Community",
      description:
        "Building Websites and Webapps with Seamless User Experience Across Devices.",
      website: "mariagarcia.com",
      location: "India",
      company: "Tech Corp.",
      skills: ["Product Strategy", "Data Analysis", "Strategic Thinking"],
      events: ["AI Summit", "Expo BLR"],
      matchPercentage: 95,
      image:
        "https://api.builder.io/api/v1/image/assets/TEMP/d6095e1ed0daddb6a4b4558bdfe60e64c4caee1a?width=136",
    },
  ];

  const handleSwipe = (direction: "left" | "right") => {
    if (direction === "right") {
      console.log(`Connecting with ${users[currentCardIndex]?.name}`);
    } else {
      console.log(`Passing ${users[currentCardIndex]?.name}`);
    }

    // Move to next card
    setCurrentCardIndex((prev) => (prev + 1) % users.length);
  };

  const handlePass = () => {
    handleSwipe("left");
  };

  const handleConnect = () => {
    handleSwipe("right");
  };

  return (
    <div className="h-screen bg-[#F6F6F6] overflow-hidden">
      {/* Header */}
      <Header onMenuToggle={toggleMobileMenu} />

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        activeItem="smart-match"
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
          <LeftSidebar activeItem="smart-match" onItemClick={() => {}} />

          {/* Community Discussions */}
          <CommunityDiscussions />
        </div>

        {/* Main Content Area */}
        <div
          className="flex-1 flex flex-col items-center overflow-y-auto lg:pr-2 pb-8 lg:pb-16"
          style={{ scrollBehavior: "smooth" }}
        >
          {/* Header Section */}
          <div className="flex justify-between items-end w-full max-w-[879px] mb-4">
            {/* Back Button and Title */}
            <div className="flex items-center gap-2">
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11 5L4 12L11 19M4 12H20H4Z"
                  stroke="#10B981"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <h1 className="text-[#10B981] font-poppins text-[20px] font-semibold">
                Smart Match
              </h1>
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center justify-center w-[256px] h-[34px] relative">
              <div className="w-full h-full border border-[#E6DFE9] rounded-lg bg-white relative">
                <div
                  className={`absolute top-[1px] w-[124px] h-[32px] bg-[#10B981] rounded-lg transition-all duration-300 ${
                    activeTab === "discover" ? "left-[1px]" : "left-[131px]"
                  }`}
                ></div>
                <button
                  onClick={() => setActiveTab("discover")}
                  className="absolute left-0 top-0 flex items-center justify-center w-[128px] h-full z-10"
                >
                  <span
                    className={`font-poppins text-[11px] text-center leading-[34px] ${
                      activeTab === "discover" ? "text-white" : "text-[#10B981]"
                    }`}
                  >
                    Discover
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("matches")}
                  className="absolute right-0 top-0 flex items-center justify-center w-[128px] h-full z-10"
                >
                  <span
                    className={`font-poppins text-[11px] text-center leading-[34px] ${
                      activeTab === "matches" ? "text-white" : "text-[#10B981]"
                    }`}
                  >
                    My Matches
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Cards Area */}
          {activeTab === "discover" ? (
            <div className="relative flex-1 flex items-center justify-center w-full max-w-[540px]">
              <SwipeCard
                user={users[currentCardIndex]}
                onSwipe={handleSwipe}
                onPass={handlePass}
                onConnect={handleConnect}
              />
            </div>
          ) : (
            <div className="flex-1 w-full max-w-[879px] mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-[24px] justify-items-center">
                {users.map((user) => (
                  <div key={user.id} className="w-full max-w-[420px]">
                    <MatchCard user={user} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
