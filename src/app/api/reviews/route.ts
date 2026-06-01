import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { z } from "zod";

const PostSchema = z.object({
  productId: z.string().min(1),
  author: z.string().min(1).max(80),
  rating: z.number().int().min(1).max(5),
  body: z.string().max(1000).optional(),
  locale: z.enum(["fr", "en", "zh"]).optional().default("fr"),
});

export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("Review")
    .select("id, author, rating, body, locale, createdAt")
    .eq("productId", productId)
    .order("createdAt", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reviews: data ?? [] });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = PostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { productId, author, rating, body: reviewBody, locale } = parsed.data;

  const { data, error } = await supabase
    .from("Review")
    .insert({ productId, author, rating, body: reviewBody ?? null, locale })
    .select("id, author, rating, body, locale, createdAt")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ review: data }, { status: 201 });
}
