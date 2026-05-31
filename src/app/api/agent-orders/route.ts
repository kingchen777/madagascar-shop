import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { randomUUID } from "crypto";

interface AgentInquiryBody {
  url: string;
  name?: string;
  spec?: string;
  qty: number;
  notes?: string;
  contact: string;
  locale?: string;
}

function generateInquiryNo(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.floor(Math.random() * 9000 + 1000);
  return `AG-${date}-${suffix}`;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { url, name, spec, qty, notes, contact, locale } = body as AgentInquiryBody;

  if (!url?.trim() || !contact?.trim()) {
    return NextResponse.json({ error: "url and contact are required" }, { status: 400 });
  }

  const inquiryNo = generateInquiryNo();
  const inquiryId = randomUUID();
  const now = new Date().toISOString();

  // Find or create user by contact (phone)
  let userId: string;
  const { data: existingUser } = await supabase
    .from("User")
    .select("id")
    .eq("phone", contact)
    .single();

  if (existingUser) {
    userId = existingUser.id;
  } else {
    const newUserId = randomUUID();
    await supabase.from("User").insert({
      id: newUserId,
      phone: contact,
      role: "CUSTOMER",
      locale: locale ?? "fr",
      createdAt: now,
      updatedAt: now,
    });
    userId = newUserId;
  }

  // Create AGENT order in DRAFT status
  const { error: orderErr } = await supabase.from("Order").insert({
    id: inquiryId,
    orderNo: inquiryNo,
    userId,
    type: "AGENT",
    status: "DRAFT",
    productCost: "0",
    domesticShipping: "0",
    intlShipping: "0",
    serviceFee: "0",
    customsFee: "0",
    miscFee: "0",
    depositAmount: "0",
    totalAmount: "0",
    currency: "MGA",
    shippingInfo: { sourceUrl: url, spec: spec ?? null, notes: notes ?? null },
    createdAt: now,
    updatedAt: now,
  });

  if (orderErr) return NextResponse.json({ error: orderErr.message }, { status: 500 });

  // Create order item
  await supabase.from("OrderItem").insert({
    id: randomUUID(),
    orderId: inquiryId,
    titleSnapshot: name ?? url,
    spec: spec ?? null,
    qty: qty ?? 1,
    unitPriceMGA: "0",
    customUrl: url,
  });

  return NextResponse.json({ inquiryId, inquiryNo, status: "DRAFT" });
}
