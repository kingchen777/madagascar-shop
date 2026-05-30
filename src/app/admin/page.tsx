import Link from "next/link";
import { ShoppingBag, Package, TrendingUp, Clock, ChevronRight } from "lucide-react";
import { MOCK_ORDERS } from "@/lib/mock-orders";
import { MOCK_PRODUCTS } from "@/lib/mock-data";

function formatMGA(n: number) {
  return new Intl.NumberFormat("fr-MG", { maximumFractionDigits: 0 }).format(n) + " Ar";
}

const STATUS_BADGE: Record<string, string> = {
  DEPOSIT_PENDING: "bg-yellow-100 text-yellow-700",
  PROCURING: "bg-purple-100 text-purple-700",
  INTL_SHIPPING: "bg-cyan-100 text-cyan-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-600",
};

const STATUS_FR: Record<string, string> = {
  DRAFT: "Brouillon",
  QUOTED: "Devis envoyé",
  DEPOSIT_PENDING: "Acompte en attente",
  DEPOSIT_PAID: "Acompte payé",
  PROCURING: "Achat en cours",
  INTL_SHIPPING: "En transit",
  COMPLETED: "Terminé",
  CANCELLED: "Annulé",
};

export default function AdminDashboard() {
  const totalRevenue = MOCK_ORDERS.reduce((s, o) => s + o.depositMGA, 0);
  const pending = MOCK_ORDERS.filter((o) =>
    ["DEPOSIT_PENDING", "BALANCE_PENDING"].includes(o.status)
  ).length;
  const active = MOCK_ORDERS.filter((o) =>
    !["COMPLETED", "CANCELLED", "REFUNDED", "DRAFT"].includes(o.status)
  ).length;

  const stats = [
    {
      label: "Commandes totales",
      value: MOCK_ORDERS.length,
      icon: ShoppingBag,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "En cours",
      value: active,
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Paiements en attente",
      value: pending,
      icon: TrendingUp,
      color: "bg-red-50 text-red-600",
    },
    {
      label: "Acomptes encaissés",
      value: formatMGA(totalRevenue),
      icon: TrendingUp,
      color: "bg-green-50 text-green-600",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Tableau de bord</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className={`inline-flex rounded-lg p-2 ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <p className="mt-3 text-xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Dernières commandes</h2>
            <Link href="/admin/orders" className="text-xs text-amber-600 hover:underline flex items-center gap-0.5">
              Voir tout <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="divide-y divide-gray-100">
            {MOCK_ORDERS.slice(0, 4).map((o) => (
              <li key={o.id}>
                <Link
                  href={`/admin/orders/${o.id}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{o.orderNo}</p>
                    <p className="text-xs text-gray-500 truncate">{o.customer.name}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[o.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {STATUS_FR[o.status] ?? o.status}
                    </span>
                    <p className="mt-0.5 text-xs text-gray-500">{formatMGA(o.totalMGA)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Products overview */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Produits ({MOCK_PRODUCTS.length})</h2>
            <Link href="/admin/products" className="text-xs text-amber-600 hover:underline flex items-center gap-0.5">
              Gérer <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="divide-y divide-gray-100">
            {MOCK_PRODUCTS.slice(0, 5).map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {p.translations.fr.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {p.type === "AGENT" ? "Agent" : "Direct"} · {p.category.name.fr}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-amber-700">
                    {formatMGA(p.priceMGA)}
                  </p>
                  {p.stock !== undefined && (
                    <p className={`text-xs ${p.stock < 5 ? "text-red-500" : "text-gray-400"}`}>
                      Stock: {p.stock}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
