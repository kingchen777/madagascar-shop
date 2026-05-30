import { NextRequest, NextResponse } from "next/server";
import { translateProduct, type Locale } from "@/lib/translate";

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, description, sourceLocale, targetLocales } = body as {
    name?: string;
    description?: string;
    sourceLocale?: string;
    targetLocales?: string[];
  };

  if (!name || !description || !sourceLocale || !Array.isArray(targetLocales)) {
    return NextResponse.json(
      { error: "Missing required fields: name, description, sourceLocale, targetLocales" },
      { status: 400 }
    );
  }

  try {
    const results = await translateProduct({
      sourceLocale: sourceLocale as Locale,
      targetLocales: targetLocales as Locale[],
      fields: { name, description },
    });

    const translations: Record<string, { name: string; description: string }> = {};
    for (const r of results) {
      translations[r.locale] = { name: r.name, description: r.description };
    }
    // Include source locale unchanged
    translations[sourceLocale] = { name, description };

    return NextResponse.json({ translations });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Translation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
