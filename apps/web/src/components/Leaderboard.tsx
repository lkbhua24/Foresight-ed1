import React, { useState } from "react";
import { Trophy, TrendingUp, User, ChevronDown, Search } from "lucide-react";

const categories = [
  { id: 'all', name: '所有类型' },
  { id: 'tech', name: '科技' },
  { id: 'sports', name: '体育' },
  { id: 'finance', name: '金融' },
  { id: 'politics', name: '政治' },
  { id: 'entertainment', name: '娱乐' },
];

const todayData = [
  { rank: 1, user: "Bob_Crypto", pnl: "+2.5 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Bob", category: "finance" },
  { rank: 2, user: "Alice_01", pnl: "+2.1 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Alice", category: "tech" },
  { rank: 3, user: "Dave_DeFi", pnl: "+1.8 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Dave", category: "finance" },
  { rank: 4, user: "Charlie_DAO", pnl: "+1.5 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Charlie", category: "politics" },
  { rank: 5, user: "Eve_NFT", pnl: "+1.2 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Eve", category: "entertainment" },
  { rank: 6, user: "Frank_Whale", pnl: "+0.9 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Frank", category: "finance" },
  { rank: 7, user: "Grace_Yield", pnl: "+0.7 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Grace", category: "finance" },
  { rank: 8, user: "Helen_Stake", pnl: "+0.5 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Helen", category: "tech" },
  { rank: 9, user: "Ivan_HODL", pnl: "-0.1 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Ivan", category: "crypto" },
  { rank: 10, user: "Jack_Trade", pnl: "-0.3 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Jack", category: "sports" },
  { rank: 11, user: "Kelly_Swap", pnl: "-0.5 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Kelly", category: "finance" },
  { rank: 12, user: "Leo_Mining", pnl: "-0.8 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Leo", category: "tech" },
  { rank: 13, user: "Mia_Token", pnl: "-1.1 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Mia", category: "crypto" },
  { rank: 14, user: "Nick_Chain", pnl: "-1.4 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Nick", category: "tech" },
  { rank: 15, user: "Olivia_Web3", pnl: "-1.8 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Olivia", category: "entertainment" },
  { rank: 16, user: "Peter_Block", pnl: "-2.1 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Peter", category: "politics" },
  { rank: 17, user: "Queen_Meta", pnl: "-2.5 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Queen", category: "tech" },
  { rank: 18, user: "Roger_Bridge", pnl: "-2.9 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Roger", category: "finance" },
  { rank: 19, user: "Sarah_Node", pnl: "-3.2 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Sarah", category: "tech" },
  { rank: 20, user: "Tom_Gas", pnl: "-3.5 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Tom", category: "sports" },
];

const weekData = [
  { rank: 1, user: "imokokok", pnl: "+12.5 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=imokokok", category: "tech" },
  { rank: 2, user: "YangZ", pnl: "+8.2 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=YangZ", category: "finance" },
  { rank: 3, user: "lkbhua24", pnl: "+5.1 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=lkbhua24", category: "politics" },
  { rank: 4, user: "Dave_DeFi", pnl: "+3.4 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Dave", category: "finance" },
  { rank: 5, user: "Eve_NFT", pnl: "+2.8 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Eve", category: "entertainment" },
  { rank: 6, user: "Frank_Whale", pnl: "+1.9 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Frank", category: "finance" },
  { rank: 7, user: "Grace_Yield", pnl: "+1.2 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Grace", category: "finance" },
  { rank: 8, user: "Helen_Stake", pnl: "+0.9 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Helen", category: "tech" },
  { rank: 9, user: "Ivan_HODL", pnl: "-0.5 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Ivan", category: "crypto" },
  { rank: 10, user: "Jack_Trade", pnl: "-1.1 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Jack", category: "sports" },
  { rank: 11, user: "Kelly_Swap", pnl: "-1.8 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Kelly", category: "finance" },
  { rank: 12, user: "Leo_Mining", pnl: "-2.3 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Leo", category: "tech" },
  { rank: 13, user: "Mia_Token", pnl: "-2.9 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Mia", category: "crypto" },
  { rank: 14, user: "Nick_Chain", pnl: "-3.5 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Nick", category: "tech" },
  { rank: 15, user: "Olivia_Web3", pnl: "-4.2 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Olivia", category: "entertainment" },
  { rank: 16, user: "Peter_Block", pnl: "-5.0 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Peter", category: "politics" },
  { rank: 17, user: "Queen_Meta", pnl: "-6.1 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Queen", category: "tech" },
  { rank: 18, user: "Roger_Bridge", pnl: "-7.4 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Roger", category: "finance" },
  { rank: 19, user: "Sarah_Node", pnl: "-8.8 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Sarah", category: "tech" },
  { rank: 20, user: "Tom_Gas", pnl: "-10.2 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Tom", category: "sports" },
];

const monthData = [
  { rank: 1, user: "Charlie_DAO", pnl: "+45.1 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Charlie", category: "politics" },
  { rank: 2, user: "Alice_01", pnl: "+32.5 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Alice", category: "tech" },
  { rank: 3, user: "Bob_Crypto", pnl: "+28.2 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Bob", category: "finance" },
  { rank: 4, user: "Eve_NFT", pnl: "+22.8 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Eve", category: "entertainment" },
  { rank: 5, user: "Dave_DeFi", pnl: "+18.4 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Dave", category: "finance" },
  { rank: 6, user: "Grace_Yield", pnl: "+12.2 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Grace", category: "finance" },
  { rank: 7, user: "Frank_Whale", pnl: "+11.9 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Frank", category: "finance" },
  { rank: 8, user: "Helen_Stake", pnl: "+8.9 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Helen", category: "tech" },
  { rank: 9, user: "Ivan_HODL", pnl: "-1.5 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Ivan", category: "crypto" },
  { rank: 10, user: "Kelly_Swap", pnl: "-3.8 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Kelly", category: "finance" },
  { rank: 11, user: "Jack_Trade", pnl: "-5.1 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Jack", category: "sports" },
  { rank: 12, user: "Leo_Mining", pnl: "-8.3 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Leo", category: "tech" },
  { rank: 13, user: "Mia_Token", pnl: "-10.9 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Mia", category: "crypto" },
  { rank: 14, user: "Nick_Chain", pnl: "-12.5 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Nick", category: "tech" },
  { rank: 15, user: "Olivia_Web3", pnl: "-15.2 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Olivia", category: "entertainment" },
  { rank: 16, user: "Peter_Block", pnl: "-18.0 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Peter", category: "politics" },
  { rank: 17, user: "Queen_Meta", pnl: "-21.1 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Queen", category: "tech" },
  { rank: 18, user: "Roger_Bridge", pnl: "-24.4 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Roger", category: "finance" },
  { rank: 19, user: "Sarah_Node", pnl: "-28.8 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Sarah", category: "tech" },
  { rank: 20, user: "Tom_Gas", pnl: "-32.2 USDC", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Tom", category: "sports" },
];

export default function Leaderboard() {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('week');
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const getData = () => {
    let data;
    switch (timeRange) {
      case 'today': data = todayData; break;
      case 'month': data = monthData; break;
      default: data = weekData; break;
    }

    if (category !== 'all') {
      data = data.filter(item => item.category === category);
    }

    if (searchQuery) {
      data = data.filter(item => 
        item.user.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return data;
  };

  const currentCategoryName = categories.find(c => c.id === category)?.name || '所有类型';

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-col gap-4 mb-6 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Trophy className="w-10 h-10 text-[#1D2B3A]" />
            <h3 className="text-3xl font-bold text-[#1D2B3A]">
              排行榜
            </h3>
          </div>
          
          <div className="flex items-center p-1 bg-white/10 rounded-full">
            {[
              { key: 'today', label: '本日' },
              { key: 'week', label: '本周' },
              { key: 'month', label: '本月' },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setTimeRange(item.key as any)}
                className={`text-base font-bold px-4 py-2 rounded-full transition-all ${
                  timeRange === item.key
                    ? "bg-white/30 text-[#1D2B3A] shadow-sm"
                    : "text-[#1D2B3A] hover:bg-white/10"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-[#1D2B3A]/50" />
            </div>
            <input
              type="text"
              placeholder="搜索用户..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/30 backdrop-blur-md text-[#1D2B3A] placeholder-[#1D2B3A]/50 border-none outline-none focus:ring-2 focus:ring-white/50 transition-all font-bold"
            />
          </div>

          {/* Category Filter */}
          <div className="relative z-20">
            <button
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="flex items-center gap-2 text-base font-bold px-4 py-2 rounded-xl bg-white/30 text-[#1D2B3A] hover:bg-white/40 transition-all min-w-[140px] justify-between"
            >
              <span>{currentCategoryName}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
            </button>

            {isCategoryOpen && (
              <div className="absolute top-full right-0 mt-2 w-40 bg-white/30 backdrop-blur-md rounded-xl shadow-xl border border-white/20 overflow-hidden py-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setCategory(cat.id);
                      setIsCategoryOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-colors ${
                      category === cat.id
                        ? "bg-[#1D2B3A]/10 text-[#1D2B3A]"
                        : "text-[#1D2B3A] hover:bg-[#1D2B3A]/5"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar max-h-[900px]">
        <div className="space-y-4">
          {getData().map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-5 rounded-3xl bg-white/20 hover:bg-white/30 transition-colors group"
            >
              <div className="flex items-center gap-6">
                <div
                  className={`w-12 h-12 flex items-center justify-center rounded-full text-xl font-bold ${
                    index === 0
                      ? "bg-yellow-400 text-[#1D2B3A] shadow-lg shadow-yellow-400/50"
                      : index === 1
                      ? "bg-[#C0C0C0] text-[#1D2B3A] shadow-lg shadow-gray-400/50"
                      : index === 2
                      ? "bg-[#CD7F32] text-[#1D2B3A] shadow-lg shadow-orange-900/30"
                      : "bg-white/40 text-[#1D2B3A]"
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex items-center gap-4">
                  <img
                    src={item.avatar}
                    alt={item.user}
                    className="w-14 h-14 rounded-full bg-white/50"
                  />
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-[#1D2B3A]">
                      {item.user}
                    </span>
                    <span className="text-xs font-medium text-[#1D2B3A]/60">
                      {categories.find(c => c.id === item.category)?.name}
                    </span>
                  </div>
                </div>
              </div>
              <div className={`flex items-center gap-2 text-xl font-bold ${
                item.pnl.startsWith('-') ? 'text-[#E44823]' : 'text-[#18683E]'
              }`}>
                <TrendingUp className={`w-6 h-6 ${
                  item.pnl.startsWith('-') ? 'rotate-180' : ''
                }`} />
                {item.pnl}
              </div>
            </div>
          ))}
          {getData().length === 0 && (
             <div className="flex flex-col items-center justify-center py-10 text-[#1D2B3A]/50">
               <p className="text-lg font-bold">未找到相关用户</p>
             </div>
          )}
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
