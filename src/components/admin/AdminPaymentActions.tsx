"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Payment {
  id: string;
  kind: string;
  provider: string;
  amount: string;
  currency: string;
  status: string;
  providerRef: string | null;
  proofUrl: string | null;
  createdAt: string;
}

const KIND_FR: Record<string, string> = {
  DEPOSIT: "Acompte",
  BALANCE: "Solde",
  FULL: "Paiement complet",
};

const PROVIDER_FR: Record<string, string> = {
  MVOLA: "MVola",
  ORANGE_MONEY: "Orange Money",
  AIRTEL_MONEY: "Airtel Money",
  BANK_TRANSFER: "Virement bancaire",
  STRIPE: "Stripe",
  PAYPAL: "PayPal",
  CASH: "Espèces",
};

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  PAID: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-600",
  REFUNDED: "bg-gray-100 text-gray-600",
};

const STATUS_FR: Record<string, string> = {
  PENDING: "En attente",
  PAID: "Confirmé",
  FAILED: "Rejeté",
  REFUNDED: "Remboursé",
};

function formatMGA(n: string | number) {
  return new Intl.NumberFormat("fr-MG", { maximumFractionDigits: 0 }).format(Number(n)) + " Ar";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("fr-MG", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

interface Props {
  payments: Payment[];
}

export function AdminPaymentActions({ payments }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<Record<string, string>>(
    Object.fromEntries(payments.map((p) => [p.id, p.status]))
  );

  async function updateStatus(paymentId: string, newStatus: "PAID" | "FAILED") {
    setLoading(paymentId);
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setStatuses((prev) => ({ ...prev, [paymentId]: newStatus }));
        // Refresh to update order status badge
        router.refresh();
      }
    } catch {
      // silent
    } finally {
      setLoading(null);
    }
  }

  if (payments.length === 0) {
    return <p className="text-sm text-gray-400">Aucun paiement soumis</p>;
  }

  return (
    <div className="space-y-3">
      {payments.map((p) => {
        const status = statuses[p.id];
        const isPending = status === "PENDING";
        return (
          <div
            key={p.id}
            className={`rounded-xl border p-4 space-y-2 ${isPending ? "border-yellow-200 bg-yellow-50" : "border-gray-100 bg-gray-50"}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-gray-900">
                  {KIND_FR[p.kind] ?? p.kind} — {PROVIDER_FR[p.provider] ?? p.provider}
                </p>
                <p className="text-base font-bold text-amber-700">{formatMGA(p.amount)}</p>
                {p.providerRef && (
                  <p className="text-xs text-gray-500 font-mono">Réf : {p.providerRef}</p>
                )}
                <p className="text-xs text-gray-400">{formatDate(p.createdAt)}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[status] ?? "bg-gray-100 text-gray-600"}`}>
                {STATUS_FR[status] ?? status}
              </span>
            </div>

            {p.proofUrl && (
              <a
                href={p.proofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-amber-600 hover:underline"
              >
                Voir le justificatif →
              </a>
            )}

            {isPending && (
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => updateStatus(p.id, "PAID")}
                  disabled={loading === p.id}
                  className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-60 transition-colors"
                >
                  {loading === p.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <CheckCircle className="h-3 w-3" />
                  )}
                  Confirmer
                </button>
                <button
                  onClick={() => updateStatus(p.id, "FAILED")}
                  disabled={loading === p.id}
                  className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60 transition-colors"
                >
                  <XCircle className="h-3 w-3" />
                  Rejeter
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
