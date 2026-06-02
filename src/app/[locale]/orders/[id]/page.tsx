import { notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, CheckCircle, Circle, Clock } from "lucide-react";
import { supabase } from "@/lib/db";
import PaymentSubmitForm from "@/components/PaymentSubmitForm";

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
  const tStatus = await getTranslations({ locale, namespace: "status" });

  const [{ data: order }, { data: settingsRows }] = await Promise.all([
    supabase
      .from("Order")
      .select(`
        id, orderNo, status, type, internalNotes,
        totalAmount, depositAmount, serviceFee, intlShipping, customsFee,
        promoCode, discountMGA,
        createdAt,
        items:OrderItem(id, titleSnapshot, unitPriceMGA, qty)
      `)
      .or(`id.eq.${id},orderNo.eq.${id}`)
      .single(),
    supabase
      .from("Setting")
      .select("key, value")
      .in("key", ["mvola_phone", "orange_money_phone"]),
  ]);

  if (!order) notFound();

  const settingsMap: Record<string, string> = {};
  for (const row of settingsRows ?? []) settingsMap[row.key] = row.value;
  const mvolaPhone = settingsMap["mvola_phone"] ?? "";
  const orangeMoneyPhone = settingsMap["orange_money_phone"] ?? "";

  const steps = order.type === "SELF" ? SELF_STEPS : AGENT_STEPS;
  const currentStep = getStepIndex(order.status, order.type);
  const isCancelled = order.status === "CANCELLED" || order.status === "REFUNDED";

  const items = order.items as {
    id: string;
    titleSnapshot: string;
    unitPriceMGA: string;
    qty: number;
  }[] | null ?? [];

  const totalAmount = Number(order.totalAmount ?? 0);
  const depositAmount = Number(order.depositAmount ?? 0);
  const serviceAmount = Number(order.serviceFee ?? 0);
  const shippingAmount = Number(order.intlShipping ?? 0);
  const customsAmount = Number(order.customsFee ?? 0);
  const discountAmount = Number((order as Record<string, unknown>).discountMGA ?? 0);
  const promoCodeApplied = (order as Record<string, unknown>).promoCode as string | null ?? null;
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
            {order.type === "AGENT" ? t("type_agent") : t("type_self")}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {t("placed_on")} {formatDate(order.createdAt)}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left */}
        <div className="lg:col-span-3 space-y-5">
          {/* Status timeline */}
          {!isCancelled && (
            <section className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                {t("tracking_section")}
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
                        {tStatus(step as Parameters<typeof tStatus>[0])}
                      </p>
                    </li>
                  );
                })}
              </ol>
              {order.internalNotes && (
                <p className="mt-4 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
                  {order.internalNotes}
                </p>
              )}
            </section>
          )}

          {isCancelled && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {order.status === "CANCELLED" ? t("cancelled_msg") : t("refunded_msg")}
            </div>
          )}

          {/* Items */}
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">
              {t("items_section")}
            </h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {item.titleSnapshot}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatMGA(item.unitPriceMGA)} × {item.qty}
                    </p>
                    <p className="text-sm font-semibold text-amber-700">
                      {formatMGA(Number(item.unitPriceMGA) * item.qty)}
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
              {t("fees_section")}
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
            {discountAmount > 0 && (
              <Row
                label={promoCodeApplied ? `Code promo (${promoCodeApplied})` : "Réduction"}
                value={`- ${formatMGA(discountAmount)}`}
                className="text-green-600"
              />
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

            {/* Payment instructions + form */}
            {(order.status === "DEPOSIT_PENDING" || order.status === "BALANCE_PENDING") && (
              <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-4 space-y-2 text-sm">
                <p className="font-semibold text-amber-800">
                  {order.status === "DEPOSIT_PENDING"
                    ? `${t("pay_deposit")} : ${formatMGA(depositAmount)}`
                    : `${t("pay_balance")} : ${formatMGA(balanceDue)}`}
                </p>
                <p className="text-amber-700 text-xs leading-relaxed">
                  {t("payment_send", {
                    mvola: mvolaPhone ? ` (${mvolaPhone})` : "",
                    orange: orangeMoneyPhone ? ` (${orangeMoneyPhone})` : "",
                  })}
                </p>
                <PaymentSubmitForm
                  orderId={order.id}
                  orderNo={order.orderNo}
                  kind={order.status === "DEPOSIT_PENDING" ? "DEPOSIT" : "BALANCE"}
                  amount={order.status === "DEPOSIT_PENDING" ? depositAmount : balanceDue}
                  mvolaPhone={mvolaPhone}
                  orangeMoneyPhone={orangeMoneyPhone}
                />
              </div>
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
