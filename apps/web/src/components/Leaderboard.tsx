"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

// Mock data matching the image
const leaderboardData = [
  {
    rank: 1,
    name: "YangZ",
    score: "+8.2 USDC",
    avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=YangZ",
  },
  {
    rank: 2,
    name: "lkbhua24",
    score: "+5.1 USDC",
    avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=lkbhua24",
  },
  {
    rank: 3,
    name: "Dave_DeFi",
    score: "+3.4 USDC",
    avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Dave_DeFi",
  },
  {
    rank: 4,
    name: "Eve_NFT",
    score: "+2.8 USDC",
    avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Eve_NFT",
  },
  {
    rank: 5,
    name: "Frank_Whale",
    score: "+1.9 USDC",
    avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Frank_Whale",
  },
  {
    rank: 6,
    name: "Grace_Yield",
    score: "+1.2 USDC",
    avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Grace_Yield",
  },
  {
    rank: 7,
    name: "Helen_Stake",
    score: "+0.9 USDC",
    avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Helen_Stake",
  },
];

export default function Leaderboard() {
  return (
    <div className="bg-white/40 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          <h3 className="text-lg font-bold text-gray-800">排行榜</h3>
        </div>
        <span className="px-3 py-1 bg-white/50 rounded-full text-xs font-medium text-gray-600">
          本周
        </span>
      </div>

      <div className="space-y-3">
        {leaderboardData.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between bg-white/60 rounded-xl p-3 hover:bg-white/80 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                  item.rank === 1
                    ? "bg-yellow-400 text-yellow-900 shadow-yellow-200"
                    : item.rank === 2
                    ? "bg-gray-300 text-gray-800"
                    : item.rank === 3
                    ? "bg-orange-300 text-orange-900"
                    : "bg-gray-100 text-gray-500"
                } shadow-sm`}
              >
                {item.rank}
              </div>
              <img
                src={item.avatar}
                alt={item.name}
                className="w-8 h-8 rounded-full bg-gray-200"
              />
              <span className="font-semibold text-gray-800 text-sm">
                {item.name}
              </span>
            </div>
            <div className="text-sm font-bold text-green-600">{item.score}</div>
          </motion.div>
        ))}
      </div>

      <Link
        href="/leaderboard"
        className="w-full mt-6 py-3 text-sm text-gray-600 font-medium hover:text-gray-900 flex items-center justify-center gap-1 transition-colors"
      >
        点击查看更多
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </Link>
    </div>
  );
}
