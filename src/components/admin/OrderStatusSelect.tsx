"use client";

import { useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import type { OrderStatus } from "@/lib/mock-orders";

const NEXT_STATUSES: Partial<Record<OrderStatus, OrderStatus[]>> = {
  DRAFT: ["QUOTED", "DEPOSIT_PENDING"],
  QUOTED: ["DEPOSIT_PENDING"],
  DEPOSIT_PENDING: ["DEPOSIT_PAID", "CANCELLED"],
  DEPOSIT_PAID: ["PROCURING"],
  PROCURING: ["PURCHASED"],
  PURCHASED: ["AT_CN_WAREHOUSE"],
  AT_CN_WAREHOUSE: ["BALANCE_PENDING"],
  BALANCE_PENDING: ["BALANCE_PAID"],
  BALANCE_PAID: ["INTL_SHIPPING"],
  INTL_SHIPPING: ["ARRIVED_MG"],
  ARRIVED_MG: ["READY_FOR_PICKUP"],
  READY_FOR_PICKUP: ["COMPLETED"],
};

const STATUS_FR: Record<string, string> = {
  DRAFT: "Brouillon", QUOTED: "Devis envoyé", DEPOSIT_PENDING: "Acompte en attente",
  DEPOSIT_PAID: "Acompte payé", PROCURING: "Achat en cours", PURCHASED: "Acheté",
  AT_CN_WAREHOUSE: "Entrepôt CN", BALANCE_PENDING: "Solde en attente",
  BALANCE_PAID: "Solde payé", INTL_SHIPPING: "En transit", ARRIVED_MG: "Arrivé MG",
  READY_FOR_PICKUP: "À retirer", COMPLETED: "Terminé", CANCELLED: "Annulé",
};

const STATUS_BADGE: Record<string, string> = {
  DEPOSIT_PENDING: "bg-yellow-100 text-yellow-700", PROCURING: "bg-purple-100 text-purple-700",
  INTL_SHIPPING: "bg-cyan-100 text-cyan-700", COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-600", DEPOSIT_PAID: "bg-blue-100 text-blue-700",
  BALANCE_PENDING: "bg-orange-100 text-orange-700", READY_FOR_PICKUP: "bg-green-100 text-green-700",
};

interface Props {
  orderId: string;
  initialStatus: OrderStatus;
}

export function OrderStatusSelect({ orderId, initialStatus }: Props) {
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const nexts = NEXT_STATUSES[status] ?? [];
  const badgeClass = STATUS_BADGE[status] ?? "bg-gray-100 text-gray-600";

  async function advance(next: OrderStatus) {
    setOpen(false);
    setLoading(true);
    try {
      await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      setStatus(next);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  if (nexts.length === 0) {
    return (
      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass}`}>
        {STATUS_FR[status] ?? status}
      </span>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass}`}
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
        {STATUS_FR[status] ?? status}
        <ChevronDown className="h-3 w-3" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 w-44 rounded-xl border border-gray-200 bg-white shadow-lg py-1">
          {nexts.map((s) => (
            <button
              key={s}
              onClick={() => advance(s)}
              className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
            >
              → {STATUS_FR[s] ?? s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
