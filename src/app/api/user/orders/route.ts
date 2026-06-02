import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/supabase-server";
import { supabase } from "@/lib/db";

// GET /api/user/orders — fetch orders for the currently authenticated user
export async function GET() {
  const authUser = await getServerUser();
  if (!authUser?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find the internal User record by email (orders use internal cuid userId)
  const { data: internalUser } = await supabase
    .from("User")
    .select("id")
    .eq("email", authUser.email)
    .single();

  if (!internalUser) {
    // Authenticated but no orders yet
    return NextResponse.json([]);
  }

  const { data: orders, error } = await supabase
    .from("Order")
    .select("id, orderNo, status, totalAmount, createdAt, items:OrderItem(titleSnapshot)")
    .eq("userId", internalUser.id)
    .order("createdAt", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(orders ?? []);
}
