"use client";

import { useState, useEffect, useTransition } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2, ArrowUp, MessageSquare, ArrowRightCircle, AlertTriangle, TrendingUp, TrendingDown, Clock, Wallet } from "lucide-react";
import { ethers } from "ethers";
import { useWallet } from "@/contexts/WalletContext";
import { getFollowStatus, toggleFollowPrediction } from "@/lib/follows";
import { supabase } from "@/lib/supabase";
import ChatPanel from "@/components/ChatPanel";


interface PredictionDetail {
  id: number;
  title: string;
  description: string;
  category: string;
  deadline: string;
  minStake: number;
  criteria: string;
  referenceUrl: string;
  status: "active" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
  stats: {
    yesAmount: number;
    noAmount: number;
    totalAmount: number;
    participantCount: number;
    yesProbability: number;
    noProbability: number;
    betCount: number;
  };
  timeInfo: {
    createdAgo: string;
    deadlineIn: string;
    isExpired: boolean;
  };
  type?: string;
  outcome_count?: number;
  outcomes?: Array<any>;
}

export default function PredictionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [prediction, setPrediction] = useState<PredictionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [entered, setEntered] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [staking, setStaking] = useState(false);
  const [stakeError, setStakeError] = useState<string | null>(null);
  const [stakeSuccess, setStakeSuccess] = useState<string | null>(null);
  const [guideLoading, setGuideLoading] = useState(false);
  const [guideError, setGuideError] = useState<string | null>(null);
  const [guideVariant, setGuideVariant] = useState<'A' | 'B'>('A');
  const [market, setMarket] = useState<{ market: string; chain_id: number; collateral_token?: string; tick_size?: number } | null>(null);
  const [manualMarket, setManualMarket] = useState<string>('');
  const [manualChainId, setManualChainId] = useState<string>('');
  const [tradeSide, setTradeSide] = useState<'buy' | 'sell'>('buy');
  const [tradeOutcome, setTradeOutcome] = useState<number>(0);
  const [priceInput, setPriceInput] = useState<string>('');
  const [amountInput, setAmountInput] = useState<string>('');
  const [expiryInput, setExpiryInput] = useState<string>('');
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderMsg, setOrderMsg] = useState<string | null>(null);
  const [depthBuy, setDepthBuy] = useState<Array<{ price: string; qty: string }>>([]);
  const [depthSell, setDepthSell] = useState<Array<{ price: string; qty: string }>>([]);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [queueRows, setQueueRows] = useState<any[]>([]);
  const [orderMode, setOrderMode] = useState<'limit' | 'best'>('limit');
  const [bestBid, setBestBid] = useState<string>('');
  const [bestAsk, setBestAsk] = useState<string>('');
  const [midPrice, setMidPrice] = useState<string>('');
  const [openOrders, setOpenOrders] = useState<any[]>([]);
  const [midByOutcome, setMidByOutcome] = useState<Record<number, bigint>>({});
  const [midDistByOutcome, setMidDistByOutcome] = useState<Record<number, number>>({});

  // 关注功能相关状态
  const { account, connectWallet, siweLogin } = useWallet();
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [followError, setFollowError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPredictionDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/predictions/${params.id}?includeStats=0&includeOutcomes=1`);
        const contentType = response.headers.get("content-type") || "";
        let result: any = null;
        try {
          if (contentType.includes("application/json")) {
            result = await response.json();
          } else {
            throw new Error(`Unexpected content-type: ${contentType}`);
          }
        } catch (e) {
          console.error("解析响应失败:", e);
          setError("数据解析失败");
          return;
        }

        if (result.success) {
          setPrediction(result.data);
          (async () => {
            try {
              const resp2 = await fetch(`/api/predictions/${params.id}?includeStats=1`);
              if (!resp2.ok) return;
              const res2 = await resp2.json();
              if (res2?.success && res2?.data?.stats) {
                setPrediction(prev => prev ? {
                  ...prev,
                  stats: res2.data.stats,
                  timeInfo: res2.data.timeInfo || prev.timeInfo
                } : prev);
              }
            } catch {}
          })();
        } else {
          setError(result.message || "获取预测事件详情失败");
        }
      } catch (err) {
        setError("网络请求失败");
        console.error("获取预测事件详情失败:", err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPredictionDetail();
    }
  }, [params.id]);

  useEffect(() => {
    const loadMarket = async () => {
      try {
        const resp = await fetch(`/api/markets/map?id=${params.id}`)
        if (!resp.ok) return
        const j = await resp.json()
        if (j?.success && j?.data) setMarket(j.data)
      } catch {}
    }
    loadMarket()
  }, [params.id])

  useEffect(() => {
    const t = setInterval(async () => {
      try {
        const m = market || (manualMarket && manualChainId ? { market: manualMarket, chain_id: Number(manualChainId) } as any : null)
        if (!m) return
        const base = process.env.NEXT_PUBLIC_RELAYER_URL || 'http://localhost:3005'
        if (!base) return
        const u1 = `${base}/orderbook/depth?contract=${m.market}&chainId=${m.chain_id}&outcome=${tradeOutcome}&side=${true}&levels=10`
        const u2 = `${base}/orderbook/depth?contract=${m.market}&chainId=${m.chain_id}&outcome=${tradeOutcome}&side=${false}&levels=10`
        const r1 = await fetch(u1)
        const r2 = await fetch(u2)
        const j1 = await r1.json().catch(() => ({}))
        const j2 = await r2.json().catch(() => ({}))
        if (j1?.data) setDepthBuy(j1.data)
        if (j2?.data) setDepthSell(j2.data)
        const bb = (j1?.data && j1.data.length) ? j1.data[0].price : ''
        const ba = (j2?.data && j2.data.length) ? j2.data[0].price : ''
        setBestBid(bb || '')
        setBestAsk(ba || '')
        if (bb && ba) {
          const mid = (BigInt(bb) + BigInt(ba)) / BigInt(2)
          setMidPrice(mid.toString())
        } else {
          setMidPrice('')
        }
      } catch {}
    }, 2000)
    return () => clearInterval(t)
  }, [market?.market, market?.chain_id, manualMarket, manualChainId])

  // 多元选项的中间价分布（相对）
  useEffect(() => {
    const refreshMultiMids = async () => {
      try {
        const m = market || (manualMarket && manualChainId ? { market: manualMarket, chain_id: Number(manualChainId) } as any : null)
        const outs: any[] = (prediction as any)?.outcomes || []
        if (!m || !Array.isArray(outs) || outs.length === 0) return
        const base = process.env.NEXT_PUBLIC_RELAYER_URL || 'http://localhost:3005'
        if (!base) return
        const indices = outs.map((_, i) => i)
        const results = await Promise.all(indices.map(async (idx) => {
          try {
            const u1 = `${base}/orderbook/depth?contract=${m.market}&chainId=${m.chain_id}&outcome=${idx}&side=${true}&levels=1`
            const u2 = `${base}/orderbook/depth?contract=${m.market}&chainId=${m.chain_id}&outcome=${idx}&side=${false}&levels=1`
            const r1 = await fetch(u1); const r2 = await fetch(u2)
            const j1 = await r1.json().catch(() => ({})); const j2 = await r2.json().catch(() => ({}))
            const bb = (j1?.data && j1.data.length) ? j1.data[0].price : ''
            const ba = (j2?.data && j2.data.length) ? j2.data[0].price : ''
            if (bb && ba) {
              const mid = (BigInt(bb) + BigInt(ba)) / BigInt(2)
              return { idx, mid }
            }
            return { idx, mid: BigInt(0) }
          } catch { return { idx, mid: BigInt(0) } }
        }))
        const map: Record<number, bigint> = {}
        let sum: bigint = BigInt(0)
        for (const r of results) { map[r.idx] = r.mid; sum += r.mid }
        setMidByOutcome(map)
        if (sum > BigInt(0)) {
          const dist: Record<number, number> = {}
          for (const r of results) {
            const pctTimes100 = Number((r.mid * BigInt(10000)) / sum) // 百分比*100
            dist[r.idx] = pctTimes100 / 100
          }
          setMidDistByOutcome(dist)
        } else {
          setMidDistByOutcome({})
        }
      } catch {}
    }
    const t = setInterval(refreshMultiMids, 4000)
    refreshMultiMids()
    return () => clearInterval(t)
  }, [market?.market, market?.chain_id, manualMarket, manualChainId, prediction?.id])
  
  // 渲染选项切换（根据详情接口 includeOutcomes 返回）
  useEffect(() => {
    // 初始 outcome 兜底：若存在 outcomes，则设为 0
    if (prediction && (prediction as any)?.outcomes && Array.isArray((prediction as any).outcomes)) {
      setTradeOutcome(0)
    }
  }, [prediction?.id])

  useEffect(() => {
    const loadQueue = async () => {
      try {
        const m = market || (manualMarket && manualChainId ? { market: manualMarket, chain_id: Number(manualChainId) } as any : null)
        if (!m || !selectedPrice) return
        const base = process.env.NEXT_PUBLIC_RELAYER_URL || 'http://localhost:3005'
        if (!base) return
        const u = `${base}/orderbook/queue?contract=${m.market}&chainId=${m.chain_id}&outcome=${tradeOutcome}&side=${tradeSide === 'buy'}&price=${selectedPrice}&limit=50&offset=0`
        const r = await fetch(u)
        const j = await r.json().catch(() => ({}))
        if (j?.data) setQueueRows(j.data)
      } catch {}
    }
    loadQueue()
  }, [market?.market, market?.chain_id, manualMarket, manualChainId, selectedPrice, tradeOutcome, tradeSide])

  useEffect(() => {
    const loadOpenOrders = async () => {
      try {
        const m = market || (manualMarket && manualChainId ? { market: manualMarket, chain_id: Number(manualChainId) } as any : null)
        if (!m || !account) return
        if (!supabase) return
        const { data, error } = await (supabase as any)
          .from('orders')
          .select('id, maker_salt, price, remaining, outcome_index, is_buy, status, created_at')
          .eq('verifying_contract', String(m.market).toLowerCase())
          .eq('chain_id', Number(m.chain_id))
          .eq('maker_address', String(account).toLowerCase())
          .in('status', ['open', 'filled_partial'])
          .order('created_at', { ascending: false })
        console.log('[loadOpenOrders] fetching with:', { market: m.market, chain: m.chain_id, account })
        if (error) {
          console.error('[loadOpenOrders] Supabase error:', error)
        } else {
          console.log('[loadOpenOrders] Data:', data)
        }
        if (!error && Array.isArray(data)) setOpenOrders(data)
      } catch (e) {
        console.error('[loadOpenOrders] Exception:', e)
      }
    }
    loadOpenOrders()
  }, [market?.market, market?.chain_id, manualMarket, manualChainId, account])

  // 将当前查看的事件写入最近浏览（供热门页侧边栏展示）
  useEffect(() => {
    if (!prediction) return;
    try {
      const raw =
        typeof window !== "undefined"
          ? window.localStorage.getItem("recent_events")
          : null;
      const arr = raw ? JSON.parse(raw) : [];
      const item = {
        id: prediction.id,
        title: prediction.title,
        category: prediction.category,
        seen_at: new Date().toISOString(),
      };
      const dedup = Array.isArray(arr)
        ? arr.filter((x: any) => Number(x?.id) !== Number(prediction.id))
        : [];
      const next = [item, ...dedup].slice(0, 10);
      window.localStorage.setItem("recent_events", JSON.stringify(next));
    } catch {}
  }, [prediction?.id]);

  useEffect(() => {
    // 设置页面进入动画状态
    setEntered(true);

    const onScroll = () => {
      if (typeof window !== "undefined") {
        setShowScrollTop(window.scrollY > 200);
      }
    };
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    router.prefetch("/trending");
  }, [router]);

  useEffect(() => {
    try {
      const key = 'guide_variant';
      const cached = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
      if (cached === 'A' || cached === 'B') {
        setGuideVariant(cached as 'A' | 'B');
      } else {
        const v = Math.random() < 0.5 ? 'A' : 'B';
        setGuideVariant(v);
        if (typeof window !== 'undefined') window.localStorage.setItem(key, v);
      }
    } catch {}
  }, []);

  const handleGuideClick = async () => {
    try {
      setGuideLoading(true);
      setGuideError(null);
      const eventId = Number(params.id);
      const url = `/forum?id=${eventId}`;
      try {
        const payload = JSON.stringify({ eventId, variant: guideVariant, ts: Date.now() });
        if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
          const blob = new Blob([payload], { type: 'application/json' });
          navigator.sendBeacon('/api/analytics/guide-click', blob);
        } else {
          await fetch('/api/analytics/guide-click', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload });
        }
      } catch {}
      router.push(url);
    } catch (e: any) {
      setGuideError(String(e?.message || e || '跳转失败'));
    } finally {
      setGuideLoading(false);
    }
  };

  const outcomeLabel = (idx: number) => {
    const arr = (prediction as any)?.outcomes;
    if (Array.isArray(arr) && arr[idx]) {
      const o = arr[idx] as any;
      return String(o?.label || `选项${idx}`);
    }
    return idx === 1 ? '是' : '否';
  };

  // 获取关注状态和数量
  useEffect(() => {
    const fetchFollowStatus = async () => {
      if (!params.id) return;

      try {
        setFollowError(null);
        // 添加错误处理和重试逻辑
        let retries = 3;
        let status;

        while (retries > 0) {
          try {
            status = await getFollowStatus(
              Number(params.id),
              account || undefined
            );
            break;
          } catch (err) {
            console.warn(
              `获取关注状态尝试失败，剩余重试次数: ${retries - 1}`,
              err
            );
            retries--;
            if (retries === 0) throw err;
            await new Promise((r) => setTimeout(r, 500)); // 重试前等待500ms
          }
        }

        if (status) {
          setFollowing(!!status.following);
          setFollowersCount(status.followersCount);
        }
      } catch (error) {
        console.error("获取关注状态失败:", error);
        setFollowError("获取关注状态失败");
        // 设置默认值，避免UI显示错误
        setFollowing(false);
        setFollowersCount(0);
      }
    };

    fetchFollowStatus();
  }, [params.id, account]);

  // Supabase Realtime 订阅：针对当前预测事件的关注插入/删除，实时更新 followersCount 与 following
  useEffect(() => {
    const eid = Number(params.id);
    if (!Number.isFinite(eid)) return;
    if (!supabase || typeof (supabase as any).channel !== 'function') return;

    const filterEq = `event_id=eq.${eid}`;
    const channel = (supabase as any).channel(`event_follows_detail_${eid}`);

    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "event_follows",
          filter: filterEq,
        },
        (payload: any) => {
          const uid = String((payload?.new || {}).user_id || "");
          // 非当前用户的插入，计数 +1；当前用户则同步 following 状态（避免与本地乐观重复叠加）
          if (!account || uid !== account) {
            setFollowersCount((c) => c + 1);
          }
          if (account && uid === account) {
            setFollowing(true);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "event_follows",
          filter: filterEq,
        },
        (payload: any) => {
          const uid = String((payload?.old || {}).user_id || "");
          if (!account || uid !== account) {
            setFollowersCount((c) => Math.max(0, c - 1));
          }
          if (account && uid === account) {
            setFollowing(false);
          }
        }
      )
      .subscribe();

    return () => {
      (supabase as any).removeChannel(channel);
    };
  }, [params.id, account]);

  // 处理关注/取消关注
  const handleToggleFollow = async () => {
    if (!account) {
      try {
        await connectWallet();
        await siweLogin();
      } catch (error) {
        setFollowError("钱包连接失败");
      }
      return;
    }

    setFollowLoading(true);
    setFollowError(null);

    try {
      const addr = account.toLowerCase();
      const newFollowing = await toggleFollowPrediction(
        following,
        Number(params.id),
        addr
      );
      setFollowing(newFollowing);

      // 重新获取关注数量
      const status = await getFollowStatus(Number(params.id), addr);
      setFollowersCount(status.followersCount);
    } catch (error) {
      console.error("关注操作失败:", error);
      const msg =
        error instanceof Error
          ? error.message || "操作失败，请重试"
          : "操作失败，请重试";
      setFollowError(msg);
    } finally {
      setFollowLoading(false);
    }
  };

  // ERC20/合约 ABI（最小化）
  const erc20Abi = [
    "function decimals() view returns (uint8)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 value) returns (bool)",
  ];
  const foresightAbi = [
    "function getPredictionCount() view returns (uint256)",
    "function stake(uint256 _predictionId, uint256 _option, uint256 amount)",
  ];

  // 地址解析（基于 chainId）
  function resolveAddresses(chainId: number): {
    foresight: string;
    usdt: string;
  } {
    const defaultForesight = (process.env.NEXT_PUBLIC_FORESIGHT_ADDRESS || "").trim();
    const defaultUsdt = (process.env.NEXT_PUBLIC_USDT_ADDRESS || "").trim();

    const map: Record<number, { foresight?: string; usdt?: string }> = {
      137: {
        foresight: process.env.NEXT_PUBLIC_FORESIGHT_ADDRESS_POLYGON,
        usdt: process.env.NEXT_PUBLIC_USDT_ADDRESS_POLYGON,
      },
      80002: {
        foresight: process.env.NEXT_PUBLIC_FORESIGHT_ADDRESS_AMOY || "0xc366ff8279D23991c630F92b457AA845eCEDD112",
        usdt: process.env.NEXT_PUBLIC_USDT_ADDRESS_AMOY || "0xdc85e8303CD81e8E78f432bC2c0D673Abccd7Daf",
      },
      11155111: {
        foresight: process.env.NEXT_PUBLIC_FORESIGHT_ADDRESS_SEPOLIA,
        usdt: process.env.NEXT_PUBLIC_USDT_ADDRESS_SEPOLIA,
      },
      31337: {
        foresight: process.env.NEXT_PUBLIC_FORESIGHT_ADDRESS_LOCALHOST,
        usdt: process.env.NEXT_PUBLIC_USDT_ADDRESS_LOCALHOST,
      },
      1337: {
        foresight: process.env.NEXT_PUBLIC_FORESIGHT_ADDRESS_LOCALHOST,
        usdt: process.env.NEXT_PUBLIC_USDT_ADDRESS_LOCALHOST,
      },
    };

    const fromMap = map[chainId] || {};
    const foresight = (fromMap.foresight || defaultForesight || "").trim();
    const usdt = (fromMap.usdt || defaultUsdt || "").trim();

    // Debug log
    console.log(`[resolveAddresses] chainId: ${chainId}`);
    console.log(`[resolveAddresses] Env Check - Amoy USDT: ${process.env.NEXT_PUBLIC_USDT_ADDRESS_AMOY}`);
    console.log(`[resolveAddresses] Result - usdt: ${usdt}, foresight: ${foresight}`);

    return { foresight, usdt };
  }

  // 将任意小数按指定 decimals 转为最小单位 BigInt
  function parseUnitsByDecimals(
    value: number | string,
    decimals: number
  ): bigint {
    const str = typeof value === "number" ? String(value) : value;
    try {
      return ethers.parseUnits(str, decimals);
    } catch {
      // 兜底处理，避免浮点误差
      const parts = str.split(".");
      if (parts.length === 1) {
        return BigInt(parts[0]) * BigInt(10) ** BigInt(decimals);
      }
      const [intPart, fracRaw] = parts;
      const frac = (fracRaw || "").slice(0, decimals).padEnd(decimals, "0");
      return (
        BigInt(intPart || "0") * BigInt(10) ** BigInt(decimals) +
        BigInt(frac || "0")
      );
    }
  }

  async function submitOrder() {
    try {
      setOrderMsg(null)
      setOrderSubmitting(true)
      const m = market || (manualMarket && manualChainId ? { market: manualMarket, chain_id: Number(manualChainId) } as any : null)
      if (!m) throw new Error('未配置市场')
      if (!prediction) throw new Error('预测事件未加载')
      if (typeof window === 'undefined' || !(window as any).ethereum) throw new Error('请先连接钱包')
      const provider = new ethers.BrowserProvider((window as any).ethereum)
      const signer = await provider.getSigner()
      const accountAddr = await signer.getAddress()
      const net = await provider.getNetwork()
      const chainIdNum = Number(net.chainId)
      const outcomeIndex = tradeOutcome
      const isBuy = tradeSide === 'buy'
      let priceDec = Number(priceInput || '0')
      if (orderMode === 'best') {
        const target = tradeSide === 'buy' ? bestAsk : bestBid
        if (!target) throw new Error('缺少盘口数据')
        priceDec = Number(ethers.formatUnits(BigInt(target), 6))
      }
      const amountDec = Number(amountInput || '0')
      if (!Number.isFinite(priceDec) || priceDec <= 0) throw new Error('价格不合法')
      if (!Number.isFinite(amountDec) || amountDec <= 0) throw new Error('数量不合法')
      const { usdt } = resolveAddresses(chainIdNum)
      if (!usdt) {
        console.error(`[submitOrder] Missing USDT address for chainId: ${chainIdNum}`)
        throw new Error(`未配置USDT地址 (Chain ID: ${chainIdNum})。请切换到 Amoy 测试网 (80002)`)
      }
      const token = new ethers.Contract(usdt, erc20Abi, signer)
      let decimals = 6
      try { decimals = await token.decimals() } catch {}
      const price = parseUnitsByDecimals(priceDec, Number(decimals))
      const amount = BigInt(Math.floor(amountDec))
      const inputVal = Number(expiryInput || '0')
      const duration = inputVal > 0 ? inputVal : 31536000
      const expirySec = BigInt(Math.floor(Date.now() / 1000) + duration)
      const salt = BigInt(String(Date.now()))
      const domain = { name: 'CLOBMarket', version: '1', chainId: chainIdNum, verifyingContract: m.market }
      const types = { OrderRequest: [
        { name: 'maker', type: 'address' },
        { name: 'outcomeIndex', type: 'uint256' },
        { name: 'isBuy', type: 'bool' },
        { name: 'price', type: 'uint256' },
        { name: 'amount', type: 'uint256' },
        { name: 'expiry', type: 'uint256' },
        { name: 'salt', type: 'uint256' },
      ] } as const
      const message = { maker: accountAddr, outcomeIndex, isBuy, price, amount, expiry: expirySec, salt }
      const signature = await signer.signTypedData(domain as any, types as any, message as any)
      const base = process.env.NEXT_PUBLIC_RELAYER_URL || 'http://localhost:3005'
      if (!base) throw new Error('未配置撮合服务')
      const body = { chainId: chainIdNum, verifyingContract: m.market, order: { maker: accountAddr, outcomeIndex, isBuy, price: price.toString(), amount: amount.toString(), expiry: expirySec.toString(), salt: salt.toString() }, signature }
      const resp = await fetch(`${base}/orderbook/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const j = await resp.json().catch(() => ({}))
      if (!resp.ok) throw new Error(j?.detail || j?.message || '下单失败')
      setOrderMsg('下单成功')
    } catch (e: any) {
      setOrderMsg(e?.message || '下单失败')
    } finally {
      setOrderSubmitting(false)
    }
  }

  async function fillOrder(row: any) {
    try {
      setOrderMsg(null)
      const m = market || (manualMarket && manualChainId ? { market: manualMarket, chain_id: Number(manualChainId) } as any : null)
      if (!m) throw new Error('未配置市场')
      if (typeof window === 'undefined' || !(window as any).ethereum) throw new Error('请先连接钱包')
      const provider = new ethers.BrowserProvider((window as any).ethereum)
      const signer = await provider.getSigner()
      const base = process.env.NEXT_PUBLIC_RELAYER_URL || 'http://localhost:3005'
      const d = await fetch(`/api/orderbook/order?id=${row.id}`)
      const j = await d.json()
      const ord = j?.data
      if (!ord) throw new Error('订单不存在')
      const types = { OrderRequest: [
        { name: 'maker', type: 'address' },
        { name: 'outcomeIndex', type: 'uint256' },
        { name: 'isBuy', type: 'bool' },
        { name: 'price', type: 'uint256' },
        { name: 'amount', type: 'uint256' },
        { name: 'expiry', type: 'uint256' },
        { name: 'salt', type: 'uint256' },
      ] } as const
      const marketContract = new ethers.Contract(m.market, [
        'function fillOrderSigned((address,uint256,bool,uint256,uint256,uint256,uint256),bytes,uint256)'
      ], signer)
      const req = [
        ord.maker_address,
        Number(ord.outcome_index),
        Boolean(ord.is_buy),
        BigInt(ord.price),
        BigInt(ord.amount),
        ord.expiry ? BigInt(Math.floor(new Date(String(ord.expiry)).getTime() / 1000)) : BigInt(0),
        BigInt(ord.maker_salt)
      ]
      const desired = amountInput ? BigInt(Math.floor(Number(amountInput))) : BigInt(0)
      const remaining = BigInt(ord.remaining)
      const fillAmount = desired > BigInt(0) ? (desired > remaining ? remaining : desired) : remaining
      if (!Boolean(ord.is_buy)) {
        const { usdt } = resolveAddresses(Number(ord.chain_id))
        if (!usdt) throw new Error('未配置USDT地址')
        const token = new ethers.Contract(usdt, erc20Abi, signer)
        const accountAddr = await signer.getAddress()
        const price = BigInt(ord.price)
        const need = fillAmount * price
        const allowance: bigint = await token.allowance(accountAddr, m.market)
        if (allowance < need) {
          const tx = await token.approve(m.market, need)
          await tx.wait()
        }
      }
      const tx = await marketContract.fillOrderSigned(req as any, ord.signature, fillAmount)
      await tx.wait()
      setOrderMsg('成交成功')
    } catch (e: any) {
      setOrderMsg(e?.message || '成交失败')
    }
  }

  async function cancelOrderSalt(row: any) {
    try {
      setOrderMsg(null)
      const m = market || (manualMarket && manualChainId ? { market: manualMarket, chain_id: Number(manualChainId) } as any : null)
      if (!m) throw new Error('未配置市场')
      if (typeof window === 'undefined' || !(window as any).ethereum) throw new Error('请先连接钱包')
      const provider = new ethers.BrowserProvider((window as any).ethereum)
      const signer = await provider.getSigner()
      const addr = await signer.getAddress()
      const chain = await provider.getNetwork()
      const chainIdNum = Number(chain.chainId)
      const base = process.env.NEXT_PUBLIC_RELAYER_URL || 'http://localhost:3005'
      const typesResp = await fetch(`${base}/orderbook/types`)
      const typesJson = await typesResp.json().catch(()=>({}))
      const types = typesJson?.types || { CancelSaltRequest: [ { name: 'maker', type: 'address' }, { name: 'salt', type: 'uint256' } ] }
      const domain = { name: 'CLOBMarket', version: '1', chainId: chainIdNum, verifyingContract: m.market }
      const message = { maker: addr, salt: BigInt(row.maker_salt) }
      const signature = await signer.signTypedData(domain as any, { CancelSaltRequest: types.CancelSaltRequest } as any, message as any)
      const payload = { chainId: chainIdNum, verifyingContract: m.market, maker: addr, salt: BigInt(row.maker_salt).toString(), signature }
      const resp = await fetch(`${base}/orderbook/cancel-salt`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const j = await resp.json().catch(()=>({}))
      if (!resp.ok) throw new Error(j?.detail || j?.message || '取消失败')
      setOrderMsg('取消成功')
      const fresh = openOrders.filter((x)=> String(x.maker_salt) !== String(row.maker_salt))
      setOpenOrders(fresh)
    } catch (e: any) {
      setOrderMsg(e?.message || '取消失败')
    }
  }

  const handleStake = async (option: "yes" | "no") => {
    try {
      setStakeError(null);
      setStakeSuccess(null);
      setStaking(true);

      if (!prediction) throw new Error("预测事件未加载");
      if (typeof window === "undefined" || !(window as any).ethereum) {
        throw new Error("请先连接钱包");
      }

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      const chainIdNum = Number(network.chainId);
      const { foresight, usdt } = resolveAddresses(chainIdNum);
      if (!foresight || !usdt) {
        throw new Error("未配置当前网络的合约或USDT地址");
      }

      const account = await signer.getAddress();
      const token = new ethers.Contract(usdt, erc20Abi, signer);
      let decimals = 6;
      try {
        decimals = await token.decimals();
      } catch {}
      const amount = parseUnitsByDecimals(
        prediction.minStake,
        Number(decimals)
      );

      // 先检查并授权
      const allowance: bigint = await token.allowance(account, foresight);
      if (allowance < amount) {
        const txApprove = await token.approve(foresight, amount);
        await txApprove.wait();
      }

      // 确认链上预测是否存在（默认使用 off-chain 的 id 作为链上 id）
      const foresightContract = new ethers.Contract(
        foresight,
        foresightAbi,
        signer
      );
      const count: bigint = await foresightContract.getPredictionCount();
      if (BigInt(prediction.id) >= count) {
        throw new Error("该事件尚未在链上创建，暂不可押注");
      }

      // 选项映射：yes -> 1, no -> 0
      const optionIndex = option === "yes" ? 1 : 0;
      const txStake = await foresightContract.stake(
        prediction.id,
        optionIndex,
        amount
      );
      const receipt = await txStake.wait();

      setStakeSuccess(`押注成功，交易哈希：${receipt?.hash || ""}`);
    } catch (e: any) {
      setStakeError(e?.message || "押注失败");
    } finally {
      setStaking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载预测事件详情中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">加载失败</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            预测事件不存在
          </h2>
          <p className="text-gray-600">请检查事件ID是否正确</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-transparent overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
        <div
          className={`max-w-4xl mx-auto transition-all duration-200 ease-out ${
            entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
          }`}
        >
          {/* 返回按钮 */}
          <button
            type="button"
            aria-label="返回上一页"
            title="返回上一页"
            onClick={() => {
              const hasHistory =
                typeof window !== "undefined" &&
                window.history &&
                window.history.length > 1;
              const sameOriginReferrer =
                typeof document !== "undefined" &&
                document.referrer &&
                (() => {
                  try {
                    const ref = new URL(document.referrer);
                    return ref.origin === window.location.origin;
                  } catch {
                    return false;
                  }
                })();
              startTransition(() => {
                if (hasHistory && sameOriginReferrer) {
                  router.back();
                } else {
                  router.push("/trending");
                }
              });
            }}
            disabled={isPending}
            className="mb-6 inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/60 backdrop-blur-md border border-gray-200 text-gray-700 hover:text-gray-800 hover:bg-white/75 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            )}
            <span className="text-sm font-medium">
              {isPending ? "返回中…" : "返回"}
            </span>
          </button>

          {/* 预测事件卡片 - 与creating预览保持一致 */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden">
            {/* 卡片头部 - 渐变背景 */}
            <div className="p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">
                      {prediction.category === "科技"
                        ? "🚀"
                        : prediction.category === "娱乐"
                        ? "🎬"
                        : prediction.category === "时政"
                        ? "🏛️"
                        : prediction.category === "天气"
                        ? "🌤️"
                        : "📊"}
                    </span>
                    <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded-full">
                      {prediction.category}
                    </span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      prediction.status === "active"
                        ? "bg-green-100/20 text-green-100"
                        : prediction.status === "completed"
                        ? "bg-blue-100/20 text-blue-100"
                        : "bg-gray-100/20 text-gray-100"
                    }`}
                  >
                    {prediction.status === "active"
                      ? "进行中"
                      : prediction.status === "completed"
                      ? "已结束"
                      : "已取消"}
                  </span>
                </div>
                <h1 className="text-2xl font-bold leading-tight">
                  {prediction.title}
                </h1>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-sm text-white/90">
                    关注数 {followersCount}
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleFollow}
                    disabled={followLoading}
                    className="px-2.5 py-1 rounded-full text-sm font-medium bg-white/20 hover:bg-white/30 text-white disabled:opacity-60"
                  >
                    {followLoading ? "处理中…" : following ? "已关注" : "关注"}
                  </button>
                  {followError && (
                    <span className="text-xs text-yellow-200">
                      {followError}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 卡片内容 */}
            <div className="p-6">
              {/* 时间信息 */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <svg
                    className="w-4 h-4 mr-2 text-orange-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>创建于 {prediction.timeInfo.createdAgo}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg
                    className="w-4 h-4 mr-2 text-yellow-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                  <span
                    className={
                      prediction.timeInfo.isExpired
                        ? "text-red-600"
                        : "text-orange-600"
                    }
                  >
                    {prediction.timeInfo.deadlineIn}
                  </span>
                </div>
              </div>

              {/* 描述 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                  事件描述
                </h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {prediction.description}
                </p>
              </div>

              {/* 判断标准 */}
              <div className="p-4 bg-gray-50 rounded-lg mb-6">
                <div className="flex items-center mb-2">
                  <svg
                    className="w-4 h-4 mr-2 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-600">
                    判断标准
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {prediction.criteria}
                </p>
              </div>

              {/* 参考链接 */}
              {prediction.referenceUrl && (
                <div className="mb-6">
                  <a
                    href={prediction.referenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    参考链接
                  </a>
                </div>
              )}

              {/* 押注统计 */}
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">押注统计</h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{prediction.stats.participantCount}</div>
                    <div className="text-sm text-gray-600">参与人数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{prediction.stats.betCount}</div>
                    <div className="text-sm text-gray-600">押注次数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{prediction.stats.totalAmount.toFixed(2)} USDT</div>
                    <div className="text-sm text-gray-600">总押注金额</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{prediction.minStake} USDT</div>
                    <div className="text-sm text-gray-600">最小押注</div>
                  </div>
                </div>

                {Array.isArray((prediction as any)?.outcomes) && (prediction as any).outcomes.length > 0 ? (
                  <div className="space-y-3">
                    {(prediction as any).outcomes.map((o: any, idx: number) => (
                      <div key={idx}>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>{String(o?.label || `选项${idx}`)}</span>
                          <span>{typeof midDistByOutcome[idx] === 'number' ? `${midDistByOutcome[idx].toFixed(1)}%` : '—'}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-500" style={{ width: `${typeof midDistByOutcome[idx] === 'number' ? midDistByOutcome[idx] : 0}%` }}></div>
                        </div>
                      </div>
                    ))}
                    <div className="text-xs text-gray-600">基于各选项盘口中间价的相对分布，仅作参考。</div>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>是 ({prediction.stats.yesProbability * 100}%)</span>
                        <span>否 ({prediction.stats.noProbability * 100}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500" style={{ width: `${prediction.stats.yesProbability * 100}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>是: {prediction.stats.yesAmount.toFixed(2)} USDT</span>
                        <span>否: {prediction.stats.noAmount.toFixed(2)} USDT</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-500" style={{ width: `${prediction.stats.totalAmount > 0 ? (prediction.stats.yesAmount / prediction.stats.totalAmount) * 100 : 50}%` }}></div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 押注/选项区域 */}
          {prediction.status === 'active' && !prediction.timeInfo.isExpired && (
            <div className="mt-6 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">参与押注</h3>
              {Array.isArray((prediction as any)?.outcomes) && (prediction as any).outcomes.length > 0 ? (
                <>
                  <div className="text-sm text-gray-700 mb-2">请选择一个选项，然后在下方“交易”区域下单</div>
                  <div className="flex flex-wrap gap-2">
                    {(prediction as any).outcomes.map((o: any, idx: number) => (
                      <button key={idx} onClick={() => setTradeOutcome(idx)} className={`px-3 py-1 rounded ${tradeOutcome===idx? 'bg-blue-100 text-blue-700':'bg-gray-100 text-gray-700'}`}>{String(o?.label || `选项${idx}`)}</button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-3">最小押注金额: {prediction.minStake} USDT</p>
                </>
              ) : (
                <>
                  <div className="flex gap-3">
                    <button onClick={() => handleStake('yes')} disabled={staking} className="flex-1 py-3 px-4 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors disabled:opacity-50">{staking ? '处理中…' : '支持 (预测达成)'}</button>
                    <button onClick={() => handleStake('no')} disabled={staking} className="flex-1 py-3 px-4 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors disabled:opacity-50">{staking ? '处理中…' : '反对 (预测不达成)'}</button>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">最小押注金额: {prediction.minStake} USDT</p>
                  {stakeError && (<p className="text-sm text-red-600 mt-2">{stakeError}</p>)}
                  {stakeSuccess && (<p className="text-sm text-green-600 mt-2">{stakeSuccess}</p>)}
                </>
              )}
            </div>
          )}

          {/* Transaction Module */}
          <div className="mt-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden">
            <div className="p-6 border-b border-gray-100/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">交易市场</h3>
                </div>
                {market && (
                  <div className="flex items-center gap-2 text-xs font-mono text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    {market.market.slice(0,6)}...{market.market.slice(-4)}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6">
              {!market && (
                <div className="mb-6 bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-yellow-800 mb-1">未检测到自动配置的市场</h4>
                      <p className="text-sm text-yellow-600 mb-3">您可以手动输入市场合约地址与链ID来进行交易。</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input 
                          value={manualMarket} 
                          onChange={(e)=>setManualMarket(e.target.value)} 
                          placeholder="市场合约地址 (0x...) "
                          className="px-3 py-2 rounded-lg border border-yellow-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" 
                        />
                        <input 
                          value={manualChainId} 
                          onChange={(e)=>setManualChainId(e.target.value)} 
                          placeholder="链ID (例如 137)" 
                          className="px-3 py-2 rounded-lg border border-yellow-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* 左侧：下单表单 */}
                <div className="lg:col-span-7 space-y-6">
                  {/* 买卖方向 */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">交易方向</label>
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                      <button 
                        onClick={() => setTradeSide('buy')} 
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          tradeSide === 'buy' 
                            ? 'bg-white text-green-600 shadow-sm ring-1 ring-gray-200' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        买入 (Buy)
                      </button>
                      <button 
                        onClick={() => setTradeSide('sell')} 
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          tradeSide === 'sell' 
                            ? 'bg-white text-red-600 shadow-sm ring-1 ring-gray-200' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        卖出 (Sell)
                      </button>
                    </div>
                  </div>

                  {/* 选项选择 */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">选择选项</label>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray((prediction as any)?.outcomes) && (prediction as any).outcomes.length > 0 ? (
                        (prediction as any).outcomes.map((o: any, idx: number) => (
                          <button 
                            key={idx} 
                            onClick={() => setTradeOutcome(idx)} 
                            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
                              tradeOutcome === idx
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {String(o?.label || `选项${idx}`)}
                          </button>
                        ))
                      ) : (
                        <>
                          <button 
                            onClick={() => setTradeOutcome(1)} 
                            className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${
                              tradeOutcome === 1
                                ? 'bg-green-50 border-green-200 text-green-700 shadow-sm'
                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            是 (Yes)
                          </button>
                          <button 
                            onClick={() => setTradeOutcome(0)} 
                            className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${
                              tradeOutcome === 0
                                ? 'bg-orange-50 border-orange-200 text-orange-700 shadow-sm'
                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            否 (No)
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 订单类型 */}
                   <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">订单类型</label>
                    <div className="flex gap-3">
                      <button 
                        onClick={()=>setOrderMode('limit')} 
                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
                          orderMode==='limit'
                            ? 'bg-purple-50 border-purple-200 text-purple-700 shadow-sm'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        限价单
                      </button>
                      <button 
                        onClick={()=>setOrderMode('best')} 
                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
                          orderMode==='best'
                            ? 'bg-purple-50 border-purple-200 text-purple-700 shadow-sm'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        市价单 (最优价)
                      </button>
                    </div>
                  </div>

                  {/* 价格与数量输入 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-gray-500 ml-1">价格 (USDT)</label>
                      <div className="relative">
                        <input 
                          value={priceInput} 
                          onChange={(e)=>setPriceInput(e.target.value)} 
                          placeholder="0.00" 
                          className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none" 
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">USDT</div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-500 ml-1">数量</label>
                       <div className="relative">
                        <input 
                          value={amountInput} 
                          onChange={(e)=>setAmountInput(e.target.value)} 
                          placeholder="0" 
                          className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none" 
                        />
                         <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">份</div>
                      </div>
                    </div>
                     <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs text-gray-500 ml-1">订单有效期 (秒)</label>
                      <div className="relative">
                         <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                          value={expiryInput} 
                          onChange={(e)=>setExpiryInput(e.target.value)} 
                          placeholder="默认不过期 (可选)" 
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none" 
                        />
                      </div>
                    </div>
                  </div>

                   {/* 快捷数量 */}
                  <div className="flex gap-2">
                    {['1', '5', '10', '50', '100'].map(amt => (
                      <button 
                        key={amt}
                        onClick={()=>setAmountInput(amt)} 
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                      >
                        +{amt}
                      </button>
                    ))}
                  </div>

                  {/* 交易概览 */}
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">当前最佳买价</span>
                      <span className="font-mono text-gray-800">{bestBid? Number(ethers.formatUnits(BigInt(bestBid), 6)).toFixed(4): '-'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">当前最佳卖价</span>
                       <span className="font-mono text-gray-800">{bestAsk? Number(ethers.formatUnits(BigInt(bestAsk), 6)).toFixed(4): '-'}</span>
                    </div>
                    <div className="h-px bg-gray-200 my-2"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">预估总额</span>
                      <span className="font-bold text-gray-900">{priceInput && amountInput? (Number(priceInput)*Number(amountInput)).toFixed(4): '0.00'} USDT</span>
                    </div>
                     <div className="flex justify-between items-center">
                      <span className="text-gray-500">获胜概率</span>
                      <span className="font-medium text-purple-600">{priceInput? (Number(priceInput)*100).toFixed(2): midPrice? (Number(ethers.formatUnits(BigInt(midPrice), 6))*100).toFixed(2): '-'}%</span>
                    </div>
                  </div>

                  {/* 提交按钮 */}
                  <button 
                    onClick={submitOrder} 
                    disabled={orderSubmitting} 
                    className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg shadow-purple-200 hover:shadow-purple-300 transform active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 ${
                      orderSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                    }`}
                  >
                    {orderSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>处理中...</span>
                      </>
                    ) : (
                      <>
                        <Wallet className="w-5 h-5" />
                        <span>提交订单</span>
                      </>
                    )}
                  </button>

                  {orderMsg && (
                    <div className={`mt-3 p-3 rounded-xl text-sm ${
                      orderMsg.includes('成功') || orderMsg.includes('Success') 
                        ? 'bg-green-50 text-green-700 border border-green-100' 
                        : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                      {orderMsg}
                    </div>
                  )}
                </div>

                {/* 右侧：盘口与订单 */}
                <div className="lg:col-span-5 space-y-6">
                  {/* 深度图 */}
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center justify-between">
                      <span>盘口深度 ({outcomeLabel(tradeOutcome)})</span>
                      <span className="text-xs font-normal text-gray-500">点击价格快速填单</span>
                    </h4>
                    
                    <div className="space-y-1">
                      {/* 卖单 (Sell Orders) - 红色 - 倒序显示，价格高的在上面 */}
                      <div className="space-y-1 mb-2">
                        {depthSell.length === 0 && (
                          <div className="text-center py-4 text-xs text-gray-400">暂无卖单</div>
                        )}
                        {depthSell.slice().reverse().map((d,i)=> (
                           <button 
                            key={i} 
                            onClick={()=>{setSelectedPrice(d.price); setPriceInput(Number(ethers.formatUnits(BigInt(d.price), 6)).toFixed(6))}} 
                            className="w-full flex justify-between items-center text-xs p-1.5 rounded hover:bg-red-100 transition-colors group"
                          >
                            <span className="text-red-600 font-mono font-medium">{Number(ethers.formatUnits(BigInt(d.price), 6)).toFixed(4)}</span>
                            <div className="flex items-center gap-2">
                               <span className="text-gray-500 font-mono">{d.qty}</span>
                               <div className="w-12 h-1 bg-red-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-red-400" style={{width: `${Math.min(100, (Number(d.qty)/10)*100)}%`}}></div>
                               </div>
                            </div>
                          </button>
                        ))}
                      </div>

                      <div className="h-px bg-gray-200 my-2"></div>

                       {/* 买单 (Buy Orders) - 绿色 */}
                      <div className="space-y-1">
                         {depthBuy.length === 0 && (
                          <div className="text-center py-4 text-xs text-gray-400">暂无买单</div>
                        )}
                        {depthBuy.map((d,i)=> (
                          <button 
                            key={i} 
                            onClick={()=>{setSelectedPrice(d.price); setPriceInput(Number(ethers.formatUnits(BigInt(d.price), 6)).toFixed(6))}} 
                            className="w-full flex justify-between items-center text-xs p-1.5 rounded hover:bg-green-100 transition-colors group"
                          >
                            <span className="text-green-600 font-mono font-medium">{Number(ethers.formatUnits(BigInt(d.price), 6)).toFixed(4)}</span>
                            <div className="flex items-center gap-2">
                               <span className="text-gray-500 font-mono">{d.qty}</span>
                               <div className="w-12 h-1 bg-green-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-green-400" style={{width: `${Math.min(100, (Number(d.qty)/10)*100)}%`}}></div>
                               </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 订单队列 */}
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      可成交队列 
                      <span className="text-xs font-normal text-gray-500 ml-2">
                        {selectedPrice ? `(价格: ${Number(ethers.formatUnits(BigInt(selectedPrice), 6)).toFixed(4)})` : '(请先选择价格)'}
                      </span>
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                       {queueRows.length === 0 ? (
                        <div className="text-center py-6 text-xs text-gray-400">暂无匹配队列</div>
                      ) : (
                        queueRows.map((r)=> (
                          <div key={r.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-gray-50 border border-gray-100 hover:border-blue-200 transition-colors">
                            <div className="font-mono text-gray-600">
                              <div className="flex items-center gap-2">
                                <span className="bg-white px-1.5 py-0.5 rounded border border-gray-200">ID: {String(r.maker_salt).slice(0,6)}...</span>
                                <span>剩: {String(r.remaining)}</span>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={()=>fillOrder(r)} className="px-2 py-1 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium transition-colors">吃单</button>
                              <button onClick={()=>cancelOrderSalt(r)} className="px-2 py-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">取消</button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* 我的挂单 */}
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                     <h4 className="text-sm font-semibold text-gray-700 mb-3">我的当前挂单</h4>
                     <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                      {openOrders.length === 0 ? (
                        <div className="text-center py-6 text-xs text-gray-400">暂无挂单</div>
                      ) : (
                        openOrders.map((r)=> (
                          <div key={r.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-gray-50 border border-gray-100">
                            <div className="text-gray-900">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${r.is_buy ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {r.is_buy ? '买' : '卖'}
                                </span>
                                <span className="font-medium text-gray-700">{outcomeLabel(Number(r.outcome_index))}</span>
                              </div>
                              <div className="font-mono text-gray-500">
                                $ {Number(ethers.formatUnits(BigInt(r.price), 6)).toFixed(4)} · 剩 {String(r.remaining)}
                              </div>
                            </div>
                            <button onClick={()=>cancelOrderSalt(r)} className="px-2 py-1 rounded-md bg-gray-200 text-gray-600 hover:bg-gray-300 hover:text-gray-800 transition-colors">撤单</button>
                          </div>
                        ))
                      )}
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>


          <div className="mt-8">
            <ChatPanel eventId={Number(params.id)} />
            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={handleGuideClick}
                className={`inline-flex items-center gap-2 h-11 px-5 rounded-2xl font-medium text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-white/40 transition-all duration-300 ${guideVariant === 'A' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600' : 'bg-gradient-to-r from-sky-500 to-emerald-500 text-white hover:from-sky-600 hover:to-emerald-600'} ${guideLoading ? 'opacity-80 cursor-wait' : ''}`}
                aria-label="前往论坛聊天室"
                title="前往论坛聊天室"
                style={{ minWidth: 176 }}
              >
                <MessageSquare className="w-5 h-5" />
                <span className="text-[14px]">前往论坛聊天室</span>
                <ArrowRightCircle className="w-5 h-5" />
              </button>
            </div>
            {guideError && (
              <div className="mt-2 text-center text-xs text-red-600">
                {guideError}
              </div>
            )}
          </div>
        </div>
        {/* 悬浮回到顶部按钮 */}
        <button
          type="button"
          aria-label="回到顶部"
          title="回到顶部"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className={`${
            showScrollTop
              ? "opacity-100 scale-100"
              : "opacity-0 scale-0 pointer-events-none"
          } fixed bottom-8 right-8 z-50 w-10 h-10 bg-gradient-to-br from-white/90 to-pink-100/90 rounded-full shadow-lg border border-pink-200/50 backdrop-blur-sm overflow-hidden group hover:scale-110 hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-300`}
        >
          {/* 背景质感效果 */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-pink-100/40 group-hover:from-white/60 group-hover:to-pink-100/60 transition-all duration-300"></div>

          {/* 箭头图标 */}
          <div className="relative z-10 flex items-center justify-center w-full h-full">
            <div className="animate-bounce">
              <svg
                className="w-4 h-4 text-gray-700"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="18 15 12 9 6 15" />
              </svg>
            </div>
          </div>

          {/* 悬浮提示 */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
            返回顶部
          </div>
        </button>
      </div>
    </div>
  );
}
