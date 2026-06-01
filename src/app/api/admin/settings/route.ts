import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

const EDITABLE_KEYS = [
  "exchange_rate_cny_mga",
  "default_deposit_pct",
  "default_service_fee_pct",
  "mvola_phone",
  "orange_money_phone",
  "contact_whatsapp",
  "contact_phone",
  "contact_email",
];

export async function GET() {
  const { data, error } = await supabase
    .from("Setting")
    .select("key, value")
    .in("key", EDITABLE_KEYS);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const settings: Record<string, string> = {};
  for (const row of data ?? []) settings[row.key] = row.value;
  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json() as Record<string, string>;
  const errors: string[] = [];

  for (const [key, value] of Object.entries(body)) {
    if (!EDITABLE_KEYS.includes(key)) continue;
    const { error } = await supabase
      .from("Setting")
      .upsert({ key, value, updatedAt: new Date().toISOString() }, { onConflict: "key" });
    if (error) errors.push(`${key}: ${error.message}`);
  }

  if (errors.length) return NextResponse.json({ error: errors.join("; ") }, { status: 500 });
  return NextResponse.json({ ok: true });
}
