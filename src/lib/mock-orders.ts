/**
 * Mock order data for development.
 * Replace with Prisma queries once DATABASE_URL is configured:
 *   import { db } from "@/lib/db"
 *   const orders = await db.order.findMany({ where: { userId }, include: { items: true } })
 */

export type OrderStatus =
  | "DRAFT"
  | "QUOTED"
  | "DEPOSIT_PENDING"
  | "DEPOSIT_PAID"
  | "PROCURING"
  | "PURCHASED"
  | "AT_CN_WAREHOUSE"
  | "BALANCE_PENDING"
  | "BALANCE_PAID"
  | "INTL_SHIPPING"
  | "ARRIVED_MG"
  | "READY_FOR_PICKUP"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED";

export type OrderType = "SELF" | "AGENT";

export interface MockOrderItem {
  id: string;
  productName: string;
  productSlug: string;
  productImage?: string;
  qty: number;
  unitPriceMGA: number;
}

export interface MockOrder {
  id: string;
  orderNo: string;
  type: OrderType;
  status: OrderStatus;
  customer: { name: string; email: string; phone: string };
  items: MockOrderItem[];
  productCostMGA: number;
  serviceFeeMGA: number;
  intlShippingMGA: number;
  customsFeeMGA: number;
  totalMGA: number;
  depositMGA: number;
  balanceDueMGA: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export const MOCK_ORDERS: MockOrder[] = [
  {
    id: "ord-001",
    orderNo: "MS-20260501-001",
    type: "SELF",
    status: "COMPLETED",
    customer: { name: "Jean Rakoto", email: "jean@example.mg", phone: "034 12 345 67" },
    items: [
      {
        id: "item-001",
        productName: "Batterie externe Xiaomi 20000mAh",
        productSlug: "xiaomi-power-bank-20000",
        productImage: "https://images.unsplash.com/photo-1585338218612-5f2f43a3ef75?w=600&q=80",
        qty: 1,
        unitPriceMGA: 85000,
      },
    ],
    productCostMGA: 85000,
    serviceFeeMGA: 0,
    intlShippingMGA: 0,
    customsFeeMGA: 0,
    totalMGA: 85000,
    depositMGA: 25500,
    balanceDueMGA: 0,
    createdAt: "2026-05-01T10:00:00Z",
    updatedAt: "2026-05-08T14:00:00Z",
  },
  {
    id: "ord-002",
    orderNo: "MS-20260510-002",
    type: "AGENT",
    status: "PROCURING",
    customer: { name: "Marie Rasoa", email: "marie@example.mg", phone: "032 98 765 43" },
    items: [
      {
        id: "item-002",
        productName: "Cuiseur à riz intelligent 3L",
        productSlug: "rice-cooker-3l-agent",
        productImage: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&q=80",
        qty: 1,
        unitPriceMGA: 138000,
      },
    ],
    productCostMGA: 138000,
    serviceFeeMGA: 13800,
    intlShippingMGA: 25000,
    customsFeeMGA: 8000,
    totalMGA: 184800,
    depositMGA: 55440,
    balanceDueMGA: 129360,
    note: "Commande via JD.com — numéro de suivi CN: JD123456789",
    createdAt: "2026-05-10T08:30:00Z",
    updatedAt: "2026-05-15T11:00:00Z",
  },
  {
    id: "ord-003",
    orderNo: "MS-20260520-003",
    type: "AGENT",
    status: "DEPOSIT_PENDING",
    customer: { name: "Paul Randria", email: "paul@example.mg", phone: "033 55 444 33" },
    items: [
      {
        id: "item-003",
        productName: "Écouteurs Bluetooth sans fil TWS",
        productSlug: "bluetooth-earbuds-agent",
        productImage: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80",
        qty: 2,
        unitPriceMGA: 65000,
      },
    ],
    productCostMGA: 130000,
    serviceFeeMGA: 13000,
    intlShippingMGA: 18000,
    customsFeeMGA: 5000,
    totalMGA: 166000,
    depositMGA: 49800,
    balanceDueMGA: 116200,
    createdAt: "2026-05-20T14:15:00Z",
    updatedAt: "2026-05-20T14:15:00Z",
  },
  {
    id: "ord-004",
    orderNo: "MS-20260525-004",
    type: "AGENT",
    status: "INTL_SHIPPING",
    customer: { name: "Hanta Ramiandrisoa", email: "hanta@example.mg", phone: "034 77 888 22" },
    items: [
      {
        id: "item-004",
        productName: "Coffret soin visage 5 pièces",
        productSlug: "skin-care-set-agent",
        productImage: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80",
        qty: 1,
        unitPriceMGA: 95000,
      },
      {
        id: "item-005",
        productName: "Robe d'été en mousseline",
        productSlug: "women-summer-dress-agent",
        productImage: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&q=80",
        qty: 2,
        unitPriceMGA: 52000,
      },
    ],
    productCostMGA: 199000,
    serviceFeeMGA: 19900,
    intlShippingMGA: 30000,
    customsFeeMGA: 10000,
    totalMGA: 258900,
    depositMGA: 77670,
    balanceDueMGA: 181230,
    note: "Vol Guangzhou → Antananarivo | Tracking: ET123456789",
    createdAt: "2026-05-22T09:00:00Z",
    updatedAt: "2026-05-27T16:00:00Z",
  },
];

export function getMockOrders(userId?: string): MockOrder[] {
  void userId; // will be used with real DB: db.order.findMany({ where: { userId } })
  return MOCK_ORDERS;
}

export function getMockOrder(id: string): MockOrder | undefined {
  return MOCK_ORDERS.find((o) => o.id === id || o.orderNo === id);
}

// --- Status helpers ---

export const SELF_STEPS: OrderStatus[] = [
  "DEPOSIT_PENDING",
  "DEPOSIT_PAID",
  "READY_FOR_PICKUP",
  "COMPLETED",
];

export const AGENT_STEPS: OrderStatus[] = [
  "QUOTED",
  "DEPOSIT_PENDING",
  "DEPOSIT_PAID",
  "PROCURING",
  "PURCHASED",
  "AT_CN_WAREHOUSE",
  "BALANCE_PENDING",
  "BALANCE_PAID",
  "INTL_SHIPPING",
  "ARRIVED_MG",
  "READY_FOR_PICKUP",
  "COMPLETED",
];

export function getStepIndex(status: OrderStatus, type: OrderType): number {
  const steps = type === "SELF" ? SELF_STEPS : AGENT_STEPS;
  return steps.indexOf(status);
}
