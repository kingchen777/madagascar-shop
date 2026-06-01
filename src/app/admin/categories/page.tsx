"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Check, X, GripVertical } from "lucide-react";

interface Translation { locale: string; name: string }
interface Category {
  id: string;
  slug: string;
  sort: number;
  translations: Translation[];
}

const LOCALES = ["fr", "en", "zh"] as const;

function nameFor(cat: Category, locale: string) {
  return cat.translations.find((t) => t.locale === locale)?.name ?? "";
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ slug: string; sort: string; fr: string; en: string; zh: string }>({ slug: "", sort: "0", fr: "", en: "", zh: "" });
  const [creating, setCreating] = useState(false);
  const [newForm, setNewForm] = useState({ slug: "", sort: "0", fr: "", en: "", zh: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/categories");
    const data = await res.json() as Category[];
    setCategories(data);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditForm({
      slug: cat.slug,
      sort: String(cat.sort),
      fr: nameFor(cat, "fr"),
      en: nameFor(cat, "en"),
      zh: nameFor(cat, "zh"),
    });
    setError(null);
  }

  function cancelEdit() { setEditingId(null); setError(null); }

  async function saveEdit(id: string) {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: editForm.slug.trim(),
        sort: Number(editForm.sort),
        translations: LOCALES.map((l) => ({ locale: l, name: editForm[l].trim() })).filter((t) => t.name),
      }),
    });
    if (!res.ok) {
      const data = await res.json() as { error?: string };
      setError(data.error ?? "Erreur");
    } else {
      setEditingId(null);
      await load();
    }
    setBusy(false);
  }

  async function deleteCategory(id: string, slug: string) {
    if (!confirm(`Supprimer la catégorie "${slug}" ?`)) return;
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json() as { error?: string };
      setError(data.error ?? "Erreur");
    } else {
      await load();
    }
    setBusy(false);
  }

  async function createCategory() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: newForm.slug.trim(),
        sort: Number(newForm.sort),
        translations: LOCALES.map((l) => ({ locale: l, name: newForm[l].trim() })).filter((t) => t.name),
      }),
    });
    if (!res.ok) {
      const data = await res.json() as { error?: string };
      setError(data.error ?? "Erreur");
    } else {
      setCreating(false);
      setNewForm({ slug: "", sort: "0", fr: "", en: "", zh: "" });
      await load();
    }
    setBusy(false);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Catégories</h1>
        {!creating && (
          <button
            onClick={() => { setCreating(true); setError(null); }}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
          >
            <Plus className="h-4 w-4" /> Nouvelle catégorie
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Create form */}
      {creating && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 space-y-3">
          <p className="text-sm font-semibold text-amber-900">Nouvelle catégorie</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Slug</label>
              <input
                value={newForm.slug}
                onChange={(e) => setNewForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="ex: electronique"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ordre (sort)</label>
              <input
                type="number"
                value={newForm.sort}
                onChange={(e) => setNewForm((f) => ({ ...f, sort: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {LOCALES.map((l) => (
              <div key={l}>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nom ({l.toUpperCase()})</label>
                <input
                  value={newForm[l]}
                  onChange={(e) => setNewForm((f) => ({ ...f, [l]: e.target.value }))}
                  placeholder={l === "fr" ? "Électronique" : l === "en" ? "Electronics" : "电子产品"}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={createCategory}
              disabled={busy || !newForm.slug || !newForm.fr}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
            >
              <Check className="h-4 w-4" /> Créer
            </button>
            <button
              onClick={() => { setCreating(false); setError(null); }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <X className="h-4 w-4" /> Annuler
            </button>
          </div>
        </div>
      )}

      {/* Category list */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="grid grid-cols-[32px_1fr_80px_2fr_100px] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <span />
          <span>Slug</span>
          <span>Sort</span>
          <span>Noms (FR / EN / ZH)</span>
          <span />
        </div>

        {loading ? (
          <p className="px-5 py-8 text-sm text-gray-400 text-center">Chargement…</p>
        ) : categories.length === 0 ? (
          <p className="px-5 py-8 text-sm text-gray-400 text-center">Aucune catégorie</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {categories.map((cat) =>
              editingId === cat.id ? (
                <li key={cat.id} className="grid grid-cols-[32px_1fr_80px_2fr_100px] gap-4 items-center px-5 py-3 bg-amber-50">
                  <GripVertical className="h-4 w-4 text-gray-300" />
                  <input
                    value={editForm.slug}
                    onChange={(e) => setEditForm((f) => ({ ...f, slug: e.target.value }))}
                    className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-amber-400 focus:outline-none"
                  />
                  <input
                    type="number"
                    value={editForm.sort}
                    onChange={(e) => setEditForm((f) => ({ ...f, sort: e.target.value }))}
                    className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-amber-400 focus:outline-none"
                  />
                  <div className="flex gap-2">
                    {LOCALES.map((l) => (
                      <input
                        key={l}
                        value={editForm[l]}
                        onChange={(e) => setEditForm((f) => ({ ...f, [l]: e.target.value }))}
                        placeholder={l.toUpperCase()}
                        className="flex-1 rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-amber-400 focus:outline-none min-w-0"
                      />
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => saveEdit(cat.id)}
                      disabled={busy}
                      className="rounded-lg bg-amber-500 p-1.5 text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="rounded-lg border border-gray-300 p-1.5 text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ) : (
                <li key={cat.id} className="grid grid-cols-[32px_1fr_80px_2fr_100px] gap-4 items-center px-5 py-3 hover:bg-gray-50 transition-colors">
                  <GripVertical className="h-4 w-4 text-gray-300" />
                  <span className="text-sm font-mono text-gray-700">{cat.slug}</span>
                  <span className="text-sm text-gray-500">{cat.sort}</span>
                  <div className="flex gap-3 text-sm text-gray-600 min-w-0">
                    <span className="truncate"><span className="text-xs text-gray-400">FR</span> {nameFor(cat, "fr")}</span>
                    <span className="truncate"><span className="text-xs text-gray-400">EN</span> {nameFor(cat, "en")}</span>
                    <span className="truncate"><span className="text-xs text-gray-400">ZH</span> {nameFor(cat, "zh")}</span>
                  </div>
                  <div className="flex gap-1.5 justify-end">
                    <button
                      onClick={() => startEdit(cat)}
                      className="rounded-lg p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => deleteCategory(cat.id, cat.slug)}
                      disabled={busy}
                      className="rounded-lg p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              )
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
