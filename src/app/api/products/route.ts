import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const idsParam = searchParams.get("ids");
  if (!idsParam) {
    return NextResponse.json({ products: [] });
  }

  const ids = idsParam.split(",").filter(Boolean).slice(0, 50);
  if (ids.length === 0) {
    return NextResponse.json({ products: [] });
  }

  const { data, error } = await supabase
    .from("Product")
    .select(`
      id, slug, type, priceMGA, basePriceCNY, stock, status, source, sourceUrl, weightKg,
      translations:ProductTranslation(locale, name, description, isAuto),
      images:ProductImage(url, sort),
      category:Category(slug, categoryTranslations:CategoryTranslation(locale, name))
    `)
    .in("id", ids)
    .eq("status", "ACTIVE");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ products: data ?? [] });
}
