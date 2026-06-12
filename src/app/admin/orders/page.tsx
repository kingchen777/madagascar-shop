import Link from "next/link";
import { Download } from "lucide-react";
import { supabase } from "@/lib/db";
import { AdminOrdersTable } from "@/components/admin/AdminOrdersTable";
import { getAdminLang } from "@/lib/getAdminLang";
import { getT } from "@/lib/adminI18n";

const FILTER_GROUPS: Record<string, string[]> = {
  DEPOSIT_PENDING: ["DEPOSIT_PENDING"],
  PROCURING: ["PROCURING", "PURCHASED", "AT_CN_WAREHOUSE"],
  INTL_SHIPPING: ["INTL_SHIPPING", "ARRIVED_MG"],
  READY_FOR_PICKUP: ["READY_FOR_PICKUP"],
  COMPLETED: ["COMPLETED"],
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const [{ status: filterStatus }, lang] = await Promise.all([
    searchParams,
    getAdminLang(),
  ]);
  const t = getT(lang);
  const to = t.orders;

  let query = supabase
    .from("Order")
    .select(`*, user:User(name, phone), items:OrderItem(titleSnapshot)`)
    .order("createdAt", { ascending: false });

  if (filterStatus && FILTER_GROUPS[filterStatus]) {
    query = query.in("status", FILTER_GROUPS[filterStatus]);
  }

  const { data: ordersData } = await query;
  const orders = ordersData ?? [];

  const groups = [
    { label: to.groups.pendingPayment, statuses: ["DEPOSIT_PENDING", "BALANCE_PENDING"], color: "bg-yellow-500" },
    { label: to.groups.inProgress, statuses: ["DEPOSIT_PAID", "PROCURING", "PURCHASED", "AT_CN_WAREHOUSE", "BALANCE_PAID", "INTL_SHIPPING", "ARRIVED_MG"], color: "bg-blue-500" },
    { label: to.groups.readyForPickup, statuses: ["READY_FOR_PICKUP"], color: "bg-green-500" },
    { label: to.groups.completed, statuses: ["COMPLETED"], color: "bg-gray-400" },
  ];

  const filterKeys = ["DEPOSIT_PENDING", "PROCURING", "INTL_SHIPPING", "READY_FOR_PICKUP", "COMPLETED"];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">{to.title} ({orders.length})</h1>
        <a
          href="/api/admin/orders/export"
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-amber-400 hover:text-amber-700 transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          {to.exportCsv}
        </a>
      </div>

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
        <Link
          href="/admin/orders"
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${!filterStatus ? "bg-gray-900 text-white" : "border border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-700"}`}
        >
          {to.all}
        </Link>
        {filterKeys.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${filterStatus === s ? "bg-gray-900 text-white" : "border border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-700"}`}
          >
            {to.status[s as keyof typeof to.status]}
          </Link>
        ))}
      </div>

      <AdminOrdersTable orders={orders} />
    </div>
  );
}
