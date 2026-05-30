import { NextRequest, NextResponse } from "next/server";
import { MOCK_PRODUCTS } from "@/lib/mock-data";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = MOCK_PRODUCTS.find((p) => p.id === id || p.slug === id);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json() as Record<string, unknown>;

  // TODO (DB):
  // const product = await prisma.product.update({
  //   where: { id },
  //   data: {
  //     ...(body.slug && { slug: body.slug as string }),
  //     ...(body.priceMGA && { priceMGA: new Decimal(body.priceMGA as string) }),
  //     ...(body.priceCNY && { basePriceCNY: new Decimal(body.priceCNY as string) }),
  //     ...(body.weightKg && { weightKg: new Decimal(body.weightKg as string) }),
  //     ...(body.stock !== undefined && { stock: parseInt(body.stock as string) }),
  //     ...(body.status && { status: body.status as ProductStatus }),
  //     ...(body.type && { type: body.type as ProductType }),
  //     ...(body.source && { source: body.source as SourcePlatform }),
  //     ...(body.sourceUrl !== undefined && { sourceUrl: body.sourceUrl as string | null }),
  //   },
  //   include: { translations: true, category: true },
  // });
  // const tr = body.translations as Record<string, { name: string; description: string }> | undefined;
  // if (tr) {
  //   for (const [locale, t] of Object.entries(tr)) {
  //     await prisma.productTranslation.upsert({
  //       where: { productId_locale: { productId: id, locale } },
  //       create: { productId: id, locale, name: t.name, description: t.description, isAuto: locale !== "fr" },
  //       update: { name: t.name, description: t.description },
  //     });
  //   }
  // }
  // return NextResponse.json(product);

  console.log("[Product PATCH]", id, body);
  return NextResponse.json({ id, ...body, updatedAt: new Date().toISOString() });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // TODO (DB): await prisma.product.delete({ where: { id } });
  console.log("[Product DELETE]", id);
  return NextResponse.json({ deleted: true, id });
}
