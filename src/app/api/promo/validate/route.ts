import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { z } from "zod";

const Schema = z.object({
  code: z.string().min(1).max(50),
  orderTotalMGA: z.number().positive(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 422 });
  }

  const { code, orderTotalMGA } = parsed.data;

  const { data: promo, error } = await supabase
    .from("PromoCode")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("active", true)
    .single();

  if (error || !promo) {
    return NextResponse.json({ error: "Code promo invalide" }, { status: 404 });
  }

  if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
    return NextResponse.json({ error: "Code promo expiré" }, { status: 410 });
  }

  if (promo.maxUses != null && promo.usedCount >= promo.maxUses) {
    return NextResponse.json({ error: "Code promo épuisé" }, { status: 410 });
  }

  if (promo.minOrderMGA != null && orderTotalMGA < Number(promo.minOrderMGA)) {
    return NextResponse.json({
      error: `Commande minimum ${Number(promo.minOrderMGA).toLocaleString("fr-MG")} Ar`,
    }, { status: 422 });
  }

  const discountMGA =
    promo.type === "PERCENT"
      ? Math.round((orderTotalMGA * Number(promo.value)) / 100)
      : Math.min(Math.round(Number(promo.value)), orderTotalMGA);

  return NextResponse.json({
    valid: true,
    code: promo.code,
    type: promo.type,
    value: Number(promo.value),
    discountMGA,
    description: promo.description ?? null,
  });
}
