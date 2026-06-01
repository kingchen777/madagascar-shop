import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { z } from "zod";

const CreateSchema = z.object({
  code: z.string().min(2).max(50).transform((s) => s.toUpperCase()),
  description: z.string().max(200).optional(),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.number().positive(),
  minOrderMGA: z.number().positive().optional(),
  maxUses: z.number().int().positive().optional(),
  expiresAt: z.string().datetime().optional(),
  active: z.boolean().optional().default(true),
});

export async function GET() {
  const { data, error } = await supabase
    .from("PromoCode")
    .select("*")
    .order("createdAt", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ promos: data ?? [] });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { data, error } = await supabase
    .from("PromoCode")
    .insert(parsed.data)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ promo: data }, { status: 201 });
}
