import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

const PRODUCT_SELECT = `*, translations:ProductTranslation(*), images:ProductImage(*), category:Category(*)`;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data, error } = await supabase
    .from("Product")
    .select(PRODUCT_SELECT)
    .eq("id", id)
    .single();
  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json() as {
    slug?: string;
    type?: string;
    source?: string;
    sourceUrl?: string;
    priceMGA?: string;
    priceCNY?: string;
    weightKg?: string;
    stock?: string;
    status?: string;
    translations?: Record<string, { name: string; description: string }>;
  };

  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (body.slug) updates.slug = body.slug;
  if (body.type) updates.type = body.type;
  if (body.source) updates.source = body.source;
  if (body.sourceUrl !== undefined) updates.sourceUrl = body.sourceUrl || null;
  if (body.priceMGA) updates.priceMGA = body.priceMGA;
  if (body.priceCNY) updates.basePriceCNY = body.priceCNY;
  if (body.weightKg) updates.weightKg = body.weightKg;
  if (body.stock !== undefined) updates.stock = parseInt(body.stock);
  if (body.status) updates.status = body.status;

  const { error } = await supabase.from("Product").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (body.translations) {
    for (const [locale, t] of Object.entries(body.translations)) {
      await supabase.from("ProductTranslation").upsert(
        { productId: id, locale, name: t.name, description: t.description, isAuto: locale !== "fr" },
        { onConflict: "productId,locale" }
      );
    }
  }

  const { data: product } = await supabase
    .from("Product")
    .select(PRODUCT_SELECT)
    .eq("id", id)
    .single();

  return NextResponse.json(product);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error } = await supabase.from("Product").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deleted: true, id });
}
