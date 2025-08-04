import React, { useState, useEffect } from "react";
import { collection, query, limit, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useNavigate } from "react-router-dom";

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

export default function TopExhibitions() {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Create query to get top 3 exhibitions
    const exhibitionsQuery = query(collection(db, "exhibitions"), limit(3));

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      exhibitionsQuery,
      (snapshot) => {
        const exhibitionsData: Exhibition[] = [];
        snapshot.forEach((doc) => {
          exhibitionsData.push({ ...doc.data() } as Exhibition);
        });
        setExhibitions(exhibitionsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching exhibitions:", error);
        setLoading(false);
      },
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  const getJoinedCount = (joinedProfile: Record<string, string>) => {
    return Object.keys(joinedProfile || {}).length;
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const handleExhibitionClick = (exhibition: Exhibition) => {
    // Navigate to exhibitions profile page with exhibition data
    navigate("/exhibitions/profile", {
      state: { exhibitionData: exhibition },
    });
  };

  if (loading) {
    return (
      <div className="w-full h-[306px] bg-[#FCFDFD] rounded-[16px] p-6">
        <div className="text-[#212121] font-poppins text-[16px] font-medium mb-6">
          Top Exhibitions
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-[39px] h-10 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 mb-1 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
              <div className="w-12 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (exhibitions.length === 0) {
    return (
      <div className="w-full h-[306px] bg-[#FCFDFD] rounded-[16px] p-6">
        <div className="text-[#212121] font-poppins text-[16px] font-medium mb-6">
          Top Exhibitions
        </div>
        <div className="text-center text-gray-500 text-[14px] font-poppins">
          No exhibitions available
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-h-[306px] bg-[#FCFDFD] rounded-[16px] p-6">
      <div className="text-[#212121] font-poppins text-[16px] font-medium mb-6">
        Top Exhibitions
      </div>

      <div className="space-y-4">
        {exhibitions.map((exhibition) => (
          <div
            key={exhibition.exhibition_id}
            className="flex items-center gap-3"
          >
            <img
              src={
                exhibition.exhibition_image_url ||
                "https://api.builder.io/api/v1/image/assets/TEMP/d064c0d047315af10f082e5ddd186ed5e3ba3001?width=80"
              }
              alt={exhibition.exhibition_name}
              className="w-[39px] h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <div
                className="text-[#212121] font-poppins text-[16px] font-medium cursor-pointer hover:text-[#10B981] transition-colors"
                onClick={() => handleExhibitionClick(exhibition)}
              >
                {truncateText(exhibition.exhibition_name, 15)}
              </div>
              <div className="text-[#212121] font-poppins text-[11px] font-light">
                {truncateText(exhibition.exhibition_description, 20)}
              </div>
            </div>
            <button
              onClick={() => handleExhibitionClick(exhibition)}
              className="border border-[#10B981] bg-white text-[#10B981] px-4 py-2 rounded-lg text-[12px] font-medium hover:bg-[#10B981] hover:text-white transition-colors"
            >
              View
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-[#DFDFDF]">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => navigate("/exhibitions/list")}
            className="text-[#10B981] font-poppins text-[12px] hover:underline"
          >
            See All
          </button>
        </div>
      </div>
    </div>
  );
}
