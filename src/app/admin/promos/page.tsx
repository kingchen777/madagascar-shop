"use client";

import { useEffect, useState, useCallback } from "react";
import { Tag, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { useAdminLang } from "@/components/admin/AdminLangContext";

interface PromoCode {
  id: string;
  code: string;
  description: string | null;
  type: "PERCENT" | "FIXED";
  value: number;
  minOrderMGA: number | null;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
}

const EMPTY_FORM = {
  code: "",
  description: "",
  type: "PERCENT" as "PERCENT" | "FIXED",
  value: "",
  minOrderMGA: "",
  maxUses: "",
  expiresAt: "",
  active: true,
};

export default function AdminPromosPage() {
  const { t } = useAdminLang();
  const tp = t.promos;

  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPromos = useCallback(() => {
    fetch("/api/admin/promos")
      .then((r) => r.json())
      .then((d) => setPromos(d.promos ?? []))
      .catch(() => setPromos([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchPromos(); }, [fetchPromos]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const body = {
        code: form.code,
        description: form.description || undefined,
        type: form.type,
        value: Number(form.value),
        minOrderMGA: form.minOrderMGA ? Number(form.minOrderMGA) : undefined,
        maxUses: form.maxUses ? Number(form.maxUses) : undefined,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
        active: form.active,
      };
      const res = await fetch("/api/admin/promos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setForm(EMPTY_FORM);
        setShowForm(false);
        fetchPromos();
      } else {
        const d: unknown = await res.json();
        setError(typeof d === "object" && d !== null && "error" in d ? String((d as { error: unknown }).error) : t.error);
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(promo: PromoCode) {
    await fetch(`/api/admin/promos/${promo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !promo.active }),
    });
    fetchPromos();
  }

  async function handleDelete(id: string) {
    if (!confirm(tp.deleteConfirm)) return;
    await fetch(`/api/admin/promos/${id}`, { method: "DELETE" });
    fetchPromos();
  }

  function formatDate(iso: string | null) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("fr-MG", { day: "2-digit", month: "short", year: "numeric" });
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">{tp.title}</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          {tp.newCode}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">{tp.form.title}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{tp.form.code}</label>
              <input
                type="text"
                required
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="SUMMER20"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono uppercase outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{tp.form.description}</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{tp.form.type}</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as "PERCENT" | "FIXED" }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-400"
              >
                <option value="PERCENT">{tp.form.typePercent}</option>
                <option value="FIXED">{tp.form.typeFixed}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {tp.form.value} {form.type === "PERCENT" ? "(%)" : "(Ar)"}
              </label>
              <input
                type="number"
                required
                min="0"
                max={form.type === "PERCENT" ? "100" : undefined}
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{tp.form.minOrder}</label>
              <input
                type="number"
                min="0"
                value={form.minOrderMGA}
                onChange={(e) => setForm((f) => ({ ...f, minOrderMGA: e.target.value }))}
                placeholder={tp.form.minOrderPlaceholder}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{tp.form.maxUses}</label>
              <input
                type="number"
                min="1"
                value={form.maxUses}
                onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                placeholder={tp.form.maxUsesPlaceholder}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{tp.form.expiry}</label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="rounded-xl bg-amber-500 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50 transition-colors">
              {saving ? t.saving : t.create}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setError(null); }} className="rounded-xl border border-gray-300 px-5 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              {t.cancel}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-400">{t.loading}</div>
      ) : promos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <Tag className="mx-auto h-10 w-10 text-gray-200 mb-3" />
          <p className="text-sm text-gray-400">{tp.noPromos}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[tp.table.code, tp.table.type, tp.table.value, tp.table.uses, tp.table.expiry, tp.table.status, ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {promos.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-mono font-bold text-gray-900">{p.code}</p>
                    {p.description && <p className="text-xs text-gray-400">{p.description}</p>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.type === "PERCENT" ? tp.percent : tp.fixed}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-amber-700">
                    {p.type === "PERCENT" ? `${p.value}%` : `${Number(p.value).toLocaleString("fr-MG")} Ar`}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.usedCount}{p.maxUses != null ? ` / ${p.maxUses}` : ""}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(p.expiresAt)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(p)}
                      className={`flex items-center gap-1.5 text-xs font-medium rounded-full px-2 py-1 transition-colors ${p.active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                    >
                      {p.active ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                      {p.active ? tp.active : tp.inactive}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(p.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
