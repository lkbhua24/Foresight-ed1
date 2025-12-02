import React from "react";
import { Trophy, TrendingUp, ChevronRight } from "lucide-react";
import Link from "next/link";

const leaderboardData = [
  { rank: 1, user: "imokokok", pnl: "+12.5 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=imokokok" },
  { rank: 2, user: "YangZ", pnl: "+8.2 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=YangZ" },
  { rank: 3, user: "lkbhua24", pnl: "+5.1 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=lkbhua24" },
  { rank: 4, user: "Dave_DeFi", pnl: "+3.4 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Dave" },
  { rank: 5, user: "Eve_NFT", pnl: "+2.8 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Eve" },
  { rank: 6, user: "Frank_Whale", pnl: "+1.9 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Frank" },
  { rank: 7, user: "Grace_Yield", pnl: "+1.2 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Grace" },
  { rank: 8, user: "Helen_Stake", pnl: "+0.9 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Helen" },
  { rank: 9, user: "Ivan_HODL", pnl: "-0.5 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Ivan" },
  { rank: 10, user: "Jack_Trade", pnl: "-1.1 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Jack" },
];

export default function TrendingLeaderboard() {
  // 显示前8名用户
  const displayData = leaderboardData.slice(0, 8);

  return (
    <div className="w-full h-full flex flex-col bg-[#F8C3C8] rounded-3xl p-4">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-[#1D2B3A]" />
          <h3 className="text-xl font-bold text-[#1D2B3A]">
            排行榜
          </h3>
        </div>
        <div className="text-xs font-bold px-2 py-1 rounded-full bg-white/30 text-[#1D2B3A]">
          本周
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-2">
          {displayData.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2.5 rounded-2xl bg-white/20 hover:bg-white/30 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                    index === 0
                      ? "bg-yellow-400 text-[#1D2B3A] shadow-lg shadow-yellow-400/50"
                      : index === 1
                      ? "bg-[#C0C0C0] text-[#1D2B3A] shadow-lg shadow-gray-400/50"
                      : index === 2
                      ? "bg-[#CD7F32] text-[#1D2B3A] shadow-lg shadow-orange-900/30"
                      : "bg-white/40 text-[#1D2B3A]"
                  }`}
                >
                  {item.rank}
                </div>
                <div className="flex items-center gap-2">
                  <img
                    src={item.avatar}
                    alt={item.user}
                    className="w-8 h-8 rounded-full bg-white/50"
                  />
                  <span className="text-sm font-bold text-[#1D2B3A]">
                    {item.user}
                  </span>
                </div>
              </div>
              <div className={`flex items-center gap-1 text-sm font-bold ${
                item.pnl.startsWith('-') ? 'text-[#E44823]' : 'text-[#18683E]'
              }`}>
                <TrendingUp className={`w-3 h-3 ${
                  item.pnl.startsWith('-') ? 'rotate-180' : ''
                }`} />
                {item.pnl}
              </div>
            </div>
          ))}

          {/* View More Button */}
          <Link 
            href="/leaderboard"
            className="flex items-center justify-center p-2.5 rounded-2xl bg-white/20 hover:bg-white/30 transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-2 text-sm font-bold text-[#1D2B3A] group-hover:text-purple-600 transition-colors">
              <span>点击查看更多</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.4);
        }
      `}</style>
    </div>
  );
}
