"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Users,
  BarChart3,
  MessageSquare,
  Heart,
  Pin,
  Flag,
  LogIn,
  Trophy,
} from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { useAuth } from "@/contexts/AuthContext";
import WalletModal from "./WalletModal";

type MenuItem = {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  requireWallet?: boolean;
  children?: MenuItem[];
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { account } = useWallet();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    markets: true,
    community: true,
    profile: true,
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const menu: MenuItem[] = useMemo(
    () => [
      {
        label: "导航栏",
        children: [
          {
            label: "热门趋势",
            href: "/trending",
            icon: <BarChart3 className="w-4 h-4" />,
          },
          {
            label: "排行榜",
            href: "/leaderboard",
            icon: <Trophy className="w-4 h-4" />,
          },
          {
            label: "论坛",
            href: "/forum",
            icon: <MessageSquare className="w-4 h-4" />,
          },
          {
            label: "我的Flag",
            href: "/flags",
            icon: <Flag className="w-4 h-4" />,
          },
          {
            label: "提案频道",
            href: "/proposals",
            icon: <Pin className="w-4 h-4" />,
          },
          {
            label: "我的关注",
            href: "/my-follows",
            icon: <Heart className="w-4 h-4" />,
            requireWallet: true,
          },
          ...(isAdmin
            ? [
                {
                  label: "管理员中心",
                  href: "/admin/predictions/new",
                  icon: <Users className="w-4 h-4" />,
                  requireWallet: true,
                },
              ]
            : []),
        ],
      },
    ],
    [isAdmin]
  );

  const isActive = (href?: string) => !!href && pathname === href;

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const onItemClick = (item: MenuItem) => {
    if (item.requireWallet && !account) {
      setWalletModalOpen(true);
      return;
    }
    if (item.href) {
      router.push(item.href);
      setMobileOpen(false);
      if (!isPinned) setIsExpanded(false);
    }
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const run = async () => {
      try {
        if (!account) {
          setIsAdmin(false);
          return;
        }
        const res = await fetch(
          `/api/user-profiles?address=${String(account).toLowerCase()}`,
          { cache: "no-store" }
        );
        const j = await res.json().catch(() => ({}));
        setIsAdmin(!!j?.profile?.is_admin);
      } catch {
        setIsAdmin(false);
      }
    };
    run();
  }, [account]);

  return (
    <>
      <div className="lg:hidden fixed top-3 left-3 z-50">
        <button
          className="px-3 py-2 rounded-xl bg-white/80 text-black border border-gray-200 shadow-sm"
          onClick={() => setMobileOpen((v) => !v)}
        >
          菜单
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ width: 60 }}
        animate={{ width: isExpanded ? 200 : 60 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => {
          if (!isPinned) setIsExpanded(false);
        }}
        className={`fixed lg:sticky top-0 lg:top-0 z-50 lg:z-10 h-screen lg:h-[calc(100vh)] flex-shrink-0 border-r border-[#F472B6]/60 backdrop-blur ${
          mobileOpen ? "left-0" : "-left-[260px] lg:left-0"
        } ${
          pathname === '/leaderboard' 
            ? "bg-gradient-to-br from-[#F8C1C4] to-[#FDD4E9]" 
            : "bg-gradient-to-b from-purple-50 to-pink-50"
        }`}
      >
        {/* Toggle Button */}
        <button
          className="absolute top-1/2 -right-3 transform -translate-y-1/2 w-6 h-6 bg-white rounded-full border border-purple-200 shadow-md flex items-center justify-center z-50 text-purple-500 hover:text-purple-700 hover:scale-110 transition-all"
          onClick={(e) => {
            e.stopPropagation();
            if (isPinned) {
              setIsPinned(false);
              setIsExpanded(false);
            } else {
              setIsPinned(true);
              setIsExpanded(true);
            }
          }}
        >
          {isPinned ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          )}
        </button>

        <div className="flex flex-col h-full p-3 items-center overflow-visible relative">
          <div className={`flex items-center ${isExpanded ? 'justify-start w-full px-2' : 'justify-center'} mb-6 relative transition-all duration-300`}>
            <img
              src="/images/logo.png"
              alt="Foresight"
              className="w-8 h-8 hover:scale-110 transition-transform duration-200 flex-shrink-0 z-10"
            />
            
            {/* Brand Name: Animated Position */}
            <motion.span 
              animate={{ 
                left: isExpanded ? 50 : 84,
                opacity: 1
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute top-1/2 -translate-y-1/2 text-xl font-black italic bg-gradient-to-r from-violet-700 via-fuchsia-600 to-orange-500 bg-clip-text text-transparent drop-shadow-sm whitespace-nowrap z-20"
            >
              Foresight
            </motion.span>
          </div>

          {/* 搜索框已移除 */}

          <div className="flex-1 overflow-y-auto w-full flex flex-col items-center no-scrollbar mt-[10px]">
            <div className="space-y-4 w-full flex flex-col items-center">
              {/* 导航分组 */}
              <div className="w-full flex flex-col items-center gap-2">
                {isExpanded && (
                   <motion.div
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: "auto" }}
                     exit={{ opacity: 0, height: 0 }}
                     className="w-full text-xs font-semibold text-gray-400 px-4 mb-1 whitespace-nowrap"
                   >
                     导航栏
                   </motion.div>
                )}
                {menu[0].children!.map((it) => (
                  <button
                    key={it.label}
                    onClick={() => onItemClick(it)}
                    title={isExpanded ? "" : it.label}
                    className={`flex items-center ${isExpanded ? 'justify-start px-3 w-full' : 'justify-center w-10'} h-10 rounded-xl transition-all overflow-hidden ${
                      isActive(it.href)
                        ? (it.href === '/leaderboard' 
                            ? "bg-white/40 text-[#1D2B3A] font-bold shadow-sm" 
                            : "bg-purple-100 text-purple-600")
                        : "hover:bg-white/70 text-gray-500 hover:text-purple-600"
                    }`}
                  >
                    <div className="flex-shrink-0 flex items-center justify-center w-6 h-6">
                       {it.icon}
                    </div>
                    {isExpanded && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="ml-3 text-sm font-medium whitespace-nowrap"
                      >
                        {it.label}
                      </motion.span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 用户区 */}
          <div className="mt-4 w-full flex justify-center">
            {account || user ? (
              isExpanded ? (
                 <div 
                   className={`flex items-center gap-3 w-full p-2 rounded-xl cursor-pointer transition-all overflow-hidden ${
                     pathname === '/leaderboard'
                       ? "bg-white/40 border border-white/20 shadow-sm"
                       : "bg-white/50 border border-[#F472B6]/30 hover:bg-white/80"
                   }`}
                   onClick={() => setWalletModalOpen(true)}
                 >
                    <div className="w-8 h-8 rounded-full bg-white border border-[#F472B6]/60 overflow-hidden flex-shrink-0">
                      <img
                        src={`https://api.dicebear.com/7.x/identicon/svg?seed=${
                          account || user?.email || "guest"
                        }`}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                       <span className={`text-sm font-bold truncate ${
                         pathname === '/leaderboard' ? "text-[#1D2B3A]" : "text-gray-800"
                       }`}>
                         {account ? `${String(account).slice(0,6)}...${String(account).slice(-4)}` : user?.email?.split('@')[0]}
                       </span>
                       <span className={`text-xs truncate ${
                         pathname === '/leaderboard' ? "text-[#1D2B3A]/70" : "text-gray-500"
                       }`}>查看详情</span>
                    </div>
                 </div>
              ) : (
                <div className={`flex items-center justify-center w-10 h-10 rounded-full overflow-hidden cursor-pointer transition-all ${
                  pathname === '/leaderboard'
                    ? "bg-white/40 border border-white/20 shadow-sm"
                    : "bg-white/80 border border-[#F472B6]/60 hover:ring-2 hover:ring-[#F472B6]/30"
                }`}>
                  <img
                    src={`https://api.dicebear.com/7.x/identicon/svg?seed=${
                      account || user?.email || "guest"
                    }`}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              )
            ) : (
              isExpanded ? (
                <button
                  className={`flex items-center justify-center w-full h-10 rounded-xl shadow-sm hover:shadow-md transition-all gap-2 ${
                    pathname === '/leaderboard'
                      ? "bg-white/40 text-[#1D2B3A] border border-white/20"
                      : "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  }`}
                  onClick={() => setWalletModalOpen(true)}
                >
                  <LogIn className="w-4 h-4" />
                  <span className="text-sm font-bold">立即登录</span>
                </button>
              ) : (
                <button
                  className={`flex items-center justify-center w-10 h-10 rounded-xl shadow-sm hover:shadow-md transition-all ${
                    pathname === '/leaderboard'
                      ? "bg-white/40 text-[#1D2B3A] border border-white/20"
                      : "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  }`}
                  onClick={() => setWalletModalOpen(true)}
                  title="登录"
                >
                  <LogIn className="w-5 h-5" />
                </button>
              )
            )}
          </div>
        </div>
      </motion.aside>

      <WalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
      />
    </>
  );
}
