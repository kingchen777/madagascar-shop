"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Package, ChevronRight, Clock, Search } from "lucide-react";
import { useAuth } from "@/lib/auth/useAuth";

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

function formatMGA(n: string | number) {
  return new Intl.NumberFormat("fr-MG", { maximumFractionDigits: 0 }).format(Number(n)) + " Ar";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-MG", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

interface Order {
  id: string;
  orderNo: string;
  status: string;
  totalAmount: string;
  createdAt: string;
  items: { titleSnapshot: string }[] | null;
}

export default function OrdersPage() {
  const locale = useLocale();
  const t = useTranslations("order");
  const tStatus = useTranslations("status");
  const tProduct = useTranslations("product");
  const { user, loading: authLoading } = useAuth();

  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  // Auto-load orders for authenticated users
  useEffect(() => {
    if (authLoading || !user) return;
    setLoading(true);
    fetch("/api/user/orders")
      .then((r) => r.json())
      .then((data) => { setOrders(Array.isArray(data) ? data as Order[] : []); setSearched(true); })
      .catch(() => setError(t("error_server")))
      .finally(() => setLoading(false));
  }, [user, authLoading, t]);

  useEffect(() => {
    if (user) return; // skip phone restore for auth users
    try {
      const saved = localStorage.getItem("madashop_last_phone");
      if (saved) setPhone(saved);
    } catch { /* ignore */ }
  }, [user]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setError("");
    setSearched(false);
    try {
      const res = await fetch(`/api/orders?phone=${encodeURIComponent(phone.trim())}`);
      if (!res.ok) { setError(t("error_search")); return; }
      setOrders(await res.json() as Order[]);
      setSearched(true);
    } catch {
      setError(t("error_server"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">{t("tracking_title")}</h1>

      <form onSubmit={handleSearch} className={`mb-8 flex gap-2 ${user ? "hidden" : ""}`}>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t("phone_placeholder")}
          className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
        />
        <button
          type="submit"
          disabled={loading || !phone.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60 transition-colors"
        >
          <Search className="h-4 w-4" />
          {loading ? "…" : t("search")}
        </button>
      </form>

      {error && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {searched && orders !== null && orders.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-3 text-gray-500">{t("no_orders")}</p>
          <Link
            href={`/${locale}/products`}
            className="mt-4 inline-block rounded-xl bg-amber-500 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
          >
            {tProduct("all_filter")}
          </Link>
        </div>
      )}

      {orders && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((order) => {
            const items = order.items ?? [];
            const firstItem = items[0];
            const extraCount = items.length - 1;
            return (
              <Link
                key={order.id}
                href={`/${locale}/orders/${order.id}`}
                className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 hover:border-amber-300 hover:shadow-sm transition-all"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-amber-50">
                  <Package className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900">{order.orderNo}</span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {tStatus(order.status as Parameters<typeof tStatus>[0])}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-gray-500">
                    {firstItem?.titleSnapshot ?? "—"}
                    {extraCount > 0 && (
                      <span className="text-gray-400"> {t("more_items", { count: extraCount })}</span>
                    )}
                  </p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(order.createdAt)}
                    </span>
                    <span className="font-medium text-amber-700">{formatMGA(order.totalAmount)}</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400" />
              </Link>
            );
          })}
        </div>
      )}

      {!searched && !user && (
        <p className="text-center text-sm text-gray-400">{t("enter_phone")}</p>
      )}
    </main>
  );
}
