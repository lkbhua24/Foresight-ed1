"use client";

import React, { useState } from "react";
import Leaderboard from "@/components/Leaderboard";
import TrendingSearchBar from "@/components/TrendingSearchBar";
import ChannelNavBar from "@/components/ChannelNavBar";

export default function LeaderboardPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <main className="h-full w-full bg-gradient-to-br from-[#F8C1C4] to-[#FDD4E9] flex flex-col items-center overflow-hidden">
      {/* Search Bar and Navigation */}
      <div className="w-full pt-4 pb-2">
        <TrendingSearchBar value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        <ChannelNavBar />
      </div>

      <div className="w-full max-w-7xl flex-1 px-8 pb-8">
        <Leaderboard />
      </div>
    </main>
  );
}
