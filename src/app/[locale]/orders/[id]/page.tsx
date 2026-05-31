import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, CheckCircle, Circle, Clock } from "lucide-react";
import { supabase } from "@/lib/db";

const SELF_STEPS = [
  "DRAFT",
  "DEPOSIT_PENDING",
  "DEPOSIT_PAID",
  "READY_FOR_PICKUP",
  "COMPLETED",
];

const AGENT_STEPS = [
  "DRAFT",
  "QUOTED",
  "DEPOSIT_PENDING",
  "DEPOSIT_PAID",
  "PROCURING",
  "PURCHASED",
  "AT_CN_WAREHOUSE",
  "BALANCE_PENDING",
  "BALANCE_PAID",
  "INTL_SHIPPING",
  "ARRIVED_MG",
  "READY_FOR_PICKUP",
  "COMPLETED",
];

function getStepIndex(status: string, type: string): number {
  const steps = type === "SELF" ? SELF_STEPS : AGENT_STEPS;
  const idx = steps.indexOf(status);
  return idx === -1 ? 0 : idx;
}

const STATUS_LABEL_FR: Record<string, string> = {
  DRAFT: "Brouillon",
  QUOTED: "Devis envoyé",
  DEPOSIT_PENDING: "Acompte en attente",
  DEPOSIT_PAID: "Acompte payé",
  PROCURING: "Achat en cours",
  PURCHASED: "Acheté en Chine",
  AT_CN_WAREHOUSE: "Entrepôt Chine",
  BALANCE_PENDING: "Solde en attente",
  BALANCE_PAID: "Solde payé",
  INTL_SHIPPING: "En transit",
  ARRIVED_MG: "Arrivé à Madagascar",
  READY_FOR_PICKUP: "Prêt à retirer",
  COMPLETED: "Terminé",
  CANCELLED: "Annulé",
  REFUNDED: "Remboursé",
};

function formatMGA(n: string | number) {
  return new Intl.NumberFormat("fr-MG", { maximumFractionDigits: 0 }).format(Number(n)) + " Ar";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-MG", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "order" });

  const { data: order } = await supabase
    .from("Order")
    .select(`
      id, orderNo, status, type, note,
      totalAmount, depositAmount, serviceAmount, shippingAmount, customsAmount,
      createdAt,
      items:OrderItem(id, titleSnapshot, imageSnapshot, unitPrice, qty)
    `)
    .eq("id", id)
    .single();

  if (!order) notFound();

  const steps = order.type === "SELF" ? SELF_STEPS : AGENT_STEPS;
  const currentStep = getStepIndex(order.status, order.type);
  const isCancelled = order.status === "CANCELLED" || order.status === "REFUNDED";

  const items = order.items as {
    id: string;
    titleSnapshot: string;
    imageSnapshot: string | null;
    unitPrice: string;
    qty: number;
  }[] | null ?? [];

  const totalAmount = Number(order.totalAmount ?? 0);
  const depositAmount = Number(order.depositAmount ?? 0);
  const serviceAmount = Number(order.serviceAmount ?? 0);
  const shippingAmount = Number(order.shippingAmount ?? 0);
  const customsAmount = Number(order.customsAmount ?? 0);
  const productCost = totalAmount - serviceAmount - shippingAmount - customsAmount;
  const balanceDue = Math.max(totalAmount - depositAmount, 0);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link
        href={`/${locale}/orders`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-amber-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("title")}
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-bold text-gray-900">{order.orderNo}</h1>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            {order.type === "AGENT" ? "Commande Agent" : "Achat direct"}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Passée le {formatDate(order.createdAt)}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left */}
        <div className="lg:col-span-3 space-y-5">
          {/* Status timeline */}
          {!isCancelled && (
            <section className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Suivi de commande
              </h2>
              <ol className="relative space-y-4 border-l-2 border-gray-200 pl-5">
                {steps.map((step, idx) => {
                  const done = idx < currentStep;
                  const active = idx === currentStep;
                  return (
                    <li key={step} className="relative">
                      <span
                        className={`absolute -left-[25px] flex h-4 w-4 items-center justify-center rounded-full ring-2 ring-white ${
                          done
                            ? "bg-green-500"
                            : active
                            ? "bg-amber-500"
                            : "bg-gray-200"
                        }`}
                      >
                        {done ? (
                          <CheckCircle className="h-3 w-3 text-white" />
                        ) : active ? (
                          <Clock className="h-3 w-3 text-white" />
                        ) : (
                          <Circle className="h-3 w-3 text-gray-400" />
                        )}
                      </span>
                      <p
                        className={`text-sm ${
                          done
                            ? "text-green-700 font-medium"
                            : active
                            ? "text-amber-700 font-semibold"
                            : "text-gray-400"
                        }`}
                      >
                        {STATUS_LABEL_FR[step] ?? step}
                      </p>
                    </li>
                  );
                })}
              </ol>
              {order.note && (
                <p className="mt-4 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
                  {order.note}
                </p>
              )}
            </section>
          )}

          {isCancelled && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Cette commande a été {order.status === "CANCELLED" ? "annulée" : "remboursée"}.
            </div>
          )}

          {/* Items */}
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Articles commandés
            </h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  {item.imageSnapshot && (
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      <Image
                        src={item.imageSnapshot}
                        alt={item.titleSnapshot}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {item.titleSnapshot}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatMGA(item.unitPrice)} × {item.qty}
                    </p>
                    <p className="text-sm font-semibold text-amber-700">
                      {formatMGA(Number(item.unitPrice) * item.qty)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right — price breakdown */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5 sticky top-24 space-y-2 text-sm">
            <h2 className="font-semibold text-gray-700 uppercase tracking-wide text-xs mb-3">
              Détail des frais
            </h2>

            <Row label={t("product_cost")} value={formatMGA(productCost)} />
            {serviceAmount > 0 && (
              <Row label={t("service_fee")} value={formatMGA(serviceAmount)} />
            )}
            {shippingAmount > 0 && (
              <Row label={t("intl_shipping")} value={formatMGA(shippingAmount)} />
            )}
            {customsAmount > 0 && (
              <Row label={t("customs_fee")} value={formatMGA(customsAmount)} />
            )}

            <div className="border-t pt-2">
              <Row label={t("total_amount")} value={formatMGA(totalAmount)} bold />
            </div>
            <Row
              label={t("deposit")}
              value={`- ${formatMGA(depositAmount)}`}
              className="text-green-600"
            />
            <div className="border-t pt-2">
              <Row
                label={t("balance_due")}
                value={formatMGA(balanceDue)}
                bold
                className="text-amber-700"
              />
            </div>

            {/* Action buttons based on status */}
            {order.status === "DEPOSIT_PENDING" && (
              <button className="mt-4 w-full rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 transition-colors">
                {t("pay_deposit")} — {formatMGA(depositAmount)}
              </button>
            )}
            {order.status === "BALANCE_PENDING" && (
              <button className="mt-4 w-full rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 transition-colors">
                {t("pay_balance")} — {formatMGA(balanceDue)}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function Row({
  label,
  value,
  bold,
  className = "",
}: {
  label: string;
  value: string;
  bold?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex justify-between gap-2 ${bold ? "font-semibold text-gray-900" : "text-gray-600"} ${className}`}>
      <span>{label}</span>
      <span className="whitespace-nowrap">{value}</span>
    </div>
  );
}
