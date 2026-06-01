"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import type { OrderStatus } from "@prisma/client";
import { OrderStatusSelect } from "./OrderStatusSelect";
import { BulkOrderActions, RowCheckbox, SelectAllCheckbox } from "./BulkOrderActions";

function formatMGA(n: string | number) {
  return new Intl.NumberFormat("fr-MG", { maximumFractionDigits: 0 }).format(Number(n)) + " Ar";
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-MG", { day: "2-digit", month: "short", year: "numeric" });
}

const STATUS_BADGE: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600", QUOTED: "bg-blue-100 text-blue-700",
  DEPOSIT_PENDING: "bg-yellow-100 text-yellow-700", DEPOSIT_PAID: "bg-blue-100 text-blue-700",
  PROCURING: "bg-purple-100 text-purple-700", PURCHASED: "bg-purple-100 text-purple-700",
  AT_CN_WAREHOUSE: "bg-indigo-100 text-indigo-700", BALANCE_PENDING: "bg-orange-100 text-orange-700",
  BALANCE_PAID: "bg-blue-100 text-blue-700", INTL_SHIPPING: "bg-cyan-100 text-cyan-700",
  ARRIVED_MG: "bg-teal-100 text-teal-700", READY_FOR_PICKUP: "bg-green-100 text-green-700",
  COMPLETED: "bg-green-100 text-green-700", CANCELLED: "bg-red-100 text-red-600",
  REFUNDED: "bg-gray-100 text-gray-600",
};

export interface OrderRow {
  id: string;
  orderNo: string;
  status: OrderStatus;
  type: string;
  totalAmount: string;
  depositAmount: string;
  createdAt: string;
  user: { name?: string; phone?: string } | null;
  items: { titleSnapshot?: string }[] | null;
}

interface Props {
  orders: OrderRow[];
}

export function AdminOrdersTable({ orders }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allIds = orders.map((o) => o.id);

  const toggleOne = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((prev) =>
      prev.size === allIds.length ? new Set() : new Set(allIds)
    );
  }, [allIds]);

  function handleBulkDone() {
    setSelected(new Set());
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5">
          <BulkOrderActions orderIds={[...selected]} onDone={handleBulkDone} />
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="pl-4 pr-2 py-3">
                <SelectAllCheckbox allIds={allIds} selected={selected} onToggleAll={toggleAll} />
              </th>
              {["N° commande", "Client", "Articles", "Type", "Total", "Acompte", "Statut", "Date", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.length === 0 ? (
              <tr><td colSpan={10} className="px-4 py-8 text-center text-sm text-gray-400">Aucune commande</td></tr>
            ) : orders.map((order) => (
              <tr key={order.id} className={`hover:bg-gray-50 transition-colors ${selected.has(order.id) ? "bg-amber-50/50" : ""}`}>
                <td className="pl-4 pr-2 py-3">
                  <RowCheckbox id={order.id} selected={selected} onToggle={toggleOne} />
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                  <Link href={`/admin/orders/${order.id}`} className="hover:text-amber-700 transition-colors">
                    {order.orderNo}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-900">{order.user?.name ?? "—"}</p>
                  <p className="text-xs text-gray-400">{order.user?.phone ?? "—"}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-gray-700 max-w-[160px] truncate">{order.items?.[0]?.titleSnapshot ?? "—"}</p>
                  {(order.items?.length ?? 0) > 1 && <p className="text-xs text-gray-400">+{(order.items?.length ?? 1) - 1} autre(s)</p>}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${order.type === "AGENT" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>{order.type}</span>
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-800 whitespace-nowrap">{formatMGA(order.totalAmount)}</td>
                <td className="px-4 py-3 text-sm text-green-700 whitespace-nowrap">{formatMGA(order.depositAmount)}</td>
                <td className="px-4 py-3">
                  <OrderStatusSelect orderId={order.id} initialStatus={order.status} />
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="text-gray-400 hover:text-amber-600 transition-colors" title="Détails">
                    <Eye className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
