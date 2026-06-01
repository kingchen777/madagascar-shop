import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

interface Params { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json() as { slug?: string; sort?: number; translations?: { locale: string; name: string }[] };
  const { slug, sort, translations } = body;

  if (slug !== undefined || sort !== undefined) {
    const update: Record<string, unknown> = {};
    if (slug !== undefined) update.slug = slug;
    if (sort !== undefined) update.sort = sort;
    const { error } = await supabase.from("Category").update(update).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (translations?.length) {
    for (const t of translations) {
      await supabase
        .from("CategoryTranslation")
        .upsert({ categoryId: id, locale: t.locale, name: t.name }, { onConflict: "categoryId,locale" });
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  // Check no products are attached
  const { count } = await supabase
    .from("Product")
    .select("id", { count: "exact", head: true })
    .eq("categoryId", id);

  if ((count ?? 0) > 0) {
    return NextResponse.json(
      { error: "Cette catégorie contient des produits. Déplacez-les d'abord." },
      { status: 409 }
    );
  }

  const { error } = await supabase.from("Category").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
