import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, collection, query, onSnapshot, where, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/use-toast";
import Header from "../components/Header";
import LeftSidebar from "../components/LeftSidebar";
import CommunityDiscussions from "../components/CommunityDiscussions";
import MobileMenu from "../components/MobileMenu";
import SwipeCard from "../components/SwipeCard";
import MatchCard from "../components/MatchCard";
import InterestsModal from "../components/InterestsModal";

interface UserDoc {
  companyLogoUrl: string;
  profilePictureUrl: string;
  description: string;
  email: string;
  createdAt: string;
  name: string;
  phone: string;
  profileType: string;
  updatedAt: string;
  userId: string;
  websiteUrl: string;
  interests: string[];
  joinedExhibitions: string[];
  industry: string | null;
}

export default function SmartMatch() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"discover" | "matches">(
    "discover",
  );
  const [isInterestsModalOpen, setIsInterestsModalOpen] = useState(false);
  const [userData, setUserData] = useState<UserDoc | null>(null);
  const [matchedUsers, setMatchedUsers] = useState<any[]>([]);
  const [myMatches, setMyMatches] = useState<any[]>([]);
  const [loadingMatchedUsers, setLoadingMatchedUsers] = useState(true);
  const [loadingMyMatches, setLoadingMyMatches] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch user data and check interests
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as UserDoc;
            setUserData(data);

            // Check if user has no interests - show modal regardless of profile type
            if (!data.interests || data.interests.length === 0) {
              setIsInterestsModalOpen(true);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, [user]);

  // Generate alias from name
  const generateAlias = (name: string): string => {
    return "@" + name.toLowerCase().replace(/\s+/g, "-");
  };

  // Fetch users data from Firebase based on user type and matching logic
  useEffect(() => {
    if (!userData) {
      setLoadingMatchedUsers(false);
      return;
    }

    // If user is visitor and has no interests, don't fetch anything
    if (userData.profileType === "visitor" && (!userData.interests || userData.interests.length === 0)) {
      setLoadingMatchedUsers(false);
      setMatchedUsers([]);
      return;
    }

    let usersQuery;

    if (userData.profileType === "visitor") {
      // Fetch exhibitor type users
      usersQuery = query(
        collection(db, "users"),
        where("profileType", "==", "exhibitor")
      );
    } else if (userData.profileType === "exhibitor") {
      // Fetch visitor type users  
      usersQuery = query(
        collection(db, "users"),
        where("profileType", "==", "visitor")
      );
    } else {
      setLoadingMatchedUsers(false);
      return;
    }

    const unsubscribe = onSnapshot(
      usersQuery,
      async (snapshot) => {
        // Get current user's matches to exclude them
        let currentUserMatches: string[] = [];
        try {
          const currentUserDoc = await getDoc(doc(db, "users", user?.uid || ""));
          currentUserMatches = currentUserDoc.exists() ? (currentUserDoc.data().matches || []) : [];
        } catch (error) {
          console.error("Error fetching current user matches:", error);
        }

        const usersData: any[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as UserDoc;
          const userDocId = data.userId || doc.id;

          // Skip current user
          if (userDocId === user?.uid) {
            return;
          }

          // Skip users who are already in current user's matches array
          if (currentUserMatches.includes(userDocId)) {
            return;
          }

          // Apply matching logic
          let isMatch = false;

          const currentUserDataInterests = userData.interests
          const incomingUserDataInterets = data.interests
          if (userData.profileType === "visitor") {
            // Check if exhibitor's industry is in current user's interests
            if (data.industry && currentUserDataInterests && currentUserDataInterests.some(v => data.interests.includes(v))) {
              isMatch = true;
            }
          } else if (userData.profileType === "exhibitor") {
            // Check if exhibitor's industry is in visitor's interests
            if (userData.industry && incomingUserDataInterets && incomingUserDataInterets.some(v => userData.interests.includes(v))) {
              isMatch = true;
            }
          }

          if (isMatch) {
            // Map user data to card format
            const mappedUser = {
              id: data.userId || doc.id,
              name: data.name || "Unknown User",
              username: generateAlias(data.name || "unknown"),
              category: userData.profileType === "visitor" ? (data.industry || "Unknown Industry") : "Visitor",
              description: data.description || "No description available",
              website: data.websiteUrl || "No website",
              location: "India", // Hardcoded as requested
              company: data.industry || "Unknown Industry",
              skills: [], // Remove skills section as requested
              events: ["abc", "dfg"], // Hardcoded events as requested
              matchPercentage: 95,
              image: data.companyLogoUrl || data.profilePictureUrl || "https://api.builder.io/api/v1/image/assets/TEMP/c55340957be0d37b91878ecb441cc5d27cf207a5?width=136",
              // Keep original user data for reference
              originalData: data
            };
            usersData.push(mappedUser);
          }
        });
        setMatchedUsers(usersData);
        setLoadingMatchedUsers(false);
      },
      (error) => {
        console.error("Error fetching users:", error);
        setLoadingMatchedUsers(false);
      }
    );

    return () => unsubscribe();
  }, [userData?.interests, userData?.industry, userData?.profileType, user?.uid]);

  // Function to fetch My Matches - extracted so it can be called after connections
  const fetchMyMatches = async () => {
    if (!user?.uid || !userData) {
      setLoadingMyMatches(false);
      return;
    }

    setLoadingMyMatches(true);
    try {
      // Get current user's data to access matches array
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        setLoadingMyMatches(false);
        return;
      }

      const currentUserData = userDoc.data();
      const matchesArray = currentUserData.matches || [];

      if (matchesArray.length === 0) {
        setMyMatches([]);
        setLoadingMyMatches(false);
        return;
      }

      // Fetch each matched user's data
      const matchedUsersPromises = matchesArray.map(async (matchedUserId: string) => {
        try {
          const matchedUserDoc = await getDoc(doc(db, "users", matchedUserId));
          if (matchedUserDoc.exists()) {
            const data = matchedUserDoc.data() as UserDoc;

            // Map user data to card format
            return {
              id: data.userId || matchedUserDoc.id,
              name: data.name || "Unknown User",
              username: generateAlias(data.name || "unknown"),
              category: userData.profileType === "visitor" ? (data.industry || "Unknown Industry") : "Visitor",
              description: data.description || "No description available",
              website: data.websiteUrl || "No website",
              location: "India", // Hardcoded as requested
              company: data.industry || "Unknown Industry",
              skills: [], // Remove skills section as requested
              events: ["abc", "dfg"], // Hardcoded events as requested
              matchPercentage: 100, // 100% since they've connected
              image: data.companyLogoUrl || data.profilePictureUrl || "https://api.builder.io/api/v1/image/assets/TEMP/c55340957be0d37b91878ecb441cc5d27cf207a5?width=136",
              // Keep original user data for reference
              originalData: data
            };
          }
          return null;
        } catch (error) {
          console.error(`Error fetching matched user ${matchedUserId}:`, error);
          return null;
        }
      });

      const matchedUsersData = await Promise.all(matchedUsersPromises);
      const validMatches = matchedUsersData.filter((match): match is any => match !== null);

      setMyMatches(validMatches);
      setLoadingMyMatches(false);
    } catch (error) {
      console.error("Error fetching my matches:", error);
      setLoadingMyMatches(false);
    }
  };

  // Fetch My Matches on component mount
  useEffect(() => {
    fetchMyMatches();
  }, [user?.uid, userData?.profileType]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Get current user data for display
  const getCurrentUser = () => {
    if (matchedUsers.length === 0) return null;
    return matchedUsers[currentCardIndex % matchedUsers.length];
  };

  const handleSwipe = (direction: "left" | "right") => {
    if (direction === "right") {
      handleConnect();
    } else {
      handlePass();
    }
  };

  const handlePass = () => {
    const currentUser = getCurrentUser();
    console.log(`Passing ${currentUser?.name}`);

    // Just move to next user without any other action
    setCurrentCardIndex((prev) => (prev + 1) % matchedUsers.length);
  };

  const handleConnect = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to connect with users.",
        variant: "destructive",
      });
      return;
    }

    const currentUser = getCurrentUser();
    if (!currentUser) return;

    console.log(`Connecting with ${currentUser?.name}`);

    try {
      // Update current user's matches array with the connected user's ID
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        matches: arrayUnion(currentUser.id)
      });

      toast({
        title: "Connection Successful!",
        description: `You have connected with ${currentUser.name}.`,
      });

      // Remove the connected user from the available users list
      setMatchedUsers(prevUsers => {
        const updatedUsers = prevUsers.filter(usr => usr.id !== currentUser.id);
        // Reset current index if necessary
        if (updatedUsers.length > 0) {
          setCurrentCardIndex(prev => prev >= updatedUsers.length ? 0 : prev);
        } else {
          setCurrentCardIndex(0);
        }
        return updatedUsers;
      });

      // Refresh My Matches to show the new connection immediately
      fetchMyMatches();

    } catch (error) {
      console.error('Error connecting with user:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect with user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const closeInterestsModal = () => {
    setIsInterestsModalOpen(false);

    // Refetch user data to get updated interests
    if (user) {
      getDoc(doc(db, "users", user.uid))
        .then((userDoc) => {
          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserDoc);
          }
        })
        .catch((error) => {
          console.error("Error refetching user data:", error);
        });
    }
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
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end w-full max-w-[879px] mb-4 gap-4">
            {/* Back Button and Title */}
            <div className="flex items-center gap-2">
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
              <h1 className="text-[#10B981] font-poppins text-[20px] font-semibold">
                Smart Match
              </h1>
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center justify-center w-full max-w-[256px] h-[34px] relative">
              <div className="w-full h-full border border-[#E6DFE9] rounded-lg bg-white relative">
                <div
                  className={`absolute top-[1px] h-[32px] bg-[#10B981] rounded-lg transition-all duration-300 ${
                    activeTab === "discover"
                      ? "left-[1px] w-[calc(50%-2px)]"
                      : "right-[1px] w-[calc(50%-2px)]"
                  }`}
                ></div>
                <button
                  onClick={() => setActiveTab("discover")}
                  className="absolute left-0 top-0 flex items-center justify-center w-1/2 h-full z-10"
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
                  className="absolute right-0 top-0 flex items-center justify-center w-1/2 h-full z-10"
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
              {loadingMatchedUsers ? (
                <div className="flex items-center justify-center w-full h-[580px] lg:h-[620px]">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[#666] font-poppins text-[16px]">Loading matches...</p>
                  </div>
                </div>
              ) : matchedUsers.length === 0 ? (
                <div className="flex items-center justify-center w-full h-[580px] lg:h-[620px]">
                  <div className="text-center">
                    <p className="text-[#666] font-poppins text-[16px] mb-2">No matches available</p>
                    <p className="text-[#888] font-poppins text-[14px]">
                      {userData?.profileType === "visitor" && (!userData?.interests || userData.interests.length === 0) 
                        ? "Please select your interests to find matches"
                        : "Check back later for new matches"
                      }
                    </p>
                  </div>
                </div>
              ) : (
                <SwipeCard
                  user={getCurrentUser()}
                  onSwipe={handleSwipe}
                  onPass={handlePass}
                  onConnect={handleConnect}
                  currentUserType={userData?.profileType}
                />
              )}
            </div>
          ) : (
            <div className="flex-1 w-full max-w-[879px] mt-4">
              {loadingMyMatches ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-[24px] justify-items-center">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-full max-w-[420px] h-[400px] bg-white rounded-[20px] animate-pulse">
                      <div className="p-6">
                        <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-200 rounded"></div>
                          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : myMatches.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[#666] font-poppins text-[16px] mb-2">No matches found</p>
                  <p className="text-[#888] font-poppins text-[14px]">Start discovering users to make connections</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-[24px] justify-items-center">
                  {myMatches.map((matchedUser) => (
                    <div key={matchedUser.id} className="w-full max-w-[420px]">
                      <MatchCard user={matchedUser} currentUserType={userData?.profileType} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Interests Modal */}
      <InterestsModal
        isOpen={isInterestsModalOpen}
        onClose={closeInterestsModal}
      />
    </div>
  );
}
