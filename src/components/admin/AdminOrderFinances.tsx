"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";

interface Props {
  orderId: string;
  initialValues: {
    totalAmount: number;
    depositAmount: number;
    serviceFee: number;
    intlShipping: number;
    customsFee: number;
  };
}

const FIELDS = [
  { key: "totalAmount", label: "Total commande (MGA)" },
  { key: "depositAmount", label: "Acompte (MGA)" },
  { key: "serviceFee", label: "Commission service (MGA)" },
  { key: "intlShipping", label: "Transport international (MGA)" },
  { key: "customsFee", label: "Douanes (MGA)" },
] as const;

export function AdminOrderFinances({ orderId, initialValues }: Props) {
  const [values, setValues] = useState({
    totalAmount: String(initialValues.totalAmount),
    depositAmount: String(initialValues.depositAmount),
    serviceFee: String(initialValues.serviceFee),
    intlShipping: String(initialValues.intlShipping),
    customsFee: String(initialValues.customsFee),
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      {FIELDS.map(({ key, label }) => (
        <div key={key}>
          <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
          <input
            type="number"
            min={0}
            value={values[key]}
            onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
          />
        </div>
      ))}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60 transition-colors"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          Enregistrer les montants
        </button>
        {saved && (
          <span className="inline-flex items-center gap-1 text-sm text-green-600">
            <Check className="h-4 w-4" /> Sauvegardé
          </span>
        )}
      </div>
    </div>
  );
}
