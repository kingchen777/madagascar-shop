"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, Loader2, Check } from "lucide-react";
import { MOCK_CATEGORIES } from "@/lib/mock-data";

type Locale = "fr" | "en" | "zh";
type ProductType = "SELF" | "AGENT";
type Source = "NONE" | "TAOBAO" | "JD" | "PINDUODUO" | "ALIBABA1688" | "TMALL";

interface TranslationFields {
  name: string;
  description: string;
}

interface FormState {
  slug: string;
  type: ProductType;
  source: Source;
  sourceUrl: string;
  priceMGA: string;
  priceCNY: string;
  weightKg: string;
  stock: string;
  categorySlug: string;
  translations: Record<Locale, TranslationFields>;
}

const SOURCES: Source[] = ["NONE", "TAOBAO", "JD", "PINDUODUO", "ALIBABA1688", "TMALL"];
const LOCALE_LABELS: Record<Locale, string> = { fr: "Français", en: "English", zh: "中文" };
const EMPTY_TRANSLATION: TranslationFields = { name: "", description: "" };

const DEFAULT_FORM: FormState = {
  slug: "",
  type: "SELF",
  source: "NONE",
  sourceUrl: "",
  priceMGA: "",
  priceCNY: "",
  weightKg: "",
  stock: "",
  categorySlug: MOCK_CATEGORIES[0]?.slug ?? "",
  translations: {
    fr: { ...EMPTY_TRANSLATION },
    en: { ...EMPTY_TRANSLATION },
    zh: { ...EMPTY_TRANSLATION },
  },
};

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState("");
  const [translated, setTranslated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Load existing product
  useEffect(() => {
    fetch(`/api/admin/products/${id}`)
      .then((r) => r.json())
      .then((data: Record<string, unknown>) => {
        const tr = (data.translations as Array<{ locale: string; name: string; description: string }> | undefined) ?? [];
        const translationsMap = (["fr", "en", "zh"] as Locale[]).reduce<Record<Locale, TranslationFields>>(
          (acc, locale) => {
            const found = tr.find((t) => t.locale === locale);
            acc[locale] = found
              ? { name: found.name, description: found.description }
              : { ...EMPTY_TRANSLATION };
            return acc;
          },
          { fr: { ...EMPTY_TRANSLATION }, en: { ...EMPTY_TRANSLATION }, zh: { ...EMPTY_TRANSLATION } }
        );

        setForm({
          slug: (data.slug as string) ?? "",
          type: ((data.type as ProductType) ?? "SELF"),
          source: ((data.source as Source) ?? "NONE"),
          sourceUrl: (data.sourceUrl as string) ?? "",
          priceMGA: data.priceMGA != null ? String(data.priceMGA) : "",
          priceCNY: data.basePriceCNY != null ? String(data.basePriceCNY) : "",
          weightKg: data.weightKg != null ? String(data.weightKg) : "",
          stock: data.stock != null ? String(data.stock) : "",
          categorySlug:
            (data.categorySlug as string) ??
            (data.category as { slug?: string } | undefined)?.slug ??
            MOCK_CATEGORIES[0]?.slug ??
            "",
          translations: translationsMap,
        });
      })
      .catch(() => setLoadError("Impossible de charger le produit."))
      .finally(() => setLoading(false));
  }, [id]);

  function setTranslation(locale: Locale, field: keyof TranslationFields, value: string) {
    setForm((f) => ({
      ...f,
      translations: {
        ...f.translations,
        [locale]: { ...f.translations[locale], [field]: value },
      },
    }));
  }

  async function handleTranslate() {
    const { name, description } = form.translations.fr;
    if (!name.trim() || !description.trim()) {
      setTranslateError("Veuillez remplir le nom et la description en français d'abord.");
      return;
    }
    setTranslateError("");
    setTranslating(true);
    setTranslated(false);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, sourceLocale: "fr", targetLocales: ["en", "zh"] }),
      });
      const data = await res.json() as {
        translations?: Record<string, TranslationFields>;
        error?: string;
      };
      if (!res.ok) {
        setTranslateError(data.error ?? "Erreur de traduction");
        return;
      }
      const tr = data.translations!;
      setForm((f) => ({
        ...f,
        translations: {
          fr: f.translations.fr,
          en: tr.en ?? f.translations.en,
          zh: tr.zh ?? f.translations.zh,
        },
      }));
      setTranslated(true);
    } catch {
      setTranslateError("Impossible de contacter l'API de traduction.");
    } finally {
      setTranslating(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setSaveError(data.error ?? "Erreur lors de la mise à jour");
        return;
      }
      router.push("/admin/products");
    } catch {
      setSaveError("Impossible de contacter le serveur.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center gap-2 text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        Chargement du produit…
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-6">
        <p className="text-red-600">{loadError}</p>
        <Link href="/admin/products" className="mt-3 inline-block text-sm text-amber-600 hover:underline">
          ← Retour aux produits
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl">
      <Link
        href="/admin/products"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-amber-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux produits
      </Link>

      <h1 className="mb-6 text-xl font-bold text-gray-900">Modifier le produit</h1>

      {saveError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {saveError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core fields */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Informations</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as ProductType }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
              >
                <option value="SELF">Direct (SELF)</option>
                <option value="AGENT">Commande Agent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Catégorie</label>
              <select
                value={form.categorySlug}
                onChange={(e) => setForm((f) => ({ ...f, categorySlug: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
              >
                {MOCK_CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name.fr}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Source</label>
              <select
                value={form.source}
                onChange={(e) => setForm((f) => ({ ...f, source: e.target.value as Source }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
              >
                {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">URL source (optionnel)</label>
              <input
                type="url"
                value={form.sourceUrl}
                onChange={(e) => setForm((f) => ({ ...f, sourceUrl: e.target.value }))}
                placeholder="https://item.taobao.com/..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Prix MGA *</label>
              <input
                type="number"
                required
                min={0}
                value={form.priceMGA}
                onChange={(e) => setForm((f) => ({ ...f, priceMGA: e.target.value }))}
                placeholder="85000"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Coût CNY</label>
              <input
                type="number"
                min={0}
                value={form.priceCNY}
                onChange={(e) => setForm((f) => ({ ...f, priceCNY: e.target.value }))}
                placeholder="89"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Poids (kg)</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.weightKg}
                onChange={(e) => setForm((f) => ({ ...f, weightKg: e.target.value }))}
                placeholder="0.45"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {form.type === "SELF" && (
            <div className="w-32">
              <label className="block text-xs font-medium text-gray-600 mb-1">Stock</label>
              <input
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                placeholder="10"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Slug URL *</label>
            <input
              type="text"
              required
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-amber-400 focus:outline-none"
            />
          </div>
        </section>

        {/* Translations */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Traductions</h2>
            <button
              type="button"
              onClick={handleTranslate}
              disabled={translating}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-60 transition-colors"
            >
              {translating ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Traduction…</>
              ) : translated ? (
                <><Check className="h-4 w-4" />Traduit</>
              ) : (
                <><Sparkles className="h-4 w-4" />Retraduire avec Claude</>
              )}
            </button>
          </div>

          {translateError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{translateError}</p>
          )}

          {(["fr", "en", "zh"] as Locale[]).map((locale) => (
            <div key={locale} className="space-y-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase">
                {LOCALE_LABELS[locale]}
                {locale === "fr" && " (source)"}
              </h3>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Nom *</label>
                <input
                  type="text"
                  required={locale === "fr"}
                  value={form.translations[locale].name}
                  onChange={(e) => setTranslation(locale, "name", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Description *</label>
                <textarea
                  rows={4}
                  required={locale === "fr"}
                  value={form.translations[locale].description}
                  onChange={(e) => setTranslation(locale, "description", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none resize-none"
                />
              </div>
            </div>
          ))}
        </section>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60 transition-colors"
          >
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Enregistrement…</> : "Mettre à jour"}
          </button>
          <Link
            href="/admin/products"
            className="rounded-xl border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
