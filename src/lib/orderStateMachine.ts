import { OrderStatus, ProductType } from "@prisma/client";

type Transition = {
  from: OrderStatus;
  to: OrderStatus[];
};

// Valid transitions for AGENT orders
const AGENT_TRANSITIONS: Transition[] = [
  { from: "DRAFT", to: ["QUOTED", "CANCELLED"] },
  { from: "QUOTED", to: ["DEPOSIT_PENDING", "CANCELLED"] },
  { from: "DEPOSIT_PENDING", to: ["DEPOSIT_PAID", "CANCELLED"] },
  { from: "DEPOSIT_PAID", to: ["PROCURING", "CANCELLED", "REFUNDED"] },
  { from: "PROCURING", to: ["PURCHASED", "CANCELLED", "REFUNDED"] },
  { from: "PURCHASED", to: ["AT_CN_WAREHOUSE"] },
  { from: "AT_CN_WAREHOUSE", to: ["BALANCE_PENDING"] },
  { from: "BALANCE_PENDING", to: ["BALANCE_PAID", "CANCELLED", "REFUNDED"] },
  { from: "BALANCE_PAID", to: ["INTL_SHIPPING"] },
  { from: "INTL_SHIPPING", to: ["ARRIVED_MG"] },
  { from: "ARRIVED_MG", to: ["READY_FOR_PICKUP"] },
  { from: "READY_FOR_PICKUP", to: ["COMPLETED"] },
  { from: "COMPLETED", to: [] },
  { from: "CANCELLED", to: [] },
  { from: "REFUNDED", to: [] },
];

// Simplified transitions for SELF (own-stock) orders
const SELF_TRANSITIONS: Transition[] = [
  { from: "DRAFT", to: ["DEPOSIT_PENDING", "CANCELLED"] },
  { from: "DEPOSIT_PENDING", to: ["DEPOSIT_PAID", "CANCELLED"] },
  { from: "DEPOSIT_PAID", to: ["READY_FOR_PICKUP", "REFUNDED"] },
  { from: "READY_FOR_PICKUP", to: ["COMPLETED"] },
  { from: "COMPLETED", to: [] },
  { from: "CANCELLED", to: [] },
  { from: "REFUNDED", to: [] },
];

function getTransitions(type: ProductType): Transition[] {
  return type === "SELF" ? SELF_TRANSITIONS : AGENT_TRANSITIONS;
}

/**
 * Check whether a status transition is allowed for the given order type.
 */
export function isTransitionAllowed(
  type: ProductType,
  from: OrderStatus,
  to: OrderStatus
): boolean {
  const transitions = getTransitions(type);
  const rule = transitions.find((t) => t.from === from);
  return rule ? rule.to.includes(to) : false;
}

/**
 * Get all valid next statuses from the current status.
 */
export function getNextStatuses(
  type: ProductType,
  current: OrderStatus
): OrderStatus[] {
  const transitions = getTransitions(type);
  const rule = transitions.find((t) => t.from === current);
  return rule ? rule.to : [];
}

/**
 * Throw if transition is not allowed.
 */
export function assertTransitionAllowed(
  type: ProductType,
  from: OrderStatus,
  to: OrderStatus
): void {
  if (!isTransitionAllowed(type, from, to)) {
    throw new Error(
      `Invalid order status transition: ${from} → ${to} (type: ${type})`
    );
  }
}

// Human-readable labels for each status (used across locales fallback)
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  DRAFT: "Draft / Brouillon",
  QUOTED: "Quoted / Devisé",
  DEPOSIT_PENDING: "Awaiting Deposit / En attente d'acompte",
  DEPOSIT_PAID: "Deposit Paid / Acompte payé",
  PROCURING: "Procuring / En cours d'achat",
  PURCHASED: "Purchased / Acheté",
  AT_CN_WAREHOUSE: "At CN Warehouse / En entrepôt CN",
  BALANCE_PENDING: "Awaiting Balance / En attente du solde",
  BALANCE_PAID: "Balance Paid / Solde payé",
  INTL_SHIPPING: "International Shipping / Expédition internationale",
  ARRIVED_MG: "Arrived in Madagascar / Arrivé à Madagascar",
  READY_FOR_PICKUP: "Ready for Pickup / Prêt à retirer",
  COMPLETED: "Completed / Terminé",
  CANCELLED: "Cancelled / Annulé",
  REFUNDED: "Refunded / Remboursé",
};
