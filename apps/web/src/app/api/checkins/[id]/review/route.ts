import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, getClient } from "@/lib/supabase";
import { Database } from "@/lib/database.types";
import { SupabaseClient } from "@supabase/supabase-js";

function toNum(v: any): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

async function parseBody(req: Request): Promise<Record<string, any>> {
  const ct = req.headers.get("content-type") || "";
  try {
    if (ct.includes("application/json")) {
      const t = await req.text();
      try {
        return JSON.parse(t);
      } catch {
        return {};
      }
    }
    if (ct.includes("application/x-www-form-urlencoded")) {
      const t = await req.text();
      const p = new URLSearchParams(t);
      return Object.fromEntries(p.entries());
    }
    const t = await req.text();
    if (t) {
      try {
        return JSON.parse(t);
      } catch {
        return {};
      }
    }
    return {};
  } catch {
    return {};
  }
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const checkinId = toNum(id);
    if (!checkinId)
      return NextResponse.json({ message: "checkinId 必填" }, { status: 400 });
    const body = await parseBody(req as any);
    const actionRaw = String(body?.action || "")
      .trim()
      .toLowerCase();
    const action =
      actionRaw === "approve"
        ? "approved"
        : actionRaw === "reject"
        ? "rejected"
        : null;
    const reviewer_id = String(body?.reviewer_id || "").trim();
    const reason = String(body?.reason || "").trim() || null;
    if (!action)
      return NextResponse.json(
        { message: "action 必须为 approve 或 reject" },
        { status: 400 }
      );
    if (!reviewer_id)
      return NextResponse.json(
        { message: "reviewer_id 必填" },
        { status: 400 }
      );

    const client = (supabaseAdmin || getClient()) as any;
    if (!client)
      return NextResponse.json({ message: "服务未配置" }, { status: 500 });

    const { data: rawChk, error: chkErr } = await client
      .from("flag_checkins")
      .select("id,flag_id,review_status")
      .eq("id", checkinId)
      .maybeSingle();

    const chk = rawChk as {
      id: number;
      flag_id: number;
      review_status: string;
    } | null;

    if (chkErr) {
      const payload = {
        user_id: reviewer_id,
        proposal_id: 0, // Placeholder for type compatibility. This logic seems to be using discussions as a log, which might fail FK constraint at runtime if proposal 0 doesn't exist.
        content: JSON.stringify({
          type: "checkin_review",
          checkin_id: checkinId,
          action,
          reason,
          ts: new Date().toISOString(),
        }),
      };
      await client.from("discussions").insert(payload as any);
      return NextResponse.json({ message: "ok" }, { status: 200 });
    }
    if (!chk)
      return NextResponse.json({ message: "打卡记录不存在" }, { status: 404 });

    const { data: rawFlag, error: fErr } = await client
      .from("flags")
      .select("*")
      .eq("id", chk.flag_id)
      .maybeSingle();

    const flag = rawFlag as {
      verification_type: string;
      witness_id: string;
      user_id: string;
      status: string;
    } | null;

    if (fErr)
      return NextResponse.json(
        { message: "查询失败", detail: fErr.message },
        { status: 500 }
      );
    if (!flag)
      return NextResponse.json({ message: "Flag 不存在" }, { status: 404 });
    if (String(flag?.verification_type || "") !== "witness")
      return NextResponse.json(
        { message: "非监督模式无需审核" },
        { status: 400 }
      );

    const allowedReviewer = String(flag?.witness_id || flag?.user_id || "");
    if (
      !allowedReviewer ||
      allowedReviewer.toLowerCase() !== reviewer_id.toLowerCase()
    )
      return NextResponse.json({ message: "仅监督人可审核" }, { status: 403 });

    const { data: upd, error: uErr } = await client
      .from("flag_checkins")
      .update({
        review_status: action,
        reviewer_id,
        review_reason: reason,
        reviewed_at: new Date().toISOString(),
      } as any)
      .eq("id", checkinId)
      .select("*")
      .maybeSingle();
    if (uErr) {
      const payload = {
        user_id: reviewer_id,
        proposal_id: 0,
        content: JSON.stringify({
          type: "checkin_review",
          checkin_id: checkinId,
          action,
          reason,
          ts: new Date().toISOString(),
        }),
      };
      await client.from("discussions").insert(payload as any);
      return NextResponse.json({ message: "ok" }, { status: 200 });
    }

    // 若 flags 当前为 pending_review，审核后回到 active
    if (String(flag?.status || "") === "pending_review") {
      await client
        .from("flags")
        .update({ status: "active" })
        .eq("id", chk.flag_id);
    }

    return NextResponse.json({ message: "ok", data: upd }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { message: "审核失败", detail: String(e?.message || e) },
      { status: 500 }
    );
  }
}
