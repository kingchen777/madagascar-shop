import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Package, ChevronRight, Clock } from "lucide-react";
import { supabase } from "@/lib/db";

const STATUS_COLOR: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  QUOTED: "bg-blue-100 text-blue-700",
  DEPOSIT_PENDING: "bg-yellow-100 text-yellow-700",
  DEPOSIT_PAID: "bg-blue-100 text-blue-700",
  PROCURING: "bg-purple-100 text-purple-700",
  PURCHASED: "bg-purple-100 text-purple-700",
  AT_CN_WAREHOUSE: "bg-indigo-100 text-indigo-700",
  BALANCE_PENDING: "bg-orange-100 text-orange-700",
  BALANCE_PAID: "bg-blue-100 text-blue-700",
  INTL_SHIPPING: "bg-cyan-100 text-cyan-700",
  ARRIVED_MG: "bg-teal-100 text-teal-700",
  READY_FOR_PICKUP: "bg-green-100 text-green-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-600",
  REFUNDED: "bg-gray-100 text-gray-600",
};

const STATUS_FR: Record<string, string> = {
  DRAFT: "Brouillon",
  QUOTED: "Devis envoyé",
  DEPOSIT_PENDING: "Acompte en attente",
  DEPOSIT_PAID: "Acompte payé",
  PROCURING: "Achat en cours",
  PURCHASED: "Acheté",
  AT_CN_WAREHOUSE: "Entrepôt CN",
  BALANCE_PENDING: "Solde en attente",
  BALANCE_PAID: "Solde payé",
  INTL_SHIPPING: "En transit",
  ARRIVED_MG: "Arrivé MG",
  READY_FOR_PICKUP: "Prêt à retirer",
  COMPLETED: "Terminé",
  CANCELLED: "Annulé",
  REFUNDED: "Remboursé",
};

function formatMGA(n: string | number) {
  return new Intl.NumberFormat("fr-MG", { maximumFractionDigits: 0 }).format(Number(n)) + " Ar";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-MG", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function OrdersPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "order" });

  const { data: ordersData } = await supabase
    .from("Order")
    .select("id, orderNo, status, totalAmount, createdAt, items:OrderItem(titleSnapshot)")
    .order("createdAt", { ascending: false });

  const orders = ordersData ?? [];

  if (orders.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <Package className="mx-auto h-16 w-16 text-gray-300" />
        <p className="mt-4 text-lg font-medium text-gray-700">Aucune commande</p>
        <Link
          href={`/${locale}/products`}
          className="mt-6 inline-block rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
        >
          Voir les produits
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">{t("title")}</h1>

      <div className="space-y-3">
        {orders.map((order) => {
          const items = order.items as { titleSnapshot: string }[] | null ?? [];
          const firstItem = items[0];
          const extraCount = items.length - 1;

          return (
            <Link
              key={order.id}
              href={`/${locale}/orders/${order.id}`}
              className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 hover:border-amber-300 hover:shadow-sm transition-all"
            >
              {/* Status icon */}
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-amber-50">
                <Package className="h-6 w-6 text-amber-600" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-gray-900">
                    {order.orderNo}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[order.status] ?? "bg-gray-100 text-gray-600"}`}
                  >
                    {STATUS_FR[order.status] ?? order.status}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-sm text-gray-500">
                  {firstItem?.titleSnapshot ?? "—"}
                  {extraCount > 0 && (
                    <span className="text-gray-400"> +{extraCount} article{extraCount > 1 ? "s" : ""}</span>
                  )}
                </p>
                <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(order.createdAt)}
                  </span>
                  <span className="font-medium text-amber-700">
                    {formatMGA(order.totalAmount)}
                  </span>
                </div>
              </div>

              <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400" />
            </Link>
          );
        })}
      </div>
    </main>
  );
}
