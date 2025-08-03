import React from "react";

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

interface MatchCardProps {
  user: User;
}

export default function MatchCard({ user }: MatchCardProps) {
  return (
    <div className="w-full h-[480px] border border-[#D5E0F6] rounded-[19px] bg-white shadow-[1.581px_1.581px_3.162px_0_rgba(174,191,237,0.25)] relative overflow-hidden">
      {/* Header Section */}
      <div className="relative w-[calc(100%-24px)] h-[100px] mx-auto mt-[12px] rounded-[14px] bg-gradient-to-br from-[#2D313C] to-[#1D1F26] flex items-center justify-center">
        <h2 className="text-[16px] font-semibold bg-gradient-to-r from-[#B0B9FF] to-[#E7E9FF] bg-clip-text text-transparent font-poppins text-center px-4">
          {user.category}
        </h2>
      </div>

      {/* Profile Picture */}
      <div className="absolute left-[24px] top-[60px] w-[80px] h-[80px] rounded-full border-[3px] border-white z-50">
        <img
          src={user.image}
          alt={user.name}
          className="w-full h-full rounded-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="px-[24px] pt-[32px] pb-[20px]">
        {/* Name, Username and Send Message Button */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-[#1F242F] font-poppins text-[16px] font-semibold">
                {user.name}
              </h3>
              {/* Match Badge */}
              <div className="bg-[rgba(16,185,129,0.25)] rounded-[8px] px-[8px] pb-[4px]">
                <span className="text-[#10B981] font-poppins text-[10px] font-semibold">
                  {user.matchPercentage}% Match
                </span>
              </div>
            </div>
            <p className="text-[#666] font-poppins text-[12px]">
              {user.username}
            </p>
          </div>
          <button className="bg-[#10B981] text-white px-[12px] py-[6px] rounded-lg font-poppins text-[12px] font-medium ml-3">
            Send Message
          </button>
        </div>

        {/* Description */}
        <div className="mt-[12px] mb-[12px]">
          <p className="text-[#666] font-poppins text-[12px] leading-[18px]">
            {user.description}
          </p>
        </div>

        {/* Website */}
        <div className="flex items-center gap-[6px] mb-[6px]">
          <svg
            className="w-[16px] h-[16px]"
            viewBox="0 0 12 13"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6.89963 9.11044L6.24749 9.76258C5.81509 10.195 5.22864 10.4379 4.61714 10.4379C4.00564 10.4379 3.41919 10.195 2.98679 9.76258C2.5544 9.33019 2.31148 8.74373 2.31148 8.13223C2.31148 7.52073 2.5544 6.93428 2.98679 6.50188L3.63893 5.84975"
              stroke="#10B981"
              strokeWidth="1.18577"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5.59766 3.89337L6.2498 3.24123C6.68219 2.80884 7.26864 2.56592 7.88014 2.56592C8.49164 2.56592 9.0781 2.80884 9.51049 3.24123C9.94289 3.67363 10.1858 4.26008 10.1858 4.87158C10.1858 5.48308 9.94289 6.06953 9.51049 6.50193L8.85835 7.15407"
              stroke="#10B981"
              strokeWidth="1.18577"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4.94336 7.80627L7.55192 5.19772"
              stroke="#10B981"
              strokeWidth="1.18577"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[#10B981] font-inter text-[12px] font-medium">
            {user.website}
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-[6px] mb-[6px]">
          <svg
            className="w-[16px] h-[16px]"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.54879 4.91389C7.54879 5.27636 7.4048 5.62398 7.1485 5.88028C6.89219 6.13658 6.54457 6.28057 6.18211 6.28057C5.81964 6.28057 5.47202 6.13658 5.21572 5.88028C4.95942 5.62398 4.81543 5.27636 4.81543 4.91389C4.81543 4.55142 4.95942 4.2038 5.21572 3.9475C5.47202 3.6912 5.81964 3.54721 6.18211 3.54721C6.54457 3.54721 6.89219 3.6912 7.1485 3.9475C7.4048 4.2038 7.54879 4.55142 7.54879 4.91389Z"
              stroke="#10B981"
              strokeWidth="0.71305"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9.59902 4.91328C9.59902 8.16689 6.18232 10.0383 6.18232 10.0383C6.18232 10.0383 2.76562 8.16689 2.76562 4.91328C2.76562 4.00712 3.1256 3.13806 3.76635 2.49731C4.40711 1.85655 5.27616 1.49658 6.18232 1.49658C7.08849 1.49658 7.95754 1.85655 8.59829 2.49731C9.23905 3.13806 9.59902 4.00712 9.59902 4.91328Z"
              stroke="#10B981"
              strokeWidth="0.71305"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[#666] font-inter text-[12px]">
            {user.location}
          </span>
        </div>

        {/* Company */}
        <div className="flex items-center gap-[6px] mb-[12px]">
          <svg
            className="w-[16px] h-[16px]"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.42383 9.69678H9.94056M2.7655 1.4967H9.59889M3.10717 1.4967V9.69678M9.25722 1.4967V9.69678M4.81552 3.20505H5.49886M4.81552 4.57173H5.49886M4.81552 5.93841H5.49886M6.86554 3.20505H7.54887M6.86554 4.57173H7.54887M6.86554 5.93841H7.54887M4.81552 9.69678V8.15926C4.81552 7.87636 5.04512 7.64676 5.32802 7.64676H7.03637C7.31927 7.64676 7.54887 7.87636 7.54887 8.15926V9.69678"
              stroke="#10B981"
              strokeWidth="0.71305"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[#666] font-inter text-[12px]">
            {user.company}
          </span>
        </div>

        {/* Skills */}
        <div className="mb-[12px]">
          <h4 className="text-[#212121] font-poppins text-[12px] font-medium mb-[6px]">
            Skills
          </h4>
          <div className="flex flex-wrap gap-[6px]">
            {user.skills.slice(0, 3).map((skill, index) => (
              <div
                key={index}
                className="flex items-center gap-[4px] px-[8px] py-[4px] border border-[#10B981] rounded-[6px] bg-white"
              >
                <svg
                  className="w-[10px] h-[10px]"
                  viewBox="0 0 6 6"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0.855077 0.716431V3.28429C0.855077 3.4205 0.909185 3.55113 1.0055 3.64744C1.10181 3.74376 1.23244 3.79786 1.36865 3.79786H1.88222M0.855077 0.716431H0.512695M0.855077 0.716431H4.62127M1.88222 3.79786H3.59413M1.88222 3.79786L1.65397 4.48263M4.62127 0.716431H4.96365M4.62127 0.716431V3.28429C4.62127 3.4205 4.56716 3.55113 4.47085 3.64744C4.37454 3.74376 4.24391 3.79786 4.1077 3.79786H3.59413M3.59413 3.79786L3.82238 4.48263M1.65397 4.48263H3.82238M1.65397 4.48263L1.53984 4.82501M3.82238 4.48263L3.93651 4.82501M1.71103 2.77072L2.39579 2.08596L2.88608 2.57625C3.11644 2.24557 3.41658 1.96951 3.76532 1.76754"
                    stroke="#10B981"
                    strokeWidth="0.342381"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-[#10B981] font-poppins text-[10px] font-semibold">
                  {skill}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Events Attending */}
        <div>
          <h4 className="text-[#212121] font-poppins text-[12px] font-medium mb-[6px]">
            Events Attending
          </h4>
          <div className="space-y-[6px]">
            {user.events.slice(0, 2).map((event, index) => (
              <div key={index} className="flex items-center gap-[6px]">
                <svg
                  className="w-[16px] h-[16px]"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.54879 5.26182C7.54879 5.62429 7.4048 5.97191 7.1485 6.22821C6.89219 6.48451 6.54457 6.6285 6.18211 6.6285C5.81964 6.6285 5.47202 6.48451 5.21572 6.22821C4.95942 5.97191 4.81543 5.62429 4.81543 5.26182C4.81543 4.89935 4.95942 4.55173 5.21572 4.29543C5.47202 4.03913 5.81964 3.89514 6.18211 3.89514C6.54457 3.89514 6.89219 4.03913 7.1485 4.29543C7.4048 4.55173 7.54879 4.89935 7.54879 5.26182Z"
                    stroke="#10B981"
                    strokeWidth="0.71305"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9.59902 5.2621C9.59902 8.5157 6.18232 10.3871 6.18232 10.3871C6.18232 10.3871 2.76562 8.5157 2.76562 5.2621C2.76562 4.35593 3.1256 3.48688 3.76635 2.84613C4.40711 2.20537 5.27616 1.8454 6.18232 1.8454C7.08849 1.8454 7.95754 2.20537 8.59829 2.84613C9.23905 3.48688 9.59902 4.35593 9.59902 5.2621Z"
                    stroke="#10B981"
                    strokeWidth="0.71305"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-[#666] font-inter text-[12px]">
                  {event}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
