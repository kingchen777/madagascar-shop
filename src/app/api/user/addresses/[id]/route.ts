import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/supabase-server";
import { supabase } from "@/lib/db";

// DELETE /api/user/addresses/[id] — 删除地址
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // 确保地址属于当前用户
  const { data: existing } = await supabase
    .from("Address")
    .select("id, isDefault")
    .eq("id", id)
    .eq("userId", user.id)
    .single();

  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await supabase.from("Address").delete().eq("id", id);

  // 如果删的是默认地址，把第一条剩余地址设为默认
  if (existing.isDefault) {
    const { data: remaining } = await supabase
      .from("Address")
      .select("id")
      .eq("userId", user.id)
      .limit(1)
      .single();

    if (remaining) {
      await supabase
        .from("Address")
        .update({ isDefault: true })
        .eq("id", remaining.id);
    }
  }

  return NextResponse.json({ ok: true });
}

// PATCH /api/user/addresses/[id] — 设为默认地址
export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // 确保地址属于当前用户
  const { data: existing } = await supabase
    .from("Address")
    .select("id")
    .eq("id", id)
    .eq("userId", user.id)
    .single();

  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // 取消所有默认，设置新默认
  await supabase.from("Address").update({ isDefault: false }).eq("userId", user.id);
  await supabase.from("Address").update({ isDefault: true }).eq("id", id);

  return NextResponse.json({ ok: true });
}
