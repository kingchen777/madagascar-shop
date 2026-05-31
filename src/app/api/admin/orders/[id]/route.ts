import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

type OrderStatus =
  | "DRAFT" | "QUOTED" | "DEPOSIT_PENDING" | "DEPOSIT_PAID"
  | "PROCURING" | "PURCHASED" | "AT_CN_WAREHOUSE"
  | "BALANCE_PENDING" | "BALANCE_PAID" | "INTL_SHIPPING"
  | "ARRIVED_MG" | "READY_FOR_PICKUP" | "COMPLETED"
  | "CANCELLED" | "REFUNDED";

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  DRAFT: ["QUOTED", "DEPOSIT_PENDING", "CANCELLED"],
  QUOTED: ["DEPOSIT_PENDING", "CANCELLED"],
  DEPOSIT_PENDING: ["DEPOSIT_PAID", "CANCELLED"],
  DEPOSIT_PAID: ["PROCURING"],
  PROCURING: ["PURCHASED", "CANCELLED"],
  PURCHASED: ["AT_CN_WAREHOUSE"],
  AT_CN_WAREHOUSE: ["BALANCE_PENDING"],
  BALANCE_PENDING: ["BALANCE_PAID"],
  BALANCE_PAID: ["INTL_SHIPPING"],
  INTL_SHIPPING: ["ARRIVED_MG"],
  ARRIVED_MG: ["READY_FOR_PICKUP"],
  READY_FOR_PICKUP: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: ["REFUNDED"],
  REFUNDED: [],
};

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
  const { status, note } = await req.json() as { status?: string; note?: string };

  if (!status) return NextResponse.json({ error: "status required" }, { status: 400 });

  const { data: order, error: fetchErr } = await supabase
    .from("Order")
    .select("id, orderNo, status")
    .or(`id.eq.${id},orderNo.eq.${id}`)
    .single();

  if (fetchErr || !order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const allowed = VALID_TRANSITIONS[order.status as OrderStatus] ?? [];
  if (!allowed.includes(status as OrderStatus)) {
    return NextResponse.json(
      { error: `Cannot transition from ${order.status} to ${status}` },
      { status: 422 }
    );
  }

  const updates: Record<string, unknown> = {
    status,
    updatedAt: new Date().toISOString(),
  };
  if (note) updates.internalNotes = note;

  const { error: updateErr } = await supabase
    .from("Order")
    .update(updates)
    .eq("id", order.id);

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  return NextResponse.json({
    id: order.id,
    orderNo: order.orderNo,
    status,
    updatedAt: new Date().toISOString(),
  });
}
