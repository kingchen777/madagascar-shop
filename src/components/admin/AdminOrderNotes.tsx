"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";

interface Props {
  orderId: string;
  initialNotes: string;
}

export function AdminOrderNotes({ orderId, initialNotes }: Props) {
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: undefined, note: notes }),
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
    <div className="space-y-2">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={4}
        placeholder="Notes internes (non visibles par le client)…"
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100 resize-none"
      />
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60 transition-colors"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          Enregistrer
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
