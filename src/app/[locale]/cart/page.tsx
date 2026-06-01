"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";

function formatMGA(amount: number) {
  return new Intl.NumberFormat("fr-MG", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(amount) + " Ar";
}

export default function CartPage() {
  const t = useTranslations("cart");
  const locale = useLocale();
  const { items, totalMGA, removeItem, setQty, clear } = useCart();

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <ShoppingBag className="mx-auto h-16 w-16 text-gray-300" />
        <p className="mt-4 text-lg font-medium text-gray-700">{t("empty")}</p>
        <Link href={`/${locale}/products`}>
          <Button className="mt-6 bg-amber-500 hover:bg-amber-600 text-white">
            {t("continue_shopping")}
          </Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <button
          onClick={clear}
          className="text-sm text-red-500 hover:text-red-700 transition-colors"
        >
          {t("clear_all")}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Item list */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4"
            >
              {item.image && (
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              )}

              <div className="flex flex-1 flex-col gap-2">
                <p className="text-sm font-medium text-gray-900 leading-snug">
                  {item.name}
                </p>
                <p className="text-sm font-semibold text-amber-700">
                  {formatMGA(item.priceMGA)}
                </p>

                <div className="flex items-center justify-between">
                  {/* Qty controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQty(item.id, item.qty - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                      aria-label="Diminuer"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => setQty(item.id, item.qty + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                      aria-label="Augmenter"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    aria-label={t("remove")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Line total */}
              <div className="hidden sm:flex items-center text-sm font-semibold text-gray-700 whitespace-nowrap">
                {formatMGA(item.priceMGA * item.qty)}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-gray-200 bg-white p-5 sticky top-24">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              {t("subtotal")}
            </h2>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span className="truncate max-w-[140px]">
                    {item.name} ×{item.qty}
                  </span>
                  <span className="font-medium">
                    {formatMGA(item.priceMGA * item.qty)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 flex justify-between font-bold text-gray-900">
              <span>{t("total")}</span>
              <span className="text-amber-700">{formatMGA(totalMGA)}</span>
            </div>

            <p className="mt-2 text-xs text-gray-400">
              {t("shipping_note")}
            </p>

            <Link href={`/${locale}/checkout`} className="block mt-4">
              <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold h-11">
                {t("checkout")}
              </Button>
            </Link>

            <Link href={`/${locale}/products`} className="block mt-2">
              <Button variant="ghost" className="w-full text-sm text-gray-500">
                {t("continue_shopping")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
