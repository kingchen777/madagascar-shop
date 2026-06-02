import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/db";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { AdminOrderNotes } from "@/components/admin/AdminOrderNotes";
import { AdminOrderFinances } from "@/components/admin/AdminOrderFinances";
import { AdminPaymentActions } from "@/components/admin/AdminPaymentActions";

function formatMGA(n: string | number) {
  return new Intl.NumberFormat("fr-MG", { maximumFractionDigits: 0 }).format(Number(n)) + " Ar";
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-MG", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const STATUS_FR: Record<string, string> = {
  DRAFT: "Brouillon", QUOTED: "Devis envoyé", DEPOSIT_PENDING: "Acompte en attente",
  DEPOSIT_PAID: "Acompte payé", PROCURING: "Achat en cours", PURCHASED: "Acheté",
  AT_CN_WAREHOUSE: "Entrepôt CN", BALANCE_PENDING: "Solde en attente", BALANCE_PAID: "Solde payé",
  INTL_SHIPPING: "En transit", ARRIVED_MG: "Arrivé MG", READY_FOR_PICKUP: "À retirer",
  COMPLETED: "Terminé", CANCELLED: "Annulé", REFUNDED: "Remboursé",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;

  const { data: order } = await supabase
    .from("Order")
    .select(`
      id, orderNo, status, type, internalNotes, shippingInfo,
      totalAmount, depositAmount, productCost, serviceFee,
      intlShipping, customsFee, miscFee, currency,
      promoCode, discountMGA,
      createdAt, updatedAt,
      user:User(id, name, phone, email),
      items:OrderItem(id, titleSnapshot, unitPriceMGA, qty, productId)
    `)
    .or(`id.eq.${id},orderNo.eq.${id}`)
    .single();

  if (!order) notFound();

  const { data: paymentsData } = await supabase
    .from("Payment")
    .select("id, kind, provider, amount, currency, status, providerRef, proofUrl, createdAt")
    .eq("orderId", order.id)
    .order("createdAt", { ascending: false });
  const payments = paymentsData ?? [];

  const userRaw = order.user as { id: string; name: string; phone: string; email: string | null }[] | { id: string; name: string; phone: string; email: string | null } | null;
  const user = Array.isArray(userRaw) ? (userRaw[0] ?? null) : userRaw;
  const items = order.items as { id: string; titleSnapshot: string; unitPriceMGA: string; qty: number; productId: string | null }[] | null ?? [];
  const shipping = order.shippingInfo as { name?: string; phone?: string; address?: string; city?: string; paymentMethod?: string } | null;

  const totalAmount = Number(order.totalAmount ?? 0);
  const depositAmount = Number(order.depositAmount ?? 0);
  const serviceFee = Number(order.serviceFee ?? 0);
  const intlShipping = Number(order.intlShipping ?? 0);
  const customsFee = Number(order.customsFee ?? 0);
  const miscFee = Number(order.miscFee ?? 0);
  const discountMGA = Number((order as Record<string, unknown>).discountMGA ?? 0);
  const promoCode = (order as Record<string, unknown>).promoCode as string | null ?? null;
  const balanceDue = Math.max(totalAmount - depositAmount, 0);

  const paymentMethodLabel: Record<string, string> = {
    mvola: "MVola", orange_money: "Orange Money", bank_transfer: "Virement bancaire",
  };

  return (
    <div className="p-6 max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-amber-600 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Commandes
        </Link>
        <div className="flex items-center gap-3 flex-1">
          <h1 className="text-xl font-bold text-gray-900">{order.orderNo}</h1>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${order.type === "AGENT" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
            {order.type}
          </span>
          <OrderStatusSelect orderId={order.id} initialStatus={order.status} />
        </div>
        <Link
          href={`/fr/orders/${order.id}`}
          target="_blank"
          className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-amber-600 transition-colors"
        >
          Vue client <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      <p className="text-sm text-gray-400">
        Créée le {formatDate(order.createdAt)} · Mise à jour le {formatDate(order.updatedAt)}
      </p>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: items + notes */}
        <div className="lg:col-span-2 space-y-5">
          {/* Items */}
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">Articles</h2>
            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3 gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.titleSnapshot}</p>
                    <p className="text-xs text-gray-500">Qté : {item.qty} · {formatMGA(item.unitPriceMGA)} / unité</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                    {formatMGA(Number(item.unitPriceMGA) * item.qty)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Payments */}
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-3 flex items-center gap-2">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Paiements</h2>
              {payments.some((p) => p.status === "PENDING") && (
                <span className="rounded-full bg-yellow-400 px-2 py-0.5 text-xs font-bold text-white">
                  {payments.filter((p) => p.status === "PENDING").length} en attente
                </span>
              )}
            </div>
            <AdminPaymentActions payments={payments} />
          </section>

          {/* Internal notes */}
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">Notes internes</h2>
            <AdminOrderNotes orderId={order.id} initialNotes={order.internalNotes ?? ""} />
          </section>
        </div>

        {/* Right: customer + pricing + shipping */}
        <div className="space-y-5">
          {/* Customer */}
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">Client</h2>
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-gray-900">{user?.name ?? "—"}</p>
              <p className="text-gray-600">{user?.phone ?? "—"}</p>
              {user?.email && <p className="text-gray-500">{user.email}</p>}
            </div>
          </section>

          {/* Shipping */}
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">Livraison</h2>
            {shipping ? (
              <div className="space-y-1 text-sm text-gray-600">
                {shipping.name && <p className="font-medium text-gray-900">{shipping.name}</p>}
                {shipping.phone && <p>{shipping.phone}</p>}
                {shipping.address && <p>{shipping.address}</p>}
                {shipping.city && <p>{shipping.city}, Madagascar</p>}
                {shipping.paymentMethod && (
                  <p className="mt-2 text-xs font-medium text-amber-700 bg-amber-50 rounded-lg px-2 py-1 inline-block">
                    {paymentMethodLabel[shipping.paymentMethod] ?? shipping.paymentMethod}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Non renseigné</p>
            )}
          </section>

          {/* Pricing */}
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">Finances</h2>
            {order.type === "AGENT" && ["DRAFT", "QUOTED"].includes(order.status) ? (
              <AdminOrderFinances
                orderId={order.id}
                initialValues={{ totalAmount, depositAmount, serviceFee, intlShipping, customsFee }}
              />
            ) : (
              <div className="space-y-1.5 text-sm">
                <Row label="Total" value={formatMGA(totalAmount)} bold />
                <Row label="Acompte" value={formatMGA(depositAmount)} className="text-green-700" />
                {discountMGA > 0 && (
                  <Row
                    label={promoCode ? `Promo (${promoCode})` : "Réduction"}
                    value={`- ${formatMGA(discountMGA)}`}
                    className="text-green-600"
                  />
                )}
                {serviceFee > 0 && <Row label="Commission" value={formatMGA(serviceFee)} />}
                {intlShipping > 0 && <Row label="Transport intl." value={formatMGA(intlShipping)} />}
                {customsFee > 0 && <Row label="Douanes" value={formatMGA(customsFee)} />}
                {miscFee > 0 && <Row label="Divers" value={formatMGA(miscFee)} />}
                <div className="border-t pt-2">
                  <Row label="Solde restant" value={formatMGA(balanceDue)} bold className="text-amber-700" />
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold, className = "" }: { label: string; value: string; bold?: boolean; className?: string }) {
  return (
    <div className={`flex justify-between gap-2 ${bold ? "font-semibold text-gray-900" : "text-gray-600"} ${className}`}>
      <span>{label}</span>
      <span className="whitespace-nowrap">{value}</span>
    </div>
  );
}
