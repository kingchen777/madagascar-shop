import { NextRequest, NextResponse } from "next/server";
import { getAllProducts } from "@/lib/data/products";

export async function GET() {
  const products = await getAllProducts();
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

  // TODO (DB): replace mock block below with Prisma:
  // const product = await prisma.product.create({
  //   data: {
  //     slug,
  //     type: (body.type as ProductType) ?? "SELF",
  //     source: (body.source as SourcePlatform) ?? "NONE",
  //     sourceUrl: body.sourceUrl || null,
  //     priceMGA: new Decimal(priceMGA),
  //     basePriceCNY: body.priceCNY ? new Decimal(body.priceCNY) : null,
  //     weightKg: body.weightKg ? new Decimal(body.weightKg) : null,
  //     stock: body.stock ? parseInt(body.stock) : null,
  //     status: "ACTIVE",
  //     category: body.categorySlug
  //       ? { connect: { slug: body.categorySlug } }
  //       : undefined,
  //     translations: {
  //       create: Object.entries(translations).map(([locale, t]) => ({
  //         locale,
  //         name: t.name,
  //         description: t.description,
  //         isAuto: locale !== "fr",
  //       })),
  //     },
  //   },
  //   include: { translations: true, category: true },
  // });
  // return NextResponse.json(product, { status: 201 });

  const id = `prod-${Date.now()}`;
  console.log("[Product CREATE]", { id, slug, priceMGA, translations });
  return NextResponse.json(
    { id, slug, priceMGA, type: body.type ?? "SELF", status: "ACTIVE", translations },
    { status: 201 }
  );
}
