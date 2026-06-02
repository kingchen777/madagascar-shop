import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/supabase-server";
import { supabase } from "@/lib/db";

// GET /api/user/addresses — 获取当前用户的所有地址
export async function GET() {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("Address")
    .select("*")
    .eq("userId", user.id)
    .order("isDefault", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ addresses: data });
}

// POST /api/user/addresses — 新增地址
export async function POST(req: NextRequest) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    fullName?: string;
    phone?: string;
    region?: string;
    line1?: string;
    note?: string;
    isDefault?: boolean;
  };

  const { fullName, phone, region, line1, note, isDefault } = body;
  if (!fullName?.trim() || !phone?.trim() || !region?.trim() || !line1?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // 如果新地址设为默认，先把其他地址取消默认
  if (isDefault) {
    await supabase
      .from("Address")
      .update({ isDefault: false })
      .eq("userId", user.id);
  }

  // 检查是否是第一条地址，自动设为默认
  const { count } = await supabase
    .from("Address")
    .select("*", { count: "exact", head: true })
    .eq("userId", user.id);

  const shouldBeDefault = isDefault || count === 0;

  const { data, error } = await supabase
    .from("Address")
    .insert({
      userId: user.id,
      fullName: fullName.trim(),
      phone: phone.trim(),
      region: region.trim(),
      line1: line1.trim(),
      note: note?.trim() ?? null,
      isDefault: shouldBeDefault,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ address: data }, { status: 201 });
}
