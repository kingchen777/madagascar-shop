import Link from "next/link";
import { ShoppingBag, Package, TrendingUp, Clock, ChevronRight, CreditCard } from "lucide-react";
import { supabase } from "@/lib/db";
import { getAdminLang } from "@/lib/getAdminLang";
import { getT } from "@/lib/adminI18n";

function formatMGA(n: string | number) {
  return new Intl.NumberFormat("fr-MG", { maximumFractionDigits: 0 }).format(Number(n)) + " Ar";
}

const STATUS_BADGE: Record<string, string> = {
  DEPOSIT_PENDING: "bg-yellow-100 text-yellow-700",
  PROCURING: "bg-purple-100 text-purple-700",
  INTL_SHIPPING: "bg-cyan-100 text-cyan-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-600",
};

export default async function AdminDashboard() {
  const lang = await getAdminLang();
  const t = getT(lang);
  const td = t.dashboard;

  const [{ data: ordersData }, { data: pendingPaymentsData }] = await Promise.all([
    supabase
      .from("Order")
      .select("id, orderNo, status, totalAmount, depositAmount, createdAt, user:User(name)")
      .order("createdAt", { ascending: false }),
    supabase
      .from("Payment")
      .select("id, kind, amount, orderId, createdAt, order:Order(orderNo)")
      .eq("status", "PENDING")
      .order("createdAt", { ascending: false })
      .limit(5),
  ]);
  const orders = ordersData ?? [];
  const pendingPayments = pendingPaymentsData ?? [];

  const { data: productsData } = await supabase
    .from("Product")
    .select("id, slug, type, priceMGA, stock, translations:ProductTranslation(locale, name)")
    .order("createdAt", { ascending: false })
    .limit(5);
  const products = productsData ?? [];

  const { count: productCount } = await supabase
    .from("Product")
    .select("id", { count: "exact", head: true });

  const totalDeposit = orders.reduce((s, o) => s + Number(o.depositAmount ?? 0), 0);
  const pending = orders.filter((o) =>
    ["DEPOSIT_PENDING", "BALANCE_PENDING"].includes(o.status)
  ).length;
  const active = orders.filter((o) =>
    !["COMPLETED", "CANCELLED", "REFUNDED", "DRAFT"].includes(o.status)
  ).length;

  const stats = [
    { label: td.totalOrders, value: orders.length, icon: ShoppingBag, color: "bg-blue-50 text-blue-600" },
    { label: td.inProgress, value: active, icon: Clock, color: "bg-amber-50 text-amber-600" },
    { label: td.pendingPayments, value: pending, icon: CreditCard, color: "bg-red-50 text-red-600" },
    { label: td.depositsCollected, value: formatMGA(totalDeposit), icon: TrendingUp, color: "bg-green-50 text-green-600" },
  ];

  const kindLabel: Record<string, string> = {
    DEPOSIT: td.deposit,
    BALANCE: td.balance,
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold text-gray-900">{td.title}</h1>

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
            <h2 className="text-sm font-semibold text-gray-900">{td.recentOrders}</h2>
            <Link href="/admin/orders" className="text-xs text-amber-600 hover:underline flex items-center gap-0.5">
              {td.viewAll} <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="divide-y divide-gray-100">
            {orders.slice(0, 4).map((o) => (
              <li key={o.id}>
                <Link
                  href={`/admin/orders/${o.id}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{o.orderNo}</p>
                    <p className="text-xs text-gray-500 truncate">{(o.user as { name?: string } | null)?.name ?? "—"}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[o.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {t.orders.status[o.status as keyof typeof t.orders.status] ?? o.status}
                    </span>
                    <p className="mt-0.5 text-xs text-gray-500">{formatMGA(o.totalAmount)}</p>
                  </div>
                </Link>
              </li>
            ))}
            {orders.length === 0 && (
              <li className="px-5 py-6 text-center text-sm text-gray-400">{td.noOrders}</li>
            )}
          </ul>
        </div>

        {/* Pending payments */}
        {pendingPayments.length > 0 && (
          <div className="rounded-xl border border-yellow-200 bg-white lg:col-span-2">
            <div className="flex items-center justify-between px-5 py-4 border-b border-yellow-100 bg-yellow-50 rounded-t-xl">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-yellow-600" />
                <h2 className="text-sm font-semibold text-yellow-900">{td.pendingConfirmation}</h2>
              </div>
              <span className="rounded-full bg-yellow-400 px-2 py-0.5 text-xs font-bold text-white">
                {pendingPayments.length}
              </span>
            </div>
            <ul className="divide-y divide-gray-100">
              {pendingPayments.map((p) => {
                const orderRaw = p.order as { orderNo?: string } | { orderNo?: string }[] | null;
                const orderNo = Array.isArray(orderRaw) ? (orderRaw[0]?.orderNo ?? "—") : (orderRaw?.orderNo ?? "—");
                return (
                  <li key={p.id}>
                    <Link
                      href={`/admin/orders/${p.orderId}`}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-amber-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{orderNo}</p>
                        <p className="text-xs text-gray-500">
                          {kindLabel[p.kind] ?? td.fullPayment}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-amber-700">{formatMGA(p.amount)}</p>
                        <ChevronRight className="h-4 w-4 text-gray-300 ml-auto mt-0.5" />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Products overview */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">{t.nav.products} ({productCount ?? 0})</h2>
            <Link href="/admin/products" className="text-xs text-amber-600 hover:underline flex items-center gap-0.5">
              {td.manage} <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="divide-y divide-gray-100">
            {products.map((p) => {
              const trans = (p.translations as { locale: string; name: string }[] | null) ?? [];
              const name = trans.find((x) => x.locale === lang)?.name
                ?? trans.find((x) => x.locale === "fr")?.name
                ?? p.slug;
              return (
                <li key={p.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                    <p className="text-xs text-gray-500">
                      {p.type === "AGENT" ? td.agent : td.direct}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-amber-700">{formatMGA(p.priceMGA)}</p>
                    {p.stock != null && (
                      <p className={`text-xs ${p.stock < 5 ? "text-red-500" : "text-gray-400"}`}>
                        Stock: {p.stock}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
            {products.length === 0 && (
              <li className="px-5 py-6 text-center text-sm text-gray-400">
                <Package className="mx-auto h-8 w-8 text-gray-200 mb-2" />
                {td.noProducts}
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
