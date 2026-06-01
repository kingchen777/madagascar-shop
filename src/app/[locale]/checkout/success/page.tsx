"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle, Package, ArrowRight } from "lucide-react";

function formatMGA(n: string | number) {
  return new Intl.NumberFormat("fr-MG", { maximumFractionDigits: 0 }).format(Number(n)) + " Ar";
}

const PAYMENT_LABELS: Record<string, string> = {
  mvola: "MVola",
  orange_money: "Orange Money",
  bank_transfer: "Virement bancaire",
  cash: "Paiement à la livraison",
};

function SuccessContent() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const t = useTranslations("checkout");

  const orderNo = searchParams.get("orderNo") ?? "";
  const orderId = searchParams.get("orderId") ?? "";
  const depositMGA = searchParams.get("depositMGA") ?? "0";
  const paymentMethod = searchParams.get("paymentMethod") ?? "";

  // Clear cart from localStorage after successful order
  useEffect(() => {
    try {
      localStorage.removeItem("madashop_cart");
    } catch { /* ignore */ }
  }, []);

  return (
    <main className="mx-auto max-w-lg px-4 py-16 sm:px-6 text-center">
      {/* Success icon */}
      <div className="mb-6 flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {t("success_title")}
      </h1>
      <p className="text-gray-500 mb-8">
        {t("success_subtitle")}
      </p>

      {/* Order card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-left space-y-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
            <Package className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">{t("order_number")}</p>
            <p className="text-base font-bold text-gray-900 font-mono">{orderNo || "—"}</p>
          </div>
        </div>

        <div className="border-t pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>{t("deposit_required")}</span>
            <span className="font-semibold text-amber-700">{formatMGA(depositMGA)}</span>
          </div>
          {paymentMethod && (
            <div className="flex justify-between text-gray-600">
              <span>{t("payment_method_label")}</span>
              <span className="font-medium">{PAYMENT_LABELS[paymentMethod] ?? paymentMethod}</span>
            </div>
          )}
        </div>

        <div className="rounded-xl bg-amber-50 border border-amber-100 p-4 text-sm text-amber-800">
          <p className="font-semibold mb-1">{t("next_steps_title")}</p>
          <p className="text-amber-700 text-xs leading-relaxed">
            {t("next_steps_body")}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {orderId && (
          <Link
            href={`/${locale}/orders/${orderId}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
          >
            {t("track_order")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
        <Link
          href={`/${locale}/products`}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-6 py-3 text-sm font-medium text-gray-600 hover:border-amber-400 hover:text-amber-700 transition-colors"
        >
          {t("continue_shopping")}
        </Link>
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
