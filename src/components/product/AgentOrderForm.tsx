"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send, Loader2, Link as LinkIcon } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
  prefillUrl?: string;
  locale?: string;
}

export function AgentOrderForm({ prefillUrl, locale }: Props) {
  const t = useTranslations("agent");
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
      const msg = data.inquiryNo ? `${t("form_success")} (${data.inquiryNo})` : t("form_success");
      toast.success(msg, { duration: 6000 });
      setForm({ url: "", name: "", spec: "", qty: "1", notes: "", contact: "" });
    } catch {
      toast.error(t("form_error"));
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
          {t("form_url")} <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="url"
            required
            value={form.url}
            onChange={(e) => update("url", e.target.value)}
            placeholder={t("form_url_placeholder")}
            className={inputClass + " pl-10"}
          />
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-gray-700">
          {t("form_name")}
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder={t("form_name_placeholder")}
          className={inputClass}
        />
      </div>

      {/* Spec + Qty in a row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="mb-1.5 block text-xs font-semibold text-gray-700">
            {t("form_spec")}
          </label>
          <input
            type="text"
            value={form.spec}
            onChange={(e) => update("spec", e.target.value)}
            placeholder={t("form_spec_placeholder")}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-700">
            {t("form_qty")}
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
          {t("form_contact")} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={form.contact}
          onChange={(e) => update("contact", e.target.value)}
          placeholder={t("form_contact_placeholder")}
          className={inputClass}
        />
      </div>

      {/* Notes */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-gray-700">
          {t("form_notes")}
        </label>
        <textarea
          rows={3}
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder={t("form_notes_placeholder")}
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
            {t("form_submitting")}
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            {t("form_submit")}
          </>
        )}
      </button>
    </form>
  );
}
