import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

// PATCH /api/admin/payments/[id] — 管理员确认支付
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { status, providerRef } = body as { status?: string; providerRef?: string };
  const validStatuses = ["PAID", "FAILED", "REFUNDED"];
  if (!status || !validStatuses.includes(status)) {
    return NextResponse.json({ error: "status must be PAID, FAILED, or REFUNDED" }, { status: 400 });
  }

  // 查找支付记录
  const { data: payment } = await supabase
    .from("Payment")
    .select("id, orderId, kind, status")
    .eq("id", id)
    .single();

  if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

  // 更新支付状态
  const { error: payErr } = await supabase
    .from("Payment")
    .update({
      status,
      providerRef: providerRef ?? undefined,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", id);

  if (payErr) return NextResponse.json({ error: payErr.message }, { status: 500 });

  // 支付确认后自动推进订单状态
  if (status === "PAID") {
    const { data: order } = await supabase
      .from("Order")
      .select("status")
      .eq("id", payment.orderId)
      .single();

    if (order) {
      const nextStatus =
        order.status === "DEPOSIT_PENDING" ? "DEPOSIT_PAID" :
        order.status === "BALANCE_PENDING" ? "BALANCE_PAID" :
        null;

      if (nextStatus) {
        await supabase
          .from("Order")
          .update({ status: nextStatus, updatedAt: new Date().toISOString() })
          .eq("id", payment.orderId);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
