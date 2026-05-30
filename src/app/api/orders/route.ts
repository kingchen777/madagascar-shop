import { NextRequest, NextResponse } from "next/server";
import { sendOrderConfirmation } from "@/lib/email";

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
  locale?: string;
}

function generateOrderNo(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
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

  const { items, shippingAddress, paymentMethod } = body as CreateOrderBody;

  if (!items?.length || !shippingAddress || !paymentMethod) {
    return NextResponse.json(
      { error: "Missing required fields: items, shippingAddress, paymentMethod" },
      { status: 400 }
    );
  }

  const totalMGA = items.reduce((s, i) => s + i.priceMGA * i.qty, 0);
  const depositMGA = Math.ceil(totalMGA * 0.3);
  const orderNo = generateOrderNo();
  const orderId = `ord-${Date.now()}`;

  // TODO (DB): await db.order.create({
  //   data: {
  //     id: orderId, orderNo, status: "DEPOSIT_PENDING", type: "SELF",
  //     totalMGA, depositMGA, balanceDueMGA: totalMGA - depositMGA,
  //     shippingName: shippingAddress.name,
  //     shippingPhone: shippingAddress.phone,
  //     shippingAddress: shippingAddress.address,
  //     shippingCity: shippingAddress.city,
  //     items: { create: items.map(i => ({ productId: i.id, qty: i.qty, unitPriceMGA: i.priceMGA })) },
  //   }
  // });

  console.log("[Order Created]", { orderId, orderNo, customer: shippingAddress.name, totalMGA, depositMGA });

  // Send confirmation email (silent fail if RESEND not configured)
  const customerEmail = (body as CreateOrderBody & { email?: string }).email;
  if (customerEmail) {
    sendOrderConfirmation({
      to: customerEmail,
      customerName: shippingAddress.name,
      orderNo,
      items: items.map((i) => ({ name: i.name, qty: i.qty, priceMGA: i.priceMGA })),
      totalMGA,
      depositMGA,
      paymentMethod,
    }).catch(() => {});
  }

  return NextResponse.json({
    orderId,
    orderNo,
    status: "DEPOSIT_PENDING",
    totalMGA,
    depositMGA,
  });
}
