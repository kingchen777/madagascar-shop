"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";

interface Settings {
  exchange_rate_cny_mga: string;
  default_deposit_pct: string;
  default_service_fee_pct: string;
  mvola_phone: string;
  orange_money_phone: string;
  contact_whatsapp: string;
  contact_phone: string;
  contact_email: string;
}

const DEFAULTS: Settings = {
  exchange_rate_cny_mga: "640",
  default_deposit_pct: "30",
  default_service_fee_pct: "15",
  mvola_phone: "",
  orange_money_phone: "",
  contact_whatsapp: "",
  contact_phone: "",
  contact_email: "",
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data: Partial<Settings>) => {
        setSettings((prev) => ({ ...prev, ...data }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) { setError(data.error ?? "Erreur lors de la sauvegarde"); return; }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setSaving(false);
    }
  }

  const inp = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none";

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Paramètres</h1>
        {saved && (
          <span className="inline-flex items-center gap-1 text-sm text-green-600">
            <Check className="h-4 w-4" /> Enregistré
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
        </div>
      ) : (
        <div className="space-y-4">
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">Taux de change</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 whitespace-nowrap">1 CNY =</span>
              <input
                type="number"
                min={1}
                value={settings.exchange_rate_cny_mga}
                onChange={(e) => setSettings((s) => ({ ...s, exchange_rate_cny_mga: e.target.value }))}
                className={inp + " w-32"}
              />
              <span className="text-sm text-gray-600">MGA</span>
            </div>
            <p className="mt-2 text-xs text-gray-400">Utilisé pour calculer les prix indicatifs des produits agent.</p>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">Frais de service</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {([
                { label: "Commission agent (%)", key: "default_service_fee_pct" as const },
                { label: "Acompte requis (%)", key: "default_deposit_pct" as const },
              ]).map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-xs text-gray-600 mb-1">{label}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={settings[key]}
                      onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.value }))}
                      className={inp + " w-20"}
                    />
                    <span className="text-gray-500">%</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">Numéros de paiement mobile</h2>
            <div className="grid grid-cols-1 gap-4 text-sm">
              {([
                { label: "MVola (Telma)", key: "mvola_phone" as const, placeholder: "034 XX XX XX" },
                { label: "Orange Money", key: "orange_money_phone" as const, placeholder: "032 XX XX XX" },
              ]).map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs text-gray-600 mb-1">{label}</label>
                  <input
                    type="tel"
                    value={settings[key]}
                    onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className={inp + " w-48"}
                  />
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-400">Affiché sur la page de commande et dans les e-mails de confirmation.</p>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">Coordonnées de contact</h2>
            <div className="grid grid-cols-1 gap-4 text-sm">
              {([
                { label: "WhatsApp (numéro international)", key: "contact_whatsapp" as const, placeholder: "+261 34 00 000 00" },
                { label: "Téléphone affiché", key: "contact_phone" as const, placeholder: "+261 34 00 000 00" },
                { label: "E-mail de contact", key: "contact_email" as const, placeholder: "contact@madashop.mg" },
              ]).map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs text-gray-600 mb-1">{label}</label>
                  <input
                    type="text"
                    value={settings[key]}
                    onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className={inp + " w-72"}
                  />
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-400">Affiché dans le pied de page du site.</p>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">Environnement</h2>
            <div className="space-y-2 text-sm">
              {[
                { label: "ANTHROPIC_API_KEY", set: !!process.env.NEXT_PUBLIC_SUPABASE_URL },
                { label: "NEXT_PUBLIC_SUPABASE_URL", set: !!process.env.NEXT_PUBLIC_SUPABASE_URL },
                { label: "SUPABASE_SERVICE_ROLE_KEY", set: true },
              ].map((v) => (
                <div key={v.label} className="flex items-center justify-between">
                  <span className="font-mono text-xs text-gray-600">{v.label}</span>
                  <span className={`text-xs font-medium ${v.set ? "text-green-600" : "text-red-500"}`}>
                    {v.set ? "✓ Configuré" : "✗ Manquant"}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60 transition-colors"
          >
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Enregistrement…</> : "Enregistrer les paramètres"}
          </button>
        </div>
      )}
    </div>
  );
}
