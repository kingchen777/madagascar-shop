import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

export async function GET() {
  const { data, error } = await supabase
    .from("Category")
    .select(`
      id, slug, sort,
      translations:CategoryTranslation(locale, name)
    `)
    .order("sort")
    .order("slug");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const body = await req.json() as { slug: string; sort?: number; translations: { locale: string; name: string }[] };

  const { slug, sort = 0, translations } = body;
  if (!slug || !translations?.length) {
    return NextResponse.json({ error: "slug and translations are required" }, { status: 400 });
  }

  const { data: cat, error } = await supabase
    .from("Category")
    .insert({ slug, sort })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = translations.map((t) => ({ categoryId: cat.id, locale: t.locale, name: t.name }));
  const { error: transError } = await supabase.from("CategoryTranslation").insert(rows);
  if (transError) return NextResponse.json({ error: transError.message }, { status: 500 });

  return NextResponse.json({ id: cat.id }, { status: 201 });
}
