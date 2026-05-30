import { NextRequest, NextResponse } from "next/server";
import { MOCK_ORDERS, type OrderStatus } from "@/lib/mock-orders";

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { status, note } = await req.json() as { status?: string; note?: string };

  if (!status) {
    return NextResponse.json({ error: "status required" }, { status: 400 });
  }

  const order = MOCK_ORDERS.find((o) => o.id === id || o.orderNo === id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const allowed = VALID_TRANSITIONS[order.status] ?? [];
  if (!allowed.includes(status as OrderStatus)) {
    return NextResponse.json(
      { error: `Cannot transition from ${order.status} to ${status}` },
      { status: 422 }
    );
  }

  // TODO (DB): await db.order.update({ where: { id }, data: { status, note, updatedAt: new Date() } })
  console.log(`[Order ${id}] ${order.status} → ${status}${note ? ` | ${note}` : ""}`);

  return NextResponse.json({ id, orderNo: order.orderNo, status, updatedAt: new Date().toISOString() });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = MOCK_ORDERS.find((o) => o.id === id || o.orderNo === id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}
