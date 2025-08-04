import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  addDoc, 
  updateDoc, 
  serverTimestamp, 
  orderBy, 
  where,
  getDoc,
  setDoc,
  or
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/use-toast";
import Header from "../components/Header";
import LeftSidebar from "../components/LeftSidebar";
import CommunityDiscussions from "../components/CommunityDiscussions";
import MobileMenu from "../components/MobileMenu";
import UserSelectionModal from "../components/UserSelectionModal";

// Data Model Design for Firebase "chats" collection:
// {
//   chatId: string (auto-generated) - unique identifier for each chat
//   participants: string[] - array of user IDs in the chat
//   participantDetails: {
//     [userId]: {
//       displayName: string,
//       profilePictureUrl: string,
//       profileType: "visitor" | "exhibitor"
//     }
//   },
//   lastMessage: {
//     content: string,
//     senderId: string,
//     timestamp: Timestamp,
//     messageType: "text" | "image" | "file"
//   },
//   createdAt: Timestamp,
//   updatedAt: Timestamp,
//   unreadCount: {
//     [userId]: number
//   }
// }

// Sub-collection "messages" under each chat document:
// {
//   messageId: string (auto-generated),
//   senderId: string,
//   content: string,
//   messageType: "text" | "image" | "file",
//   timestamp: Timestamp,
//   readBy: {
//     [userId]: Timestamp
//   }
// }

interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  messageType: "text" | "image" | "file";
  timestamp: any;
  readBy?: { [userId: string]: any };
}

interface Chat {
  id: string;
  participants: string[];
  participantDetails: {
    [userId: string]: {
      displayName: string;
      profilePictureUrl?: string;
      profileType: "visitor" | "exhibitor";
    };
  };
  lastMessage?: {
    content: string;
    senderId: string;
    timestamp: any;
    messageType: "text" | "image" | "file";
  };
  createdAt: any;
  updatedAt: any;
  unreadCount: { [userId: string]: number };
}

interface User {
  id: string;
  displayName: string;
  profilePictureUrl?: string;
  companyLogoUrl?: string;
  profileType: "visitor" | "exhibitor";
  companyName?: string;
  isOnline?: boolean;
}

export default function Chats() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showChatView, setShowChatView] = useState(false);
  const [showUserSelection, setShowUserSelection] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();

  // Check if user came from Smart Match with auto-start chat
  useEffect(() => {
    console.log("Auto-start check:", {
      autoStartChat: location.state?.autoStartChat,
      selectedUserId: location.state?.selectedUserId,
      currentUserData: !!currentUserData,
      locationState: location.state
    });

    if (location.state?.autoStartChat && location.state?.selectedUserId && currentUserData) {
      const { selectedUserId, selectedUserName, selectedUserImage } = location.state;
      console.log("Auto-starting chat with:", { selectedUserId, selectedUserName, selectedUserImage });

      // Auto-start chat with the selected user
      handleStartChatWithUser({
        id: selectedUserId,
        displayName: selectedUserName,
        profilePictureUrl: selectedUserImage,
        profileType: "visitor" // Default, will be updated when fetching user data
      });

      // Clear the navigation state to prevent re-triggering
      window.history.replaceState({}, '', '/chats');
    }
  }, [location.state, currentUserData]);

  // Fetch current user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setCurrentUserData(userDoc.data());
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, [user]);

  // Fetch user's chats
  useEffect(() => {
    if (!user) return;

    const chatsQuery = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(
      chatsQuery,
      (snapshot) => {
        const chatsData: Chat[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          const chatData: Chat = {
            id: doc.id,
            participants: data.participants || [],
            participantDetails: data.participantDetails || {},
            lastMessage: data.lastMessage,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            unreadCount: data.unreadCount || {},
          };
          chatsData.push(chatData);
        });
        setChats(chatsData);
        setLoadingChats(false);
      },
      (error) => {
        console.error("Error fetching chats:", error);
        setLoadingChats(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Fetch messages for selected chat
  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    const messagesQuery = query(
      collection(db, "chats", selectedChat.id, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const messagesData: ChatMessage[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          const messageData: ChatMessage = {
            id: doc.id,
            senderId: data.senderId,
            content: data.content,
            messageType: data.messageType || "text",
            timestamp: data.timestamp,
            readBy: data.readBy || {},
          };
          messagesData.push(messageData);
        });
        setMessages(messagesData);
        setLoadingMessages(false);

        // Mark messages as read
        if (user && messagesData.length > 0) {
          markMessagesAsRead();
        }
      },
      (error) => {
        console.error("Error fetching messages:", error);
        setLoadingMessages(false);
      }
    );

    return () => unsubscribe();
  }, [selectedChat, user]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleComposeClick = () => {
    setShowUserSelection(true);
  };

  const handleStartChatWithUser = async (selectedUser: User) => {
    console.log("handleStartChatWithUser called with:", selectedUser);
    console.log("Current user:", user?.uid, "Current user data:", !!currentUserData);

    if (!user || !currentUserData) {
      console.error("Missing user data:", { user: !!user, currentUserData: !!currentUserData });
      toast({
        title: "Error",
        description: "User data not loaded. Please try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if chat already exists between these users
      const existingChatQuery = query(
        collection(db, "chats"),
        where("participants", "array-contains", user.uid)
      );

      const existingChatsSnapshot = await new Promise((resolve) => {
        const unsubscribe = onSnapshot(existingChatQuery, (snapshot) => {
          unsubscribe();
          resolve(snapshot);
        });
      }) as any;

      let existingChat = null;
      existingChatsSnapshot.forEach((doc: any) => {
        const data = doc.data();
        if (data.participants.includes(selectedUser.id) && data.participants.length === 2) {
          existingChat = { id: doc.id, ...data };
        }
      });

      if (existingChat) {
        // Chat exists, select it
        setSelectedChat(existingChat);
        setShowChatView(true);
        toast({
          title: "Chat Opened",
          description: `Opened existing chat with ${selectedUser.displayName}`,
        });
      } else {
        // Create new chat
        const newChatData = {
          participants: [user.uid, selectedUser.id],
          participantDetails: {
            [user.uid]: {
              displayName: currentUserData.displayName || currentUserData.fullName || currentUserData.name || "Unknown",
              profilePictureUrl: currentUserData.profilePictureUrl || currentUserData.companyLogoUrl,
              profileType: currentUserData.profileType || "visitor",
            },
            [selectedUser.id]: {
              displayName: selectedUser.displayName,
              profilePictureUrl: selectedUser.profilePictureUrl || selectedUser.companyLogoUrl,
              profileType: selectedUser.profileType,
            },
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          unreadCount: {
            [user.uid]: 0,
            [selectedUser.id]: 0,
          },
        };

        // Create chat document
        const chatDocRef = await addDoc(collection(db, "chats"), newChatData);

        // Set the newly created chat as selected
        const newChat = { id: chatDocRef.id, ...newChatData };
        setSelectedChat(newChat);
        setShowChatView(true);

        toast({
          title: "Chat Started",
          description: `Started new chat with ${selectedUser.displayName}`,
        });
      }
    } catch (error) {
      console.error("Error starting chat:", error);
      toast({
        title: "Error",
        description: "Failed to start chat. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUserSelect = async (selectedUser: User) => {
    if (!user || !currentUserData) return;

    try {
      // Check if chat already exists between these users
      const existingChatQuery = query(
        collection(db, "chats"),
        where("participants", "array-contains", user.uid)
      );

      const existingChatsSnapshot = await new Promise((resolve) => {
        const unsubscribe = onSnapshot(existingChatQuery, (snapshot) => {
          unsubscribe();
          resolve(snapshot);
        });
      }) as any;

      let existingChat = null;
      existingChatsSnapshot.forEach((doc: any) => {
        const data = doc.data();
        if (data.participants.includes(selectedUser.id) && data.participants.length === 2) {
          existingChat = { id: doc.id, ...data };
        }
      });

      if (existingChat) {
        // Chat exists, select it
        setSelectedChat(existingChat);
        setShowChatView(true);
      } else {
        // Create new chat
        const newChatData = {
          participants: [user.uid, selectedUser.id],
          participantDetails: {
            [user.uid]: {
              displayName: currentUserData.displayName || currentUserData.fullName || "Unknown",
              profilePictureUrl: currentUserData.profilePictureUrl || currentUserData.companyLogoUrl,
              profileType: currentUserData.profileType || "visitor",
            },
            [selectedUser.id]: {
              displayName: selectedUser.displayName,
              profilePictureUrl: selectedUser.profilePictureUrl || selectedUser.companyLogoUrl,
              profileType: selectedUser.profileType,
            },
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          unreadCount: {
            [user.uid]: 0,
            [selectedUser.id]: 0,
          },
        };

        const chatDoc = await addDoc(collection(db, "chats"), newChatData);
        
        // Set the new chat as selected
        const newChat: Chat = {
          id: chatDoc.id,
          ...newChatData,
          unreadCount: { [user.uid]: 0, [selectedUser.id]: 0 },
        };
        setSelectedChat(newChat);
        setShowChatView(true);

        toast({
          title: "New Chat Created",
          description: `Started conversation with ${selectedUser.displayName}`,
        });
      }
    } catch (error) {
      console.error("Error creating/selecting chat:", error);
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const markMessagesAsRead = async () => {
    if (!selectedChat || !user) return;

    try {
      // Update unread count for current user to 0
      await updateDoc(doc(db, "chats", selectedChat.id), {
        [`unreadCount.${user.uid}`]: 0,
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user) return;

    try {
      // Add message to subcollection
      await addDoc(collection(db, "chats", selectedChat.id, "messages"), {
        senderId: user.uid,
        content: newMessage.trim(),
        messageType: "text",
        timestamp: serverTimestamp(),
        readBy: {
          [user.uid]: serverTimestamp(),
        },
      });

      // Update chat's last message and unread counts
      const otherParticipants = selectedChat.participants.filter(id => id !== user.uid);
      const updatedUnreadCount: { [key: string]: number } = { ...selectedChat.unreadCount };
      
      // Increment unread count for other participants
      otherParticipants.forEach(participantId => {
        updatedUnreadCount[participantId] = (updatedUnreadCount[participantId] || 0) + 1;
      });

      await updateDoc(doc(db, "chats", selectedChat.id), {
        lastMessage: {
          content: newMessage.trim(),
          senderId: user.uid,
          timestamp: serverTimestamp(),
          messageType: "text",
        },
        updatedAt: serverTimestamp(),
        unreadCount: updatedUnreadCount,
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    setShowChatView(true);
  };

  const handleBackToMessages = () => {
    setShowChatView(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getOtherParticipant = (chat: Chat) => {
    const otherParticipantId = chat.participants.find(id => id !== user?.uid);
    return otherParticipantId ? chat.participantDetails[otherParticipantId] : null;
  };

  // Filter chats based on search term
  const filteredChats = chats.filter((chat) => {
    if (!searchTerm.trim()) return true;

    const otherParticipant = getOtherParticipant(chat);
    const displayName = otherParticipant?.displayName?.toLowerCase() || "";
    // const lastMessage = chat.lastMessage?.content?.toLowerCase() || "";
    const searchLower = searchTerm.toLowerCase();

    return displayName.includes(searchLower);
  });

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return "";
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return "just now";
      if (minutes < 60) return `${minutes}m`;
      if (hours < 24) return `${hours}h`;
      if (days < 7) return `${days}d`;
      return date.toLocaleDateString();
    } catch (error) {
      return "";
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
        activeItem="chats"
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
          <LeftSidebar activeItem="chats" onItemClick={() => {}} />

          {/* Community Discussions */}
          <CommunityDiscussions />
        </div>

        {/* Chat Interface */}
        <div
          className="flex-1 flex gap-4"
          style={{ height: "calc(100vh - 140px)" }}
        >
          {/* Messages Sidebar */}
          <div
            className={`w-full lg:w-[276px] bg-white rounded-[16px] flex flex-col ${
              showChatView ? "hidden lg:flex" : "flex"
            }`}
          >
            {/* Messages Header */}
            <div className="flex justify-between items-center p-4 border-b border-[#E9EAF0]">
              <h2 className="text-[#212121] font-poppins text-[16px] font-semibold">
                Messages
              </h2>
              <button 
                onClick={handleComposeClick}
                className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[rgba(16,185,129,0.25)] hover:bg-[rgba(16,185,129,0.35)]"
              >
                <svg
                  className="w-3 h-3"
                  viewBox="0 0 12 11"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2.56836 5.57576H9.73503"
                    stroke="#10B981"
                    strokeWidth="0.977273"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6.15137 1.99243V9.1591"
                    stroke="#10B981"
                    strokeWidth="0.977273"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-[#10B981] font-inter text-[12px] font-semibold">
                  Compose
                </span>
              </button>
            </div>

            {/* Search */}
            <div className="p-4">
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
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 text-[14px] text-[#8C94A3] outline-none bg-transparent"
                />
              </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto">
              {loadingChats ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : filteredChats.length === 0 ? (
                <div className="text-center py-12">
                  {searchTerm ? (
                    <>
                      <p className="text-[#8C94A3] font-poppins text-[14px] mb-2">No chats found</p>
                      <p className="text-[#8C94A3] font-poppins text-[12px]">Try a different search term</p>
                    </>
                  ) : (
                    <>
                      <p className="text-[#8C94A3] font-poppins text-[14px] mb-2">No conversations yet</p>
                      <p className="text-[#8C94A3] font-poppins text-[12px]">Click Compose to start chatting</p>
                    </>
                  )}
                </div>
              ) : (
                filteredChats.map((chat) => {
                  const otherParticipant = getOtherParticipant(chat);
                  const unreadCount = user ? (chat.unreadCount[user.uid] || 0) : 0;
                  
                  return (
                    <div
                      key={chat.id}
                      className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 ${
                        selectedChat?.id === chat.id ? "bg-[rgba(16,185,129,0.25)]" : ""
                      }`}
                      onClick={() => handleChatSelect(chat)}
                    >
                      {/* Avatar */}
                      <div className="relative">
                        <img
                          src={
                            otherParticipant?.profilePictureUrl ||
                            "https://api.builder.io/api/v1/image/assets/TEMP/c55340957be0d37b91878ecb441cc5d27cf207a5?width=136"
                          }
                          alt={otherParticipant?.displayName || "User"}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        {/* Simulate online status */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#23BD33] border-2 border-white rounded-full"></div>
                      </div>

                      {/* Message Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[#212121] font-poppins text-[14px] font-medium truncate">
                            {otherParticipant?.displayName || "Unknown User"}
                          </span>
                          <span className="text-[#6E7485] font-inter text-[12px] flex-shrink-0">
                            {formatTimestamp(chat.lastMessage?.timestamp)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#212121] font-poppins text-[13px] font-light truncate">
                            {chat.lastMessage?.content || "Start a conversation"}
                          </span>
                          {unreadCount > 0 && (
                            <div className="w-[5px] h-[5px] bg-[#10B981] rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div
            className={`flex-1 bg-white rounded-[16px] flex flex-col ${
              !showChatView ? "hidden lg:flex" : "flex"
            }`}
          >
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="flex justify-between items-center p-4 border-b border-[#E9EAF0]">
                  {/* Mobile back button */}
                  <button
                    onClick={handleBackToMessages}
                    className="lg:hidden flex items-center gap-2 mr-3"
                  >
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M15 18L9 12L15 6"
                        stroke="#212121"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={
                          getOtherParticipant(selectedChat)?.profilePictureUrl ||
                          "https://api.builder.io/api/v1/image/assets/TEMP/c55340957be0d37b91878ecb441cc5d27cf207a5?width=136"
                        }
                        alt={getOtherParticipant(selectedChat)?.displayName || "User"}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#23BD33] border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                      <h3 className="text-[#212121] font-poppins text-[16px] font-medium">
                        {getOtherParticipant(selectedChat)?.displayName || "Unknown User"}
                      </h3>
                      <span className="text-[#10B981] font-poppins text-[12px]">
                        Active Now
                      </span>
                    </div>
                  </div>
                  <button className="p-2 rounded-lg bg-[rgba(16,185,129,0.25)]">
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 17 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8.60645 6.94571C9.15497 6.94595 9.59961 7.39127 9.59961 7.93985C9.59937 8.48823 9.15482 8.93277 8.60645 8.93301C8.05786 8.93301 7.61254 8.48837 7.6123 7.93985C7.6123 7.39112 8.05772 6.94571 8.60645 6.94571Z"
                        fill="#1D2026"
                        stroke="#1D2026"
                        strokeWidth="0.521212"
                      />
                      <path
                        d="M13.167 6.94571C13.7155 6.94595 14.1602 7.39127 14.1602 7.93985C14.1599 8.48823 13.7154 8.93277 13.167 8.93301C12.6184 8.93301 12.1731 8.48837 12.1729 7.93985C12.1729 7.39112 12.6183 6.94571 13.167 6.94571Z"
                        fill="#1D2026"
                        stroke="#1D2026"
                        strokeWidth="0.521212"
                      />
                      <path
                        d="M4.0459 6.94571C4.59442 6.94595 5.03906 7.39127 5.03906 7.93985C5.03882 8.48823 4.59427 8.93277 4.0459 8.93301C3.49732 8.93301 3.052 8.48837 3.05176 7.93985C3.05176 7.39112 3.49717 6.94571 4.0459 6.94571Z"
                        fill="#1D2026"
                        stroke="#1D2026"
                        strokeWidth="0.521212"
                      />
                    </svg>
                  </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-8 h-8 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                      <p className="text-[#8C94A3] font-poppins text-[14px]">
                        No messages yet. Start the conversation!
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Today indicator */}
                      <div className="flex justify-center">
                        <div className="px-2 py-1 bg-[rgba(16,185,129,0.25)] rounded-lg">
                          <span className="text-black font-inter text-[12px] font-medium">
                            Today
                          </span>
                        </div>
                      </div>

                      {/* Messages */}
                      {messages.map((message, index) => {
                        const isOwnMessage = message.senderId === user?.uid;
                        const senderDetails = selectedChat.participantDetails[message.senderId];
                        
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`flex flex-col max-w-[70%] ${isOwnMessage ? "items-end" : "items-start"}`}
                            >
                              {!isOwnMessage && (
                                <div className="flex items-center gap-1 mb-1">
                                  <img
                                    src={
                                      senderDetails?.profilePictureUrl ||
                                      "https://api.builder.io/api/v1/image/assets/TEMP/c55340957be0d37b91878ecb441cc5d27cf207a5?width=136"
                                    }
                                    alt="Avatar"
                                    className="w-4 h-4 rounded-full object-cover"
                                  />
                                  <span className="text-[#6E7485] font-inter text-[11px]">
                                    {formatTimestamp(message.timestamp)}
                                  </span>
                                </div>
                              )}
                              {isOwnMessage && (
                                <span className="text-[#6E7485] font-inter text-[11px] mb-1">
                                  {formatTimestamp(message.timestamp)}
                                </span>
                              )}
                              <div
                                className={`px-2 py-1 rounded-xl ${
                                  isOwnMessage
                                    ? "bg-[#10B981] text-white"
                                    : "bg-[rgba(16,185,129,0.25)] text-[#1D2026]"
                                }`}
                              >
                                <p className="text-[14px] font-poppins leading-[20px]">
                                  {message.content}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-[#E9EAF0]">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 flex items-center gap-2 px-3 py-2 border border-[#E9EAF0] rounded-xl">
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6.10698 13.1932H3.17516C3.04557 13.1932 2.92128 13.1417 2.82964 13.05C2.738 12.9584 2.68652 12.8341 2.68652 12.7045V9.9751C2.68652 9.91094 2.69916 9.8474 2.72372 9.78811C2.74827 9.72883 2.78427 9.67496 2.82964 9.62959L10.1592 2.30004C10.2508 2.2084 10.3751 2.15692 10.5047 2.15692C10.6343 2.15692 10.7586 2.2084 10.8502 2.30004L13.5796 5.02946C13.6713 5.1211 13.7228 5.24538 13.7228 5.37498C13.7228 5.50457 13.6713 5.62886 13.5796 5.72049L6.10698 13.1932Z"
                          stroke="#10B981"
                          strokeWidth="0.977273"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M8.5498 3.90912L11.9703 7.32957"
                          stroke="#10B981"
                          strokeWidth="0.977273"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M13.4367 13.1932H6.10714L2.71777 9.80383"
                          stroke="#10B981"
                          strokeWidth="0.977273"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <input
                        type="text"
                        placeholder="Type your message"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1 text-[14px] text-[#8C94A3] outline-none bg-transparent"
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-[#10B981] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#0EA573]"
                    >
                      <span className="text-white font-inter text-[14px] font-semibold">
                        Send
                      </span>
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M13.4392 7.39184L3.12192 1.61418C3.03512 1.56557 2.93556 1.54462 2.83653 1.55411C2.7375 1.56361 2.64374 1.6031 2.56776 1.66731C2.49178 1.73153 2.43721 1.8174 2.41134 1.91346C2.38547 2.00951 2.38954 2.11118 2.423 2.20486L4.36906 7.65383C4.40701 7.76011 4.40701 7.87624 4.36906 7.98252L2.423 13.4315C2.38954 13.5252 2.38547 13.6268 2.41134 13.7229C2.43721 13.8189 2.49178 13.9048 2.56776 13.969C2.64374 14.0332 2.73751 14.0727 2.83653 14.0822C2.93556 14.0917 3.03512 14.0708 3.12192 14.0222L13.4392 8.24451C13.5149 8.20207 13.5781 8.1402 13.622 8.06526C13.6659 7.99032 13.689 7.90503 13.689 7.81817C13.689 7.73131 13.6659 7.64602 13.622 7.57109C13.578 7.49615 13.5149 7.43428 13.4392 7.39184V7.39184Z"
                          fill="white"
                        />
                        <path
                          d="M4.42871 7.81818H8.3378"
                          stroke="#10B981"
                          strokeWidth="0.977273"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-[#8C94A3] font-poppins text-[14px]">
                  Select a conversation to start messaging
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Selection Modal */}
      <UserSelectionModal
        isOpen={showUserSelection}
        onClose={() => setShowUserSelection(false)}
        onUserSelect={handleUserSelect}
      />
    </div>
  );
}
