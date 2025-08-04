import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  name: string;
  username: string;
  category: string;
  description: string;
  website: string;
  location: string;
  company: string;
  skills: string[];
  events: string[];
  matchPercentage: number;
  image: string;
}

interface SwipeCardProps {
  user: User;
  onSwipe: (direction: "left" | "right") => void;
  onPass: () => void;
  onConnect: () => void;
  currentUserType?: string;
}

export default function SwipeCard({
  user,
  onSwipe,
  onPass,
  onConnect,
  currentUserType,
}: SwipeCardProps) {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);

  const handleStart = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
    startPos.current = { x: clientX, y: clientY };
  }, []);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging) return;

    // Cancel any pending animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Use requestAnimationFrame for smooth animation
    animationFrameRef.current = requestAnimationFrame(() => {
      const deltaX = clientX - startPos.current.x;
      const deltaY = clientY - startPos.current.y;

      setDragOffset({ x: deltaX, y: deltaY });
      setRotation(deltaX * 0.08); // Slightly reduced rotation for smoother feel
    });
  }, [isDragging]);

  const handleEnd = useCallback(() => {
    if (!isDragging) return;

    setIsDragging(false);

    // Cancel any pending animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const threshold = 100; // Reduced threshold for more responsive swipes

    if (Math.abs(dragOffset.x) > threshold) {
      const direction = dragOffset.x > 0 ? "right" : "left";
      onSwipe(direction);
    }

    // Reset position with smooth transition
    setDragOffset({ x: 0, y: 0 });
    setRotation(0);
  }, [isDragging, dragOffset.x, onSwipe]);

  // Mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  }, [handleStart]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleMove(e.clientX, e.clientY);
  }, [handleMove]);

  const handleMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // Touch events
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  }, [handleStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    }
  }, [handleMove]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handleEnd();
  }, [handleEnd]);

  // Global mouse events
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        handleMove(e.clientX, e.clientY);
      }
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        handleEnd();
      }
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length > 0) {
        e.preventDefault();
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
      }
    };

    const handleGlobalTouchEnd = (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault();
        handleEnd();
      }
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleGlobalMouseMove, { passive: false });
      document.addEventListener("mouseup", handleGlobalMouseUp, { passive: false });
      document.addEventListener("touchmove", handleGlobalTouchMove, { passive: false });
      document.addEventListener("touchend", handleGlobalTouchEnd, { passive: false });
    }

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
      document.removeEventListener("touchmove", handleGlobalTouchMove);
      document.removeEventListener("touchend", handleGlobalTouchEnd);

      // Cleanup animation frame on unmount
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDragging, handleMove, handleEnd]);

  const cardStyle = {
    transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)`,
    transition: isDragging ? "none" : "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    opacity: Math.abs(dragOffset.x) > 100 ? 0.7 : 1,
    willChange: isDragging ? "transform" : "auto",
  };

  const handleSendMessage = () => {
    // Navigate to chat page with user information
    navigate("/chats", {
      state: {
        selectedUserId: user.id,
        selectedUserName: user.name,
        selectedUserImage: user.image,
        autoStartChat: true
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-full h-full flex flex-col items-center justify-start">
        {/* Background Cards for Stack Effect - Extending below main card */}
        <div
          className="absolute w-full max-w-[548px] bg-[rgba(16,185,129,0.2)] rounded-[20px] lg:rounded-[37px] top-0 left-0 z-10"
          style={{ height: "calc(100% + 24px)" }}
        ></div>
        <div
          className="absolute w-full max-w-[548px] bg-[rgba(16,185,129,0.4)] rounded-[20px] lg:rounded-[37px] top-0 left-0 z-20"
          style={{ height: "calc(100% + 16px)" }}
        ></div>
        <div
          className="absolute w-full max-w-[548px] bg-[rgba(16,185,129,0.6)] rounded-[20px] lg:rounded-[37px] top-0 left-0 z-30"
          style={{ height: "calc(100% + 8px)" }}
        ></div>

        {/* Main Card */}
        <div
          ref={cardRef}
          className="relative w-full max-w-[548px] min-h-[580px] lg:min-h-[620px] bg-white rounded-[20px] lg:rounded-[37px] border border-[#D5E0F6] shadow-[3px_3px_6px_0_rgba(174,191,237,0.25)] z-40 cursor-grab active:cursor-grabbing select-none mx-4 lg:mx-0"
          style={cardStyle}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Header Section */}
          <div className="relative w-[calc(100%-2rem)] lg:w-[506px] h-[100px] lg:h-[166px] mx-auto mt-[10px] lg:mt-[17px] rounded-[20px] lg:rounded-[28px] bg-gradient-to-br from-[#2D313C] to-[#1D1F26] flex items-center justify-center">
            <h2 className="text-[16px] lg:text-[25px] font-semibold bg-gradient-to-r from-[#B0B9FF] to-[#E7E9FF] bg-clip-text text-transparent font-poppins text-center px-4">
              {user.category}
            </h2>
          </div>

          {/* Profile Picture */}
          <div className="absolute left-[20px] lg:left-[40px] top-[80px] lg:top-[116px] w-[80px] lg:w-[133px] h-[80px] lg:h-[133px] rounded-full border-[3px] lg:border-[6px] border-white z-50">
            <img
              src={user.image}
              alt={user.name}
              className="w-full h-full rounded-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="px-[20px] lg:px-[47px] pt-[80px] pb-[20px] lg:pb-[40px]">
            {/* Name and Username */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-[#1F242F] font-poppins text-[18px] lg:text-[25px] font-semibold">
                    {user.name}
                  </h3>
                  {/* Match Badge */}
                  <div className="bg-[rgba(16,185,129,0.25)] rounded-lg px-2 pb-1">
                    <span className="text-[#10B981] font-poppins text-[8px] lg:text-[10px] font-semibold">
                      {user.matchPercentage}% Match
                    </span>
                  </div>
                </div>
                {/* Send Message Button */}
                <button
                  onClick={handleSendMessage}
                  className="bg-[#10B981] text-white px-[12px] lg:px-[19px] py-1 lg:py-2 rounded-lg lg:rounded-xl font-poppins text-[12px] lg:text-[16px] font-medium hover:bg-[#0EA573] transition-colors"
                >
                  Send Message
                </button>
              </div>
              <p className="text-[#666] font-poppins text-[14px] lg:text-[16px]">
                {user.username}
              </p>
            </div>

            {/* Description */}
            <div className="mt-3 lg:mt-6 mb-3 lg:mb-4">
              <p className="text-[#666] font-poppins text-[14px] lg:text-[16px] leading-[20px] lg:leading-[31px]">
                {user.description}
              </p>
            </div>

            {/* Website */}
            <div className="flex items-center gap-3 mb-3">
              <svg
                className="w-[22px] h-[22px]"
                viewBox="0 0 23 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.6534 15.9677L11.3742 17.247C10.5259 18.0952 9.37553 18.5717 8.17599 18.5717C6.97644 18.5717 5.82603 18.0952 4.97783 17.247C4.12962 16.3988 3.6531 15.2484 3.6531 14.0488C3.6531 12.8493 4.12962 11.6989 4.97783 10.8507L6.25709 9.5714"
                  stroke="#10B981"
                  strokeWidth="2.32606"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10.0975 5.73364L11.3768 4.45438C12.225 3.60617 13.3754 3.12965 14.575 3.12965C15.7745 3.12965 16.9249 3.60617 17.7731 4.45438C18.6213 5.30258 19.0978 6.453 19.0978 7.65254C19.0978 8.85208 18.6213 10.0025 17.7731 10.8507L16.4939 12.13"
                  stroke="#10B981"
                  strokeWidth="2.32606"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8.81531 13.4091L13.9324 8.292"
                  stroke="#10B981"
                  strokeWidth="2.32606"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-[#10B981] font-inter text-[14px] lg:text-[16px] font-medium">
                {user.website}
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 mb-3">
              <svg
                className="w-[21px] h-[21px]"
                viewBox="0 0 22 23"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.9256 10.0027C13.9256 10.7137 13.6431 11.3957 13.1404 11.8984C12.6376 12.4012 11.9557 12.6837 11.2447 12.6837C10.5336 12.6837 9.85172 12.4012 9.34895 11.8984C8.84618 11.3957 8.56372 10.7137 8.56372 10.0027C8.56372 9.29169 8.84618 8.60978 9.34895 8.10701C9.85172 7.60423 10.5336 7.32178 11.2447 7.32178C11.9557 7.32178 12.6376 7.60423 13.1404 8.10701C13.6431 8.60978 13.9256 9.29169 13.9256 10.0027Z"
                  stroke="#10B981"
                  strokeWidth="1.39875"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M17.947 10.0028C17.947 16.3852 11.2447 20.0563 11.2447 20.0563C11.2447 20.0563 4.54236 16.3852 4.54236 10.0028C4.54236 8.22519 5.2485 6.52042 6.50543 5.26349C7.76236 4.00655 9.46713 3.30042 11.2447 3.30042C13.0223 3.30042 14.727 4.00655 15.984 5.26349C17.2409 6.52042 17.947 8.22519 17.947 10.0028Z"
                  stroke="#10B981"
                  strokeWidth="1.39875"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-[#666] font-inter text-[14px] lg:text-[16px]">
                {user.location}
              </span>
            </div>

            {/* Industry - Only show for visitors viewing exhibitors */}
            {currentUserType === "visitor" && (
              <div className="flex items-center gap-2 mb-4">
                <svg
                  className="w-[21px] h-[21px]"
                  viewBox="0 0 22 23"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.87231 19.3864H18.6175M4.54255 3.30078H17.9472M5.21278 3.30078V19.3864M17.277 3.30078V19.3864M8.56396 6.65195H9.90442M8.56396 9.33289H9.90442M8.56396 12.0138H9.90442M12.5854 6.65195H13.9258M12.5854 9.33289H13.9258M12.5854 12.0138H13.9258M8.56396 19.3864V16.3704C8.56396 15.8154 9.01435 15.365 9.56931 15.365H12.9205C13.4754 15.365 13.9258 15.8154 13.9258 16.3704V19.3864"
                    stroke="#10B981"
                    strokeWidth="1.39875"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-[#666] font-inter text-[14px] lg:text-[16px]">
                  {user.company}
                </span>
              </div>
            )}

            {/* Events Attending */}
            <div>
              <h4 className="text-[#212121] font-poppins text-[14px] lg:text-[19px] font-medium mb-2">
                Events Attending
              </h4>
              <div className="space-y-2">
                {user.events.map((event, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <svg
                      className="w-[21px] h-[21px]"
                      viewBox="0 0 22 22"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13.9256 9.76492C13.9256 10.476 13.6431 11.1579 13.1404 11.6606C12.6376 12.1634 11.9557 12.4459 11.2447 12.4459C10.5336 12.4459 9.85172 12.1634 9.34895 11.6606C8.84618 11.1579 8.56372 10.476 8.56372 9.76492C8.56372 9.05389 8.84618 8.37199 9.34895 7.86921C9.85172 7.36644 10.5336 7.08398 11.2447 7.08398C11.9557 7.08398 12.6376 7.36644 13.1404 7.86921C13.6431 8.37199 13.9256 9.05389 13.9256 9.76492Z"
                        stroke="#10B981"
                        strokeWidth="1.39875"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M17.947 9.76484C17.947 16.1473 11.2447 19.8184 11.2447 19.8184C11.2447 19.8184 4.54236 16.1473 4.54236 9.76484C4.54236 7.98727 5.2485 6.2825 6.50543 5.02557C7.76236 3.76864 9.46713 3.0625 11.2447 3.0625C13.0223 3.0625 14.727 3.76864 15.984 5.02557C17.2409 6.2825 17.947 7.98727 17.947 9.76484Z"
                        stroke="#10B981"
                        strokeWidth="1.39875"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-[#666] font-inter text-[14px] lg:text-[16px]">
                      {event}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Swipe Indicator Overlays */}
        {dragOffset.x > 40 && (
          <div
            className="absolute top-1/2 right-8 transform -translate-y-1/2 bg-green-500 text-white px-4 py-2 rounded-lg font-bold z-60 transition-opacity duration-200"
            style={{ opacity: Math.min(Math.abs(dragOffset.x) / 100, 1) }}
          >
            CONNECT
          </div>
        )}
        {dragOffset.x < -40 && (
          <div
            className="absolute top-1/2 left-8 transform -translate-y-1/2 bg-red-500 text-white px-4 py-2 rounded-lg font-bold z-60 transition-opacity duration-200"
            style={{ opacity: Math.min(Math.abs(dragOffset.x) / 100, 1) }}
          >
            PASS
          </div>
        )}
      </div>
      {/* Action Buttons - Updated to remove Connect functionality */}
      <div className="mt-8 lg:mt-12 flex items-center justify-center gap-2 lg:gap-4 z-50 px-4 pb-4">
        <button
          onClick={onPass}
          className="flex items-center justify-center w-[140px] lg:w-[256px] h-[45px] lg:h-[58px] border-2 border-[#10B981] rounded-[14px] lg:rounded-[18px] bg-white"
        >
          <span className="text-[#10B981] font-poppins text-[16px] font-medium">
            Pass
          </span>
        </button>
        <button
          onClick={onConnect}
          className="flex items-center justify-center w-[140px] lg:w-[228px] h-[45px] lg:h-[58px] bg-[#10B981] rounded-[14px] lg:rounded-[18px]"
        >
          <span className="text-white font-poppins text-[16px] font-medium">
            Connect
          </span>
        </button>
      </div>
    </div>
  );
}
