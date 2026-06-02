import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { sendStatusUpdate } from "@/lib/email";
import { isTransitionAllowed } from "@/lib/orderStateMachine";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data, error } = await supabase
    .from("Order")
    .select(`*, user:User(*), items:OrderItem(*, product:Product(id, slug, translations:ProductTranslation(*))), payments:Payment(*)`)
    .or(`id.eq.${id},orderNo.eq.${id}`)
    .single();
  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json() as {
    status?: string;
    note?: string;
    totalAmount?: string;
    depositAmount?: string;
    serviceFee?: string;
    intlShipping?: string;
    customsFee?: string;
  };
  const { status, note } = body;

  // Allow note-only or finance-only updates (no status change required)
  const hasFinanceUpdate = ["totalAmount", "depositAmount", "serviceFee", "intlShipping", "customsFee"]
    .some((k) => body[k as keyof typeof body] !== undefined);
  if (!status && note === undefined && !hasFinanceUpdate) {
    return NextResponse.json({ error: "status, note, or finance fields required" }, { status: 400 });
  }

  const { data: order, error: fetchErr } = await supabase
    .from("Order")
    .select("id, orderNo, status, type, totalAmount, depositAmount, user:User(name, email)")
    .or(`id.eq.${id},orderNo.eq.${id}`)
    .single();

  if (fetchErr || !order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };

  if (status) {
    if (!isTransitionAllowed(order.type as "SELF" | "AGENT", order.status as Parameters<typeof isTransitionAllowed>[1], status as Parameters<typeof isTransitionAllowed>[2])) {
      return NextResponse.json(
        { error: `Cannot transition from ${order.status} to ${status}` },
        { status: 422 }
      );
    }
    updates.status = status;
  }

  if (note !== undefined) updates.internalNotes = note;

  // Finance fields (admin sets quote for AGENT orders)
  if (body.totalAmount !== undefined) updates.totalAmount = body.totalAmount;
  if (body.depositAmount !== undefined) updates.depositAmount = body.depositAmount;
  if (body.serviceFee !== undefined) updates.serviceFee = body.serviceFee;
  if (body.intlShipping !== undefined) updates.intlShipping = body.intlShipping;
  if (body.customsFee !== undefined) updates.customsFee = body.customsFee;

  const { error: updateErr } = await supabase
    .from("Order")
    .update(updates)
    .eq("id", order.id);

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  // Send status notification email (fire-and-forget, never blocks the response)
  if (status) {
    const user = Array.isArray(order.user) ? order.user[0] : order.user;
    const email = (user as { name?: string; email?: string } | null)?.email;
    const name = (user as { name?: string; email?: string } | null)?.name ?? "Client";
    if (email) {
      const totalMGA = Number(order.totalAmount ?? 0);
      const depositMGA = Number(order.depositAmount ?? 0);
      const balanceDue = Math.max(totalMGA - depositMGA, 0);
      const orderUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://madashop.mg"}/fr/orders/${order.id}`;
      sendStatusUpdate({
        to: email,
        customerName: name,
        orderNo: order.orderNo,
        newStatus: status,
        balanceDue: status === "BALANCE_PENDING" ? balanceDue : undefined,
        orderUrl,
      }).catch(() => {});
    }
  }

  return NextResponse.json({
    id: order.id,
    orderNo: order.orderNo,
    status: status ?? order.status,
    updatedAt: new Date().toISOString(),
  });
}
