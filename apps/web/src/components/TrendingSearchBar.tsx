import React from "react";
import { Search } from "lucide-react";

interface TrendingSearchBarProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function TrendingSearchBar({ value, onChange }: TrendingSearchBarProps) {
  return (
    <div className="relative z-20 w-full max-w-[800px] mx-auto mt-[7px] px-4">
      <div className="relative group">
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder="搜索热门事件..."
          className="w-full py-1.5 px-8 rounded-full bg-white/80 backdrop-blur-xl border border-white/40 shadow-lg text-[#1D2B3A] font-bold text-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 group-hover:shadow-xl"
        />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400">
          <Search className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
