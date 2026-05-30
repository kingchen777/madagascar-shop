/**
 * Product data layer — swap mock → Prisma here when DB is ready.
 *
 * To connect real database:
 *   1. Fill .env: DATABASE_URL, DIRECT_URL (Supabase connection strings)
 *   2. Run: npx prisma db push && npm run db:seed
 *   3. Replace each function body with the commented Prisma version below.
 */

import {
  MOCK_PRODUCTS,
  getMockProduct,
  getMockProductsByCategory,
  type MockProduct,
  type MockLocale,
} from "@/lib/mock-data";

export type { MockProduct as Product, MockLocale };

/** Get all active products, optionally filtered by category slug. */
export async function getProducts(categorySlug?: string): Promise<MockProduct[]> {
  // TODO (DB): return db.product.findMany({
  //   where: { status: "ACTIVE", ...(categorySlug ? { category: { slug: categorySlug } } : {}) },
  //   include: { category: true, translations: true },
  //   orderBy: { createdAt: "desc" },
  // });
  return getMockProductsByCategory(categorySlug);
}

/** Get a single product by slug. Returns undefined if not found. */
export async function getProduct(slug: string): Promise<MockProduct | undefined> {
  // TODO (DB): return db.product.findUnique({
  //   where: { slug },
  //   include: { category: true, translations: true },
  // }) ?? undefined;
  return getMockProduct(slug);
}

/** Get all products (for admin). */
export async function getAllProducts(): Promise<MockProduct[]> {
  // TODO (DB): return db.product.findMany({
  //   include: { category: true, translations: true },
  //   orderBy: { createdAt: "desc" },
  // });
  return MOCK_PRODUCTS;
}
