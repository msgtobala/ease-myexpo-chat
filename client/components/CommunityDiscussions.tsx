import React from 'react';

export default function CommunityDiscussions() {
  const communities = [
    {
      name: "Expo BLR",
      description: "Official bangalore...",
      image: "https://api.builder.io/api/v1/image/assets/TEMP/420294678ac6505d9c5a5d63c2e787c16492d634?width=90"
    },
    {
      name: "Expo Delhi", 
      description: "Join us in delhi expo...",
      image: "https://api.builder.io/api/v1/image/assets/TEMP/e4aec95ad6b910adf1f8a48fc3c50628387d932c?width=55"
    },
    {
      name: "Digital Expo",
      description: "World's largest dig...",
      image: "https://api.builder.io/api/v1/image/assets/TEMP/420294678ac6505d9c5a5d63c2e787c16492d634?width=90"
    }
  ];

  return (
    <div className="w-full bg-[#FCFDFD] rounded-[16px] p-6">
      {/* Title */}
      <h2 className="text-[16px] font-medium text-[#212121] mb-8">Community Discussions</h2>
      
      {/* Community List */}
      <div className="space-y-6">
        {communities.map((community, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-[37px] h-[40px] rounded-full overflow-hidden">
                <img 
                  src={community.image} 
                  alt={community.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-[14px] lg:text-[16px] font-medium text-[#212121] leading-6">{community.name}</h3>
                <p className="text-[10px] lg:text-[11px] font-light text-[#212121] leading-4">{community.description}</p>
              </div>
            </div>
            
            {/* Join Button - only show for first 3 items */}
            {index < 3 && (
              <button className="w-[65px] h-[32px] border border-[#10B981] bg-white rounded-lg flex items-center justify-center">
                <span className="text-[12px] font-medium text-[#10B981]">Join</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* See All Button */}
      <div className="mt-8 flex justify-center">
        <button className="text-[12px] font-medium text-[#10B981]">See All</button>
      </div>
    </div>
  );
}
