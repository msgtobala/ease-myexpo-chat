import React, { useState, useEffect } from 'react';
import { useToast } from "../hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../contexts/AuthContext";
import { doc, getDoc, collection, query, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Exhibition {
  exhibition_id: string;
  exhibition_name: string;
  exhibition_description: string;
  exhibition_location: string;
  brochures: string[];
  posts: string[];
  exhibition_image_url: string;
  joined_profile: Record<string, string>;
  handle_id: string;
  exhibition_industry_type: string;
  exhibition_skills: string[];
  exhibition_website_url: string;
  exhibition_event_attending: string[];
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeItem?: string;
  onItemClick?: (item: string) => void;
}

export default function MobileMenu({ isOpen, onClose, activeItem = 'discussions', onItemClick }: MobileMenuProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loadingExhibitions, setLoadingExhibitions] = useState(true);

  // Fetch exhibitions from Firebase
  useEffect(() => {
    const exhibitionsQuery = query(collection(db, "exhibitions"), limit(3));

    const unsubscribe = onSnapshot(
      exhibitionsQuery,
      (snapshot) => {
        const exhibitionsData: Exhibition[] = [];
        snapshot.forEach((doc) => {
          exhibitionsData.push({ ...doc.data() } as Exhibition);
        });
        setExhibitions(exhibitionsData);
        setLoadingExhibitions(false);
      },
      (error) => {
        console.error("Error fetching exhibitions:", error);
        setLoadingExhibitions(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const handleItemClick = async (item: string) => {
    if (onItemClick) {
      onItemClick(item);
    }

    // Navigate to appropriate route
    switch (item) {
      case "discussions":
        navigate("/home");
        break;
      case "smart-match":
        navigate("/smart-match");
        break;
      case "popular":
      case "communities":
        // Show coming soon toast
        toast({
          title: "Coming Soon",
          description: "This feature will be available soon!",
          duration: 3000,
        });
        break;
      case "settings":
        // Fetch user data and navigate to appropriate profile
        if (user) {
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              if (userData.profileType === "visitor") {
                navigate("/visitor/profile", { state: { userData } });
              } else if (userData.profileType === "exhibitor") {
                navigate("/exhibitor/profile", { state: { userData } });
              }
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
            toast({
              title: "Error",
              description: "Could not load profile. Please try again.",
              duration: 3000,
            });
          }
        }
        break;
    }

    onClose(); // Close menu after selection
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const handleExhibitionClick = (exhibition: Exhibition) => {
    navigate("/exhibitions/profile", {
      state: { exhibitionData: exhibition },
    });
    onClose(); // Close menu after navigation
  };

  const handleJoinClick = () => {
    toast({
      title: "Coming Soon",
      description: "This feature will be available soon!",
      duration: 3000,
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[90] lg:hidden"
        onClick={onClose}
      />

      {/* Mobile Menu Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-[280px] bg-white z-[100] transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>

        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center">
            <svg width="24" height="28" viewBox="0 0 32 37" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M24.7964 5.98933C25.8206 6.80905 26.4528 7.79026 26.6575 9.09109C26.9088 12.2791 25.6558 15.0085 23.7108 17.4659C23.5372 17.6869 23.5372 17.6869 23.3601 17.9123C22.2067 19.3516 20.9659 20.5064 19.5234 21.6532C19.3735 21.7766 19.2236 21.8999 19.0691 22.027C16.4388 24.1386 12.4606 26.7248 8.97744 26.6161C8.85388 23.5637 8.85388 23.5637 9.44271 22.4287C9.86536 22.1283 10.2566 21.9895 10.7501 21.8314C11.3712 21.6316 11.9335 21.3736 12.5154 21.0814C12.672 21.0028 12.672 21.0028 12.8319 20.9227C14.6451 19.9909 16.2794 18.7993 17.8175 17.4659C17.9592 17.3467 18.101 17.2276 18.247 17.1048C20.1032 15.4952 22.0164 13.2401 22.3968 10.7207C22.4015 10.318 22.3935 9.95108 22.315 9.55636C22.0721 9.3134 21.839 9.35729 21.5008 9.34311C19.0575 9.38134 16.8453 11.1653 15.181 12.8132C14.8996 13.1156 14.6289 13.4234 14.3631 13.7395C14.1872 13.9461 14.0054 14.148 13.8179 14.3441C10.8711 17.4546 8.54812 21.8006 8.62425 26.1375C8.66453 27.0228 8.90675 27.6096 9.51419 28.2512C10.5866 29.2229 12.0569 29.0209 13.4161 28.9681C16.9221 28.7236 20.5535 26.1555 23.0952 23.8848C23.4595 23.5599 23.7061 23.3608 24.1761 23.2041C24.1761 23.0506 24.1761 22.8971 24.1761 22.7389C24.0929 22.7037 24.0098 22.6685 23.9241 22.6322C23.424 22.3559 23.0445 22.0439 22.6252 21.6532C22.6252 21.4997 22.6252 21.3462 22.6252 21.188C22.7824 21.1434 22.9395 21.0987 23.1014 21.0528C24.7946 20.5665 26.4586 20.015 28.1211 19.4335C28.4873 19.3057 28.8535 19.178 29.22 19.0509C29.445 18.9729 29.6699 18.8944 29.8947 18.8153C30.6549 18.5515 30.6549 18.5515 31 18.5515C30.8952 19.7453 30.6579 20.8913 30.399 22.0604C30.3147 22.4468 30.2305 22.8333 30.1464 23.2199C30.1062 23.4043 30.066 23.5886 30.0245 23.7786C29.851 24.5836 29.6906 25.3909 29.5333 26.1993C29.4628 26.5483 29.3842 26.8921 29.294 27.2364C28.7097 27.0117 28.3848 26.6366 27.9854 26.1732C27.753 25.9641 27.753 25.9641 27.4451 26.009C27.0338 26.1899 26.7865 26.4288 26.4636 26.7421C22.1798 30.6988 16.7208 33.5319 10.8193 33.3145C9.10593 33.2007 7.5018..." fill="#10B981" />
              <path d="M3.7045 13.1234C3.80686 13.1746 3.90922 13.2258 4.01468 13.2785C4.01468 13.3809 4.01468 13.4832 4.01468 13.5887C4.10744 13.6239 4.2002 13.6591 4.29578 13.6953C4.7447 13.9647 4.88788 14.1964 5.1003 14.6743C5.14695 15.4324 5.05024 15.9823 4.79012 16.6904C4.42373 17.8806 4.43511 19.0064 4.4757 20.2445C4.50032 21.1031 4.42309 21.7559 4.16977 22.5838C4.08963 23.1733 4.04236 23.7647 3.99529 24.3576C3.9819 24.5155 3.9685 24.6733 3.9547 24.8359C3.92204 25.2225 3.89036 25.609 3.85959 25.9957C2.44892 25.4921 1.41588 24.3041 0.723294 23.003C-0.300258 20.8165 -0.134404 17.879 0.580928 15.6121C0.915268 14.719 1.23437 13.8948 1.99853 13.2785C2.60208 13.0773 3.06775 13.1032 3.7045 13.1234Z" fill="#10B981" />
            </svg>
            <span className="ml-2 text-[16px] font-normal text-[#10B981]" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
              Easemyexpo
            </span>
          </div>
          <button onClick={onClose} className="p-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 6L18 18" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Navigation Items */}
          <div className="flex flex-col p-4 space-y-4">
            {/* Discussions */}
            <div
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${activeItem === 'discussions' ? 'bg-[#F0FDF4]' : 'hover:bg-gray-50'
                }`}
              onClick={() => handleItemClick('discussions')}
            >
              <svg width="20" height="20" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.3027 8.511C21.1867 8.795 21.8027 9.639 21.8027 10.608V14.894C21.8027 16.03 20.9557 16.994 19.8227 17.087C19.4827 17.114 19.1427 17.139 18.8027 17.159V20.25L15.8027 17.25C14.4487 17.25 13.1087 17.195 11.7827 17.087C11.4941 17.0637 11.2133 16.9813 10.9577 16.845M20.3027 8.511C20.1482 8.46127 19.9885 8.42939 19.8267 8.416C17.1487 8.19368 14.4568 8.19368 11.7787 8.416C10.6477 8.51 9.80273 9.473 9.80273 10.608V14.894C9.80273 15.731 10.2627 16.474 10.9577 16.845M20.3027 8.511V6.637C20.3027 5.016 19.1507 3.611 17.5427 3.402C15.4736 3.13379 13.3892 2.99951 11.3027 3C9.18773 3 7.10473 3.137 5.06273 3.402C3.45473 3.611 2.30273 5.016 2.30273 6.637V12.863C2.30273 14.484 3.45473 15.889 5.06273 16.098C5.63973 16.173 6.21973 16.238 6.80273 16.292V21L10.9577 16.845" stroke={activeItem === 'discussions' ? '#10B981' : '#666666'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className={`text-[16px] font-normal ${activeItem === 'discussions' ? 'text-[#10B981]' : 'text-[#666666]'}`}>Discussions</span>
            </div>

            {/* Smart Match */}
            <div
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${activeItem === 'smart-match' ? 'bg-[#F0FDF4]' : 'hover:bg-gray-50'
                }`}
              onClick={() => handleItemClick('smart-match')}
            >
              <svg width="18" height="18" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.99525 14.5787L8.25 17.1875L7.50475 14.5787C7.31213 13.9048 6.95099 13.2911 6.4554 12.7955C5.95982 12.2999 5.34613 11.9388 4.67225 11.7462L2.0625 11L4.67133 10.2548C5.34521 10.0621 5.9589 9.70099 6.45449 9.2054C6.95007 8.70982 7.31122 8.09613 7.50383 7.42225L8.25 4.8125L8.99525 7.42133C9.18787 8.09521 9.54901 8.7089 10.0446 9.20449C10.5402 9.70007 11.1539 10.0612 11.8278 10.2538L14.4375 11L11.8287 11.7452C11.1548 11.9379 10.5411 12.299 10.0455 12.7946C9.54993 13.2902 9.18878 13.9039 8.99617 14.5778L8.99525 14.5787ZM16.7374 7.98875L16.5 8.9375L16.2626 7.98875C16.1267 7.44479 15.8455 6.94799 15.4491 6.55144C15.0528 6.1549 14.5561 5.87353 14.0122 5.73742L13.0625 5.5L14.0122 5.26258C14.5561 5.12647 15.0528 4.8451 15.4491 4.44856C15.8455 4.05201 16.1267 3.55521 16.2626 3.01125L16.5 2.0625L16.7374 3.01125C16.8734 3.55532 17.1547 4.05221 17.5512 4.44876C17.9478 4.84531 18.4447 5.12661 18.9888 5.26258L19.9375 5.5L18.9888 5.73742C18.4447 5.87339 17.9478 6.15469 17.5512 6.55124C17.1547 6.94779 16.8734 7.44468 16.7374 7.98875ZM15.4862 18.8531L15.125 19.9375L14.7638 18.8531C14.6626 18.5493 14.492 18.2733 14.2656 18.0469C14.0392 17.8205 13.7632 17.6499 13.4594 17.5487L12.375 17.1875L13.4594 16.8263C13.7632 16.7251 14.0392 16.5545 14.2656 16.3281C14.492 16.1017 14.6626 15.8257 14.7638 15.5219L15.125 14.4375L15.4862 15.5219C15.5874 15.8257 15.758 16.1017 15.9844 16.3281C16.2108 16.5545 16.4868 16.7251 16.7906 16.8263L17.875 17.1875L16.7906 17.5487C16.4868 17.6499 16.2108 17.8205 15.9844 18.0469C15.758 18.2733 15.5874 18.5493 15.4862 18.8531Z" stroke={activeItem === 'smart-match' ? '#10B981' : '#666666'} strokeWidth="1.375" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className={`text-[16px] font-normal ${activeItem === 'smart-match' ? 'text-[#10B981]' : 'text-[#666666]'}`}>Smart Match</span>
            </div>

            {/* Popular */}
            <div
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${activeItem === 'popular' ? 'bg-[#F0FDF4]' : 'hover:bg-gray-50'
                }`}
              onClick={() => handleItemClick('popular')}
            >
              <svg width="18" height="20" viewBox="0 0 22 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.30273 18L9.05273 11.25L13.3587 15.556C14.6037 13.1022 16.6573 11.1531 19.1727 10.038L21.9127 8.818M21.9127 8.818L15.9727 6.537M21.9127 8.818L19.6327 14.758" stroke={activeItem === 'popular' ? '#10B981' : '#666666'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className={`text-[16px] font-normal ${activeItem === 'popular' ? 'text-[#10B981]' : 'text-[#666666]'}`}>Popular</span>
            </div>

            {/* Communities */}
            <div
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${activeItem === 'communities' ? 'bg-[#F0FDF4]' : 'hover:bg-gray-50'
                }`}
              onClick={() => handleItemClick('communities')}
            >
              <svg width="18" height="20" viewBox="0 0 22 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.1117 15.521C17.5795 15.2015 18.1282 15.0211 18.6943 15.0004C19.2604 14.9798 19.8207 15.1199 20.3106 15.4044C20.8004 15.689 21.1996 16.1064 21.4621 16.6084C21.7245 17.1104 21.8395 17.6764 21.7937 18.241C20.5939 18.6603 19.3195 18.8235 18.0527 18.72C18.0488 17.5866 17.7225 16.4768 17.1117 15.522C16.5696 14.6718 15.8219 13.972 14.9376 13.4875C14.0533 13.003 13.0611 12.7493 12.0527 12.75C11.0446 12.7495 10.0526 13.0032 9.16846 13.4877C8.28437 13.9723 7.53674 14.6719 6.99473 15.522M18.0517 18.719L18.0527 18.75C18.0527 18.975 18.0407 19.197 18.0157 19.416C16.2011 20.4571 14.1448 21.0033 12.0527 21C9.88273 21 7.84574 20.424 6.08974 19.416C6.06403 19.1846 6.05167 18.9519 6.05273 18.719M6.05273 18.719C4.78636 18.8263 3.51264 18.6637 2.31373 18.242C2.26809 17.6776 2.38313 17.1117 2.64556 16.6099C2.908 16.1081 3.3071 15.6908 3.79674 15.4063C4.28637 15.1218 4.84653 14.9817 5.41245 15.0021C5.97838 15.0226 6.52695 15.2028 6.99473 15.522M6.05273 18.719C6.05633 17.5857 6.38436 16.4769 6.99473 15.522M15.0527 6.75C15.0527 7.54565 14.7367 8.30871 14.1741 8.87132C13.6114 9.43393 12.8484 9.75 12.0527 9.75C11.2571 9.75 10.494 9.43393 9.93141 8.87132C9.3688 8.30871 9.05273 7.54565 9.05273 6.75C9.05273 5.95435 9.3688 5.19129 9.93141 4.62868C10.494 4.06607 11.2571 3.75 12.0527 3.75C12.8484 3.75 13.6114 4.06607 14.1741 4.62868C14.7367 5.19129 15.0527 5.95435 15.0527 6.75ZM21.0527 9.75C21.0527 10.0455 20.9945 10.3381 20.8815 10.611C20.7684 10.884 20.6027 11.1321 20.3937 11.341C20.1848 11.5499 19.9368 11.7157 19.6638 11.8287C19.3908 11.9418 19.0982 12 18.8027 12C18.5073 12 18.2147 11.9418 17.9417 11.8287C17.6687 11.7157 17.4207 11.5499 17.2117 11.341C17.0028 11.1321 16.8371 10.884 16.724 10.611C16.6109 10.3381 16.5527 10.0455 16.5527 9.75C16.5527 9.15326 16.7898 8.58097 17.2117 8.15901C17.6337 7.73705 18.206 7.5 18.8027 7.5C19.3995 7.5 19.9718 7.73705 20.3937 8.15901C20.8157 8.58097 21.0527 9.15326 21.0527 9.75ZM7.55273 9.75C7.55273 10.0455 7.49454 10.3381 7.38146 10.6..." fill="#666666" />
              </svg>
              <span className={`text-[16px] font-normal ${activeItem === 'communities' ? 'text-[#10B981]' : 'text-[#666666]'}`}>Communities</span>
            </div>

            {/* Settings */}
            <div
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${activeItem === 'settings' ? 'bg-[#F0FDF4]' : 'hover:bg-gray-50'
                }`}
              onClick={() => handleItemClick('settings')}
            >
              <svg width="18" height="19" viewBox="0 0 22 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.5648 1.91666C12.2147 1.91638 12.8371 2.18558 13.2901 2.66292C13.7431 3.14026 13.9882 3.7851 13.9685 4.38691L13.9763 4.52845C13.9921 4.66783 14.0364 4.80235 14.1082 4.92635C14.2482 5.17084 14.4774 5.34827 14.7452 5.4195C15.013 5.49073 15.2975 5.44991 15.567 5.28844L15.7171 5.20901C16.8446 4.66609 18.1969 5.09754 18.8222 6.2093L19.3843 7.20832C19.3991 7.23466 19.4122 7.26187 19.4234 7.28979L19.4756 7.39681C19.9783 8.4958 19.6206 9.80304 18.6656 10.4672L18.4297 10.619C18.3064 10.707 18.2036 10.822 18.1263 10.9602C17.9867 11.2057 17.9484 11.498 18.0198 11.7725C18.0913 12.047 18.2666 12.281 18.5326 12.4385L18.6857 12.5389C19.148 12.8701 19.4819 13.3583 19.6276 13.9179C19.7919 14.5491 19.7038 15.2215 19.3782 15.7937L18.7736 16.8255L18.6824 16.971C17.972 18.0174 16.5926 18.3371 15.54 17.7147L15.4152 17.6489C15.2851 17.5893 15.1447 17.5565 15.0168 17.5529C14.7387 17.5515 14.4716 17.664 14.275 17.8655C14.0784 18.0669 13.9685 18.3404 13.9692 18.6585L13.9618 18.823C13.86 20.0965 12.8191 21.0833 11.565 21.0833H10.4326C9.10452 21.0833 8.02785 19.9805 8.0292 18.6639L8.02142 18.5223C8.0056 18.3829 7.96129 18.2484 7.88581 18.118C7.74891 17.8729 7.52209 17.6939 7.25577 17.6209C6.98945 17.5479 6.70569 17.5869 6.43102 17.7496L6.26782 17.8331C5.75172 18.0708 5.16957 18.1147 4.62409 17.9559C4.00865 17.7768 3.48828 17.3538 3.18462 16.7923L2.6004 15.759L2.52264 15.6059C1.99061 14.4556 2.40764 13.0728 3.46606 12.4463L3.56259 12.3844C3.84534 12.1839 4.01488 11.8534 4.01488 11.5C4.01488 11.1157 3.8147 10.7605 3.46453 10.5527L3.32245 10.4593C2.30085 9.73164 1.98871 8.31879 2.62158 7.19416L3.21675 6.19241C3.87868 5.01568 5.3456 4.60973 6.47383 5.27246L6.59596 5.33915C6.72047 5.39768 6.85571 5.42875 6.98593 5.43018C7.56014 5.43024 8.02795 4.95795 8.03664 4.35256L8.04444 4.16664C8.09146 3.59102 8.33532 3.05008 8.73397 2.63979C9.18373 2.17689 9.79505 1.91666 10.4326 1.91666H11.5648ZM11.565 3.30407H10.4326C10.1554 3.30407 9.88961 3.41722 9.69406 3.61849C9.52074 3.79687 9.4..." fill="#666666" />
              </svg>
              <span className={`text-[16px] font-normal ${activeItem === 'settings' ? 'text-[#10B981]' : 'text-[#666666]'}`}>Settings</span>
            </div>
          </div>

          {/* Community Discussions Section */}
          <div className="mt-6 px-4">
            <h3 className="text-[14px] font-semibold text-black mb-4">Community Discussions</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                <img
                  src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop"
                  alt="Expo BLR"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <p className="text-[12px] font-medium text-black">Expo BLR</p>
                  <p className="text-[10px] text-gray-600">Official bangalore...</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                <img
                  src="https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&auto=format&fit=crop"
                  alt="Expo Delhi"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <p className="text-[12px] font-medium text-black">Expo Delhi</p>
                  <p className="text-[10px] text-gray-600">Join us in delhi expo...</p>
                </div>
              </div>
            </div>
          </div>

          {/* Top exhibitions Section */}
          <div className="mt-6 px-4 pb-4">
            <h3 className="text-[14px] font-semibold text-black mb-4">Top exhibitions</h3>
            <div className="space-y-3">
              {loadingExhibitions ? (
                // Loading skeleton
                [1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 rounded w-20 mb-1 animate-pulse"></div>
                      <div className="h-2 bg-gray-200 rounded w-24 animate-pulse"></div>
                    </div>
                  </div>
                ))
              ) : exhibitions.length > 0 ? (
                // Display real exhibitions from Firebase
                exhibitions.map((exhibition) => (
                  <div
                    key={exhibition.exhibition_id}
                    onClick={() => handleExhibitionClick(exhibition)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <img
                      src={
                        exhibition.exhibition_image_url ||
                        "https://api.builder.io/api/v1/image/assets/TEMP/d064c0d047315af10f082e5ddd186ed5e3ba3001?width=80"
                      }
                      alt={exhibition.exhibition_name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-[12px] font-medium text-black">
                        {truncateText(exhibition.exhibition_name, 20)}
                      </p>
                      <p className="text-[10px] text-gray-600">
                        {truncateText(exhibition.exhibition_description, 30)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                // No exhibitions available
                <div className="text-center text-gray-500 text-[12px] py-4">
                  No exhibitions available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
