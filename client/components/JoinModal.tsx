import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/use-toast";

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfileType: string;
  exhibitionData?: any;
}

interface Industry {
  id: string;
  name: string;
}

export default function JoinModal({
  isOpen,
  onClose,
  userProfileType,
  exhibitionData,
}: JoinModalProps) {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<string>("");
  const [hallNumber, setHallNumber] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (
      isOpen &&
      (userProfileType === "visitor" || userProfileType === "exhibitor")
    ) {
      fetchIndustries();
    }
  }, [isOpen, userProfileType]);

  const fetchIndustries = async () => {
    try {
      setLoading(true);
      const industriesCollection = collection(db, "industries");
      const industriesSnapshot = await getDocs(industriesCollection);
      const industriesData: Industry[] = [];

      industriesSnapshot.forEach((doc) => {
        industriesData.push({
          id: doc.id,
          name: doc.data().name || doc.id,
        });
      });

      setIndustries(industriesData);
    } catch (error) {
      console.error("Error fetching industries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!user || !exhibitionData?.exhibition_id) {
      toast({
        title: "Error",
        description: "Unable to join exhibition. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (userProfileType === "visitor" && !selectedIndustry) {
      toast({
        title: "Industry Required",
        description: "Please select your preferred industry.",
        variant: "destructive",
      });
      return;
    }

    if (userProfileType === "exhibitor" && (!selectedIndustry || !hallNumber)) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setJoining(true);

    try {
      // Get current user data
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        throw new Error("User data not found");
      }

      const userData = userDoc.data();
      const userCompanyLogoUrl =
        userData.companyLogoUrl || userData.profilePictureUrl || "";
      const userBrochureUrl = userData.brochureUrl || "";

      // 1. Update exhibition's joined_profile field
      const exhibitionDocRef = doc(
        db,
        "exhibitions",
        exhibitionData.exhibition_id,
      );

      // Create the joined profile object
      const joinedProfileUpdate = {
        [`joined_profile.${user.uid}`]: {
          id: user.uid,
          url: userCompanyLogoUrl,
        },
      };

      // Prepare exhibition updates
      const exhibitionUpdates: any = joinedProfileUpdate;

      // 2. Add brochure to exhibition if user has one
      if (userBrochureUrl) {
        exhibitionUpdates.brochures = arrayUnion(userBrochureUrl);
      }

      // Update exhibition document
      await updateDoc(exhibitionDocRef, exhibitionUpdates);

      // 3. Add exhibition to user's joinedExhibitions and selected industry to interests
      const userUpdates: any = {
        joinedExhibitions: arrayUnion(exhibitionData.exhibition_id),
      };

      // Add selected industry to interests array if selected
      if (selectedIndustry) {
        userUpdates.interests = arrayUnion(selectedIndustry);
      }

      await updateDoc(userDocRef, userUpdates);

      // 4. Show success toast
      toast({
        title: "Successfully Joined!",
        description: `You have successfully joined ${exhibitionData.exhibition_name || exhibitionData.name}.`,
      });

      onClose();
    } catch (error) {
      console.error("Error joining exhibition:", error);
      toast({
        title: "Join Failed",
        description: "Failed to join exhibition. Please try again.",
        variant: "destructive",
      });
    } finally {
      setJoining(false);
    }
  };

  const handleClose = () => {
    setSelectedIndustry("");
    setHallNumber("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[24px] w-full max-w-[500px] mx-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-[20px] font-semibold text-[#212121] font-poppins">
            Join Exhibition
          </h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="#666"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {exhibitionData && (
            <div className="mb-6">
              <p className="text-[16px] text-[#666] font-poppins mb-2">
                You are about to join:
              </p>
              <p className="text-[18px] font-semibold text-[#10B981] font-poppins">
                {exhibitionData.name}
              </p>
            </div>
          )}

          {(userProfileType === "visitor" ||
            userProfileType === "exhibitor") && (
            <div className="space-y-6">
              {/* Industry Selection */}
              <div>
                <label className="block text-[14px] font-medium text-[#212121] font-poppins mb-3">
                  Select preferred industry *
                </label>

                {loading ? (
                  <div className="w-full p-4 border border-gray-200 rounded-[12px] bg-gray-50">
                    <div className="animate-pulse flex items-center">
                      <div className="h-4 bg-gray-300 rounded w-32"></div>
                    </div>
                  </div>
                ) : (
                  <select
                    value={selectedIndustry}
                    onChange={(e) => setSelectedIndustry(e.target.value)}
                    className="w-full p-4 border border-gray-200 rounded-[12px] font-poppins text-[14px] text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                    required
                  >
                    <option value="">Choose an industry</option>
                    {industries.map((industry) => (
                      <option key={industry.id} value={industry.id}>
                        {industry.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Hall Number - Only for Exhibitors */}
              {userProfileType === "exhibitor" && (
                <div>
                  <label className="block text-[14px] font-medium text-[#212121] font-poppins mb-3">
                    Hall Number *
                  </label>
                  <input
                    type="text"
                    value={hallNumber}
                    onChange={(e) => setHallNumber(e.target.value)}
                    placeholder="Enter hall number (e.g., A1, B2, C3)"
                    className="w-full p-4 border border-gray-200 rounded-[12px] font-poppins text-[14px] text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                    required
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-100">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-3 border border-[#10B981] text-[#10B981] rounded-[12px] font-poppins text-[14px] font-medium hover:bg-[#10B981]/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleJoin}
            disabled={
              (userProfileType === "visitor" && !selectedIndustry) ||
              (userProfileType === "exhibitor" &&
                (!selectedIndustry || !hallNumber)) ||
              joining
            }
            className="flex-1 px-4 py-3 bg-[#10B981] text-white rounded-[12px] font-poppins text-[14px] font-medium hover:bg-[#0ea574] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {joining && (
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {joining ? "Joining..." : "Join Exhibition"}
          </button>
        </div>
      </div>
    </div>
  );
}
