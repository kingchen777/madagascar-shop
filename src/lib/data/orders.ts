import { supabase } from "@/lib/db";

export type OrderWithRelations = {
  id: string;
  orderNo: string;
  userId: string;
  type: "SELF" | "AGENT";
  status: string;
  productCost: string;
  domesticShipping: string;
  intlShipping: string;
  serviceFee: string;
  customsFee: string;
  miscFee: string;
  depositAmount: string;
  totalAmount: string;
  currency: string;
  shippingInfo: Record<string, unknown> | null;
  internalNotes: string | null;
  createdAt: string;
  updatedAt: string;
  user: { id: string; email: string | null; phone: string | null; name: string | null } | null;
  items: {
    id: string;
    orderId: string;
    productId: string | null;
    customUrl: string | null;
    titleSnapshot: string;
    spec: string | null;
    qty: number;
    unitPriceCNY: string | null;
    unitPriceMGA: string;
    product: {
      id: string;
      slug: string;
      translations: { locale: string; name: string; description: string }[];
    } | null;
  }[];
  payments: {
    id: string;
    orderId: string;
    kind: string;
    provider: string;
    amount: string;
    currency: string;
    status: string;
    providerRef: string | null;
    proofUrl: string | null;
    createdAt: string;
  }[];
};

const ORDER_SELECT = `
  *,
  user:User(id, email, phone, name),
  items:OrderItem(
    *,
    product:Product(id, slug, translations:ProductTranslation(locale, name, description))
  ),
  payments:Payment(*)
`;

/** Get orders for a user, or all orders if no userId provided. */
export async function getOrders(userId?: string): Promise<OrderWithRelations[]> {
  let query = supabase
    .from("Order")
    .select(ORDER_SELECT)
    .order("createdAt", { ascending: false });
  if (userId) query = query.eq("userId", userId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as OrderWithRelations[];
}

/** Get a single order by id. */
export async function getOrder(id: string): Promise<OrderWithRelations | undefined> {
  const { data, error } = await supabase
    .from("Order")
    .select(ORDER_SELECT)
    .eq("id", id)
    .single();
  if (error) return undefined;
  return data as OrderWithRelations;
}

/** Get all orders for admin dashboard. */
export async function getAllOrders(): Promise<OrderWithRelations[]> {
  return getOrders();
}
