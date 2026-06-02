import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/supabase-server";
import { supabase } from "@/lib/db";

async function getInternalUser(email: string) {
  const { data } = await supabase
    .from("User")
    .select("id")
    .eq("email", email)
    .single();
  return data;
}

// GET /api/user/wishlist — return productIds in wishlist
export async function GET() {
  const authUser = await getServerUser();
  if (!authUser?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const internalUser = await getInternalUser(authUser.email);
  if (!internalUser) {
    return NextResponse.json({ productIds: [] });
  }

  const { data, error } = await supabase
    .from("Wishlist")
    .select("productId")
    .eq("userId", internalUser.id)
    .order("createdAt", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ productIds: (data ?? []).map((r: { productId: string }) => r.productId) });
}

// POST /api/user/wishlist — add product to wishlist
export async function POST(req: NextRequest) {
  const authUser = await getServerUser();
  if (!authUser?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId } = await req.json() as { productId?: string };
  if (!productId) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }

  let internalUser = await getInternalUser(authUser.email);
  if (!internalUser) {
    // Auto-create internal user record on first wishlist action
    const { data: created } = await supabase
      .from("User")
      .insert({ email: authUser.email })
      .select("id")
      .single();
    internalUser = created;
  }

  if (!internalUser) {
    return NextResponse.json({ error: "Failed to resolve user" }, { status: 500 });
  }

  const { error } = await supabase
    .from("Wishlist")
    .upsert({ userId: internalUser.id, productId }, { onConflict: "userId,productId" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 201 });
}

// DELETE /api/user/wishlist — remove product from wishlist
export async function DELETE(req: NextRequest) {
  const authUser = await getServerUser();
  if (!authUser?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId } = await req.json() as { productId?: string };
  if (!productId) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }

  const internalUser = await getInternalUser(authUser.email);
  if (!internalUser) {
    return NextResponse.json({ ok: true });
  }

  const { error } = await supabase
    .from("Wishlist")
    .delete()
    .eq("userId", internalUser.id)
    .eq("productId", productId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
