"use client";

import { useState } from "react";
import { Tag, CheckCircle, XCircle } from "lucide-react";
import { formatMGA } from "@/lib/pricing";

interface PromoResult {
  valid: true;
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  discountMGA: number;
  description: string | null;
}

interface Props {
  orderTotalMGA: number;
  onApply: (discount: number, code: string) => void;
  onRemove: () => void;
  locale: string;
}

const LABELS: Record<string, Record<string, string>> = {
  fr: { placeholder: "Code promo", apply: "Appliquer", remove: "Retirer", saving: "Économie :", invalid: "Code invalide ou expiré" },
  en: { placeholder: "Promo code", apply: "Apply", remove: "Remove", saving: "Saving:", invalid: "Invalid or expired code" },
  zh: { placeholder: "优惠码", apply: "应用", remove: "移除", saving: "节省：", invalid: "无效或已过期的优惠码" },
};

export function PromoCodeInput({ orderTotalMGA, onApply, onRemove, locale }: Props) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState<PromoResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lbl = LABELS[locale] ?? LABELS.fr;

  async function handleApply() {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: input.trim(), orderTotalMGA }),
      });
      const data: unknown = await res.json();
      if (res.ok && typeof data === "object" && data !== null && "valid" in data) {
        const promo = data as PromoResult;
        setApplied(promo);
        onApply(promo.discountMGA, promo.code);
      } else {
        const msg = typeof data === "object" && data !== null && "error" in data
          ? String((data as { error: string }).error)
          : lbl.invalid;
        setError(msg);
      }
    } catch {
      setError(lbl.invalid);
    } finally {
      setLoading(false);
    }
  }

  function handleRemove() {
    setApplied(null);
    setInput("");
    setError(null);
    onRemove();
  }

  if (applied) {
    return (
      <div className="flex items-center justify-between rounded-xl bg-green-50 border border-green-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-800">{applied.code}</p>
            {applied.description && <p className="text-xs text-green-600">{applied.description}</p>}
            <p className="text-xs text-green-700">{lbl.saving} -{formatMGA(applied.discountMGA)}</p>
          </div>
        </div>
        <button
          onClick={handleRemove}
          className="text-gray-400 hover:text-red-500 transition-colors ml-4"
          aria-label="Retirer le code promo"
        >
          <XCircle className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value.toUpperCase()); setError(null); }}
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
            placeholder={lbl.placeholder}
            maxLength={50}
            className="w-full rounded-xl border border-gray-300 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 uppercase"
          />
        </div>
        <button
          onClick={handleApply}
          disabled={loading || !input.trim()}
          className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          {lbl.apply}
        </button>
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-500">
          <XCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}
