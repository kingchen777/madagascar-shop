import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { sendOrderConfirmation } from "@/lib/email";
import { randomUUID } from "crypto";

interface OrderItem {
  id: string;
  slug: string;
  name: string;
  priceMGA: number;
  qty: number;
}

interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
}

interface CreateOrderBody {
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  email?: string;
  locale?: string;
}

function generateOrderNo(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.floor(Math.random() * 9000 + 1000);
  return `MS-${date}-${suffix}`;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { items, shippingAddress, paymentMethod, email } = body as CreateOrderBody;

  if (!items?.length || !shippingAddress || !paymentMethod) {
    return NextResponse.json(
      { error: "Missing required fields: items, shippingAddress, paymentMethod" },
      { status: 400 }
    );
  }

  const totalMGA = items.reduce((s, i) => s + i.priceMGA * i.qty, 0);
  const depositMGA = Math.ceil(totalMGA * 0.3);
  const orderNo = generateOrderNo();
  const orderId = randomUUID();
  const now = new Date().toISOString();

  // Find or create guest user
  let userId: string;
  const { data: existingUser } = await supabase
    .from("User")
    .select("id")
    .eq("phone", shippingAddress.phone)
    .single();

  if (existingUser) {
    userId = existingUser.id;
  } else {
    const newUserId = randomUUID();
    await supabase.from("User").insert({
      id: newUserId,
      phone: shippingAddress.phone,
      email: email ?? null,
      name: shippingAddress.name,
      role: "CUSTOMER",
      locale: (body as CreateOrderBody).locale ?? "fr",
      createdAt: now,
      updatedAt: now,
    });
    userId = newUserId;
  }

  // Create order
  const { error: orderErr } = await supabase.from("Order").insert({
    id: orderId,
    orderNo,
    userId,
    type: "SELF",
    status: "DEPOSIT_PENDING",
    totalAmount: totalMGA.toString(),
    depositAmount: depositMGA.toString(),
    productCost: totalMGA.toString(),
    domesticShipping: "0",
    intlShipping: "0",
    serviceFee: "0",
    customsFee: "0",
    miscFee: "0",
    currency: "MGA",
    shippingInfo: {
      name: shippingAddress.name,
      phone: shippingAddress.phone,
      address: shippingAddress.address,
      city: shippingAddress.city,
      paymentMethod,
    },
    createdAt: now,
    updatedAt: now,
  });

  if (orderErr) return NextResponse.json({ error: orderErr.message }, { status: 500 });

  // Create order items
  const itemRows = items.map((i) => ({
    id: randomUUID(),
    orderId,
    productId: i.id ?? null,
    titleSnapshot: i.name,
    qty: i.qty,
    unitPriceMGA: i.priceMGA.toString(),
  }));
  await supabase.from("OrderItem").insert(itemRows);

  // Send confirmation email (silent fail)
  if (email) {
    sendOrderConfirmation({
      to: email,
      customerName: shippingAddress.name,
      orderNo,
      items: items.map((i) => ({ name: i.name, qty: i.qty, priceMGA: i.priceMGA })),
      totalMGA,
      depositMGA,
      paymentMethod,
    }).catch(() => {});
  }

  return NextResponse.json({ orderId, orderNo, status: "DEPOSIT_PENDING", totalMGA, depositMGA });
}
