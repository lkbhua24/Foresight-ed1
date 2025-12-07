"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { useAuth } from "@/contexts/AuthContext";
import { getClient } from "@/lib/supabase";
import WalletModal from "@/components/WalletModal";
import { FlagCard, FlagItem } from "@/components/FlagCard";
import { FlagsStats } from "@/components/FlagsStats";
import {
  Loader2,
  Plus,
  Sparkles,
  ArrowRight,
  Smile,
  Target,
  Clock,
  Zap,
  Users,
  X,
  Camera,
  Flag,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FlagsPage() {
  const { account } = useWallet();
  const { user } = useAuth();
  const [flags, setFlags] = useState<FlagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  // Form state
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [verifType, setVerifType] = useState<"self" | "witness">("self");
  const [witnessId, setWitnessId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filterMine, setFilterMine] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "pending_review" | "success" | "failed"
  >("all");
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [checkinFlag, setCheckinFlag] = useState<FlagItem | null>(null);
  const [checkinNote, setCheckinNote] = useState("");
  const [checkinImage, setCheckinImage] = useState("");
  const [checkinSubmitting, setCheckinSubmitting] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyFlag, setHistoryFlag] = useState<FlagItem | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyItems, setHistoryItems] = useState<
    Array<{
      id: string;
      note: string;
      image_url?: string;
      created_at: string;
      review_status?: string;
      reviewer_id?: string;
      review_reason?: string;
    }>
  >([]);
  const [reviewSubmittingId, setReviewSubmittingId] = useState<string | null>(
    null
  );
  const [settlingId, setSettlingId] = useState<number | null>(null);
  const [officialCreate, setOfficialCreate] = useState(false);
  const [invitesCount, setInvitesCount] = useState(0);
  const [inviteNotice, setInviteNotice] = useState<{
    flag_id: number;
    owner_id: string;
    title: string;
    ts: string;
  } | null>(null);

  const supabase = getClient();

  const officialTemplates: Array<{
    id: string;
    title: string;
    description: string;
    icon: any;
    color: string;
    bg: string;
  }> = [
    {
      id: "early_morning",
      title: "早起挑战",
      description: "日出前把被子打败！",
      icon: Clock,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      id: "target_weight",
      title: "体重管理",
      description: "每天进步一点点",
      icon: Target,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      id: "feels_like_comfort",
      title: "舒适天气",
      description: "舒适区间打卡",
      icon: Smile,
      color: "text-pink-600",
      bg: "bg-pink-100",
    },
    {
      id: "weather_rain_tomorrow",
      title: "明天会下雨吗？",
      description: "和小雨打个赌",
      icon: Sparkles,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
  ];

  const loadFlags = async () => {
    try {
      setLoading(true);
      const me = account || user?.id || "";
      if (!me) {
        setFlags([]);
        return;
      }
      const res = await fetch(
        `/api/flags?viewer_id=${encodeURIComponent(me)}`,
        { cache: "no-store" }
      );
      if (!res.ok) {
        setFlags([]);
        return;
      }
      const payload = await res.json().catch(() => ({ flags: [] }));
      const list = Array.isArray(payload?.flags) ? payload.flags : [];
      setFlags(list as FlagItem[]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadInvites = async () => {
    try {
      const me = account || user?.id || "";
      if (!me || !supabase) {
        setInvitesCount(0);
        setInviteNotice(null);
        return;
      }
      const { data, error } = await (supabase as any)
        .from("discussions")
        .select("content,created_at")
        .eq("user_id", me)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) {
        setInvitesCount(0);
        setInviteNotice(null);
        return;
      }
      const items = (data || [])
        .map((r: any) => {
          try {
            const obj = JSON.parse(String(r.content || "{}"));
            if (obj && obj.type === "witness_invite") {
              return {
                flag_id: Number(obj.flag_id || 0),
                owner_id: String(obj.owner_id || ""),
                title: String(obj.title || ""),
                ts: String(obj.ts || r.created_at || ""),
              };
            }
          } catch {}
          return null;
        })
        .filter(Boolean) as any[];
      setInvitesCount(items.length);
      setInviteNotice(items[0] || null);
    } catch {
      setInvitesCount(0);
      setInviteNotice(null);
    }
  };

  useEffect(() => {
    if (!supabase) return;
    loadFlags();
    loadInvites();

    const ch = supabase
      .channel("flags-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "flags" },
        () => {
          loadFlags();
        }
      )
      .subscribe();

    const ch2 = supabase
      .channel("discussions-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "discussions" },
        () => {
          loadInvites();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
      supabase.removeChannel(ch2);
    };
  }, []);

  const handleCreateClick = () => {
    if (!account && !user) {
      setWalletModalOpen(true);
      return;
    }
    setOfficialCreate(false);
    setCreateOpen(true);
  };

  const createFlag = async () => {
    if (!newTitle.trim() || !newDeadline) return;
    if (!user && !account) return;

    try {
      setSubmitting(true);
      const payload: any = {
        user_id: account || user?.id || "anonymous",
        title: newTitle,
        description: newDesc,
        deadline: newDeadline,
        verification_type: officialCreate ? "self" : verifType,
        status: "active",
      };
      if (!officialCreate && verifType === "witness" && witnessId.trim())
        payload.witness_id = witnessId.trim();

      const res = await fetch("/api/flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "创建失败");
      }

      setCreateOpen(false);
      setNewTitle("");
      setNewDesc("");
      setNewDeadline("");
      setOfficialCreate(false);
    } catch (e) {
      alert("创建失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  const openCheckin = (flag: FlagItem) => {
    const me = account || user?.id || "";
    if (
      !me ||
      String(flag.user_id || "").toLowerCase() !== String(me).toLowerCase()
    ) {
      alert("仅创建者可打卡");
      return;
    }
    setCheckinFlag(flag);
    setCheckinNote("");
    setCheckinImage("");
    setCheckinOpen(true);
  };

  const submitCheckin = async () => {
    if (!checkinFlag) return;
    const me = account || user?.id || "";
    if (!me) return;
    try {
      setCheckinSubmitting(true);
      const payload = {
        flag_id: checkinFlag.id,
        user_id: me,
        note: checkinNote,
        image_url: checkinImage,
      };
      const res = await fetch("/api/flags/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const ret = await res.json().catch(() => ({} as any));
      if (!res.ok)
        throw new Error(
          String((ret as any)?.detail || (ret as any)?.message || "打卡失败")
        );
      setCheckinOpen(false);
      setCheckinFlag(null);
      setCheckinNote("");
      setCheckinImage("");
      await loadFlags();
    } catch (e) {
      alert(String((e as any)?.message || "打卡失败，请重试"));
    } finally {
      setCheckinSubmitting(false);
    }
  };

  const openHistory = async (flag: FlagItem) => {
    setHistoryFlag(flag);
    setHistoryItems([]);
    setHistoryLoading(true);
    setHistoryOpen(true);
    try {
      const me = account || user?.id || "";
      const res = await fetch(
        `/api/flags/${flag.id}/checkins?limit=50&viewer_id=${encodeURIComponent(
          me
        )}`,
        {
          cache: "no-store",
        }
      );
      const data = await res.json().catch(() => ({} as any));
      const items = Array.isArray(data?.items) ? data.items : [];
      setHistoryItems(items);
    } catch {
      // ignore
    } finally {
      setHistoryLoading(false);
    }
  };

  const reviewCheckin = async (
    checkinId: string,
    action: "approve" | "reject"
  ) => {
    const me = account || user?.id || "";
    if (!me) return alert("请先连接钱包或登录");
    try {
      setReviewSubmittingId(checkinId);
      const res = await fetch(`/api/checkins/${checkinId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reviewer_id: me }),
      });
      const ret = await res.json().catch(() => ({} as any));
      if (!res.ok)
        throw new Error(String(ret?.detail || ret?.message || "操作失败"));
      if (historyFlag) await openHistory(historyFlag);
    } catch (e) {
      alert(String((e as any)?.message || "操作失败"));
    } finally {
      setReviewSubmittingId(null);
    }
  };

  const settleFlag = async (flag: FlagItem) => {
    const me = account || user?.id || "";
    if (!me) return alert("请先连接钱包或登录");
    try {
      setSettlingId(flag.id as any);
      const res = await fetch(`/api/flags/${flag.id}/settle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settler_id: me }),
      });
      const ret = await res.json().catch(() => ({} as any));
      if (!res.ok)
        throw new Error(String(ret?.detail || ret?.message || "结算失败"));
      await loadFlags();
      alert(
        `结算完成：${String(ret?.status || "")}，通过天数 ${
          ret?.metrics?.approvedDays || 0
        }/${ret?.metrics?.totalDays || 0}`
      );
    } catch (e) {
      alert(String((e as any)?.message || "结算失败"));
    } finally {
      setSettlingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-32">
      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-purple-200/20 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] -left-[10%] w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-end justify-between mb-10 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-3">
              Flag 你的生活
            </h1>
            <p className="text-gray-500 font-medium text-lg">
              把目标变成日常，让坚持更有力量。
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreateClick}
            className="px-8 py-4 bg-gray-900 text-white rounded-[2rem] font-bold shadow-xl shadow-gray-900/20 hover:bg-gray-800 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            新建 Flag
          </motion.button>
        </div>

        {/* Stats Overview */}
        <FlagsStats flags={flags} />

        {/* Quick Start / Official Templates */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">灵感推荐</h2>
            <button className="text-sm font-bold text-purple-600 hover:text-purple-700">
              查看更多
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            {officialTemplates.map((tpl) => (
              <motion.div
                key={tpl.id}
                whileHover={{ y: -5 }}
                className={`min-w-[200px] p-6 rounded-[2rem] ${tpl.bg} cursor-pointer relative overflow-hidden group`}
                onClick={() => {
                  setNewTitle(tpl.title);
                  setNewDesc(tpl.description);
                  setVerifType("self");
                  setOfficialCreate(true);
                  setCreateOpen(true);
                }}
              >
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/20 rounded-full blur-xl transition-transform group-hover:scale-150" />
                <div
                  className={`w-10 h-10 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center mb-4 ${tpl.color}`}
                >
                  <tpl.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {tpl.title}
                </h3>
                <p className="text-sm text-gray-600/80 font-medium">
                  {tpl.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Invite Notice */}
        <AnimatePresence>
          {inviteNotice && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-amber-900">
                    收到监督邀请: {inviteNotice.title}
                  </div>
                  <div className="text-xs text-amber-700">
                    共 {invitesCount} 条待处理
                  </div>
                </div>
              </div>
              <button
                onClick={() => setInviteNotice(null)}
                className="px-4 py-2 bg-white rounded-xl text-xs font-bold text-amber-800 shadow-sm"
              >
                知道了
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 sticky top-4 z-20 py-2 bg-[#F5F7FA]/80 backdrop-blur-xl -mx-4 px-4 sm:mx-0 sm:px-0 sm:bg-transparent sm:backdrop-blur-none sm:relative sm:top-0 sm:py-0">
          <div className="flex items-center gap-1 p-1.5 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto w-full sm:w-auto">
            {[
              { id: "all", label: "全部" },
              { id: "active", label: "进行中" },
              { id: "pending_review", label: "审核中" },
              { id: "success", label: "已完成" },
              { id: "failed", label: "已结束" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                  statusFilter === tab.id
                    ? "bg-gray-900 text-white shadow-lg shadow-gray-900/10"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setFilterMine(!filterMine)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all border ${
              filterMine
                ? "bg-purple-50 border-purple-100 text-purple-700"
                : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"
            }`}
          >
            <Users className="w-4 h-4" />
            {filterMine ? "只看我的" : "只看我的"}
          </button>
        </div>

        {/* Main Grid */}
        {loading ? (
          <div className="flex justify-center py-32">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : flags.length === 0 ? (
          <div className="text-center py-32">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Flag className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              还没有 Flag
            </h3>
            <p className="text-gray-500 mb-8">开始你的第一个挑战吧！</p>
            <button
              onClick={handleCreateClick}
              className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold"
            >
              立即创建
            </button>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            <AnimatePresence>
              {flags
                .filter((f) =>
                  statusFilter === "all" ? true : f.status === statusFilter
                )
                .filter((f) => {
                  if (!filterMine) return true;
                  const me = account || user?.id || "";
                  return (
                    me &&
                    String(f.user_id || "").toLowerCase() ===
                      String(me).toLowerCase()
                  );
                })
                .sort(
                  (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
                )
                .map((flag) => (
                  <div key={flag.id} className="break-inside-avoid">
                    <FlagCard
                      flag={flag}
                      isMine={
                        Boolean(account || user?.id) &&
                        String(flag.user_id || "").toLowerCase() ===
                          String(account || user?.id || "").toLowerCase()
                      }
                      onCheckin={() => openCheckin(flag)}
                      onViewHistory={() => openHistory(flag)}
                      onSettle={() => settleFlag(flag)}
                    />
                  </div>
                ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {createOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setCreateOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl z-50 p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-gray-900">
                  {officialCreate ? "开启挑战" : "立个 Flag"}
                </h2>
                <button
                  onClick={() => setCreateOpen(false)}
                  className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">
                    目标名称
                  </label>
                  <input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="例如：每天喝8杯水"
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all font-bold text-lg text-gray-900"
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">
                    详细描述
                  </label>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="给自己定个小规则..."
                    rows={3}
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all text-gray-900 resize-none font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">
                    截止时间
                  </label>
                  <input
                    type="datetime-local"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-purple-500 outline-none transition-all text-gray-900 font-mono font-medium"
                  />
                </div>

                {!officialCreate && (
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">
                      监督方式
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setVerifType("self")}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${
                          verifType === "self"
                            ? "bg-purple-50 border-purple-500 ring-2 ring-purple-200"
                            : "bg-white border-gray-100 hover:border-gray-200"
                        }`}
                      >
                        <div className="font-bold text-gray-900 mb-1">
                          自觉打卡
                        </div>
                        <div className="text-xs text-gray-500">
                          自己记录，无需审核
                        </div>
                      </button>
                      <button
                        onClick={() => setVerifType("witness")}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${
                          verifType === "witness"
                            ? "bg-purple-50 border-purple-500 ring-2 ring-purple-200"
                            : "bg-white border-gray-100 hover:border-gray-200"
                        }`}
                      >
                        <div className="font-bold text-gray-900 mb-1">
                          好友监督
                        </div>
                        <div className="text-xs text-gray-500">
                          需指定好友审核
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {verifType === "witness" && !officialCreate && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-2"
                  >
                    <label className="text-sm font-bold text-gray-700 ml-1">
                      监督人地址/ID
                    </label>
                    <input
                      value={witnessId}
                      onChange={(e) => setWitnessId(e.target.value)}
                      placeholder="0x..."
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-purple-500 outline-none transition-all font-mono text-sm"
                    />
                  </motion.div>
                )}
              </div>

              <div className="mt-8">
                <button
                  onClick={createFlag}
                  disabled={submitting || !newTitle || !newDeadline}
                  className="w-full py-4 rounded-2xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-all shadow-xl shadow-gray-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      确定创建 <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <WalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
      />

      {/* Checkin Modal */}
      <AnimatePresence>
        {checkinOpen && checkinFlag && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setCheckinOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl z-50 p-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">
                    打卡时刻
                  </h3>
                  <p className="text-sm text-gray-500">记录你的每一次进步</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">
                    心得体会
                  </label>
                  <textarea
                    value={checkinNote}
                    onChange={(e) => setCheckinNote(e.target.value)}
                    placeholder="今天感觉如何？"
                    rows={4}
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-green-500 outline-none transition-all text-gray-900 resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">
                    图片链接
                  </label>
                  <input
                    value={checkinImage}
                    onChange={(e) => setCheckinImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-green-500 outline-none transition-all text-gray-900"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setCheckinOpen(false)}
                  className="flex-1 py-4 rounded-2xl bg-gray-50 text-gray-600 font-bold hover:bg-gray-100 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={submitCheckin}
                  disabled={checkinSubmitting}
                  className="flex-1 py-4 rounded-2xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20 disabled:opacity-50"
                >
                  {checkinSubmitting ? "提交中…" : "确认打卡"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {historyOpen && historyFlag && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setHistoryOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl z-50 p-8 max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between mb-6 shrink-0">
                <h3 className="text-2xl font-black text-gray-900">打卡记录</h3>
                <button
                  onClick={() => setHistoryOpen(false)}
                  className="p-2 rounded-full bg-gray-50 hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4 overflow-y-auto pr-2 flex-1 scrollbar-hide">
                {historyLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                  </div>
                ) : historyItems.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    暂无记录
                  </div>
                ) : (
                  historyItems.map((it) => (
                    <div
                      key={it.id}
                      className="p-4 rounded-2xl bg-gray-50 border border-gray-100 relative"
                    >
                      <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200" />
                      <div className="relative pl-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-gray-400 bg-white px-2 py-1 rounded-md border border-gray-100">
                            {new Date(it.created_at).toLocaleDateString()}
                          </span>
                          {historyFlag?.verification_type === "witness" && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                String(it.review_status || "pending") ===
                                "approved"
                                  ? "bg-green-100 text-green-700"
                                  : String(it.review_status || "pending") ===
                                    "rejected"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-orange-100 text-orange-700"
                              }`}
                            >
                              {String(it.review_status || "pending") ===
                              "approved"
                                ? "已通过"
                                : String(it.review_status || "pending") ===
                                  "rejected"
                                ? "已拒绝"
                                : "待审核"}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-900 font-medium mb-2">
                          {it.note || "打卡"}
                        </p>
                        {it.image_url && (
                          <img
                            src={it.image_url}
                            className="w-full h-32 object-cover rounded-xl bg-gray-200"
                          />
                        )}

                        {historyFlag?.verification_type === "witness" &&
                          String(it.review_status || "pending") === "pending" &&
                          String(historyFlag?.user_id || "").toLowerCase() ===
                            String(account || user?.id || "").toLowerCase() && (
                            <div className="mt-3 flex gap-2">
                              <button
                                disabled={reviewSubmittingId === it.id}
                                onClick={() => reviewCheckin(it.id, "approve")}
                                className="flex-1 py-2 text-xs font-bold rounded-xl bg-green-100 text-green-700 hover:bg-green-200"
                              >
                                通过
                              </button>
                              <button
                                disabled={reviewSubmittingId === it.id}
                                onClick={() => reviewCheckin(it.id, "reject")}
                                className="flex-1 py-2 text-xs font-bold rounded-xl bg-red-100 text-red-700 hover:bg-red-200"
                              >
                                驳回
                              </button>
                            </div>
                          )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
