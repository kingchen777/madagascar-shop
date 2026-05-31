import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { randomUUID } from "crypto";

const PRODUCT_SELECT = `*, translations:ProductTranslation(*), images:ProductImage(*), category:Category(*)`;

export async function GET() {
  const { data, error } = await supabase
    .from("Product")
    .select(PRODUCT_SELECT)
    .order("createdAt", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    slug?: string;
    type?: string;
    source?: string;
    sourceUrl?: string;
    priceMGA?: string;
    priceCNY?: string;
    weightKg?: string;
    stock?: string;
    categorySlug?: string;
    translations?: Record<string, { name: string; description: string }>;
  };

  const { slug, priceMGA, translations } = body;

  if (!slug || !priceMGA || !translations?.fr?.name) {
    return NextResponse.json(
      { error: "slug, priceMGA et translations.fr.name sont requis" },
      { status: 400 }
    );
  }

  let categoryId: string | null = null;
  if (body.categorySlug) {
    const { data: cat } = await supabase
      .from("Category")
      .select("id")
      .eq("slug", body.categorySlug)
      .single();
    categoryId = cat?.id ?? null;
  }

  const productId = randomUUID();
  const now = new Date().toISOString();

  const { error: insertErr } = await supabase.from("Product").insert({
    id: productId,
    slug,
    type: body.type ?? "SELF",
    source: body.source ?? "NONE",
    sourceUrl: body.sourceUrl || null,
    categoryId,
    priceMGA,
    basePriceCNY: body.priceCNY ?? null,
    weightKg: body.weightKg ?? null,
    stock: body.stock ? parseInt(body.stock) : null,
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
  });
  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });

  const translationRows = Object.entries(translations).map(([locale, t]) => ({
    id: randomUUID(),
    productId,
    locale,
    name: t.name,
    description: t.description,
    isAuto: locale !== "fr",
  }));
  await supabase.from("ProductTranslation").insert(translationRows);

  const { data: product } = await supabase
    .from("Product")
    .select(PRODUCT_SELECT)
    .eq("id", productId)
    .single();

  return NextResponse.json(product, { status: 201 });
}
