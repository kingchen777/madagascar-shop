"use client";

import { useState } from "react";
import { CheckSquare, Square, ChevronDown } from "lucide-react";

const BULK_STATUSES = [
  "DEPOSIT_PAID",
  "PROCURING",
  "PURCHASED",
  "AT_CN_WAREHOUSE",
  "INTL_SHIPPING",
  "ARRIVED_MG",
  "READY_FOR_PICKUP",
  "COMPLETED",
  "CANCELLED",
];

const STATUS_FR: Record<string, string> = {
  DEPOSIT_PAID: "Acompte payé", PROCURING: "Achat en cours", PURCHASED: "Acheté",
  AT_CN_WAREHOUSE: "Entrepôt CN", INTL_SHIPPING: "En transit", ARRIVED_MG: "Arrivé MG",
  READY_FOR_PICKUP: "À retirer", COMPLETED: "Terminé", CANCELLED: "Annulé",
};

interface Props {
  orderIds: string[];
  onDone: () => void;
}

export function BulkOrderActions({ orderIds, onDone }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (orderIds.length === 0) return null;

  async function applyStatus(status: string) {
    setLoading(true);
    setOpen(false);
    await Promise.all(
      orderIds.map((id) =>
        fetch(`/api/admin/orders/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        })
      )
    );
    setLoading(false);
    onDone();
  }

  return (
    <div className="relative flex items-center gap-2">
      <span className="text-sm text-gray-600 font-medium">
        {orderIds.length} sélectionné{orderIds.length > 1 ? "s" : ""}
      </span>
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "…" : "Changer statut"}
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-20 w-48 rounded-xl border border-gray-200 bg-white shadow-lg py-1">
          {BULK_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => applyStatus(s)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
            >
              {STATUS_FR[s]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface RowCheckboxProps {
  id: string;
  selected: Set<string>;
  onToggle: (id: string) => void;
}

export function RowCheckbox({ id, selected, onToggle }: RowCheckboxProps) {
  const checked = selected.has(id);
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(id); }}
      className="text-gray-400 hover:text-amber-600 transition-colors"
    >
      {checked ? <CheckSquare className="h-4 w-4 text-amber-500" /> : <Square className="h-4 w-4" />}
    </button>
  );
}

interface SelectAllProps {
  allIds: string[];
  selected: Set<string>;
  onToggleAll: () => void;
}

export function SelectAllCheckbox({ allIds, selected, onToggleAll }: SelectAllProps) {
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));
  return (
    <button
      onClick={onToggleAll}
      className="text-gray-400 hover:text-amber-600 transition-colors"
    >
      {allSelected ? <CheckSquare className="h-4 w-4 text-amber-500" /> : <Square className="h-4 w-4" />}
    </button>
  );
}
