import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { randomUUID } from "crypto";

// GET /api/payments?orderId=xxx — 查询订单支付记录
export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("orderId");
  if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 });

  const { data, error } = await supabase
    .from("Payment")
    .select("id, kind, provider, amount, currency, status, providerRef, proofUrl, createdAt")
    .eq("orderId", orderId)
    .order("createdAt", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ payments: data });
}

// POST /api/payments — 客户发起支付（PENDING状态，等管理员确认）
export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { orderId, kind, provider, amount, providerRef, proofUrl } =
    body as {
      orderId?: string;
      kind?: string;
      provider?: string;
      amount?: number;
      providerRef?: string;
      proofUrl?: string;
    };

  if (!orderId || !kind || !provider || !amount) {
    return NextResponse.json({ error: "orderId, kind, provider, amount required" }, { status: 400 });
  }

  const validKinds = ["DEPOSIT", "BALANCE", "FULL"];
  const validProviders = ["MVOLA", "ORANGE_MONEY", "AIRTEL_MONEY", "STRIPE", "PAYPAL", "BANK_TRANSFER", "CASH"];
  if (!validKinds.includes(kind)) return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
  if (!validProviders.includes(provider)) return NextResponse.json({ error: "Invalid provider" }, { status: 400 });

  // 验证订单存在
  const { data: order } = await supabase
    .from("Order")
    .select("id, status")
    .eq("id", orderId)
    .single();

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("Payment")
    .insert({
      id: randomUUID(),
      orderId,
      kind,
      provider,
      amount: amount.toString(),
      currency: "MGA",
      status: "PENDING",
      providerRef: providerRef ?? null,
      proofUrl: proofUrl ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ payment: data }, { status: 201 });
}
