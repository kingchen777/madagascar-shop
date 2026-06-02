import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { sendOrderConfirmation } from "@/lib/email";
import { randomUUID } from "crypto";
import { getServerUser } from "@/lib/auth/supabase-server";

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone");
  if (!phone) return NextResponse.json([], { status: 200 });

  // Look up user by phone, then fetch their orders
  const { data: user } = await supabase
    .from("User")
    .select("id")
    .eq("phone", phone)
    .single();

  if (!user) return NextResponse.json([]);

  const { data: orders } = await supabase
    .from("Order")
    .select("id, orderNo, status, totalAmount, createdAt, items:OrderItem(titleSnapshot)")
    .eq("userId", user.id)
    .order("createdAt", { ascending: false });

  return NextResponse.json(orders ?? []);
}

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
  promoCode?: string;
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

  const { items, shippingAddress, paymentMethod, email, promoCode } = body as CreateOrderBody;

  if (!items?.length || !shippingAddress || !paymentMethod) {
    return NextResponse.json(
      { error: "Missing required fields: items, shippingAddress, paymentMethod" },
      { status: 400 }
    );
  }

  const subtotalMGA = items.reduce((s, i) => s + i.priceMGA * i.qty, 0);

  // Validate and apply promo code (graceful fallback if table doesn't exist yet)
  let discountMGA = 0;
  let appliedPromoCode: string | null = null;
  if (promoCode) {
    const { data: promo } = await supabase
      .from("PromoCode")
      .select("id, code, type, value, minOrderMGA, maxUses, usedCount, expiresAt, active")
      .eq("code", promoCode.toUpperCase())
      .eq("active", true)
      .single();

    if (
      promo &&
      (!promo.expiresAt || new Date(promo.expiresAt) >= new Date()) &&
      (promo.maxUses == null || promo.usedCount < promo.maxUses) &&
      (promo.minOrderMGA == null || subtotalMGA >= Number(promo.minOrderMGA))
    ) {
      discountMGA = promo.type === "PERCENT"
        ? Math.round((subtotalMGA * Number(promo.value)) / 100)
        : Math.min(Math.round(Number(promo.value)), subtotalMGA);
      appliedPromoCode = promo.code as string;
      // Atomic increment: only update if usedCount hasn't changed since we read it.
      // If two requests race, exactly one will match the .eq("usedCount", ...) condition.
      const { data: updated } = await supabase
        .from("PromoCode")
        .update({ usedCount: (promo.usedCount as number) + 1 })
        .eq("id", promo.id)
        .eq("usedCount", promo.usedCount as number)
        .select("id");
      // If 0 rows updated, someone else used the last slot — reject if at limit
      if ((!updated || updated.length === 0) && promo.maxUses != null) {
        return NextResponse.json({ error: "Code promo épuisé" }, { status: 410 });
      }
    }
  }

  const totalMGA = Math.max(0, subtotalMGA - discountMGA);

  // Read deposit percentage from settings (fallback: 30%)
  const { data: depositSetting } = await supabase
    .from("Setting")
    .select("value")
    .eq("key", "default_deposit_pct")
    .single();
  const depositPct = depositSetting ? parseFloat(depositSetting.value) / 100 : 0.3;
  const depositMGA = Math.ceil(totalMGA * depositPct);

  const orderNo = generateOrderNo();
  const orderId = randomUUID();
  const now = new Date().toISOString();

  // Find or create user — prefer Auth email lookup so /api/user/orders can bridge back
  let userId: string;
  const authUser = await getServerUser();
  const resolvedEmail = authUser?.email ?? email ?? null;

  // 1. Try by Auth email (most reliable for logged-in users)
  if (resolvedEmail) {
    const { data: byEmail } = await supabase
      .from("User")
      .select("id, email")
      .eq("email", resolvedEmail)
      .single();
    if (byEmail) {
      userId = byEmail.id;
      // Backfill phone if missing
      if (shippingAddress.phone) {
        await supabase
          .from("User")
          .update({ phone: shippingAddress.phone, updatedAt: now })
          .eq("id", byEmail.id)
          .is("phone", null);
      }
    } else {
      // 2. Try by phone — backfill email so future lookups work
      const { data: byPhone } = await supabase
        .from("User")
        .select("id, email")
        .eq("phone", shippingAddress.phone)
        .single();
      if (byPhone) {
        userId = byPhone.id;
        if (!byPhone.email && resolvedEmail) {
          await supabase
            .from("User")
            .update({ email: resolvedEmail, updatedAt: now })
            .eq("id", byPhone.id);
        }
      } else {
        // 3. Create new user
        const newUserId = randomUUID();
        await supabase.from("User").insert({
          id: newUserId,
          phone: shippingAddress.phone,
          email: resolvedEmail,
          name: shippingAddress.name,
          role: "CUSTOMER",
          locale: (body as CreateOrderBody).locale ?? "fr",
          createdAt: now,
          updatedAt: now,
        });
        userId = newUserId;
      }
    }
  } else {
    // No email at all — fall back to phone-only lookup/create
    const { data: byPhone } = await supabase
      .from("User")
      .select("id")
      .eq("phone", shippingAddress.phone)
      .single();
    if (byPhone) {
      userId = byPhone.id;
    } else {
      const newUserId = randomUUID();
      await supabase.from("User").insert({
        id: newUserId,
        phone: shippingAddress.phone,
        email: null,
        name: shippingAddress.name,
        role: "CUSTOMER",
        locale: (body as CreateOrderBody).locale ?? "fr",
        createdAt: now,
        updatedAt: now,
      });
      userId = newUserId;
    }
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
    ...(appliedPromoCode ? { promoCode: appliedPromoCode, discountMGA } : {}),
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

  return NextResponse.json({ orderId, orderNo, status: "DEPOSIT_PENDING", totalMGA, depositMGA, discountMGA, appliedPromoCode });
}
