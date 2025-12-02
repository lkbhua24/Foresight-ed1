import React from "react";

export default function ChannelNavBar() {
  const items = ["科技", "天气", "时政", "娱乐", "体育", "更多"];

  return (
    <div className="relative z-20 w-full max-w-[1200px] mx-auto mt-6 mb-2 px-4">
      <div className="flex items-center justify-center gap-8 py-3 px-8 bg-gradient-to-r from-[#F8C0E0]/40 via-[#FDD4E9]/40 to-[#FFE3F2]/40 backdrop-blur-md rounded-full border border-white/40 shadow-sm">
        {items.map((item) => (
          <button
            key={item}
            className="text-lg font-bold transition-all hover:scale-110 text-[#1D2B3A]"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
