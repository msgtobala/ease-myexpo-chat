import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  collection,
  getDocs,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import Header from "../components/Header";
import LeftSidebar from "../components/LeftSidebar";
import CommunityDiscussions from "../components/CommunityDiscussions";
import MobileMenu from "../components/MobileMenu";

interface Exhibition {
  exhibition_id: string;
  exhibition_name: string;
  exhibition_description: string;
  exhibition_cover_image: string;
  exhibition_logo: string;
  exhibition_location: string;
  exhibition_start_date: any;
  exhibition_end_date: any;
  created_at: any;
  created_by: string;
  joined_profile?: Record<string, any>;
}

export default function ExhibitionsList() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch exhibitions from Firestore
  useEffect(() => {
    console.log("Setting up exhibitions listener...");

    // Use same pattern as TopExhibitions - onSnapshot without ordering
    const exhibitionsQuery = query(collection(db, "exhibitions"));

    const unsubscribe = onSnapshot(
      exhibitionsQuery,
      (snapshot) => {
        console.log("Exhibitions snapshot received, size:", snapshot.size);

        const exhibitionsData: Exhibition[] = [];
        snapshot.forEach((doc) => {
          console.log("Document ID:", doc.id, "Data:", doc.data());
          exhibitionsData.push({
            exhibition_id: doc.id,
            ...doc.data()
          } as Exhibition);
        });

        console.log("Final exhibitions data:", exhibitionsData);
        setExhibitions(exhibitionsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching exhibitions:", error);
        setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleExhibitionClick = (exhibition: Exhibition) => {
    navigate("/exhibitions/profile", {
      state: { exhibitionData: exhibition }
    });
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="h-screen bg-[#F6F6F6] overflow-hidden">
      {/* Header */}
      <Header onMenuToggle={toggleMobileMenu} />

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        activeItem="communities"
        onItemClick={closeMobileMenu}
      />

      {/* Main Layout */}
      <div
        className="flex flex-col lg:flex-row gap-4 lg:gap-6 p-2 lg:p-6 max-w-[1483px] mx-auto"
        style={{ height: "calc(100vh - 76px)" }}
      >
        {/* Left Sidebar Container - Hidden on mobile, visible on desktop */}
        <div className="hidden lg:block w-[300px] space-y-6">
          {/* Navigation Menu */}
          <LeftSidebar activeItem="communities" onItemClick={() => {}} />

          {/* Community Discussions */}
          <CommunityDiscussions />
        </div>

        {/* Main Content Area */}
        <div
          className="flex-1 space-y-3 lg:space-y-6 overflow-y-auto lg:pr-2 pb-6 lg:pb-16"
          style={{ scrollBehavior: "smooth" }}
        >
          {/* Page Header */}
          <div className="w-full bg-white rounded-[16px] shadow-sm border border-gray-100 p-4 lg:p-6">
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => navigate("/home")}>
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
              </button>
              <h1 className="text-[#10B981] font-poppins text-[20px] lg:text-[24px] font-bold">
                Exhibitions
              </h1>
            </div>
            <p className="text-[#666666] font-poppins text-[14px] lg:text-[16px]">
              Discover and join exciting exhibitions happening around you
            </p>
          </div>

          {/* Exhibitions Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 lg:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-full bg-white rounded-[16px] shadow-sm border border-gray-100 animate-pulse">
                  <div className="w-full h-[200px] bg-gray-200 rounded-t-[16px]"></div>
                  <div className="p-4 lg:p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : exhibitions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 lg:gap-6">
              {exhibitions.map((exhibition) => (
                <div
                  key={exhibition.exhibition_id}
                  className="w-full bg-white rounded-[16px] shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleExhibitionClick(exhibition)}
                >
                  {/* Cover Image */}
                  <div className="relative">
                    <img
                      src={
                        exhibition.exhibition_cover_image ||
                        "https://api.builder.io/api/v1/image/assets/TEMP/3ad6b6a4ca008eac7215dd4d8ad95fd1c30dbfb2?width=1700"
                      }
                      alt={exhibition.exhibition_name}
                      className="w-full h-[200px] rounded-t-[16px] object-cover"
                    />

                    {/* Exhibition Name Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-40 rounded-t-[16px] flex items-center justify-center">
                      <h3 className="text-white font-poppins text-[18px] lg:text-[24px] font-bold text-center px-4">
                        {exhibition.exhibition_name}
                      </h3>
                    </div>

                    {/* Exhibition Logo */}
                    <div className="absolute left-4 bottom-[-30px] w-[60px] h-[60px] rounded-full border-[3px] border-white bg-white flex items-center justify-center shadow-lg">
                      {exhibition.exhibition_image_url ? (
                        <img
                          src={exhibition.exhibition_image_url}
                          alt={`${exhibition.exhibition_name} logo`}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-[#10B981] flex items-center justify-center">
                          <span className="text-white font-poppins font-bold text-[18px]">
                            {exhibition.exhibition_name?.charAt(0)?.toUpperCase() || 'E'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 lg:p-6 pt-8">
                    <div className="flex flex-col gap-3">
                      {/* Title and Description */}
                      <div>
                        <h3 className="text-[#10B981] mt-4 font-poppins text-[16px] lg:text-[18px] font-semibold mb-2">
                          {exhibition.exhibition_name}
                        </h3>
                        <p className="text-[#212121] font-poppins text-[13px] lg:text-[14px] leading-[1.5] mb-3">
                          {truncateText(exhibition.exhibition_description || "", 80)}
                        </p>
                      </div>

                      {/* Location and Dates */}
                      <div className="flex flex-col gap-2 mb-4">
                        {exhibition.exhibition_location && (
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4"
                              viewBox="0 0 16 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M2.625 7.33328L15.5748 1.33328L9.44069 13.9999L8.07755 8.66662L2.625 7.33328Z"
                                fill="#00B966"
                              />
                            </svg>
                            <span className="text-[#666666] font-poppins text-[12px] lg:text-[13px]">
                              {exhibition.exhibition_location}
                            </span>
                          </div>
                        )}
                        
                        {(exhibition.exhibition_start_date || exhibition.exhibition_end_date) && (
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4"
                              viewBox="0 0 16 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M12 2V4M4 2V4M2 8H14M2 6C2 5.46957 2.21071 4.96086 2.58579 4.58579C2.96086 4.21071 3.46957 4 4 4H12C12.5304 4 13.0391 4.21071 13.4142 4.58579C13.7893 4.96086 14 5.46957 14 6V12C14 12.5304 13.7893 13.0391 13.4142 13.4142C13.0391 13.7893 12.5304 14 12 14H4C3.46957 14 2.96086 13.7893 2.58579 13.4142C2.21071 13.0391 2 12.5304 2 12V6Z"
                                stroke="#666666"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span className="text-[#666666] font-poppins text-[12px] lg:text-[13px]">
                              {formatDate(exhibition.exhibition_start_date)}
                              {exhibition.exhibition_end_date && 
                                ` - ${formatDate(exhibition.exhibition_end_date)}`
                              }
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Bottom Row */}
                      <div className="flex items-center justify-between">
                        {/* Members Count */}
                        <div className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M11 7C12.1046 7 13 6.10457 13 5C13 3.89543 12.1046 3 11 3C9.89543 3 9 3.89543 9 5C9 6.10457 9.89543 7 11 7Z"
                              stroke="#666666"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M5 7C6.10457 7 7 6.10457 7 5C7 3.89543 6.10457 3 5 3C3.89543 3 3 3.89543 3 5C3 6.10457 3.89543 7 5 7Z"
                              stroke="#666666"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M11 9C11 9 13 9 13 11V13H9V11C9 9 11 9 11 9Z"
                              stroke="#666666"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M5 9C5 9 7 9 7 11V13H3V11C3 9 5 9 5 9Z"
                              stroke="#666666"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span className="text-[#666666] font-poppins text-[12px] lg:text-[13px]">
                            {exhibition.joined_profile ? Object.keys(exhibition.joined_profile).length : 0} members
                          </span>
                        </div>

                        {/* View Button */}
                        <button className="flex items-center justify-center px-4 py-2 bg-[#10B981] rounded-lg hover:bg-[#0ea574] transition-colors">
                          <span className="text-white font-poppins text-[12px] lg:text-[13px] font-medium">
                            View
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full bg-white rounded-[16px] shadow-sm border border-gray-100 p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <svg
                  className="w-16 h-16 text-gray-300"
                  viewBox="0 0 64 64"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M32 8L56 16V48L32 56L8 48V16L32 8Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M32 8V56M8 16L32 24L56 16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div>
                  <h3 className="text-[#212121] font-poppins text-[18px] font-semibold mb-2">
                    No Exhibitions Found
                  </h3>
                  <p className="text-[#666666] font-poppins text-[14px]">
                    There are currently no exhibitions available. Check back later!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
