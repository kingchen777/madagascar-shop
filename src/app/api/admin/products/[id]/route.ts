import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { ProductType, SourcePlatform, ProductStatus } from "@prisma/client";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { translations: true, images: true, category: true },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
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

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(body.slug && { slug: body.slug }),
      ...(body.type && { type: body.type as ProductType }),
      ...(body.source && { source: body.source as SourcePlatform }),
      ...(body.sourceUrl !== undefined && { sourceUrl: body.sourceUrl || null }),
      ...(body.priceMGA && { priceMGA: body.priceMGA }),
      ...(body.priceCNY && { basePriceCNY: body.priceCNY }),
      ...(body.weightKg && { weightKg: body.weightKg }),
      ...(body.stock !== undefined && { stock: parseInt(body.stock) }),
      ...(body.status && { status: body.status as ProductStatus }),
    },
    include: { translations: true, images: true, category: true },
  });

  if (body.translations) {
    for (const [locale, t] of Object.entries(body.translations)) {
      await prisma.productTranslation.upsert({
        where: { productId_locale: { productId: id, locale } },
        create: { productId: id, locale, name: t.name, description: t.description, isAuto: locale !== "fr" },
        update: { name: t.name, description: t.description },
      });
    }
  }

  return NextResponse.json(product);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ deleted: true, id });
}
