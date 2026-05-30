import { prisma } from "@/lib/db";
import type { Order, OrderItem, Payment, User, Product, ProductTranslation } from "@prisma/client";

export type OrderWithRelations = Order & {
  user: User;
  items: (OrderItem & {
    product: (Product & { translations: ProductTranslation[] }) | null;
  })[];
  payments: Payment[];
};

export type { Order };

/** Get orders for a user, or all orders if no userId provided. */
export async function getOrders(userId?: string): Promise<OrderWithRelations[]> {
  return prisma.order.findMany({
    where: userId ? { userId } : {},
    include: {
      user: true,
      items: { include: { product: { include: { translations: true } } } },
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

/** Get a single order by id. */
export async function getOrder(id: string): Promise<OrderWithRelations | undefined> {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      items: { include: { product: { include: { translations: true } } } },
      payments: true,
    },
  });
  return order ?? undefined;
}

/** Get all orders for admin dashboard. */
export async function getAllOrders(): Promise<OrderWithRelations[]> {
  return prisma.order.findMany({
    include: {
      user: true,
      items: { include: { product: { include: { translations: true } } } },
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
