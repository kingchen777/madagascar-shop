import { prisma } from "@/lib/db";
import type { Product, ProductTranslation, ProductImage, Category } from "@prisma/client";

export type ProductWithRelations = Product & {
  translations: ProductTranslation[];
  images: ProductImage[];
  category: Category | null;
};

export type { Product };

/** Get all active products, optionally filtered by category slug. */
export async function getProducts(categorySlug?: string): Promise<ProductWithRelations[]> {
  return prisma.product.findMany({
    where: {
      status: "ACTIVE",
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    },
    include: { translations: true, images: true, category: true },
    orderBy: { createdAt: "desc" },
  });
}

/** Get a single product by slug. Returns undefined if not found. */
export async function getProduct(slug: string): Promise<ProductWithRelations | undefined> {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { translations: true, images: true, category: true },
  });
  return product ?? undefined;
}

/** Get all products (for admin). */
export async function getAllProducts(): Promise<ProductWithRelations[]> {
  return prisma.product.findMany({
    include: { translations: true, images: true, category: true },
    orderBy: { createdAt: "desc" },
  });
}
