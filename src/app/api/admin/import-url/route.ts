import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type SourcePlatform = "TAOBAO" | "TMALL" | "PINDUODUO" | "ALIBABA1688" | "JD" | "NONE";

function detectPlatform(url: string): SourcePlatform {
  if (url.includes("1688.com")) return "ALIBABA1688";
  if (url.includes("tmall.com")) return "TMALL";
  if (url.includes("taobao.com")) return "TAOBAO";
  if (url.includes("pinduoduo.com") || url.includes("yangkeduo.com")) return "PINDUODUO";
  if (url.includes("jd.com") || url.includes("360buy.com")) return "JD";
  return "NONE";
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json() as { url?: string };
    if (!url?.startsWith("http")) {
      return NextResponse.json({ error: "URL invalide" }, { status: 400 });
    }

    // ── 1. Fetch page via Jina AI Reader ─────────────────────────
    const jinaUrl = `https://r.jina.ai/${url}`;
    const jinaRes = await fetch(jinaUrl, {
      headers: { Accept: "text/plain", "X-No-Cache": "true" },
      signal: AbortSignal.timeout(20000),
    });

    if (!jinaRes.ok) {
      return NextResponse.json({ error: "Impossible de récupérer la page. Vérifiez l'URL." }, { status: 502 });
    }

    const pageText = await jinaRes.text();
    // Keep first 8000 chars to stay within context limits
    const truncated = pageText.slice(0, 8000);

    // ── 2. Extract product info with Claude ───────────────────────
    const prompt = `You are extracting product information from a Chinese e-commerce page.

Page content:
${truncated}

Extract the following and return ONLY a valid JSON object (no markdown, no extra text):
{
  "titleZh": "product name in Chinese (original, not translated)",
  "descriptionZh": "product description in Chinese, 2-4 sentences covering key features and specs",
  "priceCNY": "price as a number string (e.g. '89.9'), use the main selling price, empty string if not found",
  "imageUrls": ["array of up to 5 product image URLs found in the page content, must be absolute URLs starting with http"]
}

Rules:
- titleZh: use the original Chinese product title
- priceCNY: extract the main price (not shipping), digits only with optional decimal
- imageUrls: only include actual image URLs (jpg/png/webp), skip icons and logos
- If information is not found, use empty string or empty array`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text.trim() : "";
    const jsonText = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();

    let extracted: {
      titleZh: string;
      descriptionZh: string;
      priceCNY: string;
      imageUrls: string[];
    };

    try {
      extracted = JSON.parse(jsonText);
    } catch {
      return NextResponse.json({ error: "Erreur de parsing IA. Réessayez." }, { status: 500 });
    }

    return NextResponse.json({
      titleZh: extracted.titleZh ?? "",
      descriptionZh: extracted.descriptionZh ?? "",
      priceCNY: extracted.priceCNY ?? "",
      imageUrls: (extracted.imageUrls ?? []).filter((u: string) => u.startsWith("http")).slice(0, 5),
      source: detectPlatform(url),
      sourceUrl: url,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
