"use client";

import React from "react";
import { motion } from "framer-motion";

// Mock data - same as the widget but could be expanded
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
  // Adding more data for the full page
  {
    rank: 8,
    name: "Ivan_Invest",
    score: "+0.8 USDC",
    avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Ivan_Invest",
  },
  {
    rank: 9,
    name: "Jack_Trade",
    score: "+0.7 USDC",
    avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Jack_Trade",
  },
  {
    rank: 10,
    name: "Kate_Hold",
    score: "+0.5 USDC",
    avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Kate_Hold",
  },
];

export default function LeaderboardPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white/40 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/50">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏆</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">排行榜</h1>
              <p className="text-gray-500 text-sm mt-1">实时更新的收益排行</p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="px-4 py-2 bg-white/80 rounded-full text-sm font-medium text-gray-800 shadow-sm border border-gray-100 cursor-pointer hover:bg-white transition-colors">
              本周
            </span>
            <span className="px-4 py-2 bg-white/40 rounded-full text-sm font-medium text-gray-500 hover:bg-white/60 transition-colors cursor-pointer">
              本月
            </span>
            <span className="px-4 py-2 bg-white/40 rounded-full text-sm font-medium text-gray-500 hover:bg-white/60 transition-colors cursor-pointer">
              总榜
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-gray-500">
            <div className="col-span-2 text-center">排名</div>
            <div className="col-span-6">用户</div>
            <div className="col-span-4 text-right">收益</div>
          </div>

          {leaderboardData.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="grid grid-cols-12 gap-4 items-center bg-white/60 rounded-xl p-4 hover:bg-white/80 transition-colors cursor-pointer group"
            >
              <div className="col-span-2 flex justify-center">
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${
                    item.rank === 1
                      ? "bg-yellow-400 text-yellow-900 shadow-yellow-200 shadow-lg scale-110"
                      : item.rank === 2
                      ? "bg-gray-300 text-gray-800 shadow-md scale-105"
                      : item.rank === 3
                      ? "bg-orange-300 text-orange-900 shadow-md scale-105"
                      : "bg-gray-100 text-gray-500"
                  } transition-transform group-hover:scale-110`}
                >
                  {item.rank}
                </div>
              </div>
              <div className="col-span-6 flex items-center gap-4">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white shadow-sm"
                />
                <span className="font-semibold text-gray-800 text-base">
                  {item.name}
                </span>
              </div>
              <div className="col-span-4 text-right text-base font-bold text-green-600">
                {item.score}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
