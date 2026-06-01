"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send, Loader2, Link as LinkIcon } from "lucide-react";
import type { Locale as MockLocale } from "@/components/product/ProductCard";

interface Props {
  locale: MockLocale;
  prefillUrl?: string;
}

const LABELS: Record<MockLocale, {
  url: string; urlPlaceholder: string;
  name: string; namePlaceholder: string;
  spec: string; specPlaceholder: string;
  qty: string;
  notes: string; notesPlaceholder: string;
  contact: string; contactPlaceholder: string;
  submit: string; submitting: string;
  success: string; error: string;
}> = {
  fr: {
    url: "Lien du produit (Taobao, 1688, Pinduoduo...)",
    urlPlaceholder: "https://item.taobao.com/item.htm?id=...",
    name: "Nom du produit (facultatif)",
    namePlaceholder: "Ex: Robe d'été bleue taille M",
    spec: "Spécifications (couleur, taille...)",
    specPlaceholder: "Ex: Couleur rouge, taille L",
    qty: "Quantité",
    notes: "Notes supplémentaires",
    notesPlaceholder: "Toute information utile pour votre commande...",
    contact: "Votre téléphone / WhatsApp",
    contactPlaceholder: "+261 XX XXX XXXX",
    submit: "Envoyer ma demande",
    submitting: "Envoi en cours...",
    success: "Demande envoyée ! Nous vous contactons sous 24h.",
    error: "Erreur lors de l'envoi. Réessayez.",
  },
  en: {
    url: "Product link (Taobao, 1688, Pinduoduo...)",
    urlPlaceholder: "https://item.taobao.com/item.htm?id=...",
    name: "Product name (optional)",
    namePlaceholder: "e.g. Blue summer dress size M",
    spec: "Specifications (color, size...)",
    specPlaceholder: "e.g. Red color, size L",
    qty: "Quantity",
    notes: "Additional notes",
    notesPlaceholder: "Any useful information for your order...",
    contact: "Your phone / WhatsApp",
    contactPlaceholder: "+261 XX XXX XXXX",
    submit: "Send my request",
    submitting: "Sending...",
    success: "Request sent! We will contact you within 24h.",
    error: "Error sending. Please try again.",
  },
  zh: {
    url: "商品链接（淘宝、1688、拼多多等）",
    urlPlaceholder: "https://item.taobao.com/item.htm?id=...",
    name: "商品名称（选填）",
    namePlaceholder: "例如：蓝色夏季连衣裙 M码",
    spec: "规格（颜色、尺码等）",
    specPlaceholder: "例如：红色，L码",
    qty: "数量",
    notes: "备注",
    notesPlaceholder: "其他需要说明的信息...",
    contact: "您的手机号 / WhatsApp",
    contactPlaceholder: "+261 XX XXX XXXX",
    submit: "提交询价",
    submitting: "提交中...",
    success: "询价已提交！我们将在24小时内联系您。",
    error: "提交失败，请重试。",
  },
};

export function AgentOrderForm({ locale, prefillUrl }: Props) {
  const L = LABELS[locale];
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    url: prefillUrl ?? "",
    name: "",
    spec: "",
    qty: "1",
    notes: "",
    contact: "",
  });

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.url.trim() || !form.contact.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/agent-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, qty: Number(form.qty), locale }),
      });
      const data = await res.json() as { inquiryNo?: string };
      const msg = data.inquiryNo ? `${L.success} (${data.inquiryNo})` : L.success;
      toast.success(msg, { duration: 6000 });
      setForm({ url: "", name: "", spec: "", qty: "1", notes: "", contact: "" });
    } catch {
      toast.error(L.error);
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* URL */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-gray-700">
          {L.url} <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="url"
            required
            value={form.url}
            onChange={(e) => update("url", e.target.value)}
            placeholder={L.urlPlaceholder}
            className={inputClass + " pl-10"}
          />
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-gray-700">
          {L.name}
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder={L.namePlaceholder}
          className={inputClass}
        />
      </div>

      {/* Spec + Qty in a row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="mb-1.5 block text-xs font-semibold text-gray-700">
            {L.spec}
          </label>
          <input
            type="text"
            value={form.spec}
            onChange={(e) => update("spec", e.target.value)}
            placeholder={L.specPlaceholder}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-700">
            {L.qty}
          </label>
          <input
            type="number"
            min="1"
            max="999"
            value={form.qty}
            onChange={(e) => update("qty", e.target.value)}
            className={inputClass + " text-center"}
          />
        </div>
      </div>

      {/* Contact */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-gray-700">
          {L.contact} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={form.contact}
          onChange={(e) => update("contact", e.target.value)}
          placeholder={L.contactPlaceholder}
          className={inputClass}
        />
      </div>

      {/* Notes */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-gray-700">
          {L.notes}
        </label>
        <textarea
          rows={3}
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder={L.notesPlaceholder}
          className={inputClass + " resize-none"}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !form.url || !form.contact}
        className="mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 text-white font-semibold hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {L.submitting}
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            {L.submit}
          </>
        )}
      </button>
    </form>
  );
}
