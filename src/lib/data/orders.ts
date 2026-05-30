/**
 * Order data layer — swap mock → Prisma here when DB is ready.
 *
 * To connect real database:
 *   1. Fill .env: DATABASE_URL, DIRECT_URL
 *   2. Run: npx prisma db push && npm run db:seed
 *   3. Replace each function body with the commented Prisma version below.
 */

import {
  MOCK_ORDERS,
  getMockOrder,
  getMockOrders,
  type MockOrder,
} from "@/lib/mock-orders";

export type { MockOrder as Order };

/** Get orders for a user (all orders in mock mode). */
export async function getOrders(userId?: string): Promise<MockOrder[]> {
  // TODO (DB): return db.order.findMany({
  //   where: userId ? { userId } : {},
  //   include: { items: { include: { product: { include: { translations: true } } } } },
  //   orderBy: { createdAt: "desc" },
  // });
  return getMockOrders(userId);
}

/** Get a single order by id. */
export async function getOrder(id: string): Promise<MockOrder | undefined> {
  // TODO (DB): return db.order.findUnique({
  //   where: { id },
  //   include: { items: { include: { product: { include: { translations: true } } } }, payments: true },
  // }) ?? undefined;
  return getMockOrder(id);
}

/** Get all orders for admin dashboard. */
export async function getAllOrders(): Promise<MockOrder[]> {
  // TODO (DB): return db.order.findMany({
  //   include: { user: true, items: true, payments: true },
  //   orderBy: { createdAt: "desc" },
  // });
  return MOCK_ORDERS;
}
