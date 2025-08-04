import React, { useState, useEffect } from "react";
import { collection, query, onSnapshot, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";

interface User {
  id: string;
  displayName: string;
  profilePictureUrl?: string;
  companyLogoUrl?: string;
  profileType: "visitor" | "exhibitor";
  isOnline?: boolean;
}

interface UserSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserSelect: (user: User) => void;
}

export default function UserSelectionModal({
  isOpen,
  onClose,
  onUserSelect,
}: UserSelectionModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { user: currentUser } = useAuth();

  // Fetch all users except the current user
  useEffect(() => {
    if (!isOpen || !currentUser) return;

    const usersQuery = query(
      collection(db, "users"),
      where("userId", "!=", currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      usersQuery,
      (snapshot) => {
        const usersData: User[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          const userData: User = {
            id: doc.id,
            displayName: data.name || data.displayName || data.fullName || "Unknown User",
            profilePictureUrl: data.profilePictureUrl,
            companyLogoUrl: data.companyLogoUrl,
            profileType: data.profileType,
            isOnline: Math.random() > 0.3,
          };
          usersData.push(userData);
        });
        setUsers(usersData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching users:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isOpen, currentUser]);

  // Filter users based on search term
  const filteredUsers = users.filter((user) =>
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) 
  );

  const handleUserSelect = (user: User) => {
    onUserSelect(user);
    onClose();
    setSearchTerm("");
  };

  const handleClose = () => {
    onClose();
    setSearchTerm("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[16px] w-full max-w-[500px] max-h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#E9EAF0]">
          <h2 className="text-[#212121] font-poppins text-[18px] font-semibold">
            Start New Conversation
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18"
                stroke="#212121"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 6L18 18"
                stroke="#212121"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="p-6">
          <div className="flex items-center gap-2 px-3 py-2 border border-[#E9EAF0] rounded-lg bg-white">
            <svg
              className="w-4 h-4"
              viewBox="0 0 17 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.81232 12.3977C10.6459 12.3977 12.943 10.1006 12.943 7.26702C12.943 4.43342 10.6459 2.13634 7.81232 2.13634C4.97873 2.13634 2.68164 4.43342 2.68164 7.26702C2.68164 10.1006 4.97873 12.3977 7.81232 12.3977Z"
                stroke="#1D2026"
                strokeWidth="0.977273"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11.4404 10.8952L14.4089 13.8637"
                stroke="#1D2026"
                strokeWidth="0.977273"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 text-[14px] text-[#8C94A3] outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#8C94A3] font-poppins text-[14px]">
                {searchTerm ? "No users found" : "No users available"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 rounded-lg"
                  onClick={() => handleUserSelect(user)}
                >
                  {/* Avatar with online status */}
                  <div className="relative">
                    <img
                      src={
                        user.profilePictureUrl ||
                        user.companyLogoUrl ||
                        "https://api.builder.io/api/v1/image/assets/TEMP/c55340957be0d37b91878ecb441cc5d27cf207a5?width=136"
                      }
                      alt={user.displayName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {user.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#23BD33] border-2 border-white rounded-full"></div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[#212121] font-poppins text-[16px] font-medium truncate">
                      {user.displayName}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-[12px] px-2 py-1 rounded-full ${
                        user.profileType === "exhibitor"
                          ? "bg-[#10B981] text-white"
                          : "bg-[rgba(16,185,129,0.25)] text-[#10B981]"
                      }`}>
                        {user.profileType === "exhibitor" ? "Exhibitor" : "Visitor"}
                      </span>
                    </div>
                  </div>

                  {/* Select Button */}
                  <button className="px-4 py-2 bg-[#10B981] text-white rounded-lg text-[12px] font-semibold hover:bg-[#0EA573]">
                    Select
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
