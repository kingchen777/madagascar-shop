import Link from "next/link";
import { Eye } from "lucide-react";
import { supabase } from "@/lib/db";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";

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
const STATUS_FR: Record<string, string> = {
  DRAFT: "Brouillon", QUOTED: "Devis envoyé", DEPOSIT_PENDING: "Acompte en attente",
  DEPOSIT_PAID: "Acompte payé", PROCURING: "Achat en cours", PURCHASED: "Acheté",
  AT_CN_WAREHOUSE: "Entrepôt CN", BALANCE_PENDING: "Solde en attente", BALANCE_PAID: "Solde payé",
  INTL_SHIPPING: "En transit", ARRIVED_MG: "Arrivé MG", READY_FOR_PICKUP: "À retirer",
  COMPLETED: "Terminé", CANCELLED: "Annulé", REFUNDED: "Remboursé",
};
const groups = [
  { label: "Paiement en attente", statuses: ["DEPOSIT_PENDING", "BALANCE_PENDING"], color: "bg-yellow-500" },
  { label: "En cours", statuses: ["DEPOSIT_PAID", "PROCURING", "PURCHASED", "AT_CN_WAREHOUSE", "BALANCE_PAID", "INTL_SHIPPING", "ARRIVED_MG"], color: "bg-blue-500" },
  { label: "À retirer", statuses: ["READY_FOR_PICKUP"], color: "bg-green-500" },
  { label: "Terminées", statuses: ["COMPLETED"], color: "bg-gray-400" },
];

export default async function AdminOrdersPage() {
  const { data: ordersData } = await supabase
    .from("Order")
    .select(`*, user:User(name, phone), items:OrderItem(titleSnapshot)`)
    .order("createdAt", { ascending: false });
  const orders = ordersData ?? [];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Commandes ({orders.length})</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {groups.map((g) => {
          const count = orders.filter((o) => g.statuses.includes(o.status)).length;
          return (
            <div key={g.label} className="rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${g.color}`} />
              <div>
                <p className="text-lg font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-500">{g.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2 flex-wrap">
        <button className="rounded-full bg-gray-900 px-3 py-1 text-xs font-medium text-white">Toutes</button>
        {["DEPOSIT_PENDING", "PROCURING", "INTL_SHIPPING", "READY_FOR_PICKUP", "COMPLETED"].map((s) => (
          <button key={s} className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:border-amber-400 hover:text-amber-700 transition-colors">
            {STATUS_FR[s]}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {["N° commande", "Client", "Articles", "Type", "Total", "Acompte", "Statut", "Date", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-400">Aucune commande</td></tr>
            ) : orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">{order.orderNo}</td>
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-900">{order.user?.name ?? "—"}</p>
                  <p className="text-xs text-gray-400">{order.user?.phone ?? "—"}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-gray-700 max-w-[160px] truncate">{order.items?.[0]?.titleSnapshot ?? "—"}</p>
                  {order.items?.length > 1 && <p className="text-xs text-gray-400">+{order.items.length - 1} autre(s)</p>}
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
                  <Link href={`/fr/orders/${order.id}`} target="_blank" className="text-gray-400 hover:text-amber-600 transition-colors" title="Voir commande client">
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
