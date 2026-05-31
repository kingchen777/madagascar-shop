"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";

function formatMGA(amount: number) {
  return new Intl.NumberFormat("fr-MG", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(amount) + " Ar";
}

const DEPOSIT_PCT = 0.3; // 30% deposit

type PaymentMethod = "mvola" | "orange_money" | "bank_transfer";

interface AddressForm {
  name: string;
  phone: string;
  address: string;
  city: string;
}

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  const tPay = useTranslations("payment");
  const locale = useLocale();
  const router = useRouter();
  const { items, totalMGA, clear } = useCart();

  const [form, setForm] = useState<AddressForm>({
    name: "",
    phone: "",
    address: "",
    city: "Antananarivo",
  });
  const [payment, setPayment] = useState<PaymentMethod>("mvola");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [orderNo, setOrderNo] = useState("");
  const [depositMGA, setDepositMGA] = useState(0);
  const [errors, setErrors] = useState<Partial<AddressForm>>({});

  if (items.length === 0 && !done) {
    return (
      <main className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
        <p className="text-gray-500">Votre panier est vide.</p>
        <Link href={`/${locale}/products`}>
          <Button className="mt-4 bg-amber-500 hover:bg-amber-600 text-white">
            Voir les produits
          </Button>
        </Link>
      </main>
    );
  }

  if (done) {
    return (
      <main className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Commande confirmée !
        </h1>
        {orderNo && (
          <p className="mt-2 text-sm font-mono font-semibold text-amber-700 bg-amber-50 rounded-lg px-4 py-2 inline-block">
            {orderNo}
          </p>
        )}
        <p className="mt-3 text-gray-600">
          Nous vous contacterons sous 24h pour confirmer le paiement.
        </p>
        <p className="mt-1 text-sm text-gray-400">
          Acompte requis : {formatMGA(depositMGA || Math.ceil(totalMGA * DEPOSIT_PCT))}
        </p>
        <Link href={`/${locale}/orders`}>
          <Button className="mt-6 bg-amber-500 hover:bg-amber-600 text-white">
            Voir mes commandes
          </Button>
        </Link>
      </main>
    );
  }

  function validate(): boolean {
    const newErrors: Partial<AddressForm> = {};
    if (!form.name.trim()) newErrors.name = "Requis";
    if (!form.phone.trim()) newErrors.phone = "Requis";
    if (!form.address.trim()) newErrors.address = "Requis";
    if (!form.city.trim()) newErrors.city = "Requis";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shippingAddress: form,
          paymentMethod: payment,
          locale,
        }),
      });
      const data = await res.json() as { orderNo?: string; depositMGA?: number };
      if (data.orderNo) setOrderNo(data.orderNo);
      if (data.depositMGA) setDepositMGA(data.depositMGA);
    } catch {
      // Continue to success screen even if API fails (offline mode)
    }
    // Store phone so orders page can pre-fill the lookup
    try { localStorage.setItem("madashop_last_phone", form.phone); } catch { /* ignore */ }
    clear();
    setSubmitting(false);
    setDone(true);
  }

  const deposit = Math.ceil(totalMGA * DEPOSIT_PCT);

  const paymentOptions: { value: PaymentMethod; label: string; number?: string }[] = [
    { value: "mvola", label: tPay("mvola"), number: "034 XX XX XX" },
    { value: "orange_money", label: tPay("orange_money"), number: "032 XX XX XX" },
    { value: "bank_transfer", label: tPay("bank_transfer") },
  ];

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link
        href={`/${locale}/cart`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-amber-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au panier
      </Link>

      <h1 className="mb-8 text-2xl font-bold text-gray-900">{t("title")}</h1>

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-5">
        {/* Left column */}
        <div className="lg:col-span-3 space-y-6">
          {/* Shipping address */}
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 text-base font-semibold text-gray-900">
              {t("shipping_address")}
            </h2>
            <div className="space-y-4">
              {(
                [
                  { key: "name", label: "Nom complet", type: "text", placeholder: "Jean Rakoto" },
                  { key: "phone", label: "Téléphone", type: "tel", placeholder: "034 XX XX XX" },
                  { key: "address", label: "Adresse", type: "text", placeholder: "Lot II J 123, Ankorondrano" },
                  { key: "city", label: "Ville", type: "text", placeholder: "Antananarivo" },
                ] as const
              ).map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                  </label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [key]: e.target.value }))
                    }
                    placeholder={placeholder}
                    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-amber-400 focus:ring-2 focus:ring-amber-100 ${
                      errors[key] ? "border-red-400" : "border-gray-300"
                    }`}
                  />
                  {errors[key] && (
                    <p className="mt-1 text-xs text-red-500">{errors[key]}</p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Payment method */}
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 text-base font-semibold text-gray-900">
              {t("payment_method")}
            </h2>
            <div className="space-y-2">
              {paymentOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                    payment === opt.value
                      ? "border-amber-400 bg-amber-50"
                      : "border-gray-200 hover:border-amber-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={opt.value}
                    checked={payment === opt.value}
                    onChange={() => setPayment(opt.value)}
                    className="accent-amber-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-800">
                      {opt.label}
                    </span>
                    {opt.number && (
                      <span className="ml-2 text-xs text-gray-500">
                        {opt.number}
                      </span>
                    )}
                  </div>
                </label>
              ))}
            </div>
            <p className="mt-3 text-xs text-gray-400">
              {t("deposit_note", { pct: "30" })}
            </p>
          </section>
        </div>

        {/* Right column — order summary */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5 sticky top-24">
            <h2 className="mb-4 text-base font-semibold text-gray-900">
              {t("order_summary")}
            </h2>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between gap-2">
                  <span className="truncate">
                    {item.name} ×{item.qty}
                  </span>
                  <span className="font-medium whitespace-nowrap">
                    {formatMGA(item.priceMGA * item.qty)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 space-y-1 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total</span>
                <span>{formatMGA(totalMGA)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Livraison</span>
                <span className="text-green-600">À confirmer</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t">
                <span>Total</span>
                <span className="text-amber-700">{formatMGA(totalMGA)}</span>
              </div>
              <div className="flex justify-between text-amber-700 font-semibold text-sm pt-1">
                <span>Acompte (30%)</span>
                <span>{formatMGA(deposit)}</span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="mt-5 w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold h-11 disabled:opacity-60"
            >
              {submitting ? "Traitement…" : t("place_order")}
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
}
