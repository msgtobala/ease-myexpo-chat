import React, { useState, useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import LeftSidebar from "../components/LeftSidebar";
import CommunityDiscussions from "../components/CommunityDiscussions";
import MobileMenu from "../components/MobileMenu";
import ExhibitionsProfileCard from "../components/ExhibitionsProfileCard";
import PostCreationModal from "../components/PostCreationModal";
import JoinModal from "../components/JoinModal";
import { useAuth } from "../contexts/AuthContext";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../lib/firebase";

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
  exhibitionId?: string;
}

interface JoinedProfile {
  id: string;
  url: string;
}

interface MemberCardProps {
  userId: string;
  profile: JoinedProfile;
  currentUserId?: string;
}

// MemberCard Component
function MemberCard({ userId, profile, currentUserId }: MemberCardProps) {
  const [memberData, setMemberData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        console.log(userId, profile);
        if (userDoc.exists()) {
          setMemberData(userDoc.data());
        }
      } catch (error) {
        console.error("Error fetching member data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberData();
  }, [userId]);

  const handleSendMessage = () => {
    navigate("/chats", {
      state: {
        selectedUserId: userId,
        selectedUserName: memberData?.name || "User",
        selectedUserImage: profile.url || memberData?.profilePictureUrl || memberData?.companyLogoUrl,
        autoStartChat: true
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center gap-4 p-3 animate-pulse">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="w-24 h-8 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!memberData) return null;

  return (
    <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3">
        {/* Profile Picture */}
        <img
          src={profile.url || memberData.profilePictureUrl || memberData.companyLogoUrl || "https://api.builder.io/api/v1/image/assets/TEMP/default-profile.jpg"}
          alt={memberData.name}
          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
        />

        {/* Member Info */}
        <div>
          <h3 className="text-[#212121] font-poppins text-[14px] lg:text-[16px] font-medium">
            {memberData.name || "Unknown User"}
          </h3>
          <div className="flex items-center gap-2">
            <span className={`text-[12px] lg:text-[13px] font-poppins font-medium px-2 py-1 rounded-full ${
              memberData.profileType === "exhibitor"
                ? "bg-blue-100 text-blue-700"
                : "bg-green-100 text-green-700"
            }`}>
              {memberData.profileType === "exhibitor" ? "Exhibitor" : "Visitor"}
            </span>
            {userId === currentUserId && (
              <span className="text-[11px] font-poppins text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                You
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Send Message Button */}
      {userId !== currentUserId && (
        <button
          onClick={handleSendMessage}
          className="flex items-center justify-center px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-[#0ea574] transition-colors font-poppins text-[12px] lg:text-[14px] font-medium"
        >
          Send Message
        </button>
      )}
    </div>
  );
}

export default function ExhibitionsProfile() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("discussion");
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postModalMode, setPostModalMode] = useState<
    "photo" | "video" | "both"
  >("both");
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [exhibitionPosts, setExhibitionPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [currentExhibitionData, setCurrentExhibitionData] = useState<any>(null);
  const [isUserJoined, setIsUserJoined] = useState(false);
  const location = useLocation();
  const exhibitionData = location.state?.exhibitionData;
  const { user } = useAuth();

  if (exhibitionData === null || exhibitionData === undefined) {
    return <Navigate to="/home" />;
  }

  // Fetch user data and check join status
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);

            // Check if user has joined this exhibition
            const joinedExhibitions = data.joinedExhibitions || [];
            setIsUserJoined(
              joinedExhibitions.includes(exhibitionData?.exhibition_id),
            );
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, [user, exhibitionData?.exhibition_id]);

  // Set up real-time listener for exhibition data
  useEffect(() => {
    if (!exhibitionData?.exhibition_id) {
      setCurrentExhibitionData(exhibitionData);
      return;
    }

    const exhibitionDocRef = doc(
      db,
      "exhibitions",
      exhibitionData.exhibition_id,
    );
    const unsubscribe = onSnapshot(
      exhibitionDocRef,
      (doc) => {
        if (doc.exists()) {
          setCurrentExhibitionData({ ...doc.data(), exhibition_id: doc.id });
        } else {
          setCurrentExhibitionData(exhibitionData);
        }
      },
      (error) => {
        console.error("Error listening to exhibition updates:", error);
        setCurrentExhibitionData(exhibitionData);
      },
    );

    return () => unsubscribe();
  }, [exhibitionData?.exhibition_id]);

  // Set up real-time listener for user data to track join status
  useEffect(() => {
    if (!user?.uid || !exhibitionData?.exhibition_id) return;

    const userDocRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(
      userDocRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          const joinedExhibitions = data.joinedExhibitions || [];
          setIsUserJoined(
            joinedExhibitions.includes(exhibitionData.exhibition_id),
          );
        }
      },
      (error) => {
        console.error("Error listening to user updates:", error);
      },
    );

    return () => unsubscribe();
  }, [user?.uid, exhibitionData?.exhibition_id]);

  // Fetch exhibition-specific posts
  useEffect(() => {
    if (!exhibitionData?.exhibition_id) {
      setLoadingPosts(false);
      return;
    }

    // Create query to get posts for this specific exhibition
    const postsQuery = query(
      collection(db, "posts"),
      where("exhibitionId", "==", exhibitionData.exhibition_id),
      orderBy("postedTime", "desc"),
    );

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      postsQuery,
      (snapshot) => {
        const postsData: Post[] = [];
        snapshot.forEach((doc) => {
          postsData.push({ postId: doc.id, ...doc.data() } as Post);
        });
        setExhibitionPosts(postsData);
        setLoadingPosts(false);
      },
      (error) => {
        console.error("Error fetching exhibition posts:", error);
        setLoadingPosts(false);
      },
    );

    return () => unsubscribe();
  }, [exhibitionData?.exhibition_id]);

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

  const openJoinModal = () => {
    setIsJoinModalOpen(true);
  };

  const closeJoinModal = () => {
    setIsJoinModalOpen(false);
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

  return (
    <div className="h-screen bg-[#F6F6F6] overflow-hidden">
      {/* Header */}
      <Header onMenuToggle={toggleMobileMenu} />

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        activeItem="profile"
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
          {/* Exhibitions Profile Card */}
          <ExhibitionsProfileCard
            activeTab={activeTab}
            onTabChange={setActiveTab}
            exhibitionData={currentExhibitionData || exhibitionData}
            onJoin={openJoinModal}
            isUserJoined={isUserJoined}
          />

          {/* Tab Content */}
          {activeTab === "discussion" && (
            <>
              {/* Write New Post */}
              {/*<div className="w-full bg-white rounded-[16px] shadow-sm border border-gray-100">
                <div className="relative h-[98px] p-4 lg:p-6">
                  <div className="flex items-center gap-3 lg:gap-4">
                    <img
                      src={
                        userData?.profilePictureUrl ||
                        userData?.companyLogoUrl ||
                        user?.photoURL ||
                        "https://api.builder.io/api/v1/image/assets/TEMP/08ddb1fb09896356801624917f29fb97d9915626?width=80"
                      }
                      alt="Profile"
                      className="w-10 h-10 rounded-[18px] object-cover"
                    />
                    <input
                      type="text"
                      placeholder="Write something ..."
                      className="flex-1 text-[#666666] font-roboto text-[14px] lg:text-[16px] bg-transparent outline-none placeholder-[#666666] cursor-pointer"
                      onClick={() => openPostModal("both")}
                      readOnly
                    />
                    <svg
                      className="w-[22px] h-[24px] ml-auto"
                      viewBox="0 0 23 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M19.5038 19.2089C19.8361 19.2089 20.1054 19.498 20.1054 19.8545C20.1054 20.1813 19.8791 20.4514 19.5855 20.4941L19.5038 20.5H13.2279C12.8957 20.5 12.6264 20.211 12.6264 19.8545C12.6264 19.5277 12.8527 19.2576 13.1463 19.2148L13.2279 19.2089H19.5038ZM13.3999 4.41662C14.5388 3.19446 16.386 3.19446 17.5249 4.41662L18.7072 5.6854C19.8461 6.90755 19.8461 8.88985 18.7072 10.112L9.82037 19.6486C9.31221 20.1939 8.62324 20.4999 7.90412 20.4999H4.26464C3.92654 20.4999 3.65485 20.201 3.66328 19.8383L3.75483 15.8975C3.77303 15.1526 4.05703 14.4425 4.54793 13.9157L13.3999 4.41662ZM12.7118 6.979L5.39864 14.8287C5.12578 15.1215 4.96764 15.5169 4.95753 15.9305L4.88114 19.2084L7.90412 19.2088C8.25983 19.2088 8.6019 19.0745 8.8719 18.8317L8.96965 18.7357L16.3191 10.849L12.7118 6.979ZM16.6742 5.32953C16.0051 4.61156 14.9196 4.61156 14.2506 5.32953L13.5632 6.066L17.1695 9.936L17.8565 9.19909C18.4884 8.52101 18.5235 7.44433 17.9618 6.72195L17.8565 6.59831L16.6742 5.32953Z"
                        fill="#666666"
                      />
                    </svg>
                  </div>
                </div>

                <div className="bg-[#10B981] h-[57px] rounded-b-[16px] flex items-center justify-between px-4 lg:px-6">
                  <div className="flex items-center gap-4 lg:gap-16">
                    <div
                      className="flex items-center gap-2 cursor-pointer hover:opacity-80"
                      onClick={() => openPostModal("photo")}
                    >
                      <svg
                        className="w-[28px] h-[24px]"
                        viewBox="0 0 28 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M19.0503 2C23.0207 2 25.6668 4.42887 25.6668 7.91408V16.0849C25.6668 19.5703 23.0205 22 19.0503 22H8.93837C4.96989 22 2.3335 19.5722 2.3335 16.0849V7.91408C2.3335 4.43059 4.97759 2 8.93837 2H19.0503ZM19.0503 3.50383H8.93837C5.97426 3.50383 4.087 5.2387 4.087 7.91408V16.0849C4.087 18.7647 5.9673 20.4962 8.93837 20.4962H19.0503C22.0244 20.4962 23.9133 18.7618 23.9133 16.0849V7.91408C23.9133 5.23744 22.0247 3.50383 19.0503 3.50383ZM19.8812 12.1835L20.0332 12.3086L22.4601 14.4561C22.7971 14.7543 22.7884 15.2303 22.4407 15.5193C22.1246 15.7821 21.6371 15.7998 21.2979 15.5768L21.2009 15.5027L18.7742 13.3553C18.3514 12.9814 17.6641 12.9779 17.235 13.3269L17.1408 13.4137L14.5355 16.1312C13.614 17.0939 11.9559 17.1971 10.8831 16.3903L10.7406 16.2747L9.70084 15.3648C9.42772 15.1217 8.99217 15.0987 8.68886 15.2949L8.59306 15.3684L6.80566 16.9855C6.47254 17.2869 5.9176 17.2996 5.56618 17.0139C5.24671 16.7542 5.2054 16.3373 5.45081 16.0372L5.53305 15.9509L7.32008 14.3341C8.26086 13.4819 9.8101 13.4365 10.8123 14.1967L10.9583 14.3167L11.9928 15.222C12.2952 15.4865 12.7799 15.4933 13.0924 15.2553L13.1807 15.1766L15.7862 12.4589C16.8214 11.3782 18.6854 11.2689 19.8812 12.1835ZM10.0016 6.64124C11.6174 6.64124 12.9288 7.76589 12.9288 9.15164C12.9288 10.5374 11.6174 11.662 10.0016 11.662C8.38584 11.662 7.07556 10.5374 7.07556 9.15164C7.07556 7.76583 8.38584 6.64124 10.0016 6.64124ZM10.0016 8.14507C9.35458 8.14507 8.82907 8.59611 8.82907 9.15164C8.82907 9.70716 9.35458 10.1582 10.0016 10.1582C10.649 10.1582 11.1753 9.70684 11.1753 9.15164C11.1753 8.59643 10.649 8.14507 10.0016 8.14507Z"
                          fill="white"
                        />
                      </svg>
                      <span className="text-white font-poppins text-[16px]">
                        Photo
                      </span>
                    </div>
                    <div
                      className="flex items-center gap-2 cursor-pointer hover:opacity-80"
                      onClick={() => openPostModal("video")}
                    >
                      <svg
                        className="w-[28px] h-[24px]"
                        viewBox="0 0 29 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M15.0388 4.49982C17.8647 4.49982 19.832 6.03379 20.0416 8.28415L23.13 7.2019C24.4663 6.73455 25.9243 7.52863 26.0304 8.7353L26.0366 8.87632V15.5153C26.0366 16.7526 24.628 17.6087 23.2842 17.237L23.1295 17.1886L20.0415 16.1062C19.8315 18.3551 17.8602 19.8908 15.0388 19.8908H7.72495C4.73232 19.8908 2.70361 18.1717 2.70361 15.7028V8.68782C2.70361 6.21891 4.73232 4.49982 7.72495 4.49982H15.0388ZM15.0388 5.99982H7.72495C5.69436 5.99982 4.45361 7.0512 4.45361 8.68782V15.7028C4.45361 17.3394 5.69436 18.3908 7.72495 18.3908H15.0388C17.0644 18.3908 18.3101 17.3367 18.3101 15.7028L18.3099 15.0173C18.3095 15.0066 18.3094 14.9959 18.3096 14.9852L18.3101 8.68782C18.3101 7.0516 17.0686 5.99982 15.0388 5.99982ZM23.8708 8.57141L23.7916 8.59056L20.0601 9.89682V14.4928L23.7912 15.7999C24.0018 15.8736 24.2294 15.7642 24.2774 15.5854L24.2866 15.5153V8.87632C24.2866 8.68152 24.082 8.54203 23.8708 8.57141Z"
                          fill="white"
                        />
                      </svg>
                      <span className="text-white font-poppins text-[16px]">
                        Video
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <svg
                        className="w-[27px] h-[24px]"
                        viewBox="0 0 28 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M17.9477 2C18.342 2 18.6679 2.26247 18.7195 2.603L18.7266 2.69767L18.7266 3.48626C21.9251 3.68121 23.8836 5.51888 23.8735 8.48579V16.9744C23.8735 20.1193 21.6745 22 18.1401 22H9.35682C5.82667 22 3.62354 20.0872 3.62354 16.9041V8.48579C3.62354 5.51995 5.58836 3.68177 8.77991 3.48635L8.78 2.69767C8.78 2.31236 9.1287 2 9.55885 2C9.95314 2 10.279 2.26247 10.3306 2.603L10.3377 2.69767L10.3375 3.469H17.1685L17.1689 2.69767C17.1689 2.31236 17.5176 2 17.9477 2ZM22.3154 10.283H5.18054L5.18122 16.9041C5.18122 19.2292 6.58134 20.5198 9.10112 20.6006L9.35682 20.6047H18.1401C20.8299 20.6047 22.3158 19.3338 22.3158 16.9744L22.3154 10.283ZM18.371 16.136C18.8012 16.136 19.1499 16.4484 19.1499 16.8337C19.1499 17.1869 18.8569 17.4788 18.4767 17.525L18.371 17.5314C17.9313 17.5314 17.5826 17.219 17.5826 16.8337C17.5826 16.4805 17.8756 16.1886 18.2557 16.1424L18.371 16.136ZM13.7629 16.136C14.1931 16.136 14.5418 16.4484 14.5418 16.8337C14.5418 17.1869 14.2487 17.4788 13.8686 17.525L13.7629 17.5314C13.3231 17.5314 12.9744 17.219 12.9744 16.8337C12.9744 16.4805 13.2674 16.1886 13.6476 16.1424L13.7629 16.136ZM9.14518 16.136C9.57532 16.136 9.92402 16.4484 9.92402 16.8337C9.92402 17.1869 9.63101 17.4788 9.25086 17.525L9.13555 17.5314C8.70541 17.5314 8.35671 17.219 8.35671 16.8337C8.35671 16.4805 8.64972 16.1886 9.02987 16.1424L9.14518 16.136ZM18.371 12.5206C18.8012 12.5206 19.1499 12.833 19.1499 13.2183C19.1499 13.5715 18.8569 13.8634 18.4767 13.9096L18.371 13.916C17.9313 13.916 17.5826 13.6036 17.5826 13.2183C17.5826 12.8651 17.8756 12.5732 18.2557 12.527L18.371 12.5206ZM13.7629 12.5206C14.1931 12.5206 14.5418 12.833 14.5418 13.2183C14.5418 13.5715 14.2487 13.8634 13.8686 13.9096L13.7629 13.916C13.3231 13.916 12.9744 13.6036 12.9744 13.2183C12.9744 12.8651 13.2674 12.5732 13.6476 12.527L13.7629 12.5206ZM9.14518 12.5206C9.57532 12.5206 9.92402 12.833 9.92402 13.2183C9.92402 13.5715 9.63101 13.8634 9.25086 13.9096L9.13555 13.916C8.70541 13.916 8.35671 13.6036 8.35671 13.2183C8.35671 12.8651 8.64972 16.1886 9.02987 12.527L9.14518 12.5206ZM17.1685 4.864H10.3375L10.3377 5.75887C10.3377 6.14418 9.98899 6.45654 9.55885 6.45654C9.16455 6.45654 8.83869 6.19407 8.78711 5.85354L8.78 5.75887L8.7789 4.88521C6.45729 5.05837 5.18122 6.3066 5.18122 8.48579L5.18054 8.887H22.3154L22.3158 8.48365C22.3232 6.30275 21.0537 5.05711 18.7266 4.88499L18.7266 5.75887C18.7266 6.14418 18.3779 6.45654 17.9477 6.45654C17.5534 6.45654 17.2276 6.19407 17.176 5.85354L17.1689 5.75887L17.1685 4.864Z"
                          fill="white"
                        />
                      </svg>
                      <span className="text-white font-poppins text-[16px]">
                        Event
                      </span>
                    </div>


                    <div className="flex items-center gap-2">
                      <svg
                        className="w-[30px] h-[24px]"
                        viewBox="0 0 31 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M20.2081 2C24.2031 2 26.5919 3.92 26.6294 7.132V16.791C26.6294 20.048 24.2344 22 20.2081 22H10.5519C10.0369 22 9.54814 21.968 9.08814 21.905L8.81564 21.864C5.85189 21.371 4.12939 19.555 4.12939 16.791V7.209C4.12939 6.875 4.15439 6.555 4.20439 6.249C4.64064 3.564 6.94689 2 10.5519 2H20.2081ZM20.1969 3.457H10.5519C7.48189 3.457 5.92564 4.72 5.92564 7.209V16.791C5.92564 19.28 7.48189 20.543 10.5519 20.543H20.1969C23.2656 20.543 24.8119 19.28 24.8119 16.791V7.209C24.8119 4.72 23.2656 3.457 20.1969 3.457ZM19.8706 15.51C20.3631 15.51 20.7619 15.834 20.7619 16.234C20.7619 16.634 20.3631 16.958 19.8706 16.958H10.8569C10.3644 16.958 9.96439 16.634 9.96439 16.234C9.96439 15.834 10.3644 15.51 10.8569 15.51H19.8706ZM19.8706 11.271C20.2144 11.241 20.5506 11.373 20.7344 11.61C20.9181 11.849 20.9181 12.151 20.7344 12.39C20.5506 12.627 20.2144 12.759 19.8706 12.729H10.8569C10.3994 12.687 10.0531 12.374 10.0531 12C10.0531 11.626 10.3994 11.312 10.8569 11.271H19.8706ZM14.2969 7.042C14.7544 7.083 15.1006 7.397 15.1006 7.771C15.1006 8.144 14.7544 8.458 14.2969 8.499H10.8681C10.4094 8.458 10.0631 8.144 10.0631 7.771C10.0631 7.397 10.4094 7.083 10.8681 7.042H14.2969Z"
                          fill="white"
                        />
                      </svg>
                      <span className="text-white font-poppins text-[16px]">
                        Article
                      </span>
                    </div>
                  </div>


                  <svg
                    className="w-[24px] h-[24px]"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M10.8049 14.8178L14.4619 20.7508C14.6219 21.0108 14.8719 21.0078 14.9729 20.9938C15.0739 20.9798 15.3169 20.9178 15.4049 20.6228L19.9779 5.17777C20.0579 4.90477 19.9109 4.71877 19.8449 4.65277C19.7809 4.58677 19.5979 4.44577 19.3329 4.52077L3.87694 9.04677C3.58394 9.13277 3.51994 9.37877 3.50594 9.47977C3.49194 9.58277 3.48794 9.83777 3.74694 10.0008L9.74794 13.7538L15.0499 8.39577C15.3409 8.10177 15.8159 8.09877 16.1109 8.38977C16.4059 8.68077 16.4079 9.15677 16.1169 9.45077L10.8049 14.8178ZM14.8949 22.4998C14.1989 22.4998 13.5609 22.1458 13.1849 21.5378L9.30794 15.2468L2.95194 11.2718C2.26694 10.8428 1.90894 10.0788 2.01994 9.27577C2.12994 8.47277 2.68094 7.83477 3.45494 7.60777L18.9109 3.08177C19.6219 2.87377 20.3839 3.07077 20.9079 3.59277C21.4319 4.11977 21.6269 4.88977 21.4149 5.60377L16.8419 21.0478C16.6129 21.8248 15.9729 22.3738 15.1719 22.4808C15.0779 22.4928 14.9869 22.4998 14.8949 22.4998Z"
                      fill="white"
                    />
                  </svg>
                </div>
              </div>*/}

              {/* Posts List */}
              {loadingPosts ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading posts...</p>
                </div>
              ) : exhibitionPosts.length > 0 ? (
                exhibitionPosts.map((post) => (
                  <div
                  key={post.postId}
                  className="w-full bg-white rounded-[16px] lg:rounded-[18px] shadow-sm border border-gray-100"
                >
                  <div className="p-3 lg:p-4">
                      {/* Post Header */}
                    <div className="flex items-center justify-between mb-3 lg:mb-4">
                      <div className="flex items-center gap-2 lg:gap-3">
                        <img
                          src={
                            post.postedByProfileImage ||
                            "https://api.builder.io/api/v1/image/assets/TEMP/d064c0d047315af10f082e5ddd186ed5e3ba3001?width=80"
                          }
                          alt={post.postedBy}
                          className="w-9 h-9 lg:w-11 lg:h-11 rounded-full object-cover"
                        />
                        <div>
                          <div className="text-black font-poppins text-[13px] lg:text-[14px] font-medium">
                            {post.postedBy}
                          </div>
                          <div className="text-black/46 font-poppins text-[11px] lg:text-[12px]">
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
                      <div className="text-black font-poppins text-[13px] lg:text-[14px] mb-3 lg:mb-4">
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
                            className="w-full h-[200px] lg:h-[307px] rounded-[14px] lg:rounded-[18px] object-cover mb-3 lg:mb-4"
                          />
                        )}
                        {post.postType === "video" && (
                          <video
                            src={post.postAssetUrl}
                            controls
                            className="w-full h-[200px] lg:h-[307px] rounded-[14px] lg:rounded-[18px] object-cover mb-3 lg:mb-4"
                          />
                        )}
                      </>
                    )}

                      {/* Post Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 lg:gap-8">
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
                    <div className="mt-3 lg:mt-4 bg-[#F6F6F6] rounded-[16px] lg:rounded-[18px] p-2 lg:p-3 flex items-center gap-2 lg:gap-3">
                      <img
                        src={
                          userData?.profilePictureUrl ||
                          userData?.companyLogoUrl ||
                          user?.photoURL ||
                          "https://api.builder.io/api/v1/image/assets/TEMP/ad33659c33381eac40061641b81f19d65a13ad9f?width=78"
                        }
                        alt="Profile"
                        className="w-[22px] h-[22px] lg:w-[26px] lg:h-[26px] rounded-full object-cover"
                      />
                      <input
                        type="text"
                        placeholder="Write a comment"
                        className="flex-1 text-black/36 font-roboto text-[10px] lg:text-[11px] bg-transparent outline-none placeholder-black/36"
                      />
                    </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full bg-white rounded-[16px] shadow-sm border border-gray-100 p-6 text-center">
                  <p className="text-gray-500">
                    No posts available for this exhibition.
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === "exhibitor-catalogue" && (
            <div className="w-full bg-white rounded-[16px] shadow-sm border border-gray-100 p-6">
              {/* PDF Document List */}
              <div className="space-y-4">
                {currentExhibitionData?.brochures &&
                currentExhibitionData.brochures.length > 0 ? (
                  currentExhibitionData.brochures.map((brochureUrl, index) => {
                    // Extract filename from URL
                    const filename =
                      brochureUrl.split("/").pop()?.split("?")[0] ||
                      `brochure-${index + 1}.pdf`;
                    const displayName = decodeURIComponent(filename);

                    return (
                      <div key={index} className="flex items-center gap-4 p-3">
                        {/* PDF Icon */}
                        <svg
                          className="w-12 h-12 flex-shrink-0"
                          viewBox="0 0 48 48"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M15.584 42.5H32.416C34.2725 42.5 36.053 41.7625 37.3657 40.4497C38.6785 39.137 39.416 37.3565 39.416 35.5V24.44C39.4166 22.5837 38.68 20.8032 37.368 19.49L25.43 7.55C24.7799 6.90001 24.0082 6.38442 23.1589 6.03268C22.3096 5.68094 21.3993 5.49993 20.48 5.5H15.584C13.7275 5.5 11.947 6.2375 10.6342 7.55025C9.32148 8.86301 8.58398 10.6435 8.58398 12.5V35.5C8.58398 37.3565 9.32148 39.137 10.6342 40.4497C11.947 41.7625 13.7275 42.5 15.584 42.5Z"
                            stroke="#10B981"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M23.376 6.21997V17.54C23.376 18.6008 23.7974 19.6183 24.5476 20.3684C25.2977 21.1185 26.3151 21.54 27.376 21.54H38.7"
                            stroke="#10B981"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M14.5 33V31M14.5 31V27H16.5C17.0304 27 17.5391 27.2107 17.9142 27.5858C18.2893 27.9609 18.5 28.4696 18.5 29C18.5 29.5304 18.2893 30.0391 17.9142 30.4142C17.5391 30.7893 17.0304 31 16.5 31H14.5ZM30.5 33V30.5M30.5 30.5V27H33.5M30.5 30.5H33.5M22.5 33V27H23.5C24.2956 27 25.0587 27.3161 25.6213 27.8787C26.1839 28.4413 26.5 29.2044 26.5 30C26.5 30.7956 26.1839 31.5587 25.6213 32.1213C25.0587 32.6839 24.2956 33 23.5 33H22.5Z"
                            stroke="#10B981"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>

                        {/* Document Info */}
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <h3 className="text-[#1D2026] font-inter text-[14px] font-medium leading-[20px] tracking-[-0.14px]">
                              {displayName}
                            </h3>
                            <a
                              href={brochureUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center px-3 py-2 rounded-lg bg-[#10B981] border border-[#10B981] min-w-[101px] h-8 hover:bg-[#0ea574] transition-colors"
                            >
                              <span className="text-white font-poppins text-[12px] font-medium">
                                Download
                              </span>
                            </a>
                          </div>
                          <p className="text-[#6E7485] font-inter text-[14px] leading-[22px] tracking-[-0.14px]">
                            PDF Document
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <p>No brochures available for this exhibition.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "members" && (
            <div className="w-full bg-white rounded-[16px] shadow-sm border border-gray-100">
              <div className="p-4 lg:p-6">
                <h2 className="text-[#212121] font-poppins text-[18px] lg:text-[20px] font-semibold mb-4 lg:mb-6">
                  Exhibition Members
                </h2>

                {/* Members List */}
                <div className="space-y-4">
                  {currentExhibitionData?.joined_profile &&
                   Object.keys(currentExhibitionData.joined_profile).length > 0 ? (
                    Object.entries(currentExhibitionData.joined_profile).map(([key, profile]) => (
                      <MemberCard
                        key={profile.id}
                        userId={profile.id}
                        profile={profile}
                        currentUserId={user?.uid}
                      />
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <p>No users joined</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="w-full bg-white rounded-[16px] shadow-sm border border-gray-100 p-6 text-center text-gray-500">
              <p>
                Content for {activeTab.replace("-", " ")} tab coming soon...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Post Creation Modal */}
      <PostCreationModal
        isOpen={isPostModalOpen}
        onClose={closePostModal}
        mode={postModalMode}
        exhibitionId={exhibitionData?.exhibition_id}
        postedByType="exhibition"
      />

      {/* Join Modal */}
      <JoinModal
        isOpen={isJoinModalOpen}
        onClose={closeJoinModal}
        userProfileType={userData?.profileType || "visitor"}
        exhibitionData={exhibitionData}
      />
    </div>
  );
}
