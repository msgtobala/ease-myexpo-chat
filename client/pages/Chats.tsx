import React, { useState } from "react";
import Header from "../components/Header";
import LeftSidebar from "../components/LeftSidebar";
import CommunityDiscussions from "../components/CommunityDiscussions";
import MobileMenu from "../components/MobileMenu";

interface ChatMessage {
  id: string;
  sender: "user" | "other";
  content: string;
  timestamp: string;
  avatar?: string;
}

interface Contact {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  avatar: string;
  isOnline: boolean;
  isActive?: boolean;
  hasUnread?: boolean;
}

export default function Chats() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showChatView, setShowChatView] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Sample contacts data
  const contacts: Contact[] = [
    {
      id: "1",
      name: "Jane Cooper",
      lastMessage: "Yeah sure, tell me zafor",
      timestamp: "just now",
      avatar:
        "https://api.builder.io/api/v1/image/assets/TEMP/c55340957be0d37b91878ecb441cc5d27cf207a5?width=136",
      isOnline: true,
      isActive: true,
    },
    {
      id: "2",
      name: "Jenny Wilson",
      lastMessage: "Thank you so much, sir",
      timestamp: "2 d",
      avatar:
        "https://api.builder.io/api/v1/image/assets/TEMP/d081773160edf0019eec468a08da9cb714d08397?width=136",
      isOnline: true,
      hasUnread: true,
    },
    {
      id: "3",
      name: "Marvin McKinney",
      lastMessage: "You're Welcome",
      timestamp: "1 m",
      avatar:
        "https://api.builder.io/api/v1/image/assets/TEMP/bc7a1eff8e56420951453a7f66e906723f9f8bfa?width=136",
      isOnline: true,
      hasUnread: true,
    },
    {
      id: "4",
      name: "Eleanor Pena",
      lastMessage: "Thank you so much, sir",
      timestamp: "1 m",
      avatar:
        "https://api.builder.io/api/v1/image/assets/TEMP/d6095e1ed0daddb6a4b4558bdfe60e64c4caee1a?width=136",
      isOnline: false,
    },
    {
      id: "5",
      name: "Ronald Richards",
      lastMessage: "Sorry, I can't help you",
      timestamp: "2 m",
      avatar:
        "https://api.builder.io/api/v1/image/assets/TEMP/c55340957be0d37b91878ecb441cc5d27cf207a5?width=136",
      isOnline: true,
    },
    {
      id: "6",
      name: "Kathryn Murphy",
      lastMessage: "new message",
      timestamp: "2 m",
      avatar:
        "https://api.builder.io/api/v1/image/assets/TEMP/d081773160edf0019eec468a08da9cb714d08397?width=136",
      isOnline: false,
    },
    {
      id: "7",
      name: "Jacob Jones",
      lastMessage: "Thank you so much, sir",
      timestamp: "6 m",
      avatar:
        "https://api.builder.io/api/v1/image/assets/TEMP/bc7a1eff8e56420951453a7f66e906723f9f8bfa?width=136",
      isOnline: true,
    },
    {
      id: "8",
      name: "Cameron Williamson",
      lastMessage: "It's okay, no problem brother, i will fix everhitn...",
      timestamp: "6 m",
      avatar:
        "https://api.builder.io/api/v1/image/assets/TEMP/d6095e1ed0daddb6a4b4558bdfe60e64c4caee1a?width=136",
      isOnline: false,
    },
    {
      id: "9",
      name: "Arlene McCoy",
      lastMessage: "Thank you so much, sir",
      timestamp: "9 m",
      avatar:
        "https://api.builder.io/api/v1/image/assets/TEMP/c55340957be0d37b91878ecb441cc5d27cf207a5?width=136",
      isOnline: false,
    },
    {
      id: "10",
      name: "Dianne Russell",
      lastMessage: "You're Welcome",
      timestamp: "9 m",
      avatar:
        "https://api.builder.io/api/v1/image/assets/TEMP/d081773160edf0019eec468a08da9cb714d08397?width=136",
      isOnline: true,
    },
    {
      id: "11",
      name: "Kristin Watson",
      lastMessage: "new message",
      timestamp: "1 y",
      avatar:
        "https://api.builder.io/api/v1/image/assets/TEMP/bc7a1eff8e56420951453a7f66e906723f9f8bfa?width=136",
      isOnline: true,
    },
    {
      id: "12",
      name: "Kristin Watson",
      lastMessage: "new message",
      timestamp: "1 y",
      avatar:
        "https://api.builder.io/api/v1/image/assets/TEMP/d6095e1ed0daddb6a4b4558bdfe60e64c4caee1a?width=136",
      isOnline: true,
    },
  ];

  // Sample messages for selected contact
  const messages: ChatMessage[] = [
    {
      id: "1",
      sender: "other",
      content:
        "Hello and thanks for joining the community. If you have any questions about the expo or event, feel free to get in touch and I'll be happy to help 😀",
      timestamp: "12:00pm",
      avatar:
        "https://api.builder.io/api/v1/image/assets/TEMP/c55340957be0d37b91878ecb441cc5d27cf207a5?width=136",
    },
    {
      id: "2",
      sender: "user",
      content: "Hello, Good Evening.",
      timestamp: "12:30pm",
    },
    {
      id: "3",
      sender: "user",
      content: "I'm Zafor",
      timestamp: "12:30pm",
    },
    {
      id: "4",
      sender: "user",
      content:
        "I only have a small doubt about your expo. can you give me some time for this?",
      timestamp: "12:30pm",
    },
    {
      id: "5",
      sender: "other",
      content: "Yeah sure, tell me zafor",
      timestamp: "12:45pm",
      avatar:
        "https://api.builder.io/api/v1/image/assets/TEMP/c55340957be0d37b91878ecb441cc5d27cf207a5?width=136",
    },
  ];

  // Set first contact as selected by default
  React.useEffect(() => {
    if (contacts.length > 0 && !selectedContact) {
      setSelectedContact(contacts[0]);
    }
  }, [contacts, selectedContact]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Here you would typically send the message to the server
      console.log("Sending message:", newMessage);
      setNewMessage("");
    }
  };

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    setShowChatView(true); // Show chat view on mobile when contact is selected
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
              <button className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[rgba(16,185,129,0.25)]">
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
                  className="flex-1 text-[14px] text-[#8C94A3] outline-none bg-transparent"
                />
              </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 ${
                    contact.isActive ? "bg-[rgba(16,185,129,0.25)]" : ""
                  }`}
                  onClick={() => handleContactSelect(contact)}
                >
                  {/* Avatar with online status */}
                  <div className="relative">
                    <img
                      src={contact.avatar}
                      alt={contact.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    {contact.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#23BD33] border-2 border-white rounded-full"></div>
                    )}
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[#212121] font-poppins text-[14px] font-medium truncate">
                        {contact.name}
                      </span>
                      <span className="text-[#6E7485] font-inter text-[12px] flex-shrink-0">
                        {contact.timestamp}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#212121] font-poppins text-[13px] font-light truncate">
                        {contact.lastMessage}
                      </span>
                      {contact.hasUnread && (
                        <div className="w-[5px] h-[5px] bg-[#10B981] rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div
            className={`flex-1 bg-white rounded-[16px] flex flex-col ${
              !showChatView ? "hidden lg:flex" : "flex"
            }`}
          >
            {selectedContact ? (
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
                        src={selectedContact.avatar}
                        alt={selectedContact.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      {selectedContact.isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#23BD33] border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-[#212121] font-poppins text-[16px] font-medium">
                        {selectedContact.name}
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
                  {/* Today indicator */}
                  <div className="flex justify-center">
                    <div className="px-2 py-1 bg-[rgba(16,185,129,0.25)] rounded-lg">
                      <span className="text-black font-inter text-[12px] font-medium">
                        Today
                      </span>
                    </div>
                  </div>

                  {/* Messages */}
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex flex-col max-w-[70%] ${message.sender === "user" ? "items-end" : "items-start"}`}
                      >
                        {message.sender === "other" && (
                          <div className="flex items-center gap-1 mb-1">
                            <img
                              src={message.avatar}
                              alt="Avatar"
                              className="w-4 h-4 rounded-full object-cover"
                            />
                            <span className="text-[#6E7485] font-inter text-[11px]">
                              {message.timestamp}
                            </span>
                          </div>
                        )}
                        {message.sender === "user" && (
                          <span className="text-[#6E7485] font-inter text-[11px] mb-1">
                            {message.timestamp}
                          </span>
                        )}
                        <div
                          className={`px-2 py-1 rounded-xl ${
                            message.sender === "user"
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
                  ))}
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
                      className="flex items-center gap-2 px-4 py-2 bg-[#10B981] rounded-lg"
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
    </div>
  );
}
