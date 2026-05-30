export default function AdminSettingsPage() {
  return (
    <div className="p-6 max-w-2xl">
      <h1 className="mb-6 text-xl font-bold text-gray-900">Paramètres</h1>

      <div className="space-y-4">
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">Taux de change</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">1 CNY =</span>
            <input
              type="number"
              defaultValue={500}
              className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
            />
            <span className="text-sm text-gray-600">MGA</span>
            <button className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition-colors">
              Enregistrer
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-400">Utilisé pour calculer les prix indicatifs des produits agent.</p>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">Frais de service</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              { label: "Commission agent", key: "service_fee_pct", default: "10" },
              { label: "Acompte requis (%)", key: "deposit_pct", default: "30" },
            ].map((s) => (
              <div key={s.key}>
                <label className="block text-xs text-gray-600 mb-1">{s.label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    defaultValue={s.default}
                    className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
                  />
                  <span className="text-gray-500">%</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">Base de données</h2>
          <div className="space-y-2 text-sm">
            {[
              { label: "DATABASE_URL", set: !!process.env.DATABASE_URL },
              { label: "ANTHROPIC_API_KEY", set: !!process.env.ANTHROPIC_API_KEY },
              { label: "RESEND_API_KEY", set: !!process.env.RESEND_API_KEY },
              { label: "NEXT_PUBLIC_SUPABASE_URL", set: !!process.env.NEXT_PUBLIC_SUPABASE_URL },
            ].map((v) => (
              <div key={v.label} className="flex items-center justify-between">
                <span className="font-mono text-xs text-gray-600">{v.label}</span>
                <span className={`text-xs font-medium ${v.set ? "text-green-600" : "text-red-500"}`}>
                  {v.set ? "✓ Configuré" : "✗ Manquant"}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-400">Modifiez les variables dans votre fichier <code>.env</code> ou dans les paramètres Vercel.</p>
        </section>
      </div>
    </div>
  );
}
