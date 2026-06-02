"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle, Loader2 } from "lucide-react";

type Provider = "MVOLA" | "ORANGE_MONEY" | "AIRTEL_MONEY" | "BANK_TRANSFER";

interface Props {
  orderId: string;
  orderNo: string;
  kind: "DEPOSIT" | "BALANCE";
  amount: number;
  mvolaPhone?: string;
  orangeMoneyPhone?: string;
}

export default function PaymentSubmitForm({
  orderId,
  orderNo,
  kind,
  amount,
  mvolaPhone,
  orangeMoneyPhone,
}: Props) {
  const t = useTranslations("order");
  const [provider, setProvider] = useState<Provider>("MVOLA");
  const [providerRef, setProviderRef] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const providerOptions: { value: Provider; label: string; phone?: string }[] = [
    { value: "MVOLA", label: "MVola", phone: mvolaPhone },
    { value: "ORANGE_MONEY", label: "Orange Money", phone: orangeMoneyPhone },
    { value: "AIRTEL_MONEY", label: "Airtel Money" },
    { value: "BANK_TRANSFER", label: "Virement bancaire / Bank Transfer" },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          kind,
          provider,
          amount,
          providerRef: providerRef.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Request failed");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("payment_error"));
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mt-4 flex items-start gap-3 rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-800">
        <CheckCircle className="h-5 w-5 mt-0.5 shrink-0 text-green-600" />
        <p>{t("payment_submitted")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      {/* Provider select */}
      <div>
        <label className="block text-xs font-medium text-amber-800 mb-1">
          {t("choose_provider")}
        </label>
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value as Provider)}
          className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          {providerOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}{opt.phone ? ` — ${opt.phone}` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Optional provider ref */}
      <div>
        <label className="block text-xs font-medium text-amber-800 mb-1">
          {t("provider_ref")}
        </label>
        <input
          type="text"
          value={providerRef}
          onChange={(e) => setProviderRef(e.target.value)}
          placeholder={t("provider_ref_placeholder")}
          className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      {/* Order ref reminder */}
      <p className="text-xs text-amber-700 font-mono">
        {t("ref_label")} {orderNo}
      </p>

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60 transition-colors"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("submitting")}
          </>
        ) : (
          t("submit_payment")
        )}
      </button>
    </form>
  );
}
