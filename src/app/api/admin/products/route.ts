import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { ProductType, SourcePlatform } from "@prisma/client";

export async function GET() {
  const products = await prisma.product.findMany({
    include: { translations: true, images: true, category: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
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

  const product = await prisma.product.create({
    data: {
      slug,
      type: (body.type as ProductType) ?? "SELF",
      source: (body.source as SourcePlatform) ?? "NONE",
      sourceUrl: body.sourceUrl || null,
      priceMGA: priceMGA,
      basePriceCNY: body.priceCNY ?? null,
      weightKg: body.weightKg ?? null,
      stock: body.stock ? parseInt(body.stock) : null,
      status: "ACTIVE",
      ...(body.categorySlug
        ? { category: { connect: { slug: body.categorySlug } } }
        : {}),
      translations: {
        create: Object.entries(translations).map(([locale, t]) => ({
          locale,
          name: t.name,
          description: t.description,
          isAuto: locale !== "fr",
        })),
      },
    },
    include: { translations: true, images: true, category: true },
  });

  return NextResponse.json(product, { status: 201 });
}
